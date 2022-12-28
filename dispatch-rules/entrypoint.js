import notulenRules from './notulen';
import schorschingsbesluitRules from './schorsingsbesluit';
import besluitHandhavenRules from './besluit-handhaven';
import jaarrekeningrules from './jaarrekening';
import adviesJaarrekeningRules from './advies-jaarrekening';
import eindRekeningRules from './eindrekening';
import budgetwijziging from './budgetwijziging';
import adviesBudgetwijzigingRules from './advies-budgetwijziging';
import besluitBudgetwijzigingRules from './besluit-budgetwijziging';
import meerjarenplanwijzigingRules from './meerjarenplanwijziging';

import { sparqlEscapeUri } from "mu";
import { toezichthoudendeQuerySnippet, repOrgQuerySnippet } from './query-snippets';

/*
 * This file exports a list of rule objects, which helps deduce who the targets are for a
 * a specific submission.
 * It tries to translate this file: https://docs.google.com/spreadsheets/d/1NnZHqaFnNToE-aZMiyDI1QIPhHP5EG8i39KGFhTazlg/edit?usp=sharing
 */

const rules = [
  ...notulenRules,
  ...schorschingsbesluitRules,
  ...besluitHandhavenRules,
  ...jaarrekeningrules,
  ...adviesJaarrekeningRules,
  ...eindRekeningRules,
  ...budgetwijziging,
  ...adviesBudgetwijzigingRules,
  ...besluitBudgetwijzigingRules,
  ...meerjarenplanwijzigingRules
];

export default rules;
