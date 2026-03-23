/**
 * Object which contains a mapping between parent and child submission types.
 * If `includeChildSubmissions` is `true` for a certain dispatch rule, child submissions matching this whitelist object are also dispatched.
 */

export const CHILD_SUBMISSION_WHITELIST_MAPPING = {
  // Jaarrekeningen van de besturen van de eredienst
  "https://data.vlaanderen.be/id/concept/BesluitDocumentType/672bf096-dccd-40af-ab60-bd7de15cc461":
    // Jaarrekening
    "https://data.vlaanderen.be/id/concept/BesluitType/e44c535d-4339-4d15-bdbf-d4be6046de2c",

  // Budgetten(wijzigingen) - Indiening bij representatief orgaan
  "https://data.vlaanderen.be/id/concept/BesluitDocumentType/18833df2-8c9e-4edd-87fd-b5c252337349":
    // Budget(wijziging) - Indiening bij centraal bestuur of representatief orgaan
    "https://data.vlaanderen.be/id/concept/BesluitType/d463b6d1-c207-4c1a-8c08-f2c7dd1fa53b",

  // Budgetten(wijzigingen) - Indiening bij toezichthoudende gemeente of provincie
  "https://data.vlaanderen.be/id/concept/BesluitDocumentType/ce569d3d-25ff-4ce9-a194-e77113597e29":
    // Budget(wijziging) - Indiening bij centraal bestuur of representatief orgaan
    "https://data.vlaanderen.be/id/concept/BesluitType/d463b6d1-c207-4c1a-8c08-f2c7dd1fa53b",

  // Meerjarenplannen(wijzigingen) van de besturen van de eredienst
  "https://data.vlaanderen.be/id/concept/BesluitDocumentType/2c9ada23-1229-4c7e-a53e-acddc9014e4e":
    // Meerjarenplan(aanpassing)
    "https://data.vlaanderen.be/id/concept/BesluitType/f56c645d-b8e1-4066-813d-e213f5bc529f",
};
