export const PROFILE_ORDER_KEY='magiclore_profile_order_v1';

// Shared by the archive cards and all chart profile selectors. Unknown/deleted
// keys are ignored; new records retain their existing insertion order at the end.
export function orderedProfileKeys(keys,storage=localStorage){
 const raw=JSON.parse(storage.getItem(PROFILE_ORDER_KEY)||'[]');
 const stored=Array.isArray(raw)?raw.filter(k=>typeof k==='string'):[];
 const available=new Set(keys);
 return [...new Set([...stored,...keys])].filter(k=>available.has(k));
}
