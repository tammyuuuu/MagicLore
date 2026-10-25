import test from 'node:test';import assert from 'node:assert/strict';
import {calculateRelocation,relocationNarrative} from '../../src/western/relocation.js';
const input={date:'2000-01-01',time:'12:00',offset:'+08:00',latitude:39.902775,longitude:116.401144,system:'placidus',nodeType:'mean'};
test('relocation preserves instant, longitudes, nodes and planetary aspects',()=>{
 const r=calculateRelocation(input,{place:'纽约',latitude:40.7128,longitude:-74.006});
 assert.equal(r.natal.utc,r.relocated.utc);assert.equal(r.relocated.input.offset,'+08:00');
 assert.deepEqual(r.natal.planets.map(p=>[p.name,p.longitude,p.retrograde]),r.relocated.planets.map(p=>[p.name,p.longitude,p.retrograde]));
 assert.deepEqual(r.natal.aspects,r.relocated.aspects);assert.notEqual(r.natal.asc,r.relocated.asc);assert.notEqual(r.natal.mc,r.relocated.mc);
 assert.ok(r.natal.planets.some((p,i)=>p.house!==r.relocated.planets[i].house));
 assert.equal(input.longitude,116.401144);
});
test('same location reproduces natal houses under every supported house system',()=>{
 for(const system of ['placidus','whole','equal']){
 const r=calculateRelocation({...input,system},{place:'北京',latitude:input.latitude,longitude:input.longitude});
 assert.deepEqual(r.natal.cusps,r.relocated.cusps);assert.deepEqual(r.natal.planets,r.relocated.planets);
 }
});
test('interpretation covers twelve fields and explains actual moved planets',()=>{
 const r=calculateRelocation(input,{place:'上海',latitude:31.2304,longitude:121.4737}),rows=relocationNarrative(r);
 assert.equal(rows.length,12);assert.ok(rows.every((row,i)=>!i||rows[i-1].stars>=row.stars));
 for(const row of rows){assert.equal(row.paragraphs.length,3);assert.ok(row.evidence.includes(`第${row.house}宫`));}
 const moved=r.relocated.planets.find(p=>p.name==='Sun'&&p.house!==r.natal.planets.find(n=>n.name===p.name).house);
 if(moved)assert.match(rows.find(row=>row.house===moved.house).paragraphs[0],/太阳.*进入重置/);
});
test('blank or out of range target coordinates cannot silently become valid locations',()=>{
 assert.throws(()=>calculateRelocation(input,null));assert.throws(()=>calculateRelocation(input,{latitude:'',longitude:''}));
 assert.throws(()=>calculateRelocation(input,{latitude:91,longitude:0}));
});
