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
  copySubjectDataToDestinators
} from "./util/queries";
import dispatchRules from "./dispatch-rules";

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
          await dispatch(subject, submission);
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

async function dispatch(subject, submission) {
  const submissionInfo = await getSubmissionInfo(submission);
  if(submissionInfo) {
    const applicableRules = dispatchRules.filter(r =>
                                                   r.documentType == submissionInfo.submissionType
                                                   && r.sendByType == submissionInfo.creatorType
                                                );
    for(const rule of applicableRules) {
      const destinators = await getDestinators(submissionInfo.creator, rule);
      await copySubjectDataToDestinators(subject, destinators);
    }
  }
}
