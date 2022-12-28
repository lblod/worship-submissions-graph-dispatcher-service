import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

const rules = [];

/* Excel: Rules number: 46, 47, 48, 49, 50
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * RO: <http://data.lblod.info/id/representatieveOrganen/2267e8e132b5556bd4d0b454c9383ca0> Bisdom Gent
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4> Aalst
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * RO: <http://data.lblod.info/id/representatieveOrganen/2267e8e132b5556bd4d0b454c9383ca0> Bisdom Gent
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/41a09f6c-7964-4777-8375-437ef61ed946',
  matchSentByEenheidClass: eenheidClass => {
    return [
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054' // Centraal bestuur van de eredienst
    ].indexOf(eenheidClass) > -1;
  },
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${toezichthoudendeQuerySnippet()}
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
          skos:prefLabel ?label.
        } UNION {
          ${repOrgQuerySnippet()}
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
