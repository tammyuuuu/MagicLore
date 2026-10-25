import test from 'node:test';
import assert from 'node:assert/strict';
import {transitThemes,transitDuration} from '../../src/western/transitThemes.js';
import {calculateWesternChart} from '../../src/western/calculateWesternChart.js';
import {tropicalLongitude} from '../../src/vedic/astronomy.js';
const cusps=Array.from({length:12},(_,i)=>i*30);
test('Moon duration is short and reports an hourly continuous interval',()=>{
 const utc='2026-10-06T04:00:00.000Z',longitude=tropicalLongitude('Moon',new Date(utc));const result=transitDuration({planet:'Moon',target:'MC',angle:0},{mc:longitude},{utc,input:{offset:'+08:00'}});
 assert.match(result.label,/短期/);assert.match(result.label,/小时/);assert.ok(Date.parse(result.end)-Date.parse(result.start)<86400000);
});
test('unified reading ranks four unique aspects and computes their contiguous intervals',()=>{
 const input={date:'2000-01-01',time:'12:00',offset:'+08:00',latitude:39.902775,longitude:116.401144,system:'placidus',nodeType:'mean'};
 const natal=calculateWesternChart(input),current=calculateWesternChart({...input,date:'2026-10-06'}),rows=transitThemes(natal,current,{mode:'unified'});
 assert.equal(rows.length,4);assert.equal(new Set(rows.map(r=>r.configurationKeys[0])).size,4);
 assert.ok(rows.every((r,i)=>!i||rows[i-1].stars>=r.stars));
 for(const row of rows){const d=row.duration;assert.ok(Date.parse(d.start)<=Date.parse(current.utc));assert.ok(Date.parse(d.end)>=Date.parse(current.utc));const target=row.aspect.target==='MC'?natal.mc:natal.planets.find(p=>p.name===row.aspect.target).longitude;const orb=ms=>Math.abs(Math.abs(((tropicalLongitude(row.aspect.planet,new Date(ms))-target+540)%360)-180)-row.aspect.angle);assert.ok(orb(Date.parse(d.start))<=3.001);if(!d.clippedStart)assert.ok(orb(Date.parse(d.start)-3600000)>3);}
});
test('short selection excludes covered configurations and ignores generational targets',()=>{
 const natal={cusps,mc:13,planets:[{name:'Sun',longitude:0,house:1},{name:'Neptune',longitude:120,house:5}]};
 const current={planets:[{name:'Moon',longitude:120},{name:'Venus',longitude:120}]};
 const result=transitThemes(natal,current,{mode:'short',exclude:['Moon:Sun:120']});
 assert.ok(result.length<=2);assert.ok(result.every(r=>r.paragraphs.length===3));assert.ok(result.every(r=>!r.configurationKeys.includes('Moon:Sun:120')));assert.ok(result.every(r=>!r.configurationKeys.some(k=>k.includes(':Neptune:'))));
});
test('direct MC aspect selects career without inventing unrelated areas',()=>{
 const result=transitThemes({cusps,mc:0,planets:[]},{planets:[{name:'Saturn',longitude:120}]});
 assert.equal(result.length,1);assert.match(result[0].title,/事业/);assert.match(result[0].paragraphs.join(''),/相位直接触及天顶/);assert.match(result[0].evidence,/拱相/);
});
test('no qualifying aspect does not produce a fixed list of life areas',()=>{
 assert.deepEqual(transitThemes({cusps,mc:13,planets:[]},{planets:[{name:'Saturn',longitude:36}]}),[]);
});
test('sixth house reading explains routines without forecasting disease',()=>{
 const result=transitThemes({cusps,mc:13,planets:[{name:'Sun',longitude:150,house:6}]},{planets:[{name:'Mars',longitude:240}]});
 const health=result.find(r=>r.title.includes('健康'));assert.ok(health);assert.match(health.paragraphs.join(''),/不据此判断疾病/);assert.match(health.evidence,/刑相/);
});
