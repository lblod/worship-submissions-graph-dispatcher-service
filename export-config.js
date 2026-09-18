import { sparqlEscapeUri } from "mu";
import { DISPATCH_SOURCE_GRAPH } from "./config";

/*
 * This file is used as helper for fetching related subjects to a meb:Submission.
 * It provides some path template queries as a shorthand to fetch the related subject.
 * See code to check how it is used.
 * TODO: it might probably be more elegant, but it shortens code.
 */
export default [
  {
    type: `http://mu.semte.ch/vocabularies/ext/SubmissionDocument`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://purl.org/dc/terms/subject> ?subject;
                        a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://lblod.data.gift/vocabularies/besluit/TaxRate`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/taxRate> ?subject.
    }`,
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/AuthenticityType`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/authenticityType> ?subject.
    }`,
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/TaxType`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://mu.semte.ch/vocabularies/ext/taxType> ?subject.
    }`,
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/ChartOfAccount`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.w3.org/ns/prov#generated> ?formData;
                        a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/chartOfAccount> ?subject.
    }`,
  },
  {
    type: `http://lblod.data.gift/vocabularies/automatische-melding/FormData`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.w3.org/ns/prov#generated> ?subject;
                       a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?subject.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?remoteFile.
                       ?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?remoteFile.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource>
                                / <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?remoteFile.
                       ?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?remoteFile.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/meta-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?s a <http://mu.semte.ch/vocabularies/ext/SubmissionDocument>.
                       ?submission <http://purl.org/dc/terms/subject> ?s.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/form-data-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?s a <http://mu.semte.ch/vocabularies/ext/SubmissionDocument>.
                       ?submission <http://purl.org/dc/terms/subject> ?s.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/form-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?submission <http://purl.org/dc/terms/subject> ?s.`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?formData <http://purl.org/dc/terms/hasPart> ?subject.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?virtualFile .
                       ?formData <http://purl.org/dc/terms/hasPart> ?virtualFile.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?formData <http://purl.org/dc/terms/hasPart> ?subject.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
    }`,
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#LocalFileDataObject`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?vfile.
                       ?formData <http://purl.org/dc/terms/hasPart> ?vfile.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
    }`,
  },
  {
    type: `http://rdf.myexperiment.org/ontologies/base/Submission`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission> .
                       BIND(?submission as ?subject)
    }`,
  },
  {
    type: `http://data.vlaanderen.be/ns/besluit#Artikel`,
    pathToSubmission: `GRAPH ${sparqlEscapeUri(DISPATCH_SOURCE_GRAPH)} {
      ?subject a <http://data.vlaanderen.be/ns/besluit#Artikel>.
                      ?submissionDocument <http://data.europa.eu/eli/ontology#has_part> ?subject.
                      ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>;
                         <http://purl.org/dc/terms/subject> ?submissionDocument.
    }`,
  },
];
