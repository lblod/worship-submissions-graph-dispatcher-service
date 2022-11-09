import { sparqlEscapeUri } from "mu";
/*
 * This file exports a list of rule objects, which helps deduce who the targets are for a
 * a specific submission.
 * It tries to translate this file: https://docs.google.com/spreadsheets/d/1NnZHqaFnNToE-aZMiyDI1QIPhHP5EG8i39KGFhTazlg/edit?usp=sharing
 * TODO's
 *  ABB needs UUID
 *  no centrale besturen van eredienst linked to eredienstbesturen
 *  addresses van alles
 *  more rules
 */

const rules = [];

/*
 * Sender: EB
 */
// Excel: Rules number: 1,2,3,4
let rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/8e791b27-7600-4577-b24e-c7c29e0eb773', // Notulen EB
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86',
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
            a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
            <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>;
            mu:uuid ?uuid.

        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        } UNION {
          ?bestuurseenheid org:linkedTo ?sender ;
            mu:uuid ?uuid ;
            a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
        }
      }
    `;
  }
};
rules.push(rule);

// Excel: Rules number: 77
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/54b61cbd-349f-41c4-9c8a-7e8e67d08347', // Eindrekening (ER)
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86',
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        VALUES ?bestuurseenheid {
          <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
          ${sparqlEscapeUri(sender)}
        }
        ?bestuurseenheid mu:uuid ?uuid.
      }
    `;
  }
};
rules.push(rule);

// Excel: Rules number: 83, 84, 90, 91
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/40831a2c-771d-4b41-9720-0399998f1873', // Budget(wijziging)
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86',
  destinationInfoQuery: ( sender ) => {
    return `
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX org: <http://www.w3.org/ns/org#>

        SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
          BIND(${sparqlEscapeUri(sender)} as ?sender)
          {
            ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
              <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
              a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

            ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
              <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>;
              mu:uuid ?uuid.

          } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
          } UNION {
             ?bestuurseenheid <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
               a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
               mu:uuid ?uuid.
          } UNION {
              VALUES ?bestuurseenheid {
                ${sparqlEscapeUri(sender)}
              }
              ?bestuurseenheid mu:uuid ?uuid.
          }
        }
    `;
  }
};
rules.push(rule);

// Excel: Rules number: 63, 64, 65, 66
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/e44c535d-4339-4d15-bdbf-d4be6046de2c', //Jaarrekening (JR) - EB met CB
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86',
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
            a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
            <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>;
            mu:uuid ?uuid.

        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        } UNION {
          ?bestuurseenheid <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
            a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
            mu:uuid ?uuid.
        }
      }
    `;
  }
};
rules.push(rule);

// Excel: Rules number: 100, 105, 106, 107, 108
rule = {
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/f56c645d-b8e1-4066-813d-e213f5bc529f', //Meerjarenplan(wijziging) - EB met CB
  sendByType: 'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86',
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>

      SELECT DISTINCT ?bestuurseenheid ?uuid WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
            a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
            <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>;
            mu:uuid ?uuid.

        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid
        } UNION {
          ?bestuurseenheid <http://www.w3.org/ns/org#hasSubOrganization> ?sender;
            a <http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst>;
            mu:uuid ?uuid.
        } UNION {
            ?bestuurseenheid org:linkedTo ?sender ;
              mu:uuid ?uuid ;
              a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
          }
      }
    `;
  }
};
rules.push(rule);

export default rules;
