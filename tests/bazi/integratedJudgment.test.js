import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { makeJudgmentFacts,elementAfter } from '../../src/bazi/rules/judgmentFacts.js';
import { analyzeBaziJudgment } from '../../src/bazi/rules/judgmentEngine.js';
import { analyzeInteractions } from '../../src/bazi/rules/interactions.js';
import { classifyStrengthRatio } from '../../src/bazi/rules/strength.js';
import { analyzeBaziPeriod,scoreLuckCycles,cycleStart,SCORE_POLICY } from '../../src/bazi/rules/periodScoring.js';
import { buildUnifiedBaziInsight } from '../../src/bazi/rules/integratedInsight.js';
import { calculateBaziWithPatterns } from '../../src/bazi/services/analyzeBazi.js';
import { renderTrendSvg } from '../../src/bazi/ui/trendChart.js';
import {balancedFlowEffects,balancedFlowProfile,flowActors,indirectThemeEffects} from '../../src/bazi/rules/balancedFlow.js';
import {periodCapacityEffects} from '../../src/bazi/rules/periodCapacity.js';

const keys=['year','month','day','hour'];
function chart(text,gender='female'){
 return {calculatedResult:Object.fromEntries(text.split(' ').map((name,i)=>[keys[i],{name,stem:name[0],branch:name[1]}])),input:{gender}};
}
const analyze=text=>analyzeBaziJudgment(chart(text));
const freeze=o=>{Object.freeze(o);for(const v of Object.values(o))if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);return o;};
const realInput={gender:'female',date:'1990-09-23',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'};

test('balanced charts score actual capacity changes without waiting for a named pattern',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1999-07-07',time:'06:00',gender:'male',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true});
 assert.deepEqual(Object.values(r.calculatedResult).map(p=>p.name),['己卯','庚午','庚申','己卯']);
 assert.equal(r.judgmentAnalysis.level,'平衡');
 const cycles=scoreLuckCycles(r);
 for(const theme of ['overall','career','wealth','relationship']){
  assert.ok(cycles.every(c=>Number.isFinite(c.scores[theme])),theme);
  assert.ok(new Set(cycles.map(c=>c.scores[theme])).size>1);
  assert.equal((renderTrendSvg(cycles,theme).match(/class="bt-line"/g)||[]).length,7);
 }
 for(const pillar of ['丁卯','丙寅']){
  const p=analyzeBaziPeriod(r,[{pillar,id:'luck',source:'luck'}]),c=p.contributions.wealth.find(c=>c.id==='capacity-change');
  assert.ok(c.value<0);assert.ok(c.evidence.guaranteedChange<0);assert.ok(c.evidence.anchors.length);
  assert.equal(p.state.strength.kind,'weak');
 }
 const p=analyzeBaziPeriod(r,[{pillar:'戊辰',id:'luck',source:'luck'}]);
 assert.ok(p.contributions.relationship.some(c=>c.id==='resource-capacity'&&c.evidence.actors.length===3));
 // Direct analysis does not depend on the surrounding luck-cycle scores.
 const stripped={...r,luckCycles:{...r.luckCycles,cycles:[]}};
 assert.deepEqual(analyzeBaziPeriod(stripped,[{pillar:'丁卯',id:'luck',source:'luck'}]).scores,analyzeBaziPeriod(r,[{pillar:'丁卯',id:'luck',source:'luck'}]).scores);
});

test('capacity uses guaranteed direction and real anchors, never an interval midpoint or invented load',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1999-07-07',time:'06:00',gender:'male'}),baseline=r.judgmentAnalysis;
 const state=analyzeBaziJudgment(r,[{pillar:'丁卯',id:'luck',source:'luck'}]);
 const disputed={...state,strength:{...state.strength,interval:[.35,.55]}};
 const ranges=[];
 assert.equal(periodCapacityEffects(baseline,disputed,(theme,u)=>ranges.push({theme,...u})).some(e=>e.id==='capacity-change'),false);
 assert.ok(ranges.some(u=>u.theme==='wealth'&&u.low<0&&u.high===0));
 const noAnchors={...baseline,facts:{...baseline.facts,natal:[]}};
 assert.deepEqual(periodCapacityEffects(noAnchors,state),[]);
 assert.deepEqual(periodCapacityEffects({...baseline,special:{status:'uncertain'}},state),[]);
 assert.deepEqual(periodCapacityEffects(baseline,{...state,special:{status:'uncertain'}}),[]);
 assert.equal(periodCapacityEffects(baseline,baseline).some(e=>e.id==='capacity-change'),false);
});

test('summer weak wood: resource and authority periods retain actual indirect thematic effects',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'2002-06-15',time:'12:00',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true});
 assert.equal(r.judgmentAnalysis.dayMaster,'甲');assert.equal(r.judgmentAnalysis.level,'身弱');
 const p=analyzeBaziPeriod(r,[{pillar:'庚子',source:'luck',id:'luck'}]);
 const support=p.contributions.wealth.find(c=>c.id==='indirect-resource-peer-1');
 assert.ok(support.value>0);assert.ok(support.evidence.some(e=>e.id==='luck'&&e.element==='水'));
 assert.ok(support.evidence.some(e=>e.id==='day'&&e.element==='木'));
 assert.ok(p.contributions.wealth.some(c=>c.id==='indirect-resource-output--1'&&c.value>0));
 assert.equal(p.contributions.wealth.some(c=>c.id==='incoming-element'),false);
 const cycles=scoreLuckCycles(r);
 assert.deepEqual(cycles.map(c=>c.pillar),['乙巳','甲辰','癸卯','壬寅','辛丑','庚子','己亥','戊戌']);
 for(const theme of ['overall','career','wealth','relationship']){
  assert.ok(cycles.every(c=>Number.isFinite(c.scores[theme])));
  assert.equal((renderTrendSvg(cycles,theme).match(/class="bt-line"/g)||[]).length,7);
  for(const c of cycles){assert.ok(c.contributions[theme].length);assert.equal(c.scores[theme],Math.round(Math.max(0,Math.min(100,50+c.contributions[theme].reduce((s,x)=>s+x.value,0)))*10)/10);}
 }
 const stage=analyzeBaziPeriod(r,[{pillar:'戊戌',source:'luck',id:'luck'}]);
 assert.equal(stage.state.special.status,'ordinary');assert.equal(stage.state.special.phase,'ordinary-period-actions');
 assert.ok(stage.state.interactions.transformed.some(t=>t.kind==='三合'&&t.element==='火'));
 assert.equal(stage.state.patternAnalysis.patterns.some(t=>t.name.startsWith('从')),false);
});

