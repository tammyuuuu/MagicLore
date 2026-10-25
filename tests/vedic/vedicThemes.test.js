import test from 'node:test';import assert from 'node:assert/strict';
import {calculateVedicChart} from '../../src/vedic/calculateVedicChart.js';
import {vedicThemeNarrative} from '../../src/vedic/themeNarrative.js';
const input={date:'2000-01-01',time:'12:00:00',latitude:39.902775,longitude:116.401144,timezoneOffset:'+08:00'};
test('all twelve topics have actual house and lord evidence including nodes',()=>{const chart=calculateVedicChart(input),r=vedicThemeNarrative(chart);assert.equal(r.cards.length,12);assert.equal(new Set(r.cards.map(c=>c.house)).size,12);for(const c of r.cards){assert.equal(c.paragraphs.length,3);assert.ok(c.evidence.includes('第'+c.house+'宫'));assert.ok(c.stars>=1&&c.stars<=5);}const full=JSON.stringify(r);assert.ok(full.includes('罗睺'));assert.ok(full.includes('计都'));assert.ok(!full.includes('undefined'));assert.ok(r.cards.every((c,i)=>i===0||r.cards[i-1].importance>=c.importance));});
test('different birth time recomputes topic placements and emphasis',()=>{const a=vedicThemeNarrative(calculateVedicChart(input)),b=vedicThemeNarrative(calculateVedicChart({...input,time:'00:00:00'}));assert.notDeepEqual(a,b);});
