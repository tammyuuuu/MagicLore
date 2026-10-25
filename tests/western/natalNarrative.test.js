import test from 'node:test';import assert from 'node:assert/strict';
import {calculateWesternChart} from '../../src/western/calculateWesternChart.js';
import {natalNarrative} from '../../src/western/natalNarrative.js';
const input={date:'2000-01-01',time:'12:00',offset:'+08:00',latitude:39.902775,longitude:116.401144,system:'placidus',nodeType:'mean'};
test('natal reading leads with global synthesis then detailed supported priorities',()=>{
 const chart=calculateWesternChart(input),rows=natalNarrative(chart);assert.ok(rows.length===14);assert.match(rows[0].title,/整张盘/);assert.ok(rows.every(r=>r.paragraphs.length===3&&r.evidence));assert.equal(new Set(rows.map(r=>r.title)).size,rows.length);assert.ok(rows.slice(1).every((r,i,rs)=>!i||rs[i-1].importance>=r.importance));
 const aspectCards=rows.filter(r=>r.evidence.includes('偏差'));assert.ok(aspectCards.length<=3);for(const row of aspectCards)assert.ok(chart.aspects.some(a=>row.evidence.includes(a.label)&&row.evidence.includes(a.orb.toFixed(2))));
});
test('changing the chart changes actual narrative evidence and main areas',()=>{
 const a=natalNarrative(calculateWesternChart(input)),b=natalNarrative(calculateWesternChart({...input,date:'2001-06-15',time:'20:00'}));assert.notEqual(a[0].evidence,b[0].evidence);assert.notDeepEqual(a.map(r=>r.evidence),b.map(r=>r.evidence));
});
test('whole sign reading separates tenth cusp and MC',()=>{
 const rows=natalNarrative(calculateWesternChart({...input,system:'whole'}));assert.match(rows.find(r=>r.house===10).paragraphs[0],/分别读取/);
});

test('theme order varies with chart and is supported by natal factors',()=>{
 const t=natalNarrative(calculateWesternChart({...input,date:'2000-02-09',time:'07:45',latitude:30.378032,longitude:114.315443}));
 const other=natalNarrative(calculateWesternChart(input));
 assert.notDeepEqual(t.slice(1).map(r=>r.title),other.slice(1).map(r=>r.title));
 assert.ok(t.some(r=>r.title.startsWith('财富')));assert.ok(t.some(r=>r.house===12));
 assert.ok(t.some(r=>r.evidence.includes('第1宫3颗行星')));
});

test('all twelve houses including love and family have stars in descending order',()=>{
 const rows=natalNarrative(calculateWesternChart(input)).slice(1).filter(r=>r.house);
 assert.deepEqual(rows.map(r=>r.house).sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
 assert.ok(rows.every(r=>r.stars>=1&&r.stars<=5&&r.meta.includes('重要性')));
 assert.ok(rows.every((r,i)=>!i||rows[i-1].stars>=r.stars));
 assert.match(rows.find(r=>r.house===4).title,/家庭/);assert.match(rows.find(r=>r.house===5).title,/爱情/);
 assert.match(rows.find(r=>r.house===7).title,/伴侣/);
});

test('node axis includes actual signs houses selected node type and deduplicates conjunctions',()=>{
 for(const nodeType of ['mean','true']){
  const chart=calculateWesternChart({...input,nodeType});const rows=natalNarrative(chart);const card=rows.find(r=>r.northHouse);
  assert.ok(card);assert.match(card.evidence,new RegExp(`北交点.+第${chart.planets.find(p=>p.name==='NorthNode').house}宫`));
  assert.ok(card.evidence.includes(nodeType==='true'?'真交点':'平均交点'));
  assert.match(card.paragraphs.join(''),/熟悉|成长/);
  assert.equal(rows.filter(r=>r.northHouse).length,1);
 }
});