test('indirect thematic effects require known target direction and effective actors, not a generic resource bonus',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'2002-06-15',time:'12:00'}),baseline=r.judgmentAnalysis;
 const state=analyzeBaziJudgment(r,[{pillar:'庚子',source:'luck',id:'luck'}]);
 const groups={wealth:['wealth','output','peer']};
 const effects=indirectThemeEffects(baseline,state,groups);assert.ok(effects.length);
 const unresolved={...baseline,preferences:{...baseline.preferences,evaluations:baseline.preferences.evaluations.map(e=>({...e,sign:null}))}};
 assert.deepEqual(indirectThemeEffects(unresolved,state,groups),[]);
 assert.deepEqual(indirectThemeEffects(baseline,baseline,groups),[]);
 assert.deepEqual(indirectThemeEffects({...baseline,special:{status:'uncertain'}},state,groups),[]);
 const reversed={...baseline,preferences:{...baseline.preferences,evaluations:baseline.preferences.evaluations.map(e=>({...e,sign:e.sign===null?null:-e.sign}))}};
 const inverse=indirectThemeEffects(reversed,state,groups);
 assert.deepEqual(inverse.map(e=>e.direction),effects.map(e=>-e.direction));
 const blocked={...state,interactions:{...state.interactions,boundIds:[...state.interactions.boundIds,'luck']}};
 assert.ok(indirectThemeEffects(baseline,blocked,groups).every(e=>e.evidence.every(a=>a.id!=='luck'||a.layer!=='stem')));
});

test('reported archive 1997-07-01 06:00 Beijing has eight evidence-backed points for every theme',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1997-07-01',time:'06:00',gender:'male',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true});
 assert.deepEqual(Object.values(r.calculatedResult).map(p=>p.name),['丁丑','丙午','甲辰','丁卯']);
 assert.equal(r.judgmentAnalysis.level,'身弱');
 const cycles=scoreLuckCycles(r);assert.equal(cycles[5].pillar,'庚子');
 for(const theme of ['overall','career','wealth','relationship']){
  assert.ok(cycles.every(c=>Number.isFinite(c.scores[theme])));
  assert.equal((renderTrendSvg(cycles,theme).match(/class="bt-line"/g)||[]).length,7);
  for(const c of cycles){
   assert.equal(c.scores[theme],Math.round(Math.max(0,Math.min(100,50+c.contributions[theme].reduce((s,x)=>s+x.value,0)))*10)/10);
   for(const sentence of c.themes[theme].split('。').filter(Boolean))assert.ok(c.contributions[theme].some(x=>x.text.includes(sentence)));
  }
 }
 assert.ok(cycles[5].contributions.wealth.some(c=>c.id==='indirect-resource-peer-1'));
 assert.ok(cycles[5].contributions.wealth.some(c=>c.id==='indirect-authority-peer--1'&&c.value<0));
});

test('a same-element temporary day join does not reclassify an ordinary natal chart as disputed transformation',()=>{
 const natal=analyze('戊戌 乙酉 庚申 壬午');
 assert.equal(natal.special.status,'ordinary');assert.ok(natal.interactions.transformed.some(x=>x.layer==='stem'&&x.ids.includes('day')&&x.element===natal.element));
 const r=calculateBaziWithPatterns({...realInput,gender:'male',date:'1999-10-05',time:'06:00',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true});
 assert.equal(r.judgmentAnalysis.level,'偏强');assert.equal(r.judgmentAnalysis.special.status,'ordinary');
 const p=analyzeBaziPeriod(r,[{pillar:'乙丑',source:'luck',id:'luck'}]);
 assert.equal(p.state.special.status,'ordinary');assert.equal(p.state.special.phase,'ordinary-same-qi-join');
 assert.ok(p.state.interactions.transformed.some(x=>x.layer==='stem'&&x.ids.includes('day')&&x.element==='金'));
 assert.equal(p.state.dayMaster,'庚');assert.equal(p.state.patternAnalysis.patterns.some(x=>x.name.startsWith('化')),false);
 const cycles=scoreLuckCycles(r);assert.equal(cycles.at(-1).pillar,'乙丑');
 for(const theme of ['overall','career','wealth','relationship']){
  assert.ok(cycles.every(c=>Number.isFinite(c.scores[theme])));
  assert.equal((renderTrendSvg(cycles,theme).match(/class="bt-line"/g)||[]).length,7);
  for(const c of cycles){assert.ok(c.contributions[theme].length);assert.equal(c.scores[theme],Math.round(Math.max(0,Math.min(100,50+c.contributions[theme].reduce((s,x)=>s+x.value,0)))*10)/10);}
 }
});

