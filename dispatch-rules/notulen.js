import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

const rules = [];

/* Excel: Rules number: 1,2,3,4
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
* RO: <http://data.lblod.info/id/representatieveOrganen/2267e8e132b5556bd4d0b454c9383ca0> Bisdom Gent
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/8e791b27-7600-4577-b24e-c7c29e0eb773', // Notulen EB
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${toezichthoudendeQuerySnippet()}
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        } UNION {
          ${repOrgQuerySnippet()}
        }
      }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 5, 6, 7, 8
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/b0ffe0e981a7e887a0b949d7ff77096b> CKB Tongeren
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625> Tongeren
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
* RO: <http://data.lblod.info/id/representatieveOrganen/c98e270d84a8455b2f4bf16b915aeff2> Bisdom Hasselt
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/d689e774de665f48e80db2262b1bbd7a> CB orthodoxe parochies West-Vlaanderen
* PROVINCIE: <http://data.lblod.info/id/bestuurseenheden/8152e68420f560b8493d6c555a5bd4186903dc341028bb9855af6c44a9464fea> West-Vlaanderen
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
* RO: <http://data.lblod.info/id/representatieveOrganen/0ebb44c2ef14d86978ea85e74d128ad1> Oecumenisch Patriarchaat van Konstantinopel
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/8e791b27-7600-4577-b24e-c7c29e0eb773', // Notulen CB
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054', // Centraal bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${toezichthoudendeQuerySnippet()}
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        } UNION {
${repOrgQuerySnippet()}
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
