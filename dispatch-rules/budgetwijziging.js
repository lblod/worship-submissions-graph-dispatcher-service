import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet } from "./query-snippets";

const rules = [];

/* Excel: Rules number: 83
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/7f5475cfb202d12f54779f046441c9e1> CKB Deinze
**/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/d463b6d1-c207-4c1a-8c08-f2c7dd1fa53b', // Budget(wijziging) - Indiening bij Centraal bestuur of Representatief orgaan - EB met CB 
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', //EB met CB
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

        SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ?bestuurseenheid org:hasSubOrganization ?sender;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>;
              skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
            }
          } UNION {
            VALUES ?bestuurseenheid {
              ${sparqlEscapeUri(sender)}
            }

            ?bestuurseenheid skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
            }
          }
        }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 84, 163
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/44329be9ac7054b39adbc583b6203ba2> Protestantse Kerk Christengemeente Emmanuel van Haacht
* RO: <http://data.lblod.info/id/representatieveOrganen/6f79a1b89678b85009484da7c4a104bc> Administratieve Raad van de Protestants-Evangelische Eredienst
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/d463b6d1-c207-4c1a-8c08-f2c7dd1fa53b', // Budget(wijziging) - Indiening bij Centraal bestuur of Representatief orgaan - EB zonder CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // EB zonder CB
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>

        SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            FILTER NOT EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              skos:prefLabel ?label;
              a ere:RepresentatiefOrgaan.

            FILTER NOT EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          } UNION {
            VALUES ?bestuurseenheid {
              <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
              ${sparqlEscapeUri(sender)}
            }

            ?bestuurseenheid skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER NOT EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          }
        }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 90, 91, 146
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/44329be9ac7054b39adbc583b6203ba2> Protestantse Kerk Christengemeente Emmanuel van Haacht
* Gemeente : <http://data.lblod.info/id/bestuurseenheden/b942231860865ab0c4108651b117f69a755a04186df97e767707e5d95955ebbd> Boortmeerbeek
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/d85218e2-a75f-4a30-9182-512b5c9dd1b2', // Budget(wijziging)- Indiening bij toezichthoudende gemeente of provincie - EB zonder CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // EB zonder CB
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

        SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ${toezichthoudendeQuerySnippet()}
            FILTER NOT EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          } UNION {
            VALUES ?bestuurseenheid {
              <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
              ${sparqlEscapeUri(sender)}
            }

            ?bestuurseenheid skos:prefLabel ?label;
              mu:uuid ?uuid.

            FILTER NOT EXISTS {
              ?cb org:hasSubOrganization ?sender;
                besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>.
            }
          }
        }
    `;
  }
};
rules.push(rule);

/* Excel: Rule number: 88, 89, 145
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/b0ffe0e981a7e887a0b949d7ff77096b> CKB Tongeren
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625> Tongeren
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
*/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/ce569d3d-25ff-4ce9-a194-e77113597e29', // Budgetten(wijzigingen) - Indiening bij toezichthoudende gemeente of provincie - CB namens EB's
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
              <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
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

/* Excel: Rules number: 85, 164
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/b0ffe0e981a7e887a0b949d7ff77096b> CKB Tongeren
* RO: <http://data.lblod.info/id/representatieveOrganen/c98e270d84a8455b2f4bf16b915aeff2> Bisdom Hasselt
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
*/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/18833df2-8c9e-4edd-87fd-b5c252337349', // Budgetten(wijzigingen) - betreffende besturen van de eredienst - Indiening bij Representatief orgaan - CB namens EB's
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054', // Centraal bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            VALUES ?bestuurseenheid {
              <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
              ${sparqlEscapeUri(sender)}
            }
            ?bestuurseenheid mu:uuid ?uuid;
              skos:prefLabel ?label.
          } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              skos:prefLabel ?label;
              a ere:RepresentatiefOrgaan.
          }
        }
    `;
  }
};
rules.push(rule);


/**
 * Previous form named Budget, see (https://github.com/lblod/manage-submission-form-tooling/blob/master/formSkeleton/forms/Budget/besturen-van-de-eredienst/form.ttl)
 * was used but this form doesn't exist anymore for worship services, it has been replaced by Budget(wijziging) - Indiening bij centraal bestuur of representatief orgaan 
 * We still need to add dispatching rules for this Budget form because of old submissions that were created. As they don't share the same form structure and URI's they serve the same purpose.
 * Rules : Sender EB with CB = receiver EB and CB / Sender EB without CB = receiver EB and RO + ABB
*/

/*
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/44329be9ac7054b39adbc583b6203ba2> Protestantse Kerk Christengemeente Emmanuel van Haacht
* RO: <http://data.lblod.info/id/representatieveOrganen/6f79a1b89678b85009484da7c4a104bc> Administratieve Raad van de Protestants-Evangelische Eredienst
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
*/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/40831a2c-771d-4b41-9720-0399998f1873', // Budget EB without CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          FILTER NOT EXISTS {
            ?centraalBestuur org:hasSubOrganization ?sender ;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bentraalBestuur-f650b0604054> .
          }
        } UNION {
          ?bestuurseenheid org:linkedTo ?sender ;
            mu:uuid ?uuid ;
            skos:prefLabel ?label ;
            a ere:RepresentatiefOrgaan .

          FILTER NOT EXISTS {
            ?centraalBestuur org:hasSubOrganization ?sender ;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054> .
          }
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }

          ?bestuurseenheid skos:prefLabel ?label ;
            mu:uuid ?uuid.

          FILTER NOT EXISTS {
            ?centraalBestuur org:hasSubOrganization ?sender ;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054> .
          }
        }
      }
    `;
  }
};
rules.push(rule);

/*
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/7f5475cfb202d12f54779f046441c9e1> CKB Deinze
*/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/40831a2c-771d-4b41-9720-0399998f1873', // Budget EB with CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          FILTER EXISTS {
            ?centraalBestuur org:hasSubOrganization ?sender ;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054> .
          }
        } UNION {
          ?bestuurseenheid org:hasSubOrganization ?sender ;
            mu:uuid ?uuid ;
            skos:prefLabel ?label ;
            a ere:CentraalBestuurVanDeEredienst  .
        } UNION {
          VALUES ?bestuurseenheid {
            ${sparqlEscapeUri(sender)}
          }

          ?bestuurseenheid skos:prefLabel ?label ;
            mu:uuid ?uuid.

          FILTER EXISTS {
            ?centraalBestuur org:hasSubOrganization ?sender ;
              besluit:classificatie <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054> .
          }
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;