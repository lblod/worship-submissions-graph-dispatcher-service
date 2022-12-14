import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

const rules = [];
/* Excel: Rules number: 86, 87
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/e17dabfaf8f562ad181f422006c42e97> CB van de Islamitische gemeenschappen in Limburg
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/2b12630f-8c4e-40a4-8a61-a0c45621a1e6', // Avies budgetwijziging
  matchSentByEenheidClass: eenheidClass =>
    eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213', // RO
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        BIND(${sparqlEscapeUri(submission)} as ?submission)

        ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>;
          <http://purl.org/pav/createdBy> ?sender;
          <http://www.w3.org/ns/prov#generated> ?formData.

        ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>;
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
