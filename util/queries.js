import {  sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeDate, uuid } from "mu";
import { querySudo as query, updateSudo as update } from "@lblod/mu-auth-sudo";
import exportConfig from "../export-config";
import { parseResult } from './utils';
import { ORG_GRAPH_BASE, ORG_GRAPH_SUFFIX, DISPATCH_SOURCE_GRAPH, DISPATCH_FILES_GRAPH } from '../config';

const CREATOR = 'http://lblod.data.gift/services/worship-submissions-graph-dispatcher-service';

export async function getRelatedSubjectsForSubmission(submission, subjectType, pathToSubmission) {
  const queryStr = `
    SELECT DISTINCT ?subject WHERE {
      BIND(${sparqlEscapeUri(submission)} as ?submission)
      ${pathToSubmission}
    }`;

  const result = await query(queryStr);
  return result.results.bindings.map(r => r.subject.value);
}

export async function getTypesForSubject(subject) {
  const configuredTypes = exportConfig.map(c => sparqlEscapeUri(c.type)).join('\n');

  const queryStr = `
     SELECT DISTINCT ?type {
        VALUES ?type {
         ${configuredTypes}
        }
       ${sparqlEscapeUri(subject)} a ?type.
     }
  `;

  return (await query(queryStr)).results.bindings.map(r => r.type.value);
}

export async function getSubmissionForSubject(subject, type) {
  const configs = exportConfig.filter(c => c.type == type);

  for(const config of configs) {
    const queryStr = `
      SELECT DISTINCT ?submission WHERE {
        BIND(${sparqlEscapeUri(subject)} as ?subject)

        ?subject a ${sparqlEscapeUri(config.type)}.
        ${config.pathToSubmission}
      }
    `;

    const bindings = (await query(queryStr)).results.bindings;
    if(bindings.length) {
      return bindings[0].submission.value;
    }
  }
  return null;
}

export async function getSubmissionInfo(submission) {
  const queryStr = `
    SELECT DISTINCT ?submissionType ?submission ?creator ?creatorUuid ?creatorType WHERE {
      BIND(${sparqlEscapeUri(submission)} as ?submission)
      ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>;
        <http://www.w3.org/ns/prov#generated> ?formData;
        <http://purl.org/pav/createdBy> ?creator.

      ?creator <http://data.vlaanderen.be/ns/besluit#classificatie> ?creatorType;
        <http://mu.semte.ch/vocabularies/core/uuid> ?creatorUuid.

      ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>;
            <http://mu.semte.ch/vocabularies/ext/decisionType> ?submissionType.
    }
  `;
  //TODO it is assumed to return MAX 1 result
  return parseResult(await query(queryStr))[0];
}

export async function getDestinators(submissionInfo, rule) {
  const result = await query(rule.destinationInfoQuery(submissionInfo.creator, submissionInfo.submission));
  return parseResult(result);
}

export async function getGraphsAndCountForSubjects(subjects, graphs) {
  const bindGraph = graphs?.length ? `VALUES ?graph {\n${graphs.map(sparqlEscapeUri).join('\n')}\n}` : '';
  const graphFilter = graphs?.length ? '' : `FILTER (REGEX(STR(?graph), "${ORG_GRAPH_BASE}"))`;
  const q = `
    SELECT DISTINCT
        ?graph
        ?subject
        (COUNT(?p) as ?count) {
      VALUES ?subject {
        ${subjects.map(sparqlEscapeUri).join('\n')}
      }
      ${bindGraph}
      GRAPH ?graph {
        ?subject ?p ?o .
      }
      ${graphFilter}
    }
    GROUP BY ?graph ?subject
  `;
  return parseResult(await query(q));
}

export async function removeSubjectFromGraph(subject, graph) {
  const removeQueryStr = `
    DELETE {
      GRAPH ${sparqlEscapeUri(graph)} {
        ?subject ?p ?o .
      }
    }
    WHERE {
      BIND (${sparqlEscapeUri(subject)} as ?subject)
      GRAPH ${sparqlEscapeUri(graph)} {
        ?subject ?p ?o .
      }
    }
  `;
  await update(removeQueryStr);
}

export async function copySubjectDataToGraph(subject, graph, toRemoveFirst = false) {
  const removeQueryStr = toRemoveFirst ? `
    DELETE {
      GRAPH ${sparqlEscapeUri(graph)} {
        ?subject ?p ?o .
      }
    }
    WHERE {
      BIND (${sparqlEscapeUri(subject)} as ?subject)
      GRAPH ${sparqlEscapeUri(graph)} {
        ?subject ?p ?o .
      }
    }
  ` : '';
  const queryStr = `
     ${toRemoveFirst ? removeQueryStr + '\n;\n' : ''}
     INSERT {
        GRAPH ${sparqlEscapeUri(graph)} {
          ?s ?p ?o.
        }
     }
     WHERE {
        VALUES ?g {
          ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)}
          ${sparqlEscapeUri(DISPATCH_FILES_GRAPH)}
        }
        BIND(${sparqlEscapeUri(subject)} as ?s)
        GRAPH ?g {
          ?s ?p ?o.
        }
     }
  `;
  await update(queryStr);
}

export async function sendErrorAlert({message, detail, reference}) {
  if (!message)
    throw 'Error needs a message describing what went wrong.';
  const id = uuid();
  const uri = `http://data.lblod.info/errors/${id}`;
  const q = `
      PREFIX mu:   <http://mu.semte.ch/vocabularies/core/>
      PREFIX oslc: <http://open-services.net/ns/core#>
      PREFIX dct:  <http://purl.org/dc/terms/>
      INSERT DATA {
        GRAPH <http://mu.semte.ch/graphs/error> {
            ${sparqlEscapeUri(uri)} a oslc:Error ;
                    mu:uuid ${sparqlEscapeString(id)} ;
                    dct:subject ${sparqlEscapeString('Dispatch worship submissions')} ;
                    oslc:message ${sparqlEscapeString(message)} ;
                    dct:created ${sparqlEscapeDateTime(new Date().toISOString())} ;
                    dct:creator ${sparqlEscapeUri(CREATOR)} .
            ${reference ? `${sparqlEscapeUri(uri)} dct:references ${sparqlEscapeUri(reference)} .` : ''}
            ${detail ? `${sparqlEscapeUri(uri)} oslc:largePreview ${sparqlEscapeString(detail)} .` : ''}
        }
      }
  `;
  try {
    await update(q);
  } catch (e) {
    console.error(`[WARN] Something went wrong while trying to store an error.\nMessage: ${e}\nQuery: ${q}`);
  }
}

export async function getSubmissions( { inGraph, sentDateSince } = {}) {
  const bindGraph = inGraph ? `BIND(${sparqlEscapeUri(inGraph)} as ?graph)` : '';
  let queryStr = `
    PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
    SELECT DISTINCT ?submission WHERE {
       ${bindGraph}
       GRAPH ?graph {
         ?submission a meb:Submission.
       }
    }
  `;
  if(sentDateSince) {
    queryStr = `
      PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
       SELECT DISTINCT ?submission WHERE {
         ${bindGraph}
         GRAPH ?graph {
           ?submission a meb:Submission;
             <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#sentDate> ?sentDate.
         }
         FILTER(?sentDate >= ${sparqlEscapeDate(sentDateSince)})
      }
  `;
  }
  const result = await query(queryStr);
  return parseResult(result).map(s => s.submission);
}
