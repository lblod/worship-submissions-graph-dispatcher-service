import { sparqlEscapeUri } from "mu";

const rules = [];
/* Excel: Rules number: 86, 87
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/e17dabfaf8f562ad181f422006c42e97> CB van de Islamitische gemeenschappen in Limburg
 * OR
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/6375F8724B5FEAF28DEDE821> Attaqwa
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/2b12630f-8c4e-40a4-8a61-a0c45621a1e6', // Advies budgetwijziging - EB if EB without CB or CB if EB has CB
  matchSentByEenheidClass: eenheidClass =>
    eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213', // RO
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX eli: <http://data.europa.eu/eli/ontology#>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX prov: <http://www.w3.org/ns/prov#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        BIND(${sparqlEscapeUri(submission)} as ?submission)

        ?submission
          pav:createdBy ?sender;
          prov:generated ?formData.

        ?formData
          eli:is_about ?aboutEenheid.      

        OPTIONAL {
          ?centraalBestuurVanDeEredienst org:hasSubOrganization ?aboutEenheid.
        }

        ?aboutEenheid a ere:BestuurVanDeEredienst;
          besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86>.

        BIND (IF(BOUND(?centraalBestuurVanDeEredienst), ?centraalBestuurVanDeEredienst, ?aboutEenheid) AS ?receiver)
        {
          ?receiver
            mu:uuid ?uuid ;
            skos:prefLabel ?label .
          BIND (?receiver AS ?bestuurseenheid)
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid
            mu:uuid ?uuid ;
            skos:prefLabel ?label .
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
