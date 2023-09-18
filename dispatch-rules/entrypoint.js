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
import adviesMeerjarenplanwijzigingRules from './advies-meerjarenplanwijziging';

import besluitMeerjarenplanwijzigingRules from './besluit-meerjarenplanwijziging';

import aanvraagDesaffectatiePresbyteriaKerken from './aanvraag-desaffectatie-presbyteria-kerken';
import opvragenBijkomendeInlichtingenEredienstbesturen from './opvragen-bijkomende-inlichtingen-eredienstbesturen';
import reactieOpOpvragenBijkomendeInlichtingenDoorDeToezichthouderAanEeEredienstbesturen from './reactie-op-opvragen-bijkomende-inlichtingen-door-de-toezichthouder-aan-de-eredienstbesturen';
/*
 * This file exports a list of rule objects, which helps deduce who the targets are for a
 * a specific submission.
 * It tries to translate this file: https://docs.google.com/spreadsheets/d/1NnZHqaFnNToE-aZMiyDI1QIPhHP5EG8i39KGFhTazlg/edit?usp=sharing
 * Rule object has the following shape:
 *  {
 *    documentType: 'http://uri/of/type/doc',
 *    matchSentByEenheidClass: eenheidClass => { returns true if bestuurseenheidClassificatieCode matches }
 *    destinationInfoQuery: ( sender, submission = null ) => {
 *      returns string of query to execute to find matching eenheiden where to dispatch to
 *    }
 *  }
 *
 * The property of documentType and matchSentByEenheidClass are used to pre-filter the rules. This to avoid extra load on the database.
 * Only destinationInfoQuery will return the correct query to match the bestuurseenheden where the submission should go to.
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
  ...meerjarenplanwijzigingRules,
  ...adviesMeerjarenplanwijzigingRules,
  ...besluitMeerjarenplanwijzigingRules,
  ...aanvraagDesaffectatiePresbyteriaKerken,
  ...opvragenBijkomendeInlichtingenEredienstbesturen,
  ...reactieOpOpvragenBijkomendeInlichtingenDoorDeToezichthouderAanEeEredienstbesturen
];

export default rules;
