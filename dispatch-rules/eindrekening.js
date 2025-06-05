import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];

/* Excel: Rules number: 77
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
**/
let rule = {
  abbSubgroupDestination: [ "LoketLB-databankEredienstenGebruiker", "LoketLB-databankEredienstenGebruiker-LF"],
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/54b61cbd-349f-41c4-9c8a-7e8e67d08347', // Eindrekening (ER)
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // EB
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
            skos:prefLabel ?label.
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
