import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet } from './query-snippets';

const rules = [];


/* Excel: Rules number: TODO: Add rule number
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * PROVINCIE: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4> Aalst
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * PROVINCIE: <https://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
**/

let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/3a3ea43f-6631-4a7d-94c6-3a77a445d450', // Reactie op opvragen bijkomende inlichtingen door de toezichthouder (gemeente/provincie) aan de eredienstbesturen
  matchSentByEenheidClass: eenheidClass => {
    return [
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054' // Centraal bestuur van de eredienst 
    ]
      .indexOf(eenheidClass) > -1 ;
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
