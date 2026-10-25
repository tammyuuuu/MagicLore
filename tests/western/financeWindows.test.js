import test from 'node:test';
import assert from 'node:assert/strict';
import {financeSignals,financeTargets,scanFinanceWindows} from '../../src/western/financeWindows.js';
import {calculateWesternChart} from '../../src/western/calculateWesternChart.js';
import {tropicalLongitude,localToUtc} from '../../src/vedic/astronomy.js';
const input={date:'2000-01-01',time:'12:00',offset:'+08:00',latitude:39.902775,longitude:116.401144,system:'placidus',nodeType:'mean'};
test('financial signals separate opportunities and pressure across zodiac boundary',()=>{
 const targets=[{name:'Venus',longitude:1,role:'金星',category:'income'}];
 assert.equal(financeSignals(targets,{Jupiter:359})[0].category,'income');
 assert.equal(financeSignals(targets,{Saturn:91})[0].category,'pressure');
 assert.equal(financeSignals(targets,{Jupiter:4}).length,0);
});
test('five year windows preserve independent peak evidence and stay within range',async()=>{
 const result=await scanFinanceWindows(input,'2026-10-06');assert.equal(result.end,'2031-10-05');assert.equal(result.days,1826);assert.ok(result.windows.length);
 const targets=financeTargets(calculateWesternChart(input));
 for(const row of result.windows){assert.ok(row.start<=row.peak&&row.peak<=row.end);assert.ok(row.start>=result.start&&row.end<=result.end);const longitude=tropicalLongitude(row.planet,localToUtc(row.peak,'12:00',input.offset));const hit=financeSignals(targets,{[row.planet]:longitude}).find(h=>h.key===row.key);assert.ok(hit);assert.ok(Math.abs(hit.orb-row.minOrb)<1e-8);}
});
test('ten year monthly curve remains relative and covers daily samples once',async()=>{const result=await scanFinanceWindows(input,'2026-10-06',{years:10});assert.equal(result.end,'2036-10-05');assert.equal(result.monthly.length,121);assert.equal(result.monthly.reduce((sum,r)=>sum+r.days,0),result.days);for(const r of result.monthly)for(const key of ['income','shared','pressure'])assert.ok(r[key]>=0&&r[key]<=100);});
test('selected duration controls end date and rejects invalid lengths',async()=>{const result=await scanFinanceWindows(input,'2026-10-06',{years:1});assert.equal(result.end,'2027-10-05');assert.equal(result.days,365);await assert.rejects(scanFinanceWindows(input,'2026-10-06',{years:31}));await assert.rejects(scanFinanceWindows(input,'2026-10-06',{years:1.5}));});
