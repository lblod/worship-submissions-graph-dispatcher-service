import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];
/* Excel: Rules number: 109, 110
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * PO: <http://data.lblod.info/id/bestuurseenheden/14278813524c762255aeba149e7d7134ddecfbb43e7d56910731bd4e13e34f39> Limburg
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/0fc2c27d-a03c-4e3f-9db1-f10f026f76f8', // Advies meerjarenplanwijziging
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
       {

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

          VALUES ?classificatie {
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000>
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>
          }
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?aboutEenheid;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
            a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
            <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie;
            mu:uuid ?uuid;
            <http://www.w3.org/2004/02/skos/core#prefLabel> ?label.

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
