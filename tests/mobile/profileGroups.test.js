import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroup,renameGroup,deleteGroup,moveToGroup,reorderGroups,readGroups,groupKeys,saveGroupOrder,PROFILE_GROUPS_KEY} from '../../profile-groups.js';
import {savePerson,listPeople,exportProfiles,importProfiles} from '../../person-store.js';
import {PROFILE_ORDER_KEY} from '../../profile-order.js';
const memory=()=>{const d=new Map();return {getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),d};};
const facts=name=>({name,sex:'female',notes:'',birth:{date:{calendar:'gregorian',value:'2000-01-01',gregorian:'2000-01-01',isLeapMonth:null,conversion:null},time:'12:00',place:{status:'known',name:'北京',locationId:null,latitude:39.9042,longitude:116.4074,source:'manual'},zone:{iana:'Asia/Shanghai',fixedOffset:null,offsetChoice:null},originalInput:{}}});
test('分组筛选、独立排序及删除只修改归属，档案和全部顺序均保留',()=>{
 const s=memory(),a=savePerson(facts('甲'),null,s),b=savePerson(facts('乙'),null,s),g=createGroup('家人',s),h=createGroup('朋友',s),keys=[a,b].map(p=>'person:'+p.id);
 moveToGroup(keys[0],g.id,s);moveToGroup(keys[1],g.id,s);saveGroupOrder(g.id,[keys[1],keys[0]],s);
 assert.deepEqual(groupKeys(keys,g.id,readGroups(s)),[keys[1],keys[0]]);assert.deepEqual(groupKeys(keys,'all',readGroups(s)),keys);
 renameGroup(h.id,'同事',s);reorderGroups([h.id,g.id],s);assert.deepEqual(readGroups(s).groups.map(g=>g.name),['同事','家人']);
 const raw=JSON.stringify(listPeople({},s));deleteGroup(g.id,s);assert.equal(JSON.stringify(listPeople({},s)),raw);assert.deepEqual(groupKeys(keys,'ungrouped',readGroups(s)),keys);
 assert.throws(()=>reorderGroups([h.id,h.id],s));assert.throws(()=>renameGroup(h.id,' ',s));
});
test('分组、组内顺序和全部顺序可备份往返；旧备份不清除分组',async()=>{
 const s=memory(),a=savePerson(facts('甲'),null,s),b=savePerson(facts('乙'),null,s),g=createGroup('家人',s),keys=[a,b].map(p=>'person:'+p.id);
 moveToGroup(keys[0],g.id,s);moveToGroup(keys[1],g.id,s);saveGroupOrder(g.id,[keys[1],keys[0]],s);s.setItem(PROFILE_ORDER_KEY,JSON.stringify(keys));
 const backup=exportProfiles(s),target=memory();await importProfiles(JSON.stringify(backup),target);
 assert.deepEqual(readGroups(target),readGroups(s));assert.equal(target.getItem(PROFILE_ORDER_KEY),s.getItem(PROFILE_ORDER_KEY));
 await importProfiles(JSON.stringify(backup),target);assert.deepEqual(readGroups(target),readGroups(s));
 const old={...backup};delete old.profileGroups;delete old.profileOrder;await importProfiles(JSON.stringify(old),target);assert.deepEqual(readGroups(target),readGroups(s));
});
test('导入冲突人物及同 ID 异名分组时归属和排序映射正确，重复导入不复制',async()=>{
 const s=memory(),a=savePerson(facts('甲'),null,s),g=createGroup('家人',s),key='person:'+a.id;moveToGroup(key,g.id,s);saveGroupOrder(g.id,[key],s);
 const backup=exportProfiles(s),target=memory();await importProfiles(JSON.stringify(backup),target);
 savePerson({...listPeople({},target)[0],notes:'本机版本'},a.id,target);renameGroup(g.id,'本机组',target);
 await importProfiles(JSON.stringify(backup),target);const people=listPeople({},target),imported=people.find(p=>p.conflictOf===a.id),state=readGroups(target);
 assert.ok(imported);const importedGroup=state.groups.find(x=>x.name==='家人');assert.ok(importedGroup);assert.equal(state.assignments['person:'+imported.id],importedGroup.id);assert.deepEqual(state.orders[importedGroup.id],['person:'+imported.id]);
 await importProfiles(JSON.stringify(backup),target);assert.equal(readGroups(target).groups.length,2);assert.equal(listPeople({},target).length,2);
});
test('损坏分组备份和写入失败均不造成部分档案导入',async()=>{
 const s=memory(),p=savePerson(facts('甲'),null,s);createGroup('家人',s);const backup=exportProfiles(s),target=memory();savePerson(facts('原有'),null,target);const before=[...target.d];
 await assert.rejects(importProfiles(JSON.stringify({...backup,profileGroups:{version:1,groups:[],assignments:{x:'missing'},orders:{}}}),target));assert.deepEqual([...target.d],before);
 const set=target.setItem;let failed=false;target.setItem=(k,v)=>{if(k===PROFILE_GROUPS_KEY&&!failed){failed=true;throw Error('write failed');}set(k,v);};
 await assert.rejects(importProfiles(JSON.stringify(backup),target));assert.equal(listPeople({},target).some(x=>x.id===p.id),false);assert.equal(target.getItem(PROFILE_GROUPS_KEY),null);
});
