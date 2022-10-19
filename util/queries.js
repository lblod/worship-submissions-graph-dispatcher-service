import {  sparqlEscapeUri } from "mu";
import { querySudo as query, updateSudo as update } from "@lblod/mu-auth-sudo";
import exportConfig from "../exportConfig";
import { parseResult } from './utils';
import { ORG_GRAPH_BASE, ORG_GRAPH_SUFFIX, DISPATCH_SOURCE_GRAPH } from '../config';

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

export async function getDestinators(sender, rule) {
  const result = await query(rule.destinationInfoQuery(sender));
  return parseResult(result);
}

export async function copySubjectDataToDestinators(subject, destinators) {
  for(const destinator of destinators) {
    const targetGraph = ORG_GRAPH_BASE + '/' + destinator.uuid + '/' + ORG_GRAPH_SUFFIX;
    const queryStr = `
       INSERT {
          GRAPH ${sparqlEscapeUri(targetGraph)} {
            ?s ?p ?o.
          }
       }
       WHERE {
          BIND(${sparqlEscapeUri(subject)} as ?s)
          GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
            ?s ?p ?o.
          }
       }
    `;
    await update(queryStr);
  }
}
