import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { analyzeMonthPatterns } from '../../src/bazi/rules/patterns.js';
import { calculateBazi } from '../../src/bazi/services/calculateBazi.js';
import { calculateBaziWithPatterns } from '../../src/bazi/services/analyzeBazi.js';
import { STEM_BY_NAME, BRANCH_BY_NAME } from '../../src/bazi/data/fundamentals.js';
import { getHiddenStems } from '../../src/bazi/data/hiddenStems.js';
import { getTenGod } from '../../src/bazi/rules/tenGods.js';

// Structural unit fixtures use canonical stems/branches, not fabricated tenGods,
// strength overrides or hand-edited hidden stems. Calendar integration is tested below.
const keys=['year','month','day','hour'];
function chart(text){return Object.fromEntries(text.split(' ').map((name,i)=>[keys[i],{name,stem:name[0],branch:name[1]}]));}
const analyze=text=>analyzeMonthPatterns(chart(text));

for(const [name,text] of [
  ['正官格','壬戌 庚戌 癸未 乙亥'],
  ['七杀格','癸未 丁未 辛巳 戊申'],
  ['财格','庚辰 丙午 癸巳 庚午'],
  ['印格','辛酉 己未 辛亥 壬子'],
  ['食神格','辛丑 戊寅 丙午 乙丑'],
  ['伤官格','癸亥 甲辰 庚申 己亥']
]) test(`${name} requires a rooted, positionally effective formation`,()=>{
  const result=analyze(text);
  assert.equal(result.status,'established');
  assert.equal(result.patterns[0].name,name);
  const chosen=result.candidates.find(c=>c.name===name);
  assert.ok(chosen.formations.length);
  assert.ok(result.structureGod);
  assert.ok(result.assistantGods.length);
  assert.equal(result.structureGod.function,'格局用神');
  assert.ok(result.assistantGods.every(g=>g.function==='相神'));
});

for(const [name,text] of [
  ['正官格','己丑 乙丑 壬申 甲辰'],
  ['七杀格','甲寅 戊午 辛卯 辛丑'],
  ['财格','己亥 壬申 己酉 乙卯'],
  ['印格','庚辰 丁巳 癸酉 癸卯'],
  ['食神格','甲午 丙辰 丙子 己丑'],
  ['伤官格','乙未 己酉 戊戌 甲子']
]) test(`${name} records actual damage rather than calling every month command successful`,()=>{
  const result=analyze(text);
  assert.equal(result.status,'broken');
  assert.equal(result.patterns[0].name,name);
  assert.ok(result.candidates.some(c=>c.damage.length));
  assert.deepEqual(result.assistantGods,[]);
  assert.deepEqual(result.patterns[0].combinations,[]);
});

test('classical killing-resource example resolves multiple month exposures through one shared route',()=>{
  const result=analyze('丙寅 戊戌 壬戌 辛丑');
  assert.equal(result.status,'established');
  assert.equal(result.patterns[0].name,'七杀格');
  assert.deepEqual(result.patterns[0].combinations,['杀印相生']);
  assert.equal(result.structureGod.stem,'戊');
  assert.ok(result.assistantGods.some(g=>g.stem==='辛'));
  assert.match(result.selection.resolution,/同一有效/);
});

test('classical hurt-resource example needs strong hurt, usable rooted resource and support need',()=>{
  const result=analyze('壬申 丙午 甲午 壬申');
  assert.equal(result.bodySupport.kind,'weak');
  assert.equal(result.status,'established');
  assert.deepEqual(result.patterns[0].combinations,['伤官配印']);
});

test('officer damaged by hurt is rescued only by a surviving resource pathway',()=>{
  const result=analyze('甲子 庚辰 癸巳 庚辰');
  assert.equal(result.status,'rescued');
  const c=result.candidates[0];
  assert.ok(c.damage.some(d=>d.kind==='hurt-officer'));
  assert.ok(c.rescues.some(r=>r.text==='印制伤护官。'));
  assert.ok(c.rescues.every(r=>c.damage.some(d=>d.id===r.damageId)));
});

test('wealth can mediate hurt to officer, but a rescue for one attacker does not rescue another',()=>{
  const saved=analyze('戊子 丁酉 甲寅 癸丑');
  assert.equal(saved.status,'rescued');
  assert.ok(saved.candidates[0].rescues.some(r=>r.text.includes('财再生官')));
  const damaged=analyze('丁巳 丁酉 甲午 戊寅');
  assert.equal(damaged.status,'broken');
  const c=damaged.candidates[0];
  assert.ok(c.rescues.length>0);
  assert.ok(c.damage.some(d=>!c.rescues.some(r=>r.damageId===d.id)));
});

test('hurt-resource may have rescue; a damaged resource is not still advertised as a successful combination',()=>{
  const saved=analyze('辛丑 壬午 甲申 甲辰');
  assert.equal(saved.status,'rescued');
  assert.ok(saved.patterns[0].combinations.includes('伤官配印'));
  const damaged=analyze('辛丑 甲辰 丁亥 庚寅');
  assert.notEqual(damaged.status,'established');
  assert.ok(!damaged.patterns.some(p=>p.combinations.includes('伤官配印')));
});

