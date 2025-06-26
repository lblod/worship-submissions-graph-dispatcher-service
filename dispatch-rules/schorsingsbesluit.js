import { sparqlEscapeUri } from "mu";
import { ORG_GRAPH_SUFFIX } from '../config';

const rules = [];

/* Excel: Rules number: 9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/14278813524c762255aeba149e7d7134ddecfbb43e7d56910731bd4e13e34f39> Prov. limburg
 * PO: <http://data.lblod.info/id/bestuurseenheden/14278813524c762255aeba149e7d7134ddecfbb43e7d56910731bd4e13e34f39> Limburg
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * RO: <http://data.lblod.info/id/representatieveOrganen/e224c637ba8bb0e5dfbb87da225b4652> Executief van de Moslims van België
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/e17dabfaf8f562ad181f422006c42e97> CB van de Islamitische gemeenschappen in Limburg
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/a8880f3d8b482788c5f3adbf58f01b4f> Islamitische geloofsgemeenschap Al Mouhsinine van Bilzen
 * Testing:
 *--------------------------
 * -SENDER-: <http://data.lblod.info/id/bestuurseenheden/f08dca136aca8cfd86913c6e452ca3b763d618b52aec02f8864443942c50277a> Gem. Roosdaal
 * GO: <http://data.lblod.info/id/bestuurseenheden/f08dca136aca8cfd86913c6e452ca3b763d618b52aec02f8864443942c50277a> Gem. Roosdaal
 * PG: <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b> ABB
 * RO: <http://data.lblod.info/id/representatieveOrganen/2089dc85d4ba48a7f28ee4b521af2b26> Aartsbisdom Mechelen-Brussel
 * CB: <http://data.lblod.info/id/centraleBesturenVanDeEredienst/c0916729a896db2a6947027182bb1128> CKB Roosdaal
 * EB: <http://data.lblod.info/id/besturenVanDeEredienst/ece3ff12e1fdba111ce2bf3d5edf7c0e> Kerkfabriek St.-Apollonia van Roosdaal (Pamel)
**/
let rule = {
  abbSubgroupDestination: [ ORG_GRAPH_SUFFIX, `${ORG_GRAPH_SUFFIX}-LF`],
  documentType: 'https://data.vlaanderen.be/id/concept/BesluitType/b25faa84-3ab5-47ae-98c0-1b389c77b827', // schorsingsbesluit
  matchSentByEenheidClass: eenheidClass => {
    return [
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000',
      'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001' ]
      .indexOf(eenheidClass) > -1 ;
  },
  destinationInfoQuery: ( sender, submission ) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

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
           <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
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
          ?bestuurseenheid org:linkedTo ?aboutEenheid ;
            mu:uuid ?uuid ;
            skos:prefLabel ?label;
            a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
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
