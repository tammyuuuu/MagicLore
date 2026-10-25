import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateWesternChart,houseOf} from '../../src/western/calculateWesternChart.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('./swiss-fixtures.json',import.meta.url),'utf8'));
const difference=(a,b)=>Math.abs(((a-b+540)%360)-180);
for(const fixture of fixtures)test(`Swiss reference ${fixture.date} ${fixture.latitude}`,()=>{
  const chart=calculateWesternChart(fixture),ref=fixture.reference;
  for(const p of chart.planets.slice(0,10))assert.ok(difference(p.longitude,ref.planets[p.name])<.03,`${p.name}: ${difference(p.longitude,ref.planets[p.name])}°`);
  assert.ok(difference(chart.asc,ref.asc)<.02,`ASC ${difference(chart.asc,ref.asc)}°`);
  assert.ok(difference(chart.mc,ref.mc)<.02,`MC ${difference(chart.mc,ref.mc)}°`);
  chart.cusps.forEach((value,i)=>assert.ok(difference(value,ref.cusps[i])<.02,`cusp ${i+1}: ${difference(value,ref.cusps[i])}°`));
});
test('whole sign and equal house boundaries wrap at Aries',()=>{
  for(const system of ['whole','equal']){const chart=calculateWesternChart({...fixtures[0],system});assert.equal(chart.cusps.length,12);chart.cusps.forEach((c,i)=>assert.equal(houseOf(c,chart.cusps),i+1));}
});
test('reject invalid coordinates and polar Placidus without silently changing system',()=>{
  assert.throws(()=>calculateWesternChart({...fixtures[0],latitude:95}));
  assert.throws(()=>calculateWesternChart({...fixtures[0],latitude:70}),/极圈/);
  assert.doesNotThrow(()=>calculateWesternChart({...fixtures[0],latitude:70,system:'whole'}));
});
