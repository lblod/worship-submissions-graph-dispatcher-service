import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];
/* Excel: Rules number: 140
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
**/
let rule = {
  abbSubgroupDestination: [ ORG_GRAPH_SUFFIX, `${ORG_GRAPH_SUFFIX}-LF`],
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/6d1a3aea-6773-4e10-924d-38be596c5e2e', // Opheffing van annexe kerken en kapelanijen
  matchSentByEenheidClass: eenheidClass =>
    eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213', // RO
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        BIND(${sparqlEscapeUri(submission)} as ?submission)

        ?submission
          pav:createdBy ?sender;
          prov:generated ?formData.

        VALUES ?bestuurseenheid {
          <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
          ${sparqlEscapeUri(sender)}
        }
        {
          ?bestuurseenheid mu:uuid ?uuid;
            skos:prefLabel ?label.
        } UNION {
          BIND(<http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan> as ?worshipType)
          BIND(<http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213> as ?worshipClassification)
          ?bestuurseenheid a ?worshipType ;
            mu:uuid ?uuid;
            besluit:classificatie ?worshipClassification;
            skos:prefLabel ?label.
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
