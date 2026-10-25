import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateWesternChart,calculateWesternTransit,houseOf} from '../../src/western/calculateWesternChart.js';
const natal={date:'2000-01-01',time:'12:00',offset:'+08:00',latitude:39.902775,longitude:116.401144,system:'placidus',nodeType:'mean'};
test('transit keeps natal cusps while preserving current planetary positions',()=>{
 const target={...natal,date:'2026-10-06'},base=calculateWesternChart(natal),current=calculateWesternChart(target),transit=calculateWesternTransit(natal,target);
 assert.deepEqual(transit.cusps,base.cusps);assert.equal(transit.asc,base.asc);assert.notEqual(current.asc,transit.asc);
 transit.planets.forEach((p,i)=>{assert.equal(p.longitude,current.planets[i].longitude);assert.equal(p.house,houseOf(p.longitude,base.cusps));});
 assert.equal(transit.aspects.length,0);
 const next=calculateWesternTransit(natal,{...target,time:'18:00'});assert.deepEqual(next.cusps,base.cusps);assert.notEqual(next.planets[1].longitude,transit.planets[1].longitude);
});
