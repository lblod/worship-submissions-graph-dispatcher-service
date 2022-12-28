import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

const rules = [];
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/b25faa84-3ab5-47ae-98c0-1b389c77b827', // schorsingsbesluit
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000', // Provincie
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

        ?aboutEenheid a <http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst>;
          <http://data.vlaanderen.be/ns/besluit#classificatie>
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86>.

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
       } UNION {
         ?bestuurseenheid a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
            <http://www.w3.org/ns/org#hasSubOrganization> ?aboutEenheid;
            skos:prefLabel ?label;
            mu:uuid ?uuid.
       } UNION {
          ?bestuurseenheid org:linkedTo ?aboutEenheid ;
            mu:uuid ?uuid ;
            skos:prefLabel ?label;
            a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
       }
      }
    `;
  }
};
rules.push(rule);

export default rules;
