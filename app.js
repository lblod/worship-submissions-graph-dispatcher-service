import bodyParser from "body-parser";
import { CronJob } from 'cron';
import { app } from "mu";
import { Delta } from "./lib/delta";
import { ProcessingQueue, distributeAndSchedule } from './lib/processing-queue';
import {
  sendErrorAlert,
  getTypesForSubject,
  getSubmissionForSubject,
  getSubmissionInfo,
  getDestinators,
  copySubjectDataToDestinators,
  getRelatedSubjectsForSubmission,
  getSubmissions,
  removeSubjects
} from "./util/queries";
import dispatchRules from "./dispatch-rules/entrypoint";
import exportConfig from "./export-config";
import { DISPATCH_SOURCE_GRAPH,
         ENABLE_HEALING,
         HEALING_CRON,
         ORG_GRAPH_BASE,
         ORG_GRAPH_SUFFIX,
         NUMBER_OF_HEALING_QUEUES
       } from './config';

const normalQueue = new ProcessingQueue('normal-operation-queue');
const healingQueuePool = Array.from(
  { length: NUMBER_OF_HEALING_QUEUES },
  (_, index) => new ProcessingQueue(`healing-queue-${index}`)
);

console.log(`ENABLE_HEALING is set to ${ENABLE_HEALING}`);
if(ENABLE_HEALING) {
  console.log(`HEALING_CRON is set to ${HEALING_CRON}`);
  new CronJob(HEALING_CRON, async function() {
    const now = new Date().toISOString();
    console.info(`Healing sync triggered by cron job at ${now}`);

    const submissions = await getSubmissions();
    for(const submission of submissions) {
      distributeAndSchedule(
        healingQueuePool,
        async () => await healSubmission(submission)
      );
    }
  }, null, true);
}

app.use(
  bodyParser.json({
    type: function (req) {
      return /^application\/json/.test(req.get("content-type"));
    }
  })
);

app.get("/", function (req, res) {
  res.send("Hello from worship-submissions-graph-dispatcher-service");
});

app.post("/delta", async function (req, res) {
  const delta = new Delta(req.body);

  if (!delta.inserts.length) {
    console.log(
      "Delta does not contain any insertions. Nothing should happen."
    );
    return res.status(204).send();
  }

  const inserts = delta.inserts;
  const subjects = inserts.map(insert => insert.subject.value);
  const uniqueSubjects = [ ...new Set(subjects) ];

  for(const subject of uniqueSubjects) {
    normalQueue.addJob(async () => await processSubject(subject));
  }
  return res.status(200).send();
});

/***********************************************
 * DEBUG/RESCUE ENDPOINS
 * Not meant to be exposed
 * Note: GET calls with side effects (sorry)
 ***********************************************/
/*
 * Triggers the dispatch manually.
 * Append only operation.
 * Uses cases:
 *  - debugging
 *  - something went wrong during the initial sync and it needs to be restarted.
 *  - something went wrong during the dispatch of a single submission
 */

/**
 * Triggers the dispatch process manually.
 *  This is an operation is intended for scenarios such as debugging, restarting failed initial syncs,
 *  or re-dispatching submissions that encountered issues during dispatching.
 *
 * @route GET /manual-dispatch
 * @group Dispatch - Operations related to the manual dispatch of submissions
 * @param {string} [subject] - The unique identifier of a specific submission to dispatch. If provided, only this submission will be re-dispatched.
 * @returns {Object} 201 - An empty response indicating that the dispatch process has been initiated.
 * @example request - Example of dispatching a specific submission
 * GET /manual-dispatch?subject=sub123
 * @example request - Example of dispatching all submissions
 * GET /manual-dispatch
 */
app.get("/manual-dispatch", async function (req, res) {
  if(req.query.subject) {
    console.log(`Only one subject to (re-)dispatch: ${req.query.subject}`);
    distributeAndSchedule(
      healingQueuePool,
      async () => await processSubject(req.query.subject)
    );
  }
  else {
    console.log(`Dispatching all submissions (again) from GRAPH ${DISPATCH_SOURCE_GRAPH}`);
    const submissions = await getSubmissions( { inGraph: DISPATCH_SOURCE_GRAPH });
    console.log(`Found ${submissions.length} submissions to (re-)dispatch.`);
    console.log(`This might take a while; big amount can take big time`);
    for(const submission of submissions) {
      distributeAndSchedule(
        healingQueuePool,
        async () => await processSubject(submission)
      );
    }
  }
  console.log(`Scheduling done`);
  return res.status(201).send();
});

