import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { makeJudgmentFacts } from '../../src/bazi/rules/judgmentFacts.js';
import { analyzeBaziJudgment } from '../../src/bazi/rules/judgmentEngine.js';
import { analyzeInteractions } from '../../src/bazi/rules/interactions.js';
import { classifyStrengthRatio } from '../../src/bazi/rules/strength.js';
import { analyzeBaziPeriod,scoreLuckCycles,cycleStart,SCORE_POLICY } from '../../src/bazi/rules/periodScoring.js';
import { buildUnifiedBaziInsight } from '../../src/bazi/rules/integratedInsight.js';
import { calculateBaziWithPatterns } from '../../src/bazi/services/analyzeBazi.js';
import { renderTrendSvg } from '../../src/bazi/ui/trendChart.js';

const keys=['year','month','day','hour'];
function chart(text,gender='female'){
 return {calculatedResult:Object.fromEntries(text.split(' ').map((name,i)=>[keys[i],{name,stem:name[0],branch:name[1]}])),input:{gender}};
}
const analyze=text=>analyzeBaziJudgment(chart(text));
const freeze=o=>{Object.freeze(o);for(const v of Object.values(o))if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);return o;};
const realInput={gender:'female',date:'1990-09-23',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'};

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
 assert.ok(Object.values(r.scores).every(v=>v===null));
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
 assert.equal((overall.match(/class="bt-line"/g)||[]).length,2);
 assert.equal((career.match(/class="bt-line"/g)||[]).length,1);
 assert.match(overall,/未评分/);assert.doesNotMatch(overall,/NaN|undefined/);assert.notEqual(overall,career);
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