test('a temporary join changing the day-master element still preserves the unresolved structural gate',()=>{
 const r=calculateBaziWithPatterns({...realInput,gender:'female',date:'1991-06-22',time:'17:30'});
 assert.equal(r.judgmentAnalysis.special.status,'ordinary');
 const p=analyzeBaziPeriod(r,[{pillar:'戊戌',source:'luck',id:'luck'}]);
 assert.ok(p.state.interactions.transformed.some(x=>x.layer==='stem'&&x.ids.includes('day')&&x.element!==p.state.element));
 assert.equal(p.state.special.status,'uncertain');assert.ok(Object.values(p.scores).every(v=>v===null));
});

test('Beijing 2000-02-07 14:00 counts same-pillar flow and supplied qi without claiming a direct root',()=>{
 const r=calculateBaziWithPatterns({...realInput,gender:'male',date:'2000-02-07',time:'14:00',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true});
 assert.equal(r.judgmentAnalysis.level,'平衡');
 const p=analyzeBaziPeriod(r,[{pillar:'庚辰',source:'luck',id:'luck'}]);
 const actors=flowActors(p.state),metal=actors.find(a=>a.id==='year'&&a.layer==='stem');
 assert.equal(metal.rootType,'supplied');assert.equal(metal.rooted,false);assert.ok(metal.sources.includes('year'));assert.ok(metal.sources.includes('luck'));
 assert.ok(!actors.some(a=>a.id==='luck'&&a.layer==='stem')); // 庚与日干乙合绊，不借供源强行启用。
 const effects=balancedFlowEffects(r.judgmentAnalysis,p.state);
 assert.ok(effects.some(e=>e.id==='flow-wealth-authority'&&e.evidence.some(a=>a.id==='luck')&&e.evidence.some(a=>a.id==='year'&&a.rootType==='supplied')));
 assert.ok(balancedFlowProfile(r.judgmentAnalysis).some(e=>e.id==='wealth-authority'));
 assert.equal(r.judgmentAnalysis.patternAnalysis.status,'uncertain');
 for(const cycle of scoreLuckCycles(r))for(const t of ['overall','career','wealth','relationship']){
  assert.ok(Number.isFinite(cycle.scores[t]));assert.ok(cycle.contributions[t].length);
  assert.equal(cycle.scores[t],Math.round(Math.max(0,Math.min(100,50+cycle.contributions[t].reduce((sum,c)=>sum+c.value,0)))*10)/10);
 }
});

test('one-step supply cannot recursively create a rootless fire-earth-metal chain',()=>{
 const input=chart('庚子 戊子 乙卯 丁亥');
 const j=analyzeBaziJudgment(input,[{pillar:'戊子',source:'luck',id:'luck'}]),actors=flowActors(j);
 assert.ok(actors.some(a=>a.element==='火'&&a.rootType==='supplied'));
 assert.ok(!actors.some(a=>a.element==='土'||a.element==='金'));
});

test('seven strength grades have reproducible independent theme scores and matching interpretations',()=>{
 const samples=[['身弱','1991-01-17','02:30'],['偏弱','1990-10-25','04:30'],['平衡','1990-06-21','16:30'],['偏强','1990-01-16','01:30'],['身强','1990-09-24','01:30']].map(([level,date,time])=>({level,r:calculateBaziWithPatterns({...realInput,gender:'male',date,time})}));
 samples.push({level:'从弱',r:chart('辛巳 辛丑 乙酉 乙酉')},{level:'从强',r:chart('癸卯 乙卯 甲寅 乙亥')});
 for(const {level,r}of samples){
  const j=analyzeBaziJudgment(r);assert.equal(j.level,level);
  const pillars=r.luckCycles?.cycles.map(c=>c.pillar)||['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未'];
  const results=pillars.map(pillar=>analyzeBaziPeriod(r,[{pillar,source:'luck',id:'luck'}]));
  for(const t of ['overall','career','wealth','relationship']){
   assert.ok(results.some(p=>Number.isFinite(p.scores[t])),level+' '+t);
   for(const p of results)if(p.scores[t]!==null){
    assert.ok(p.contributions[t].length);assert.equal(p.scores[t],Math.round(Math.max(0,Math.min(100,50+p.contributions[t].reduce((s,c)=>s+c.value,0)))*10)/10);
    for(const sentence of p.themes[t].split('。').filter(Boolean))assert.ok(p.contributions[t].some(c=>c.text.includes(sentence)));
   }
  }
 }
});

test('balanced charts use effective ten-god flow rather than default neutrality',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'2000-01-05',time:'12:00',gender:'male',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime:true}),j=r.judgmentAnalysis;
 assert.equal(j.level,'平衡');assert.ok(balancedFlowProfile(j).length);
 const results=r.luckCycles.cycles.map(c=>analyzeBaziPeriod(r,[{pillar:c.pillar,source:'luck',id:'luck'}]));
 for(const t of ['overall','career','wealth','relationship']){
  assert.ok(results.some(p=>p.contributions[t].some(c=>c.id.startsWith('flow-'))));
  assert.ok(new Set(results.map(p=>p.scores[t]).filter(Number.isFinite)).size>1);
 }
 const missing=chart('甲子 乙酉 丙寅 丁亥');const x=analyzeBaziJudgment(missing);
 assert.deepEqual(balancedFlowEffects({...j,special:{status:'uncertain'}},x),[]);
 assert.deepEqual(balancedFlowProfile({...j,special:{status:'uncertain'}}),[]);
});