/**
 * Triggers the healing flow for submissions.
 * This process clears the submission from all its target graphs and restarts the dispatching process.
 * It's useful for debugging or when something goes wrong during the dispatch of a submission.
 *
 * @route GET /heal-submission
 * @param {string} [subject] - The unique identifier of the submission to heal. If provided, only this submission will be healed.
 * @param {string} [sentDateSince] - The start date from which submissions will be healed, in YYYY-MM-DD format.
 *   If provided, all submissions sent on or after this date will be healed. If omitted, all submissions will be healed.
 * @returns {Object} 201 - An empty response indicating that the healing process has been initiated.
 * @returns {Error} 406 - An error response indicating that multiple query parameters are not supported.
 * @example request - Example of healing a specific submission
 * GET /heal-submission?subject=sub123
 * @example request - Example of healing submissions from a specific date
 * GET /heal-submission?sentDateSince=2023-01-01
 */
app.get("/heal-submission", async function (req, res) {

  if(Object.keys(req.query || {}).length > 1) {
    return res.status(406)
      .send(
        {
          message: `Multiple query parameters not supported yet.`
        }
      );
  }

  if(req.query.subject) {
    console.log(`Only one submission to (re-)dispatch: ${req.query.subject}`);
    distributeAndSchedule(
      healingQueuePool,
      async () => await healSubmission(req.query.subject)
    );
    console.log(`Scheduling done`);
    return res.status(201).send();
  }

  let submissions;

  if(req.query.sentDateSince) {
    let sentDateSince = new Date(req.query.sentDateSince).toISOString().split('T')[0];
    console.log(`Received "?sentDateSince" paramater: ${req.query.sentDateSince}`);
    console.log(`Converted to short date: ${sentDateSince}`);
    console.log(`Healing will be applied submissions with sent date >= ${sentDateSince}`);
    submissions = await getSubmissions( { sentDateSince } );
  }
  else {
    console.log(`No, query param found, going to heal all submissions`);
    submissions = await getSubmissions();
  }

  for(const submission of submissions) {
    distributeAndSchedule(
      healingQueuePool,
      async () => await healSubmission(submission)
    );
  }

  return res.status(201).send();
});

/***********************************************
 * END DEBUG/RESCUE ENDPOINTS
 ***********************************************/

async function processSubject(subject) {
  try {
    // Deduce type.
    // We can have multiple types .e.g LocalFileDataObject is also FileDataObject
    // hence we must check em all.
    // TODO: really sure?
    const types = await getTypesForSubject(subject);

    for(const type of types) {
      try {
        const submission = await getSubmissionForSubject(subject, type);
        if(submission) {
          await dispatch(submission);
        }
      }
      catch (e) {
        console.error(`Error while processing a subject ${subject}: ${e.message ? e.message : e}`);
        await sendErrorAlert({
          message: `Error while processing a subject ${subject}: ${e.message ? e.message : e}`
        });
      }
    }
  } catch (e) {
    console.error(`Error while processing a subject: ${e.message ? e.message : e}`);
    await sendErrorAlert({
      message: `Something unexpected went wrong while processing a subject: ${e.message ? e.message : e}`
    });
  }
}

async function dispatch(submission) {
  const submissionInfo = await getSubmissionInfo(submission);

  if(submissionInfo) {
    const applicableRules = dispatchRules.filter(r =>
                                                 r.documentType == submissionInfo.submissionType
                                                 && r.matchSentByEenheidClass(submissionInfo.creatorType)
                                                );

    for(const rule of applicableRules) {
      const destinators = await getDestinators(submissionInfo, rule);
      let relatedSubjects = [ submissionInfo.submission ];

      for (const config of exportConfig) {
        const subjects = await getRelatedSubjectsForSubmission(
          submissionInfo.submission,
          config.type,
          config.pathToSubmission
        );

        relatedSubjects = [ ...relatedSubjects, ...subjects ];
      }

      for(const subject of relatedSubjects) {
        await copySubjectDataToDestinators(subject, destinators);
      }
    }
  }
}

/*
 * Removes a submission from its target graphs.
 * Re-dispatch the submission again.
 * Use-case: handle data updates (e.g. bestuurseenheid changes) which affect the dispatch-rules
 */
async function healSubmission( submission ) {
  try {
    let relatedSubjects = [];
    for (const config of exportConfig) {
      const subjects = await getRelatedSubjectsForSubmission(
        submission,
        config.type,
        config.pathToSubmission
      );
      relatedSubjects = [ ...relatedSubjects, ...subjects ];
    }
    await removeSubjects([submission, ...relatedSubjects],
                         ORG_GRAPH_BASE + '/.*/' + ORG_GRAPH_SUFFIX);
    await processSubject(submission);
  } catch (e) {
    console.error(`Error while processing a subject: ${e.message ? e.message : e}`);
    await sendErrorAlert({
      message: `Something unexpected went wrong while processing a subject ${submission}: ${e.message ? e.message : e}`
    });
  }
}
