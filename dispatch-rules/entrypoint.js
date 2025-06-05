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
import erekenningReguliereProcedure from './erekenning-reguliere-procedure';
import naamswijziging from './naamswijziging';
import opheffingVanAnnexeKerkenEnKapelanijen from './opheffing-van-annexe-kerken-en-kapelanijen';
import wijzigingGebiedsomschrijving from './wijziging-gebiedsomschrijving';
import samenvoeging from './samenvoeging';
import meldingOnvolledigheidInzendingEredienstbestuur from './melding-onvolledigheid-inzending-eredienstbestuur';
import opstartBeroepsprocedureNaarAanleidingVanEenBeslissing from './opstart-beroepsprocedure-naar-aanleiding-van-een-beslissing';
import afschriftErkenningszoekendeBesturen from './afschrift-erkenningszoekende-besturen';
import meldingInterneBeslissingTotSamenvoeging from './melding-interne-beslissing-tot-samenvoeging';

/*
 * This file exports a list of rule objects, which helps deduce who the targets are for a
 * a specific submission.
 * Check the README.md#Anatomy of a dispatch-rule.
 * Please, if things change in the format of the rules, please update the doc there.
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
  ...reactieOpOpvragenBijkomendeInlichtingenDoorDeToezichthouderAanEeEredienstbesturen,
  ...erekenningReguliereProcedure,
  ...naamswijziging,
  ...opheffingVanAnnexeKerkenEnKapelanijen,
  ...samenvoeging,
  ...wijzigingGebiedsomschrijving,
  ...meldingOnvolledigheidInzendingEredienstbestuur,
  ...opstartBeroepsprocedureNaarAanleidingVanEenBeslissing,
  ...afschriftErkenningszoekendeBesturen,
  ...meldingInterneBeslissingTotSamenvoeging
];

export default rules;