test('valid ordinary charts receive a final evidence-backed grade, while malformed data is rejected',()=>{
 const j=calculateBaziWithPatterns({...realInput,date:'1990-11-26',time:'07:30',gender:'male'}).judgmentAnalysis;
 assert.equal(j.strength.uncertain,false);assert.ok(['身弱','偏弱','平衡','偏强','身强'].includes(j.level));assert.ok(j.strength.classificationEvidence.rule);
 assert.equal(analyzeBaziJudgment({}).facts,null);
 const transformation=analyze('戊戌 戊戌 甲戌 己丑');assert.equal(transformation.special.level,'化气');assert.equal(transformation.level,null);
});

test('Beijing 2000-01-01 noon preserves clashed support roots and scores eight actual luck stages',()=>{
 for(const trueSolarTime of [false,true]){
  const r=calculateBaziWithPatterns({...realInput,date:'2000-01-01',time:'12:00',gender:'male',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime}),j=r.judgmentAnalysis;
  assert.equal(j.dayMaster,'戊');assert.equal(j.level,'偏强');assert.equal(j.special.status,'ordinary');
  assert.ok(j.strength.classificationEvidence.branchEvidence.filter(b=>b.availability<1&&b.support>0).length>=2);
  assert.ok(j.strength.classificationEvidence.support.includes('month'));
  assert.ok(j.climate.supply.fire>0);assert.equal(j.climate.cold,false);
  const cs=scoreLuckCycles(r);assert.equal(cs.length,8);
  for(const t of ['overall','career','wealth','relationship']){
   assert.ok(cs.every(c=>Number.isFinite(c.scores[t])));assert.ok(new Set(cs.map(c=>c.scores[t])).size>1);
   for(const c of cs){assert.ok(c.contributions[t].length);assert.equal(c.scores[t],Math.round(Math.max(0,Math.min(100,50+c.contributions[t].reduce((s,x)=>s+x.value,0)))*10)/10);}
   assert.equal((renderTrendSvg(cs,t).match(/class="bt-line"/g)||[]).length,7);
  }
 }
});

test('cancelling incoming effects remain separate from independently computed capacity',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1990-01-16',time:'01:30',gender:'female'});
 const p=analyzeBaziPeriod(r,[{pillar:'甲申',source:'luck',id:'luck'}]);
 assert.deepEqual(p.contributions.relationship.filter(c=>c.id.startsWith('incoming-')).map(c=>[c.id,c.value]),[['incoming-support',4],['incoming-load',-4]]);
 assert.ok(p.contributions.relationship.some(c=>c.id==='capacity-change'&&c.evidence.axis==='strength-distance'));
 assert.equal(p.scores.relationship,Math.round((50+p.contributions.relationship.reduce((s,c)=>s+c.value,0))*10)/10);
 assert.ok(p.contributions.relationship.some(c=>/支持/.test(c.text)));assert.ok(p.contributions.relationship.some(c=>/节制/.test(c.text)));
});

test('Beijing 2000-01-05 noon retains the strength interval and computes all eight actual luck stages',()=>{
 for(const trueSolarTime of [false,true]){
  const r=calculateBaziWithPatterns({...realInput,date:'2000-01-05',time:'12:00',gender:'male',place:'北京',longitude:116.4074,latitude:39.9042,trueSolarTime});
  const j=r.judgmentAnalysis;assert.equal(j.dayMaster,'壬');assert.equal(j.level,'平衡');assert.equal(j.strength.uncertain,false);assert.equal(j.strength.intervalUncertain,true);
  assert.match(j.strength.classificationEvidence.rule,/得令通月根/);
  assert.deepEqual(j.preferences.favorable,[]);assert.equal(j.special.status,'ordinary');
  const cycles=scoreLuckCycles(r);assert.equal(cycles.length,8);
  assert.deepEqual(cycles.map(c=>c.pillar),['乙亥','甲戌','癸酉','壬申','辛未','庚午','己巳','戊辰']);
  for(const theme of ['overall','career','wealth','relationship']){
   assert.ok(cycles.every(c=>Number.isFinite(c.scores[theme])));
   for(const c of cycles){
    assert.ok(c.contributions[theme].length);
    assert.equal(c.scores[theme],Math.round(Math.max(0,Math.min(100,50+c.contributions[theme].reduce((s,x)=>s+x.value,0)))*10)/10);
   }
   assert.equal((renderTrendSvg(cycles,theme).match(/class="bt-line"/g)||[]).length,7);
  }
  const originalRisk=Math.max(0,.42-j.strength.interval[0],j.strength.interval[1]-.58);
  for(const c of cycles){
   const p=analyzeBaziPeriod(r,[{pillar:c.pillar,source:'luck',id:'luck'}]);
   const stageRisk=Math.max(0,.42-p.state.strength.interval[0],p.state.strength.interval[1]-.58);
   const item=p.contributions.overall.find(x=>x.id==='strength-risk-change');assert.ok(item);
   assert.equal(item.value,Math.round(Math.max(-1,Math.min(1,(originalRisk-stageRisk)/.2))*SCORE_POLICY.element.overall*10)/10);
  }
 }
});

test('intact support roots reject following-weak without converting every extreme clash into a special dispute',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1993-03-21',time:'10:30',gender:'male'}),j=r.judgmentAnalysis;
 assert.ok(j.strength.ratio<.15);assert.equal(j.special.status,'ordinary');
 assert.ok(j.preferences.favorable.length);assert.equal(j.patternAnalysis.patterns.some(p=>p.name.startsWith('从')),false);
 const root=j.facts.nodes.find(n=>!j.interactions.disputedRootIds.includes(n.id)&&[j.element,elementAfter(j.element,4)].includes(n.hidden[0].element));assert.ok(root);
 const unknown=analyze('壬寅 壬寅 庚寅 戊寅');assert.equal(unknown.special.status,'uncertain');
});

