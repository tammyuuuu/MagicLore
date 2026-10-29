import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{},Intl,Date};vm.runInNewContext(fs.readFileSync(new URL('../../bazi_patterns.js',import.meta.url),'utf8'),ctx);vm.runInNewContext(fs.readFileSync(new URL('../../bazi_judgment.js',import.meta.url),'utf8'),ctx);
const pillar=(stem,branch,element,hidden)=>({stem,branch,stemAttributes:{element},hiddenStems:hidden.map(([s,e])=>({stem:s,element:e,tenGod:'偏财'})),tenGod:'偏财'});
function fixture(){return {calculatedResult:{year:pillar('戊','戌','土',[['戊','土']]),month:pillar('戊','辰','土',[['戊','土']]),day:pillar('乙','未','木',[['己','土']]),hour:pillar('己','丑','土',[['己','土']])},luckCycles:{startDate:'2020-02-01T00:00:00Z',cycles:[{pillar:'戊寅',startYear:2020,endYear:2029,stemTenGod:'偏财',branchTenGod:'比肩',years:[{year:2027,annual:{pillar:'丁丑',stemTenGod:'伤官'}},{year:2028,annual:{pillar:'戊申',stemTenGod:'偏财'}},{year:2038,annual:{pillar:'戊申',stemTenGod:'偏财'}}]}]}};}
test('does not infer following from an extreme ratio with combinations or clashes',()=>{const m=ctx.window.buildBaziInsight(fixture(),new Date('2026-10-28T00:00:00Z'));assert.equal(m.follow,null);assert.equal(m.unresolved,true);assert.equal(m.favorable.length,0);assert.equal(m.patterns.length,0);});
test('scores stay unavailable, dates are limited and signals follow annual data',()=>{const m=ctx.window.buildBaziInsight(fixture(),new Date('2026-10-28T00:00:00Z'));assert.equal(m.cycles[0].current,true);assert.ok(Object.values(m.cycles[0].scores).every(v=>v===null));assert.equal(m.events.wealth.length,0);assert.equal(m.events.love.length,0);assert.ok(Object.values(m.events).flat().every(x=>x.year<=2035));});
test('current cycle uses start date rather than rounded calendar year',()=>{const r=fixture();r.luckCycles.cycles.push({...r.luckCycles.cycles[0],startYear:2030,endYear:2039,years:[]});const a=ctx.window.buildBaziInsight(r,new Date('2030-01-15T00:00:00Z'));assert.equal(a.cycles[0].current,true);assert.equal(a.cycles[1].current,false);const b=ctx.window.buildBaziInsight(r,new Date('2030-02-02T00:00:00Z'));assert.equal(b.cycles[1].current,true);});
vm.runInNewContext(fs.readFileSync(new URL('../../bazi_plate.js',import.meta.url),'utf8'),ctx);
test('natal clicks explain position and stage clicks explain original chart interaction',()=>{const r=fixture();const day=r.calculatedResult.day;day.branchAttributes={element:'土'};let result=ctx.window.describeBaziPosition(r,day,2,'stem');assert.match(result.text,/日主本人/);result=ctx.window.describeBaziPosition(r,day,2,'branch');assert.match(result.text,/婚姻宫/);assert.match(result.text,/藏己/);const period={...day,title:'流年 2027',stem:'丁',branch:'丑',tenGod:'伤官',stemAttributes:{element:'火'}};result=ctx.window.describeBaziPosition(r,period,5,'stem');assert.match(result.title,/2027/);assert.ok(ctx.window.analyzeBaziPeriod(r,[{pillar:'丁丑',source:'annual',id:'annual'}]).state.interactions.relations.some(x=>x.kind==='冲'&&x.ids.includes('day')));assert.doesNotMatch(result.text,/一定结婚|必然获利/);});

test('month click includes selected luck and annual periods without colliding with the natal month ID',()=>{
 const r=fixture(),stages=[{title:'大运',stem:'戊',branch:'寅'},{title:'流年 2027',stem:'丁',branch:'未'},{title:'流月',stem:'壬',branch:'子'}];
 ctx.document={getElementById:id=>id==='chart'?{_readingColumns:[...Object.values(r.calculatedResult),...stages]}:null};
 const engine=ctx.window.analyzeBaziPeriod;let received;
 ctx.window.analyzeBaziPeriod=(input,periods)=>{received=engine(input,periods);return received;};
 try{
  const reading=ctx.window.describeBaziPosition(r,stages[2],6,'branch');
  assert.ok(received.state.facts);assert.equal(received.state.facts.periods.length,3);
  assert.equal(received.state.facts.periods[2].id,'month-period');assert.equal(received.state.facts.monthBranch,'辰');
  assert.ok(reading.text.endsWith(received.themes.overall));
 }finally{ctx.window.analyzeBaziPeriod=engine;delete ctx.document;}
});
