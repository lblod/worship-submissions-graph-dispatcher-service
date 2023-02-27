# worship-submissions-graph-dispatcher-service

Microservice that listens to the delta notifier and dispatches submissions (and related) to the correct organisation graphs.
By correct: we mean as defined by business rules

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
## API

### POST /delta
Triggers the preparation of a submission for the export when a resource is sent.
### GET /manual-dispatch?submission=http://bar
Triggers a manual dispatch.
Meant for debugging only.
If no parameters are provided, will dispatch all submissions in DISPATCH_SOURCE_GRAPH.
