import test from 'node:test';import assert from 'node:assert/strict';
import {financeExplanation} from '../../src/western/financeWindows.js';
const chart={cusps:[330,0,30,60,90,120,150,180,210,240,270,300],planets:[{name:'Saturn',longitude:40,house:2},{name:'Jupiter',longitude:10,house:2}],mc:245,input:{system:'placidus'}};
const row={planet:'Saturn',target:'MC',angle:120,transitHouse:1,topicHouse:10};
test('MC explanation states actual Saturn houses and the career to money chain',()=>{const result=financeExplanation(row,chart);assert.match(result.explanation[0].note,/第11宫/);assert.match(result.explanation[0].note,/第12宫/);assert.match(result.explanation[0].note,/第2宫/);assert.match(result.chain,/宫主星木星 → 第2宫/);assert.match(result.connection,/间接/);assert.match(result.explanation[2].text,/120°/);});
test('career ruler outside money houses explicitly limits wealth evidence',()=>{const weaker={...chart,planets:chart.planets.map(p=>p.name==='Jupiter'?{...p,house:9}:p)};const result=financeExplanation(row,weaker);assert.match(result.connection,/有限/);assert.match(result.explanation[3].text,/没有直接落入第2宫或第8宫/);});
test('whole sign MC is not presented as the tenth cusp',()=>{const result=financeExplanation(row,{...chart,input:{system:'whole'}});assert.match(result.explanation[1].text,/天顶不一定是第10宫宫头/);});
