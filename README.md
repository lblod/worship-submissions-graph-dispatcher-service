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
DISPATCH_SOURCE_GRAPH_FILES: The source graph of the files for the submissions defaults to 'http://mu.semte.ch/graphs/temp/original-physical-files-data';
HEALING_CRON : cron pattern for healing defaults to '00 07 * * 06'; //Weekly on saturday
ENABLE_HEALING : enables healing, defaults to false
```
## API
### POST /delta
Triggers the preparation of a submission for the export when a resource is sent.
### [DEBUG] GET /manual-dispatch?subject=http://bar
Triggers a manual dispatch.
Meant for debugging only.
If no parameters are provided, will dispatch all submissions in DISPATCH_SOURCE_GRAPH.
### [DEBUG] GET /heal-submission?subject=http://bar
Triggers the healing of one submission, or all of them if no param is given
Meant for debugging only.