test('known incoming components survive an unresolved component in the same theme',()=>{
 const r=calculateBaziWithPatterns({...realInput,date:'1990-09-24',time:'01:30',gender:'male'});
 const p=analyzeBaziPeriod(r,[{pillar:'丁亥',source:'luck',id:'luck'}]);
 assert.ok(p.assessments.overall.uncertainties.some(x=>x.id==='incoming-element-unresolved'));
 assert.ok(p.contributions.overall.some(x=>x.id==='incoming-element'));
 assert.equal(p.scores.overall,Math.round(Math.max(0,Math.min(100,50+p.contributions.overall.reduce((sum,c)=>sum+c.value,0)))*10)/10);
});

test('local contested combinations produce reproducible ranges without discarding independent rules',()=>{
 const input=calculateBaziWithPatterns(realInput),cycles=scoreLuckCycles(input),cycle=cycles.find(c=>c.pillar==='庚辰');
 assert.ok(cycle);
 for(const theme of ['overall','career','wealth']){
  const a=cycle.assessments[theme];assert.equal(a.status,'partial');assert.ok(a.range[0]<a.range[1]);
  const base=50+cycle.contributions[theme].reduce((s,c)=>s+c.value,0);
  const clamp=v=>Math.round(Math.max(0,Math.min(100,v))*10)/10;
  assert.deepEqual(a.range,[clamp(base+a.uncertainties.reduce((s,u)=>s+u.low,0)),clamp(base+a.uncertainties.reduce((s,u)=>s+u.high,0))]);
  assert.doesNotMatch(cycle.themes[theme],/评分范围|置信度|主次未定/);assert.ok(cycle.contributions[theme].length);
 }
 const direct=analyzeBaziPeriod(input,[{pillar:'庚辰',source:'luck',id:'luck'}]);
 assert.deepEqual(direct.assessments,cycle.assessments);
 const svg=renderTrendSvg(cycles,'wealth',4);assert.match(svg,/bt-line/);assert.doesNotMatch(svg,/bt-partial|bt-range|bt-missing/);
 const altered=structuredClone(cycles);altered[3].scores.wealth=99;
 assert.deepEqual(altered[4].assessments,cycle.assessments); // no neighboring score supplies the range
 const unknown=analyzeBaziPeriod(chart('壬寅 壬寅 庚寅 戊寅'),[{pillar:'庚辰',source:'luck',id:'luck'}]);
 assert.ok(Object.values(unknown.assessments).every(a=>a.status==='unavailable'&&a.range===null));
});

test('rendering distinguishes exact, bounded and unavailable points and never bridges unknowns',()=>{
 const cs=[{pillar:'甲子',scores:{overall:60},assessments:{overall:{status:'scored',range:[60,60]}}},
 {pillar:'乙丑',scores:{overall:45},assessments:{overall:{status:'partial',range:[30,70]}}},
 {pillar:'丙寅',scores:{overall:null},assessments:{overall:{status:'unavailable',range:null}}},
 {pillar:'丁卯',scores:{overall:80},assessments:{overall:{status:'scored',range:[80,80]}}}];
 const svg=renderTrendSvg(cs);assert.equal((svg.match(/class="bt-line"/g)||[]).length,1);
 assert.match(svg,/综合45分/);assert.doesNotMatch(svg,/30—70分|bt-range|bt-partial|bt-missing|NaN|undefined/);
 assert.equal((svg.match(/class="bt-point"/g)||[]).length,3);
});

