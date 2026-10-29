export const PROFILE_GROUPS_KEY='magiclore_profile_groups_v1';
export const emptyGroups=()=>({version:1,groups:[],assignments:{},orders:{}});
const validKey=x=>typeof x==='string'&&x.length>0&&x.length<500&&!['__proto__','constructor','prototype'].includes(x);
export function validateGroups(s){
 if(!s||s.version!==1||!Array.isArray(s.groups)||s.groups.length>200||!s.assignments||!s.orders||typeof s.assignments!=='object'||typeof s.orders!=='object'||Array.isArray(s.assignments)||Array.isArray(s.orders))throw Error('分组资料格式无效。');
 const ids=new Set();for(const g of s.groups){if(!validKey(g.id)||['all','ungrouped'].includes(g.id)||ids.has(g.id)||typeof g.name!=='string'||!g.name.trim()||g.name.length>40)throw Error('分组名称或编号无效。');ids.add(g.id);}
 for(const [k,v]of Object.entries(s.assignments))if(!validKey(k)||!ids.has(v))throw Error('档案分组归属无效。');
 for(const [k,v]of Object.entries(s.orders))if(!validKey(k)||k!=='ungrouped'&&!ids.has(k)||!Array.isArray(v)||v.length>20000||v.some(x=>!validKey(x)))throw Error('分组排序资料无效。');
 return s;
}
export function readGroups(storage=localStorage){return validateGroups(JSON.parse(storage.getItem(PROFILE_GROUPS_KEY)||JSON.stringify(emptyGroups())));}
export function saveGroups(s,storage=localStorage){validateGroups(s);storage.setItem(PROFILE_GROUPS_KEY,JSON.stringify(s));}
export function createGroup(name,storage=localStorage){const s=readGroups(storage),g={id:'group-'+crypto.randomUUID(),name:name.trim()};s.groups.push(g);saveGroups(s,storage);return g;}
export function renameGroup(id,name,storage=localStorage){const s=readGroups(storage),g=s.groups.find(g=>g.id===id);if(!g)throw Error('分组不存在。');g.name=name.trim();saveGroups(s,storage);}
export function deleteGroup(id,storage=localStorage){const s=readGroups(storage);s.groups=s.groups.filter(g=>g.id!==id);for(const [k,v]of Object.entries(s.assignments))if(v===id)delete s.assignments[k];delete s.orders[id];saveGroups(s,storage);}
export function moveToGroup(key,id,storage=localStorage){const s=readGroups(storage);if(id&&!s.groups.some(g=>g.id===id))throw Error('分组不存在。');if(id)s.assignments[key]=id;else delete s.assignments[key];for(const k of Object.keys(s.orders))s.orders[k]=s.orders[k].filter(x=>x!==key);saveGroups(s,storage);}
export function reorderGroups(ids,storage=localStorage){const s=readGroups(storage);if(ids.length!==s.groups.length||new Set(ids).size!==ids.length||ids.some(id=>!s.groups.some(g=>g.id===id)))throw Error('分组顺序无效。');s.groups=ids.map(id=>s.groups.find(g=>g.id===id));saveGroups(s,storage);}
export function groupKeys(keys,id,s){if(id==='all')return [...keys];const available=keys.filter(k=>(s.assignments[k]||'ungrouped')===id);return [...new Set([...(s.orders[id]||[]),...available])].filter(k=>available.includes(k));}
export function saveGroupOrder(id,keys,storage=localStorage){const s=readGroups(storage);s.orders[id]=keys;saveGroups(s,storage);}
export function mergeGroups(current,incoming,idMap={}){
 const a=structuredClone(validateGroups(current)),b=validateGroups(incoming),map={};
 const key=k=>k.startsWith('person:')?'person:'+(Object.hasOwn(idMap,k.slice(7))?idMap[k.slice(7)]:k.slice(7)):k;
 for(const g of b.groups){let id=g.id;const existing=a.groups.find(x=>x.id===id);if(existing&&existing.name!==g.name){let h=2166136261;for(const c of g.name)h=Math.imul(h^c.codePointAt(0),16777619);id=g.id+'-import-'+(h>>>0).toString(36);}map[g.id]=id;if(!a.groups.some(x=>x.id===id))a.groups.push({...g,id});}
 for(const [k,v]of Object.entries(b.assignments)){const dest=key(k);if(!Object.hasOwn(a.assignments,dest))a.assignments[dest]=map[v];}
 for(const [id,keys]of Object.entries(b.orders)){const target=Object.hasOwn(map,id)?map[id]:id;a.orders[target]=[...new Set([...(Object.hasOwn(a.orders,target)?a.orders[target]:[]),...keys.map(key)])];}
 return validateGroups(a);
}
