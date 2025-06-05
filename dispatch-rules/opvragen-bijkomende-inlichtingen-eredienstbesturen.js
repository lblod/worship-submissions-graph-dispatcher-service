import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];


/* Excel: Rules number: TODO: Add rule number
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/d93451bf-e89a-4528-80f3-f0a1c19361a8> Deinze
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
 * Testing:
 *--------------------------
 * -SENDER-: <https://data.lblod.info/id/bestuurseenheden/298b13541e1e85de4b71535197aa1f3bbc4bdb67f0fe0f58ab4a7dc207af61fa> Oost-Vlaanderen
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
**/

let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/24743b26-e0fb-4c14-8c82-5cd271289b0e', // Opvragen bijkomende inlichtingen eredienstbesturen
  matchSentByEenheidClass: eenheidClass => {
    return [
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000', // Provincie
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001' // Gemeente
    ]
      .indexOf(eenheidClass) > -1 ;
  },
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>

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
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
           skos:prefLabel ?label.
       } UNION {
         ?aboutEenheid a <http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst>.

         ?bestuurseenheid a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
            <http://www.w3.org/ns/org#hasSubOrganization> ?aboutEenheid;
            skos:prefLabel ?label;
            mu:uuid ?uuid.
       } UNION {
          ?aboutEenheid a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
            <http://www.w3.org/ns/org#hasSubOrganization> ?bestuurseenheid.
 
          ?bestuurseenheid a <http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst>;
             skos:prefLabel ?label;
             mu:uuid ?uuid.
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
