import bodyParser from "body-parser";
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
} from "./util/queries";
import dispatchRules from "./dispatch-rules/entrypoint";
import exportConfig from "./export-config";
import { DISPATCH_SOURCE_GRAPH } from './config';

const processSubjectsQueue = new ProcessingQueue('submissions-dispatch-queue');

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
 * DEBUG/INTERNAL only. Not meant to be exposed
 * Yeah also get request with side effects!
 * Easier to write the call
 ***********************************************/
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
