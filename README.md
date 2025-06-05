# worship-submissions-graph-dispatcher-service

Microservice that listens to the delta notifier and dispatches submissions (and related) to the correct organisation graphs.
By correct: we mean as defined by business rules. See code for exact implementation.

## Features
  1. on incoming delta, if a `meb:Submission` can be deduced, it will fetch it and dispatch to the correct org graph.
  2. Periodic healing, if enabled, will remove all submissions from their current target graph, and re-dispatch them again.
    - This tackles the case of changes in relations between bestuurseenheden, which affects which organisation a submission should belong to.

## Installation
Add the following snippet to your `docker-compose.yml`:

```yml
worship-submissions-graph-dispatcher:
  image: lblod/worship-submissions-graph-dispatcher-service
```

Configure the delta-notification service to send notifications on the `/delta` endpoint by adding the following rules in `./delta/rules.js`:

```javascript
export default [
  {
    match: {
      graph: {
        type: 'uri',
        value: 'http://mu.semte.ch/graphs/temp/for-dispatch'
      }
    },
    callback: {
      url: 'http://submissions-dispatcher/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 10000,
      ignoreFromSelf: true
    }
  }
]
```
## environment variables
```
ORG_GRAPH_BASE : The base uri of the org graph; defaults to 'http://mu.semte.ch/graphs/organizations';
ORG_GRAPH_SUFFIX : The postfix of the org-graph  defaults to 'ABB_databankErediensten_LB_CompEnts_gebruiker';
DISPATCH_SOURCE_GRAPH : The source graph of the submissions defaults to 'http://mu.semte.ch/graphs/temp/for-dispatch';
HEALING_CRON : cron pattern for healing defaults to '00 07 * * 06'; //Weekly on saturday
ENABLE_HEALING : enables healing, defaults to false
NUMBER_OF_HEALING_QUEUES: the number of healing queues availible, for parallel processing purposes. Defaults to '1'
ABB_UUID: the UUID of ABB, defaults to "141d9d6b-54af-4d17-b313-8d1c30bc3f5b"
```
## API
### POST /delta
Triggers the preparation of a submission for the export when a resource is sent.
#### DEBUG API
The debug API provides a set of endpoints designed to assist in troubleshooting and resolving issues related to the submission dispatch.
Don't expose this API in production.
##### GET `/heal-submission`
This endpoint triggers the healing flow for submissions, clearing the submission from all its target graphs and restarting the dispatching process.

**Usage:**
- To heal a specific submission, provide `?subject=http://submissions/123`
- To heal submissions sent from a specific sentDate, use `?sentDateSince` with the date in `YYYY-MM-DD` format.
- If no query parameters are provided, the healing process will be applied to all submissions.

#### GET `/manual-dispatch`

This endpoint allows for the manual triggering of the dispatch process. It doesn't not clear data in the target graph. It does the dispatch process again.

**Usage:**
- To dispatch a specific submission, provide `?subject=http://submissions/123`
- Without any query parameters, the endpoint will re-dispatch all submissions present in `DISPATCH_SOURCE_GRAPH`.

## Anatomy of a dispatch-rule
Calculating the destinators is complex. It can depend on:
1. Type of document
2. Type of bestuurseenheid who sends it
   2.1. And if ABB is a destinator, extra rules apply
3. Extra information in the submission itself (typically defined in the `eli:is_about` predicate)

The file contains a high-level specification of the rules:
[Business Rules](https://docs.google.com/spreadsheets/d/1NnZHqaFnNToE-aZMiyDI1QIPhHP5EG8i39KGFhTazlg/edit?usp=sharing)
This is what the business uses.

A rule contains the information required to dispatch the submission to the correct (sub-)organization (i.e., the correct graph).
But also a little bit more.

Take for example:

```
  abbSubgroupDestination: [ ORG_GRAPH_SUFFIX, `${ORG_GRAPH_SUFFIX}-LF`],
  documentType:
    "https://data.vlaanderen.be/id/concept/BesluitDocumentType/4f938e44-8bce-4d3a-b5a7-b84754fe981a", // Aanvraag desaffectatie presbyteria/kerken
  matchSentByEenheidClass: (eenheidClass) =>
    eenheidClass ==
    "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001",
  destinationInfoQuery: (sender) => {
    return `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?bestuurseenheid ?uuid ?label WHERE {
        BIND(${sparqlEscapeUri(sender)} as ?sender)
          VALUES ?bestuurseenheid {
            <http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b>
            ${sparqlEscapeUri(sender)}
          }
          ?bestuurseenheid mu:uuid ?uuid;
            skos:prefLabel ?label.
      }
    `;
  },
};
```
A breakdown of the fields:
- `[OPTIONAL] abbSubgroupDestination`:
  If detected that a submission should go to ABB, this field is taken into account.
  Within ABB, at the moment, there are (essentially) two roles: the default one, and LF.
  The default one can access all submissions with destinator ABB, LF only a subset.
  This info is used to generate the correct target graph, only for ABB.
  Currently, no extra rules exist for other target organizations, so this information is ignored in other cases.
- `[REQUIRED] documentType`:
  Specifies what document type the rule applies to. Conceptually speaking, we don't really need this, and we could dump everything in `destinationInfoQuery`. However, this would trigger lots of querying, and we want to avoid this. So this is basically a shorthand.
- `[REQUIRED] matchSentByEenheidClass`: This is a function that returns a boolean, based on the `BestuurseenheidClassificatieCode`.
  Dispatching not only depends on documentType, but also on who created the document. This helps to differentiate the rule.
  Again, conceptually speaking, we don't really need this, and we could dump everything in `destinationInfoQuery`.
  However, this would trigger lots of querying, and we want to avoid this. So this is basically a shorthand.
- `[REQUIRED] destinationInfoQuery`: `function (sender, [optional] submission)` returns the full query to calculate the effective destinators.
  Sometimes, sender info is not sufficient; the submission can also contain (extra) information about whom the submission is intended for.
  Only destinationInfoQuery will return the correct query to match the bestuurseenheden where the submission should go to.
