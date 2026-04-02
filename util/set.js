/**
 * @template T
 * @param {Set<T>} set 
 * @param  {...T} items 
 * @returns 
 */

export function addMany(set, ...items){
  for (const item of items) {
    set.add(item);
  }
  return set;
}