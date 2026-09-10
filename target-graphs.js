import { ORG_GRAPH_BASE, ORG_GRAPH_SUFFIX, ABB_UUID } from "./config";
import dispatchRules from "./dispatch-rules/entrypoint";

/*
 * The set of graphs this service manages, is defined here through a regex.
 * This definition is calculated upfront, so we can log it on boot of the service.
 * Mirrors calculateDestinatorGraphs (util/queries.js): every organisation plus
 * the ABB default goes to ORG_GRAPH_BASE/<uuid>/<ORG_GRAPH_SUFFIX>, the ABB
 * subgroups only to ORG_GRAPH_BASE/<ABB_UUID>/<subgroup suffix>.
 */
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const abbSubgroupSuffixes = [
  ...new Set(dispatchRules.flatMap((rule) => rule.abbSubgroupDestination ?? [])),
];
export const TARGET_GRAPHS_PATTERN =
  `^${escapeRegex(ORG_GRAPH_BASE)}/[^/]+/${escapeRegex(ORG_GRAPH_SUFFIX)}$` +
  (abbSubgroupSuffixes.length
    ? `|^${escapeRegex(ORG_GRAPH_BASE)}/${escapeRegex(ABB_UUID)}/(${abbSubgroupSuffixes
        .map(escapeRegex)
        .join("|")})$`
    : "");
console.log(`Graphs managed on dispatch: ${TARGET_GRAPHS_PATTERN}`);