test('mere coexistence of killing/resource or hurt/resource does not certify a combination',()=>{
  for(const text of ['乙巳 壬子 丁卯 壬寅','乙巳 甲戌 丙午 甲戌']){
    const r=analyze(text);
    assert.equal(r.status,'uncertain');
    assert.deepEqual(r.patterns,[]);
    assert.equal(r.structureGod,null);
  }
});

test('command clash, unresolved meetings and multiple competing exposures do not force a name',()=>{
  for(const text of ['甲子 庚午 癸巳 庚辰','甲申 丙子 丁辰 辛未','丙寅 戊戌 壬戌 丁丑']){
    const r=analyze(text);assert.equal(r.status,'uncertain');assert.deepEqual(r.patterns,[]);
  }
});

test('month peer/rob command is not renamed wealth merely because wealth is exposed',()=>{
  const r=analyze('戊辰 丙寅 甲子 壬申');
  assert.equal(r.status,'uncertain');
  assert.deepEqual(r.patterns,[]);
  assert.match(r.reason,/比劫|月令/);
});

test('month selection does not trust forged hidden stems, tenGods or presentation labels',()=>{
  const p=chart('壬申 丙午 甲午 壬申');
  const expected=analyzeMonthPatterns(p);
  for(const k of keys){p[k].tenGod='正官';p[k].hiddenStems=[{stem:'辛',tenGod:'正官',element:'金'}];}
  assert.deepEqual(analyzeMonthPatterns(p),expected);
  assert.equal(analyzeMonthPatterns({}).status,'uncertain');
  assert.equal(analyzeMonthPatterns(null).status,'uncertain');
});

test('calendar core stays identical and browser/service share the unified analysis',()=>{
  const input={gender:'female',date:'1995-08-12',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'};
  const r=calculateBaziWithPatterns(input);
  const {patternAnalysis,judgmentAnalysis,...unchanged}=r;
  assert.deepEqual(unchanged,calculateBazi(input));
  assert.deepEqual(r.patternAnalysis,analyzeMonthPatterns(r));
  const ctx={window:{},Intl,Date};
  vm.runInNewContext(fs.readFileSync(new URL('../../bazi_patterns.js',import.meta.url),'utf8'),ctx);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.analyzeBaziPatterns(r))),JSON.parse(JSON.stringify(r.patternAnalysis)));
  for(const text of ['丙寅 戊戌 壬戌 辛丑','壬申 丙午 甲午 壬申','甲子 庚辰 癸巳 庚辰','丁巳 丁酉 甲午 戊寅'])
    assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.analyzeBaziPatterns(chart(text)))),JSON.parse(JSON.stringify(analyze(text))));
  vm.runInNewContext(fs.readFileSync(new URL('../../bazi_judgment.js',import.meta.url),'utf8'),ctx);
  const report=ctx.window.buildBaziInsight(r,new Date('2026-10-28T00:00:00Z'));
  assert.ok(report.cycles.every(c=>Object.values(c.scores).every(v=>v===null||Number.isFinite(v))));
  assert.deepEqual(Array.from(report.supportPreference.favorable),Array.from(judgmentAnalysis.strength.supportPreference.favorable));
  assert.equal(report.structureGod?.function||null,r.patternAnalysis.structureGod?.function||null);
});

test('report displays certified structure/helper separately from support preferences, with no candidate names',()=>{
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.classList={add(){}};this.textContent='';this.dataset={};}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(){this.children=[];}
    setAttribute(){}
  }
  const ctx={window:{},Intl,Date,document:{createElement:tag=>new Element(tag)}};
  vm.runInNewContext(fs.readFileSync(new URL('../../bazi_patterns.js',import.meta.url),'utf8'),ctx);
  vm.runInNewContext(fs.readFileSync(new URL('../../bazi_judgment.js',import.meta.url),'utf8'),ctx);
  const plain={...calculateBazi({gender:'female',date:'1995-08-12',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'})};
  const render=text=>{
    const pillars=chart(text);
    // Preserve canonical detail for legacy support calculation.
    for(const key of keys){
      const pillar=pillars[key];
      pillars[key]={...pillar,stemAttributes:STEM_BY_NAME[pillar.stem],branchAttributes:BRANCH_BY_NAME[pillar.branch],
        tenGod:getTenGod(pillars.day.stem,pillar.stem),
        hiddenStems:Object.entries(getHiddenStems(pillar.branch)).filter(([,s])=>s).map(([role,stem])=>({role,stem,element:STEM_BY_NAME[stem].element,tenGod:getTenGod(pillars.day.stem,stem)}))};
    }
    // Force the report to use its real bridge, rather than a stale service result.
    const result={...plain,calculatedResult:pillars,patternAnalysis:analyze(text)};
    const host=new Element('main');ctx.window.renderBaziJudgment(result,host);
    const texts=[];const walk=n=>{texts.push(n.textContent);n.children.forEach(walk);};walk(host);return texts.join('\n');
  };
  const named=render('壬申 丙午 甲午 壬申');
  assert.match(named,/伤官配印/);assert.match(named,/格局用神：丁/);assert.match(named,/相神：壬/);assert.match(named,/五行喜忌/);
  const uncertain=render('甲子 庚午 癸巳 庚辰');
  assert.doesNotMatch(uncertain,/格局用神：|候选|正官格|七杀格/);
});
