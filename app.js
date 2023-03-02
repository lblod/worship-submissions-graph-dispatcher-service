import bodyParser from "body-parser";
import { CronJob } from 'cron';
import { app } from "mu";
import { Delta } from "./lib/delta";
import { ProcessingQueue } from './lib/processing-queue';
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
import { DISPATCH_SOURCE_GRAPH, ENABLE_HEALING, HEALING_CRON } from './config';

const processSubjectsQueue = new ProcessingQueue('submissions-dispatch-queue');

console.log(`ENABLE_HEALING is set to ${ENABLE_HEALING}`);
if(ENABLE_HEALING) {
  console.log(`HEALING_CRON is set to ${HEALING_CRON}`);
  new CronJob(HEALING_CRON, async function() {
    const now = new Date().toISOString();
    console.info(`Healing sync triggered by cron job at ${now}`);

    const submissions = await getSubmissions();
    for(const submission of submissions) {
      processSubjectsQueue
        .addJob(async () => await healSubmission(submission));
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
    processSubjectsQueue.addJob(() => processSubject(subject));
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
app.get("/manual-dispatch", async function (req, res) {
  if(req.query.submission) {
    console.log(`Only one submission to (re-)dispatch: ${req.query.submission}`);
    processSubjectsQueue.addJob(() => processSubject(req.query.submission));
  }
  else {
    console.log(`Dispatching all submissions (again) from GRAPH ${DISPATCH_SOURCE_GRAPH}`);
    const submissions = await getSubmissions(DISPATCH_SOURCE_GRAPH);
    console.log(`Found ${submissions.length} submissions to (re-)dispatch.`);
    console.log(`This might take a while; big amount can take big time`);
    for(const submission of submissions) {
      processSubjectsQueue.addJob(() => processSubject(submission));
    }
  }
  console.log(`Scheduling done`);
  return res.status(201).send();
});

/*
 * Triggers the healing flow for a single submission.
 * Clears the submission from all its target graphs, and starts the dispatching again
 * Uses cases:
 *  - debugging
 *  - something went wrong during the dispatch of a single submission
 */
app.get("/heal-submission", async function (req, res) {
  if(req.query.subject) {
    console.log(`Only one submission to (re-)dispatch: ${req.query.subject}`);
    processSubjectsQueue.addJob(async () => await healSubmission(req.query.subject));
    console.log(`Scheduling done`);
    return res.status(201).send();
  }
  else {
    console.log(`No, query param found, going to heal all submissions`);
    const submissions = await getSubmissions();
    for(const submission of submissions) {
      processSubjectsQueue.addJob(async () => await healSubmission(submission));
    }
    return res.status(201).send();
  }
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
    await removeSubjects([submission, ...relatedSubjects], DISPATCH_SOURCE_GRAPH);
    await processSubject(submission);
  } catch (e) {
    console.error(`Error while processing a subject: ${e.message ? e.message : e}`);
    await sendErrorAlert({
      message: `Something unexpected went wrong while processing a subject ${submission}: ${e.message ? e.message : e}`
    });
  }
}
