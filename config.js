export const ORG_GRAPH_BASE = process.env.ORG_GRAPH_BASE || 'http://mu.semte.ch/graphs/organizations';
export const ORG_GRAPH_SUFFIX = process.env.ORG_GRAPH_SUFFIX || 'ABB_databankErediensten_LB_CompEnts_gebruiker';
export const DISPATCH_SOURCE_GRAPH = process.env.DISPATCH_SOURCE_GRAPH || 'http://mu.semte.ch/graphs/temp/for-dispatch';
export const HEALING_CRON = process.env.HEALING_CRON || '00 07 * * 06'; //Weekly on saturday
export const ENABLE_HEALING = process.env.ENABLE_HEALING == "true";