for(const [date,time]of [['1990-09-23','12:00'],['1990-09-23','14:30'],['1985-06-15','12:00']])test(`actual birth input ${date} ${time} produces four curves`,()=>{
 const result=calculateBaziWithPatterns({...realInput,date,time}),cycles=scoreLuckCycles(result);
 for(const theme of ['overall','career','wealth','relationship']){
  assert.ok(cycles.some(c=>Number.isFinite(c.scores[theme])),theme);
  for(const cycle of cycles){
   if(cycle.scores[theme]===null)continue;
   assert.ok(cycle.contributions[theme].length);
   assert.equal(cycle.scores[theme],Math.round(Math.max(0,Math.min(100,50+cycle.contributions[theme].reduce((s,c)=>s+c.value,0)))*10)/10);
  }
  assert.match(renderTrendSvg(cycles,theme),/class="bt-point/);
 }
});

test('balanced below and above 50% share the same neutral support preference',()=>{
 const below=analyze('己卯 辛亥 癸未 丙辰'),above=analyze('癸亥 乙未 辛酉 丁亥');
 assert.ok(below.strength.ratio<.5&&above.strength.ratio>.5);
 for(const r of [below,above]){
  assert.equal(r.strength.kind,'balanced');assert.equal(r.strength.level,'平衡');
  assert.deepEqual(r.strength.supportPreference.favorable,[]);assert.deepEqual(r.strength.supportPreference.avoid,[]);
  assert.equal(r.patternAnalysis.bodySupport.kind,'balanced');
 }
});

test('strength boundaries are stable, including both ends of the balanced band',()=>{
 for(const ratio of [.42,.5,.58,.42-Number.EPSILON,.58+Number.EPSILON])assert.equal(classifyStrengthRatio(ratio).kind,'balanced');
 assert.equal(classifyStrengthRatio(.419).kind,'weak');assert.equal(classifyStrengthRatio(.581).kind,'strong');
 assert.equal(classifyStrengthRatio(.22).label,'身弱');assert.equal(classifyStrengthRatio(.78).label,'偏强');
 for(const ratio of [NaN,-.1,1.1])assert.equal(classifyStrengthRatio(ratio).kind,'unknown');
});

test('strength includes seasonal, root, binding and uncertainty information rather than a bare count',()=>{
 const r=analyze('甲子 庚午 癸巳 庚辰');
 assert.ok(r.strength.interval[0]<r.strength.interval[1]);
 assert.ok(r.strength.contributions.some(c=>c.range[0]!==c.range[1]));
 assert.ok(r.interactions.disputedRootIds.includes('month'));
 assert.ok(r.strength.roots.some(root=>root.disputed));
});

test('solar-term progress is derived from the effective birth instant and used consistently in periods',()=>{
 const r=calculateBaziWithPatterns(realInput),a=r.judgmentAnalysis;
 assert.ok(a.facts.monthProgress>=0&&a.facts.monthProgress<1);
 assert.equal(a.strength.monthProgress,a.facts.monthProgress);
 const period=analyzeBaziPeriod(r,[{pillar:'甲子',source:'luck',id:'luck'}]);
 assert.equal(period.state.facts.monthProgress,a.facts.monthProgress);
 assert.equal(period.state.facts.monthBranch,a.facts.monthBranch);
});

// Classical structural regressions, not claims to predict historical life events.
for(const [text,name]of [
 ['癸卯 乙卯 甲寅 乙亥','从旺格'],
 ['丙午 甲午 丙午 甲午','从旺格'],
 ['辛巳 辛丑 乙酉 乙酉','从杀格'],
 ['丁卯 壬寅 庚午 丙戌','从杀格']
])test(`classical following structure: ${text}`,()=>{
 const r=analyze(text);assert.equal(r.special.status,'established');assert.equal(r.special.name,name);
 assert.equal(r.patternAnalysis.patterns[0].name,name);
 assert.ok(r.special.requirements.length>=3);
});

for(const [text,name]of [
 ['乙亥 壬子 乙卯 癸亥','从强格'],
 ['乙卯 乙卯 辛卯 癸亥','从财格'],
 ['丙午 丙午 甲午 戊午','从儿格'],
 ['癸亥 乙卯 甲寅 乙未','曲直格'],
 ['戊戌 戊戌 甲戌 己丑','化土格'],
 ['甲寅 丁巳 丙午 乙未','炎上格'],
 ['戊申 辛酉 庚戌 己酉','从革格'],
 ['癸亥 壬子 壬子 辛丑','润下格'],
 ['丙戌 戊戌 己丑 己丑','稼穑格']
])test(`strict sufficient special structure: ${name}`,()=>{
 const r=analyze(text);assert.equal(r.special.status,'established');assert.equal(r.special.name,name);
 assert.equal(r.patternAnalysis.patterns.length,1);assert.equal(r.patternAnalysis.structureGod,null);
});

test('rooted support, competing transformations and weak-resource disputes do not force a following label',()=>{
 for(const text of ['乙卯 乙卯 辛酉 癸亥','戊戌 己丑 甲戌 己丑','壬寅 壬寅 庚寅 戊寅','戊戌 丙辰 乙未 丙戌']){
  const r=analyze(text);assert.notEqual(r.special.status,'established');
  assert.ok(!r.patternAnalysis.patterns.some(p=>p.name.startsWith('从')||p.name.startsWith('化')));
 }
 assert.equal(analyze('壬寅 壬寅 庚寅 戊寅').special.status,'uncertain');
});

test('following has its own preferences, and climate is not allowed to blindly reverse a certified structure',()=>{
 const r=analyze('丙午 甲午 丙午 甲午');
 assert.ok(r.special.favorable.includes('火'));assert.ok(r.preferences.favorable.includes('火'));
 assert.ok(r.preferences.avoid.includes('水'));assert.ok(!r.preferences.favorable.includes('水'));
 assert.ok(r.preferences.deferredClimate.some(d=>d.element==='水'));
 const child=analyze('丙午 丙午 甲午 戊午');assert.ok(child.special.favorable.includes('木'));assert.ok(child.special.avoid.includes('水'));
});

test('a favorable output period preserves following-self while a rooted opposing period is withheld',()=>{
 const input=chart('癸卯 乙卯 甲寅 乙亥');
 const forward=analyzeBaziPeriod(input,[{pillar:'丁巳',source:'luck',id:'luck'}]);
 // 巳亥 clashes, so it cannot be silently certified just because 丁 is output.
 assert.ok(Object.values(forward.scores).every(v=>v===null));
 const reverse=analyzeBaziPeriod(input,[{pillar:'庚申',source:'luck',id:'luck'}]);
 assert.equal(reverse.state.special.status,'uncertain');assert.ok(Object.values(reverse.scores).every(v=>v===null));
});

for(const [text,name]of [['辛酉 戊寅 甲寅 壬子','建禄格'],['辛丑 戊寅 乙卯 壬子','月劫格'],['庚戌 癸卯 甲寅 壬子','阳刃格']])
 test(`${name} needs a usable wealth/authority/output pathway`,()=>{
  const r=analyze(text);assert.equal(r.patternAnalysis.status,'established');assert.equal(r.patternAnalysis.patterns[0].name,name);
  assert.ok(r.patternAnalysis.assistantGods.length>0);
 });

test('climate distinguishes cold, heat, dryness and actual effective supplies',()=>{
 const cold=analyze('壬子 癸丑 甲子 乙卯');assert.ok(cold.climate.needs.some(n=>n.element==='火'));
 const summer=analyze('丙午 丙午 甲午 戊午');assert.ok(summer.climate.needs.some(n=>n.element==='水'));
 const supplied=analyze('壬子 丙子 甲寅 丙寅');assert.ok(!supplied.climate.cold);
 assert.ok(!cold.preferences.favorable.some(e=>cold.preferences.avoid.includes(e)));
 const floating=analyze('壬子 丙子 甲子 乙卯');
 assert.equal(floating.climate.supply.fire,0);assert.ok(floating.climate.cold);
});

test('a certified complete seasonal set absorbs internal joins, including repeated member occurrences',()=>{
 for(const [text,element]of [['甲寅 丁巳 丙午 乙未','火'],['癸亥 壬子 壬子 辛丑','水']]){
  const r=analyze(text);
  assert.ok(r.interactions.transformed.some(x=>x.kind==='三会'&&x.element===element));
  assert.ok(r.interactions.relations.some(x=>x.kind==='六合'&&x.state==='subsumed'));
  assert.equal(r.interactions.unresolved.length,0);
 }
});

test('all pairwise branch and stem relations are recorded without treating every join as transformation',()=>{
 const r=analyze('甲子 己丑 甲卯 壬酉');
 assert.equal(r.status,'unavailable'); // 甲卯 is not a sexagenary pillar.
 const bound=analyze('甲子 己巳 庚寅 壬午');
 assert.ok(bound.interactions.relations.some(r=>r.kind==='五合'&&r.state!=='transformed'));
 const conflict=analyze('甲子 己丑 甲戌 癸卯');
 assert.ok(conflict.interactions.relations.some(r=>r.kind==='五合'&&r.state==='contested'));
 assert.ok(!conflict.interactions.transformed.some(r=>r.kind==='五合'));
});

test('half combinations cannot manufacture a complete set; duplicates cannot supply a missing member',()=>{
 const half=analyze('壬申 庚子 癸酉 辛酉');
 assert.ok(half.interactions.relations.some(r=>r.kind==='半合'));
 assert.ok(!half.interactions.transformed.some(r=>r.kind==='三合'&&r.element==='水'));
 const contested=analyze('壬申 庚子 癸酉 丙辰');assert.ok(contested.interactions.unresolved.length);
 const full=analyze('壬申 庚子 癸亥 丙辰');
 assert.ok(full.interactions.transformed.some(r=>r.kind==='三合'&&r.element==='水'));
});

test('three punishments, self-punishment, harm and break remain distinct, rather than deleting roots',()=>{
 const a=analyze('甲寅 丁巳 庚申 壬子');
 assert.ok(a.interactions.relations.some(r=>r.kind==='三刑'));
 const b=analyze('丙午 壬午 甲子 丁未');
 assert.ok(b.interactions.relations.some(r=>r.kind==='自刑'));
 assert.ok(b.interactions.relations.some(r=>r.kind==='害'));
 const c=analyze('甲子 乙酉 丙寅 丁亥');assert.ok(c.interactions.relations.some(r=>r.kind==='破'));
});

test('integrated periods keep natal month command and original day master, and resolve inter-period interactions',()=>{
 const input=chart('壬申 丙午 甲午 壬申');
 const r=analyzeBaziPeriod(input,[{pillar:'辛丑',id:'luck',source:'luck'},{pillar:'丁未',id:'annual',source:'annual'},{pillar:'壬子',id:'month-period',source:'month'}]);
 assert.equal(r.state.facts.day,'甲');assert.equal(r.state.facts.monthBranch,'午');
 assert.ok(r.state.interactions.relations.some(x=>x.kind==='冲'&&x.ids.includes('luck')&&x.ids.includes('annual')));
 assert.ok(r.state.interactions.relations.some(x=>x.kind==='冲'&&x.ids.includes('day')&&x.ids.includes('month-period')));
});

test('four scores are independently derived, and every finite score is reproducible from its contributions',()=>{
 const input=calculateBaziWithPatterns(realInput);
 const r=analyzeBaziPeriod(input,[{pillar:'壬午',id:'luck',source:'luck'}]);
 for(const theme of ['overall','career','wealth','relationship']){
  const v=r.scores[theme];if(v===null)continue;
  assert.ok(v>=0&&v<=100);assert.ok(r.contributions[theme].length);
  const expected=Math.round(Math.max(0,Math.min(100,50+r.contributions[theme].reduce((s,c)=>s+c.value,0)))*10)/10;
  assert.equal(v,expected);
 }
 const cycles=scoreLuckCycles(input);
 assert.ok(cycles.some(c=>new Set(Object.values(c.scores).filter(v=>v!==null)).size>=3));
 assert.ok(cycles.some(c=>Object.values(c.scores).some(Number.isFinite)));
});

test('no evidence, unresolved special structures or malformed stages yield no default 50',()=>{
 const noEvidence=chart('己卯 辛亥 癸未 丙辰');
 const r=analyzeBaziPeriod(noEvidence,[{pillar:'甲子',id:'luck',source:'luck'}]);
 for(const theme of ['overall','career','wealth','relationship'])if(r.scores[theme]!==null)assert.ok(r.contributions[theme].length);
 for(const periods of [null,{},[null],[{pillar:'甲卯',source:'luck',id:'luck'}],[{pillar:'甲子',source:'luck',id:'day'}],
  [{pillar:'甲子',source:'luck',id:'a'},{pillar:'乙丑',source:'luck',id:'b'}]]){
  const bad=analyzeBaziPeriod(chart('辛酉 戊寅 甲寅 壬子'),periods);assert.ok(Object.values(bad.scores).every(v=>v===null));
 }
});

test('missing spouse-star grouping data withholds only relationship, not unrelated scores',()=>{
 const r=calculateBaziWithPatterns(realInput),cycle=scoreLuckCycles(r).find(c=>Number.isFinite(c.scores.overall));assert.ok(cycle);
 const before=analyzeBaziPeriod(r,[{pillar:cycle.pillar,source:'luck',id:'luck'}]);r.input.gender=null;
 const result=analyzeBaziPeriod(r,[{pillar:cycle.pillar,source:'luck',id:'luck'}]);
 assert.equal(result.scores.relationship,null);assert.ok(result.reasons.relationship.some(x=>x.includes('性别')));
 assert.ok(Number.isFinite(result.scores.overall));
 assert.equal(result.scores.overall,before.scores.overall);assert.equal(result.scores.career,before.scores.career);assert.equal(result.scores.wealth,before.scores.wealth);
});

test('luck trends and annual averages have separate coverage; missing stored years are recomputed astronomically',()=>{
 const r=calculateBaziWithPatterns(realInput),cycles=scoreLuckCycles(r);
 for(const cycle of cycles)for(const theme of ['overall','career','wealth','relationship']){
  assert.equal(cycle.scores[theme],cycle.directScores[theme]);
  if(cycle.coverage[theme]<SCORE_POLICY.minimumCoverage)assert.equal(cycle.annualAverage[theme],null);
 }
 const missing={...r,luckCycles:{...r.luckCycles,cycles:r.luckCycles.cycles.map(c=>({...c,years:[]}))}};
 const recomputed=scoreLuckCycles(missing);
 for(const [i,cycle]of recomputed.entries()){
  assert.deepEqual(cycle.scores,cycles[i].scores);
  assert.deepEqual(cycle.years,cycles[i].years);
  assert.ok(cycle.years.every(y=>y.boundaryRule==='astronomy-lichun'));
 }
});

test('annual windows use Lichun, are clipped to exact handover instants, and reject forged year pillars',()=>{
 const r=calculateBaziWithPatterns(realInput),cycles=scoreLuckCycles(r);
 for(const c of cycles)for(const row of c.years){
  assert.ok(Date.parse(row.from)>=Date.parse(c.startInstant));assert.ok(Date.parse(row.to)<=Date.parse(c.endInstant));
  assert.ok(row.weight>0&&row.weight<=1);
 }
 const first=cycles[0];assert.ok(first.years[0].weight<1);
 const copy=structuredClone(r);const badYear=copy.luckCycles.cycles[0].years[0].year;
 copy.luckCycles.cycles[0].years[0].annual.pillar='甲子';
 const bad=scoreLuckCycles(copy);assert.ok(!bad[0].years.some(row=>row.year===badYear));
 assert.equal(cycleStart('2020-02-29T04:00:00.000Z',1).toISOString(),'2030-02-28T04:00:00.000Z');
});

test('missing or timezone-ambiguous handover dates cannot generate a scored timeline',()=>{
 for(const startDate of [null,'2020-02-29T04:00:00','bad-date']){
  const r=calculateBaziWithPatterns(realInput);r.luckCycles.startDate=startDate;
  for(const c of scoreLuckCycles(r)){
   assert.ok(Object.values(c.scores).every(v=>v===null));assert.equal(c.years.length,0);
  }
 }
 assert.equal(cycleStart('2020-02-29T04:00:00Z',-1),null);
});

test('cached reports invalidate on a changed chart; evaluation is deterministic and input remains untouched',()=>{
 const input=freeze(chart('壬申 丙午 甲午 壬申'));
 assert.deepEqual(analyzeBaziJudgment(input),analyzeBaziJudgment(input));
 const copy=chart('壬申 丙午 甲午 壬申');const old=buildUnifiedBaziInsight(copy,new Date('2026-10-28T00:00:00Z'));
 copy.calculatedResult.day={name:'乙未',stem:'乙',branch:'未'};
 const fresh=buildUnifiedBaziInsight(copy,new Date('2026-10-28T00:00:00Z'));
 assert.notEqual(old.dayMaster,fresh.dayMaster);
 assert.equal(buildUnifiedBaziInsight(null).cycles.length,0);
});

test('trend chart does not bridge missing scores or turn them into zero; all themes have distinct data',()=>{
 const cycles=[{pillar:'甲子',startYear:2000,scores:{overall:30,career:70}},{pillar:'乙丑',startYear:2010,scores:{overall:null,career:60}},{pillar:'丙寅',startYear:2020,scores:{overall:80,career:50}}];
 const overall=renderTrendSvg(cycles,'overall',2),career=renderTrendSvg(cycles,'career',2);
 assert.equal((overall.match(/class="bt-line"/g)||[]).length,0);
 assert.equal((career.match(/class="bt-line"/g)||[]).length,2);
 assert.match(overall,/暂无结果/);assert.doesNotMatch(overall,/NaN|undefined/);assert.notEqual(overall,career);
 assert.match(overall,/tabindex="0"/);assert.match(overall,/aria-pressed="true"/);
 assert.equal((overall.match(/class="bt-hit"/g)||[]).length,cycles.length);
});

test('classic browser bridge and service expose the same integrated rules and score policy',()=>{
 const ctx={window:{},Intl,Date};vm.runInNewContext(fs.readFileSync(new URL('../../bazi_patterns.js',import.meta.url),'utf8'),ctx);
 const input=chart('丁卯 壬寅 庚午 丙戌');
 const direct=analyzeBaziJudgment(input),browser=ctx.window.analyzeBaziJudgment(input);
 assert.deepEqual(JSON.parse(JSON.stringify(browser)),JSON.parse(JSON.stringify(direct)));
 const args=[{pillar:'壬子',source:'luck',id:'luck'}];
 assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.analyzeBaziPeriod(input,args).scores)),analyzeBaziPeriod(input,args).scores);
});
