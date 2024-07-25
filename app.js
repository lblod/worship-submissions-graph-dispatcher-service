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
  removeSubjectFromGraph,
  copySubjectDataToGraph,
  getRelatedSubjectsForSubmission,
  getSubmissions,
  getGraphsAndCountForSubjects,
} from "./util/queries";
import dispatchRules from "./dispatch-rules/entrypoint";
import exportConfig from "./export-config";
import { DISPATCH_SOURCE_GRAPH,
         DISPATCH_FILES_GRAPH,
         ENABLE_HEALING,
         HEALING_CRON,
         ORG_GRAPH_BASE,
         ORG_GRAPH_SUFFIX,
         NUMBER_OF_HEALING_QUEUES
       } from './config';

const normalQueue = new ProcessingQueue('normal-operation-queue');

console.log(`The healing pool will consist of ${NUMBER_OF_HEALING_QUEUES} queues`);
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
        async () => await processSubject(submission)
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
      async () => await processSubject(req.query.subject)
    );
    console.log(`Scheduling done`);
    return res.status(201).send();
  }

  let submissions;

  if(req.query.sentDateSince) {
    let sentDateSince = new Date(req.query.sentDateSince).toISOString().split('T')[0];
    console.log(`Received "?sentDateSince" paramater: ${req.query.sentDateSince}`);
    console.log(`Converted to short date: ${sentDateSince}`);
    console.log(`Healing will be applied to submissions with sent date >= ${sentDateSince}`);
    submissions = await getSubmissions( { sentDateSince } );
  }
  else {
    console.log(`No, query param found, going to heal all submissions`);
    submissions = await getSubmissions();
  }

  for(const submission of submissions) {
    distributeAndSchedule(
      healingQueuePool,
      async () => await processSubject(submission)
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
      relatedSubjects = [ ...(new Set(relatedSubjects)) ];

      // Scalar product of related subjects and graphs they should be in
      const allSubjectsAndGraphs = relatedSubjects.reduce((acc, curr) => {
        destinators.forEach((d) => {
          acc.push({
            subject: curr,
            graph: ORG_GRAPH_BASE + '/' + d.uuid + '/' + ORG_GRAPH_SUFFIX
          });
        });
        return acc;
      }, []);

      //Count number of triples per subject
      let counts = await getGraphsAndCountForSubjects(relatedSubjects, [DISPATCH_SOURCE_GRAPH, DISPATCH_FILES_GRAPH]);
      // Deduplicate the counts
      // In certain scenario's, the physical file triples are not completely
      // dispatched correctly between the temp/for-dispatch and the
      // temp/original-physical-files-data graphs. Take the max number of
      // triples that can be found in order to become consistent.
      counts = counts.reduce((acc, curr) => {
        const alreadySeen = acc.find((e) => e.subject === curr.subject);
        if (alreadySeen) {
          alreadySeen.count = Math.max(alreadySeen.count, curr.count);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
      allSubjectsAndGraphs.forEach((e) => {
        e.count = counts.find((f) => f.subject === e. subject)?.count;
      });

      // List of subjects and the graph they are in
      const subjectsAndGraphs = await getGraphsAndCountForSubjects(relatedSubjects);

      // Find subjects that no longer have a correct destinator by calculating a difference
      const removeSubjectsPerGraph = [];
      for (const currSub of subjectsAndGraphs) {
        const found = allSubjectsAndGraphs.find((e) =>
          e.subject === currSub.subject &&
          e.graph === currSub.graph);
        if (!found)
          removeSubjectsPerGraph.push(currSub);
      }

      for (const { subject, graph } of removeSubjectsPerGraph) {
        await removeSubjectFromGraph(subject, graph);
      }

      // Difference between the two lists, only ones remaining are the missing or incorrect ones
      const missingSubjectsPerGraph = [];
      for (const allSub of allSubjectsAndGraphs) {
        const found = subjectsAndGraphs.find((e) => 
          e.subject === allSub.subject &&
          e.graph === allSub.graph);
        if (found) {
          if (found.count > allSub.count) {
            allSub.toRemoveFirst = true;
            missingSubjectsPerGraph.push(allSub);
          } else if (found.count < allSub.count) {
            missingSubjectsPerGraph.push(allSub);
            // No else. If counts are equal, nothing needs to be done.
          }
        } else {
          missingSubjectsPerGraph.push(allSub);
        }
      }

      for (const { subject, graph, toRemoveFirst } of missingSubjectsPerGraph)
        await copySubjectDataToGraph(subject, graph, toRemoveFirst);
    }
  }
}
