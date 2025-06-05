import { sparqlEscapeUri } from "mu";
import { allTypeLocaleBetrokkenheid, repOrgQuerySnippet } from './query-snippets';
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];

/* Excel:
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/besturenVanDeEredienst/6375F8724B5FEAF28DEDE821> Attaqwa
 * GO: <http://data.lblod.info/id/bestuurseenheden/55155a78bd145df7bfa3caaa17ba491fb4dd238f4f4d2c5485bff1be96ca3036> Mol
 * PO: <http://data.lblod.info/id/bestuurseenheden/bd74ee38a4b1e296821a11729c1f704cf439576c7ab2c910c95b067cf183d923> Prov. Antwerpen
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/6375F8724B5FEAF28DEDE821> Attaqwa
**/
let rule = {
  abbSubgroupDestination: [ ORG_GRAPH_SUFFIX, `${ORG_GRAPH_SUFFIX}-LF`],
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitDocumentType/a970c99d-c06c-4942-9815-153bf3e87df2', // Afschrift erkenningszoekende besturen
  matchSentByEenheidClass: (eenheidClass) =>
    eenheidClass ==
    'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86', // Bestuur van de eredienst
  destinationInfoQuery: ( sender ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
        {
          ${allTypeLocaleBetrokkenheid()}
        } UNION {
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
          skos:prefLabel ?label.
        } UNION {
          ${repOrgQuerySnippet()}
        }
      }
    `;
  }
};
rules.push(rule);

export default rules;
