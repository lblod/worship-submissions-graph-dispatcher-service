import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];

/* Excel:
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB 
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * PROVINCIE: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 **/
let rule = {
  abbSubgroupDestination: [ ORG_GRAPH_SUFFIX, `${ORG_GRAPH_SUFFIX}-LF`],
  documentType:
    "https://data.vlaanderen.be/id/concept/BesluitDocumentType/802a7e56-54f8-488d-b489-4816321fb9ae", // Opstart beroepsprocedure naar aanleiding van een beslissing
    matchSentByEenheidClass: eenheidClass => {
        return [
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000', // Provincie
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001', // Gemeente
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054', // Centraal bestuur van de eredienst
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213'  // Representatief Orgaan
        ]
          .indexOf(eenheidClass) > -1 ; 
    },
    destinationInfoQuery: (sender) => {
        return `
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          PREFIX org: <http://www.w3.org/ns/org#>
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

          SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
            BIND(${sparqlEscapeUri(sender)} as ?sender)
              VALUES ?bestuurseenheid {
                <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
                ${sparqlEscapeUri(sender)}
              }
              ?bestuurseenheid mu:uuid ?uuid;
                skos:prefLabel ?label.
          }
        `;
    },
};
rules.push(rule);

export default rules;
