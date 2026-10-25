import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateVedicChart} from '../../src/vedic/calculateVedicChart.js';
import {navamsaNarrative} from '../../src/vedic/navamsaNarrative.js';
test('Venus ruling D9 seventh has distinct relationship and daily-life content',()=>{
 const c=calculateVedicChart({date:'2000-01-01',time:'12:00:00',latitude:39.9,longitude:116.4,timezoneOffset:'+08:00'});
 c.lagna.siderealLongitude=210/9;c.grahas.find(p=>p.name==='Venus').siderealLongitude=210/9;
 const r=navamsaNarrative(c),a=r.cards[0],b=r.cards[1];
 assert.match(a.evidence,/宫主星金星/);assert.match(b.paragraphs[0],/同时是D9第7宫主星/);
 assert.notEqual(a.title.split(' · ')[1],b.title.split(' · ')[1]);
 for(const p of a.paragraphs)assert.ok(!b.paragraphs.includes(p));
 assert.match(b.paragraphs[1],/个人空间/);
});
