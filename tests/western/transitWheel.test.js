import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {calculateWesternChart,calculateWesternTransit} from '../../src/western/calculateWesternChart.js';
import {placePlanetSymbols} from '../../src/western/planetSymbolLayout.js';
import {planetSymbol} from '../../src/western/planetSymbols.js';
import {planetDetails} from '../../src/western/planetDetails.js';
import {splitLongitude,normalizeLongitude as norm} from '../../src/vedic/zodiac.js';
const source=fs.readFileSync(new URL('../../src/western/westernApp.js',import.meta.url),'utf8');
const context={placePlanetSymbols,planetSymbol,planetDetails,splitLongitude,norm};vm.createContext(context);vm.runInContext(source.slice(source.indexOf('const names='),source.indexOf('function drawInteractive('))+';this.renderWheel=wheel;',context);
const input=JSON.parse(fs.readFileSync(new URL('./swiss-fixtures.json',import.meta.url),'utf8'))[0];
test('叠盘只有一张SVG，十颗本命与十颗行运行星分层可点',()=>{
 const natal=calculateWesternChart(input),current=calculateWesternTransit(input,{...input,date:'2026-10-26'}),svg=context.renderWheel(current,natal);
 assert.equal((svg.match(/<svg /g)||[]).length,1);assert.equal((svg.match(/data-layer="natal"/g)||[]).length,10);assert.equal((svg.match(/data-layer="transit"/g)||[]).length,10);assert.equal((svg.match(/role="button"/g)||[]).length,20);
 for(const m of svg.matchAll(/class="western-aspect western-cross-aspect" data-angle="(\d+)"/g))assert.ok([0,60,90,120,180].includes(Number(m[1])));
 assert.ok((svg.match(/western-cross-aspect/g)||[]).length<=24);
});
test('切换行运日期后本命行星位置不动，零容许度没有交叉相位',()=>{
 const natal=calculateWesternChart(input),first=calculateWesternTransit(input,{...input,date:'2026-10-26'}),next=calculateWesternTransit(input,{...input,date:'2026-11-26',transitOrb:0});
 const coordinates=svg=>[...svg.matchAll(/data-planet-name="([^"]+)" data-layer="natal" data-x="([^"]+)" data-y="([^"]+)"/g)].map(m=>m.slice(1));
 const a=context.renderWheel(first,natal),b=context.renderWheel(next,natal);assert.deepEqual(coordinates(a),coordinates(b));assert.ok(!b.includes('western-cross-aspect'));
 const independent=context.renderWheel(calculateWesternChart({...input,date:'2026-10-26'}));assert.ok(!independent.includes('data-layer="natal"'));assert.equal((independent.match(/role="button"/g)||[]).length,10);
});
