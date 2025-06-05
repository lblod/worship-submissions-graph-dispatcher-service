import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];

/* Excel: Rules number: 70, 71
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/14278813524c762255aeba149e7d7134ddecfbb43e7d56910731bd4e13e34f39> Prov. limburg
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
**/
let rule = {
  abbSubgroupDestination: [ "LoketLB-databankEredienstenGebruiker", "LoketLB-databankEredienstenGebruiker-LF"],
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/79414af4-4f57-4ca3-aaa4-f8f1e015e71c', // Advies jaarrekening
  matchSentByEenheidClass: eenheidClass => {
    return [
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000',
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001' ]
      .indexOf(eenheidClass) > -1 ;
  },
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX eli: <http://data.europa.eu/eli/ontology#>
      PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
      PREFIX prov: <http://www.w3.org/ns/prov#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        BIND(${sparqlEscapeUri(submission)} as ?submission)

        {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
            skos:prefLabel ?label.
        }
        UNION {
          ?submission a meb:Submission;
            prov:generated ?formData.

          ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>;
            eli:is_about ?bestuurseenheid.

          ?bestuurseenheid mu:uuid ?uuid;
            skos:prefLabel ?label.
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
