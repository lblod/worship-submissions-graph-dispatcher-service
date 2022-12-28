import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

const rules = [];

/* Excel: Rules number: 83
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/7f5475cfb202d12f54779f046441c9e1> CKB Deinze
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/40831a2c-771d-4b41-9720-0399998f1873', // Budget(wijziging)
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', //EB met CB
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ?bestuurseenheid org:hasSubOrganization ?sender;
            <http://data.vlaanderen.be/ns/besluit#classificatie>
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>;
              skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER EXISTS {
              ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
                <http://data.vlaanderen.be/ns/besluit#classificatie>
                  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
            }
          } UNION {
            VALUES ?bestuurseenheid {
              ${sparqlEscapeUri(sender)}
            }

            ?bestuurseenheid skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER EXISTS {
              ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
                <http://data.vlaanderen.be/ns/besluit#classificatie>
                  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
            }
          }
        }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 84, 90, 91
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/44329be9ac7054b39adbc583b6203ba2> Protestantse Kerk Christengemeente Emmanuel van Haacht
* RO: <http://data.lblod.info/id/representatieveOrganen/6f79a1b89678b85009484da7c4a104bc> Administratieve Raad van de Protestants-Evangelische Eredienst
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/40831a2c-771d-4b41-9720-0399998f1873', // Budget(wijziging)
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', //EB zonder CB
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ${toezichthoudendeQuerySnippet()}
            FILTER NOT EXISTS {
              ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
                <http://data.vlaanderen.be/ns/besluit#classificatie>
                  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              skos:prefLabel ?label;
              a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.

            FILTER NOT EXISTS {
              ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
                <http://data.vlaanderen.be/ns/besluit#classificatie>
                  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          } UNION {
            VALUES ?bestuurseenheid {
              ${sparqlEscapeUri(sender)}
            }

            ?bestuurseenheid skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER NOT EXISTS {
              ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
                <http://data.vlaanderen.be/ns/besluit#classificatie>
                  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          }
        }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 85, 88, 89
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/b0ffe0e981a7e887a0b949d7ff77096b> CKB Tongeren
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625> Tongeren
* RO: <http://data.lblod.info/id/representatieveOrganen/c98e270d84a8455b2f4bf16b915aeff2> Bisdom Hasselt
*/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/18833df2-8c9e-4edd-87fd-b5c252337349', // Budget(wijziging) - CB namens EB's
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054', // Centraal bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ${toezichthoudendeQuerySnippet()}
          } UNION {
            VALUES ?bestuurseenheid {
              ${sparqlEscapeUri(sender)}
            }
            ?bestuurseenheid mu:uuid ?uuid;
              skos:prefLabel ?label.
          } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
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
