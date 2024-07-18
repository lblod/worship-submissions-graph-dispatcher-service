import { sparqlEscapeUri } from "mu";

const rules = [];

/* Excel:
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB 
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * PROVINCIE: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * 
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4> Aalst
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4> Aalst
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * 
 *  * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/2b149a43d431b110132e2ab3b90a246e> CKB Aalst
 * PROVINCIE: <http://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 **/
let rule = {
  documentType:
    "https://data.vlaanderen.be/id/concept/BesluitDocumentType/863caf68-97c9-4ee0-adb5-620577ea8146", // Melding onvolledigheid inzending eredienstbestuur
    matchSentByEenheidClass: eenheidClass => {
        return [
            'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000', // Provincie
            'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001'  // Gemeente
        ]
          .indexOf(eenheidClass) > -1 ; 
    },
    destinationInfoQuery: (sender, submission) => {
        return `
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          PREFIX org: <http://www.w3.org/ns/org#>
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

          SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
            BIND(${sparqlEscapeUri(sender)} as ?sender)
            BIND(${sparqlEscapeUri(submission)} as ?submission)

            ?submission
              <http://purl.org/pav/createdBy> ?sender;
              <http://www.w3.org/ns/prov#generated> ?formData.

            ?formData
              <http://data.europa.eu/eli/ontology#is_about> ?aboutEenheid.

            VALUES ?worshipType {
              <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>
              <http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst>
            }

            VALUES ?worshipClassifications {
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86>
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
            }

            ?aboutEenheid a ?worshipType;
              <http://data.vlaanderen.be/ns/besluit#classificatie> ?worshipClassifications.

            {
              ?aboutEenheid mu:uuid ?uuid;
                skos:prefLabel ?label.
              BIND(?aboutEenheid as ?bestuurseenheid)
            } UNION {
              VALUES ?bestuurseenheid {
                <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
                ${sparqlEscapeUri(sender)}
              }
              ?bestuurseenheid mu:uuid ?uuid;
                  skos:prefLabel ?label.
            }
          }
    `;
    },
};
rules.push(rule);

export default rules;
