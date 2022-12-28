import notulenRules from './notulen';
import schorschingsbesluitRules from './schorsingsbesluit';
import besluitHandhavenRules from './besluit-handhaven';
import jaarrekeningrules from './jaarrekening';
import adviesJaarrekeningRules from './advies-jaarrekening';
import eindRekeningRules from './eindrekening';
import budgetwijziging from './budgetwijziging';
import adviesBudgetwijzingRules from './advies-budgetwijziging';

import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

/*
 * This file exports a list of rule objects, which helps deduce who the targets are for a
 * a specific submission.
 * It tries to translate this file: https://docs.google.com/spreadsheets/d/1NnZHqaFnNToE-aZMiyDI1QIPhHP5EG8i39KGFhTazlg/edit?usp=sharing
 */

const rules = [
  ...notulenRules,
  ...schorschingsbesluitRules,
  ...besluitHandhavenRules,
  ...jaarrekeningrules,
  ...adviesJaarrekeningRules,
  ...eindRekeningRules,
  ...budgetwijziging,
  ...adviesBudgetwijzingRules
];

// Excel: Rules number: 9, 11, 13, 15, 17, 19, 21, 23, 25, 27
// TODO: we need an extension in loket to go 'down the tree', a PO can have multiple EB, CB.
// This is for a next story

/* Excel: Rules number: 101, 102, 103, 104
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/b0ffe0e981a7e887a0b949d7ff77096b> CKB Tongeren
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625> Tongeren
* RO: <http://data.lblod.info/id/representatieveOrganen/c98e270d84a8455b2f4bf16b915aeff2> Bisdom Hasselt
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
*/
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/2c9ada23-1229-4c7e-a53e-acddc9014e4e', // Meerjarenplan(wijziging) - CB namens EB's
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054', // Centraal bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${toezichthoudendeQuerySnippet()}
        } UNION {
          ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        }
      }
    `;
  }
};
rules.push(rule);

/* Excel: Rules number: 100
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/d52de436e194111289248db2d06e99ac> Kerkfabriek O.-L.-Vrouw van Deinze
* CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/7f5475cfb202d12f54779f046441c9e1> CKB Deinze
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/f56c645d-b8e1-4066-813d-e213f5bc529f', //Meerjarenplan(wijziging) - EB met CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', //EB
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ?bestuurseenheid org:hasSubOrganization ?sender;
            <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>;
            mu:uuid ?uuid.
        } UNION {
          VALUES ?bestuurseenheid {
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        }
      }
    `;
  }
};
rules.push(rule);


/* Excel: Rules number: 105, 106, 107, 108
* Testing:
*--------------------------
* -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/44329be9ac7054b39adbc583b6203ba2> Protestantse Kerk Christengemeente Emmanuel van Haacht
* GEMEENTE: <http://data.lblod.info/id/bestuurseenheden/2ad0d123f4a81787572342c394a1917b81752f42d802d1e013941f56b53bdd2a> Haacht
* PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
* RO: <http://data.lblod.info/id/representatieveOrganen/6f79a1b89678b85009484da7c4a104bc> Administratieve Raad van de Protestants-Evangelische Eredienst
**/
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/f56c645d-b8e1-4066-813d-e213f5bc529f', //Meerjarenplan(wijziging) - EB zonder CB
  matchSentByEenheidClass: eenheidClass => eenheidClass == 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', //EB
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${toezichthoudendeQuerySnippet()}
          FILTER NOT EXISTS {
            ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
              <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
          }
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
          }
          ?bestuurseenheid mu:uuid ?uuid.

          FILTER NOT EXISTS {
            ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
              <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
          }
        } UNION {
          ${repOrgQuerySnippet()}

          FILTER NOT EXISTS {
            ?cb <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
              <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
          }
        } UNION {
          VALUES ?bestuurseenheid {
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
