s# worship-submissions-graph-dispatcher-service

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
```
## API
### POST /delta
Triggers the preparation of a submission for the export when a resource is sent.
#### DEUBG API
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
