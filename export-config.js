/*
 * This file is used as helper for fetching related subjects to a meb:Submission.
 * It provides some path template queries as a shorthand to fetch the related subject.
 * See code to check how it is used.
 * TODO: it might probably be more elegant, but it shortens code.
 */
export default [
  {
    type: `http://mu.semte.ch/vocabularies/ext/SubmissionDocument`,
    pathToSubmission: `?submission <http://purl.org/dc/terms/subject> ?subject;
                        a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://lblod.data.gift/vocabularies/besluit/TaxRate`,
    pathToSubmission: `?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/taxRate> ?subject.`
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/AuthenticityType`,
    pathToSubmission: `?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/authenticityType> ?subject.`
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/TaxType`,
    pathToSubmission: `?submission <http://www.w3.org/ns/prov#generated> ?formData;
                         a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://mu.semte.ch/vocabularies/ext/taxType> ?subject.`
  },
  {
    type: `http://mu.semte.ch/vocabularies/ext/ChartOfAccount`,
    pathToSubmission: `?submission <http://www.w3.org/ns/prov#generated> ?formData;
                        a <http://rdf.myexperiment.org/ontologies/base/Submission>.
                       ?formData <http://lblod.data.gift/vocabularies/besluit/chartOfAccount> ?subject.`
  },
  {
    type: `http://www.w3.org/2004/02/skos/core#Concept`,
    pathToSubmission: `
    VALUES ?conceptScheme {
      <http://lblod.data.gift/concept-schemes/5cecec47-ba66-4d7a-ac9d-a1e7962ca4e2>
      <http://lblod.data.gift/concept-schemes/ac9bc402-c8e6-41fd-ad57-fad15622e560>
      <https://data.vlaanderen.be/id/conceptscheme/BesluitType>
      <https://data.vlaanderen.be/id/conceptscheme/BesluitDocumentType>
      <http://data.vlaanderen.be/id/conceptscheme/BestuurseenheidClassificatieCode>
      <http://lblod.data.gift/concept-schemes/b65b15ba-6755-4cd2-bd07-2c2cf3c0e4d3>
      <http://lblod.data.gift/concept-schemes/c93ccd41-aee7-488f-86d3-038de890d05a>
      <http://lblod.data.gift/concept-schemes/71e6455e-1204-46a6-abf4-87319f58eaa5>
    }
    {
      ?subject <http://www.w3.org/2004/02/skos/core#inScheme> ?conceptScheme.
    }
    UNION {
      ?subject <http://www.w3.org/2004/02/skos/core#topConceptOf> ?conceptScheme.
    }
    ?submission <http://www.w3.org/ns/prov#generated> ?formData .
    {
      ?formData <http://lblod.data.gift/vocabularies/besluit/authenticityType> ?subject.
    } UNION {
      ?formData <http://mu.semte.ch/vocabularies/ext/regulationType> ?subject.
    } UNION {
      ?formData <http://mu.semte.ch/vocabularies/ext/decisionType> ?subject.
    } UNION {
      ?formData <http://mu.semte.ch/vocabularies/ext/taxType> ?subject.
    } UNION {
      ?formData <http://data.europa.eu/eli/ontology#passed_by> / <http://data.vlaanderen.be/ns/mandaat#isTijdspecialisatieVan> / <http://data.vlaanderen.be/ns/besluit#bestuurt> / <http://data.vlaanderen.be/ns/besluit#classificatie> ?subject.
    }`
  },
  {
    type: `http://lblod.data.gift/vocabularies/automatische-melding/FormData`,
    pathToSubmission: `?submission <http://www.w3.org/ns/prov#generated> ?subject;
                       a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?subject.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?remoteFile.
                       ?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?remoteFile.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource>
                                / <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?remoteFile.
                       ?submission <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> ?remoteFile.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/meta-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?s a <http://mu.semte.ch/vocabularies/ext/SubmissionDocument>.
                       ?submission <http://purl.org/dc/terms/subject> ?s.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/form-data-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?s a <http://mu.semte.ch/vocabularies/ext/SubmissionDocument>.
                       ?submission <http://purl.org/dc/terms/subject> ?s.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://purl.org/dc/terms/type> <http://data.lblod.gift/concepts/form-file-type>.
                       ?s <http://purl.org/dc/terms/source> ?subject.
                       ?s a <http://mu.semte.ch/vocabularies/ext/SubmissionDocument>.
                       ?submission <http://purl.org/dc/terms/subject> ?s.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?formData <http://purl.org/dc/terms/hasPart> ?subject.
                       ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject`,
    pathToSubmission: `?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?virtualFile .
                       ?formData <http://purl.org/dc/terms/hasPart> ?virtualFile.
                       ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject`,
    pathToSubmission: `?formData <http://purl.org/dc/terms/hasPart> ?subject.
                       ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
    type: `http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#LocalFileDataObject`,
    pathToSubmission: `?subject <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#dataSource> ?vfile.
                       ?formData <http://purl.org/dc/terms/hasPart> ?vfile.
                       ?formData a <http://lblod.data.gift/vocabularies/automatische-melding/FormData>.
                       ?submission <http://www.w3.org/ns/prov#generated> ?formData.
                       ?submission a <http://rdf.myexperiment.org/ontologies/base/Submission>.`
  },
  {
   type: `http://rdf.myexperiment.org/ontologies/base/Submission`,
   pathToSubmission: `?submission a <http://rdf.myexperiment.org/ontologies/base/Submission> .\n FILTER(?submission = ?subject)`
  },
];
