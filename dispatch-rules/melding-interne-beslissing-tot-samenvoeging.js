import { sparqlEscapeUri } from "mu";

const rules = [];
/* Excel: Rules number: TODO: update excel?
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * RO: <http://data.lblod.info/id/besturenVanDeEredienst/928335b5a7b1cb7850c7cc98574e9ec9> Islamitische geloofsgemeenschap Fatih van Genk
 * RO: <http://data.lblod.info/id/besturenVanDeEredienst/b81199eddd02f291bd4c1a0e29e5b9c8> Islamitische geloofsgemeenschap Islamitisch Cultureel Centrum van Gent (Gentbrugge)
 **/
let rule = {
  documentType:
    "https://data.vlaanderen.be/id/concept/BesluitType/95c671c2-3ab7-43e2-a90d-9b096c84bfe7", // Melding interne beslissing tot samenvoeging
  matchSentByEenheidClass: (eenheidClass) =>
    eenheidClass ==
    "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213", // RO
  destinationInfoQuery: (sender, submission) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        BIND(${sparqlEscapeUri(submission)} as ?submission)
        {
          ?submission
            pav:createdBy ?sender;
            prov:generated ?formData.

          ?formData
            <http://data.europa.eu/eli/ontology#is_about> ?bestuurseenheid.

          VALUES ?worshipType {
            <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>
            <http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst>
          }

          VALUES ?worshipClassifications {
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86>
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
          }

          ?bestuurseenheid a ?worshipType;
            besluit:classificatie ?worshipClassifications;
            mu:uuid ?uuid;
            skos:prefLabel ?label.
        } UNION {
          VALUES ?bestuurseenheid {
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
