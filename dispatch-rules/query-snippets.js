export const allTypeLocaleBetrokkenheid = () => `
          VALUES ?classificatie {
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000>
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>
          }
          VALUES ?typeLocaleBetrokkenheid {
            <http://lblod.data.gift/concepts/86fcbbbff764f1cba4c7e10dbbae578e>
            <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>
            <http://lblod.data.gift/concepts/0f845f00ee76099c89518cbaf6a7b77f>
          }
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
          <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> ?typeLocaleBetrokkenheid.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
          <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie;
          mu:uuid ?uuid;
          <http://www.w3.org/2004/02/skos/core#prefLabel> ?label.
`;

export const toezichtAndFinancierendBetrokkenheid = () => `
          VALUES ?classificatie {
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000>
            <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>
          }
          VALUES ?typeLocaleBetrokkenheid {
            <http://lblod.data.gift/concepts/86fcbbbff764f1cba4c7e10dbbae578e>
            <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>
          }
          ?betrokkenBestuur
            <http://www.w3.org/ns/org#organization> ?aboutEenheid ;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> ?typeLocaleBetrokkenheid .
          ?bestuurseenheid
            <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur ;
            <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie ;
            mu:uuid ?uuid ;
            <http://www.w3.org/2004/02/skos/core#prefLabel> ?label .
`;

export const toezichthoudendeQuerySnippet = () => `
          VALUES ?classificatie {
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000>
              <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>
          }
          ?betrokkenBestuur <http://www.w3.org/ns/org#organization> ?sender;
            <http://data.lblod.info/vocabularies/erediensten/typebetrokkenheid> <http://lblod.data.gift/concepts/ac400cc9f135ac7873fb3e551ec738c1>;
            a <http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen>.

          ?bestuurseenheid <http://data.lblod.info/vocabularies/erediensten/betrokkenBestuur> ?betrokkenBestuur;
            <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie;
            mu:uuid ?uuid;
            <http://www.w3.org/2004/02/skos/core#prefLabel> ?label.
`;

export const repOrgQuerySnippet = () => `
          ?bestuurseenheid org:linkedTo ?sender ;
            mu:uuid ?uuid ;
            <http://www.w3.org/2004/02/skos/core#prefLabel> ?label;
            a <http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan>.
`;
