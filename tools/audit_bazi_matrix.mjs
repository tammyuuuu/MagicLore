import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {calculateBaziWithPatterns} from '../src/bazi/services/analyzeBazi.js';
import {analyzeBaziJudgment} from '../src/bazi/rules/judgmentEngine.js';
import {SEXAGENARY_CYCLE} from '../src/bazi/data/sexagenary.js';
import {analyzeBaziPeriod,THEMES,SCORE_POLICY} from '../src/bazi/rules/periodScoring.js';

// Independent calendar sample, not the old 1990–2009 grid. Every selected chart
// is then tested against all 60 possible pillars, including nonconsecutive ones.
// This is a software coverage audit, not empirical validation of predictions.
const opt=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const engine=opt('engine')?await import(pathToFileURL(opt('engine')).href):{analyzeBaziPeriod,SCORE_POLICY};
const analyze=engine.analyzeBaziPeriod;
const output=opt('output')||'maintenance/bazi-matrix.json';
const check=process.argv.includes('--check'),baselinePath=opt('baseline')||'tests/fixtures/bazi-matrix-baseline.json';
const places=[['北京','Asia/Shanghai',116.4074,39.9042],['乌鲁木齐','Asia/Shanghai',87.6168,43.8256],['纽约','America/New_York',-74.006,40.7128],['悉尼','Australia/Sydney',151.2093,-33.8688]];
const rows=[],representatives=new Map();let pointCount=0;
function category(p,t,j){
 if(p.assessments[t].unavailableCause)return p.assessments[t].unavailableCause;
 if(p.reasons[t].some(x=>x.includes('原局特殊')))return 'natal-identity';
 if(p.reasons[t].some(x=>x.includes('阶段特殊')||x.includes('原有从格')))return 'period-identity';
 if(p.reasons[t].some(x=>x.includes('化气格')))return 'transformation-theme';
 if(p.reasons[t].some(x=>x.includes('性别')))return 'missing-gender';
 if(p.assessments[t].uncertainties.length)return 'unresolved-components';
 if(j.preferences.evaluations.some(e=>e.sign===null))return 'conditional-direction';
 return 'uncovered-context'; // Keep this visible; do not relabel a gap as missing user data.
}
function evaluate(id,r,pillars,source){
 const j=analyzeBaziJudgment(r),periods=pillars.map(pillar=>{
  const p=analyze(r,[{pillar,id:'luck',source:'luck'}],j),missing={};
  for(const t of THEMES){
   const value=p.scores[t];
   if(value===null){assert.ok(p.reasons[t].length,id+' '+pillar+' '+t);missing[t]={category:category(p,t,j),reasons:p.reasons[t],uncertainties:p.assessments[t].uncertainties.map(x=>x.id),natalBlockers:j.special.blockers,periodBlockers:p.state.special.blockers};}
   else{
    assert.ok(Number.isFinite(value)&&value>=0&&value<=100);assert.ok(p.contributions[t].length);
    assert.equal(value,Math.round(Math.max(0,Math.min(100,50+p.contributions[t].reduce((s,c)=>s+c.value,0)))*10)/10);
    for(const sentence of p.themes[t].split('。').filter(Boolean))assert.ok(p.contributions[t].some(c=>c.text.includes(sentence)));
   }
  }
  pointCount++;return {pillar,scores:p.scores,missing};
 });
 rows.push({id,source,day:j.dayMaster,level:j.level,special:j.special.status,pattern:j.patternAnalysis.patterns.map(p=>p.name).join('/')||'未命名',periods});
}
for(let year=1960;year<2020;year++)for(let month=1;month<=12;month++)for(const gender of ['male','female']){
 const n=(year-1960)*24+(month-1)*2+(gender==='female'?1:0),[place,timezoneId,longitude,latitude]=places[(year+month)%places.length];
 const date=`${year}-${String(month).padStart(2,'0')}-${String(1+(year*7+month*11)%27).padStart(2,'0')}`,time=`${String((year+month*5)%24).padStart(2,'0')}:${n%3===0?'00':n%3===1?'30':'59'}`;
 const input={date,time,gender,place,timezoneId,longitude,latitude,trueSolarTime:n%4<2,dayBoundaryRule:'midnight'},r=calculateBaziWithPatterns(input),j=r.judgmentAnalysis;
 const id=JSON.stringify(input);evaluate(id,r,r.luckCycles.cycles.map(c=>c.pillar),'calendar');
 const key=j.dayMaster+'/'+j.level;
 if(!representatives.has(key))representatives.set(key,{id,r});
 if(n%240===239)console.log(`calendar charts checked: ${n+1}/1440`);
}
for(const [key,{id,r}]of representatives)evaluate('all60/'+key+'/'+id,r,SEXAGENARY_CYCLE.map(p=>p.name),'all60');
for(const text of ['癸卯 乙卯 甲寅 乙亥','辛巳 辛丑 乙酉 乙酉','癸亥 乙卯 甲寅 乙未','甲寅 丁巳 丙午 乙未','戊申 辛酉 庚戌 己酉','癸亥 壬子 壬子 辛丑','丙戌 戊戌 己丑 己丑','戊戌 戊戌 甲戌 己丑','壬寅 壬寅 庚寅 戊寅']){
 const r={input:{gender:'female'},calculatedResult:Object.fromEntries(text.split(' ').map((p,i)=>[['year','month','day','hour'][i],{stem:p[0],branch:p[1]}]))};
 evaluate(text,r,SEXAGENARY_CYCLE.map(p=>p.name),'structure');
}
function stats(list){const p=list.flatMap(r=>r.periods),categories={};for(const row of p)for(const t of THEMES)if(row.missing[t]){const key=row.missing[t].category;categories[key]=(categories[key]||0)+1;}return{charts:list.length,periods:p.length,scores:Object.fromEntries(THEMES.map(t=>[t,p.filter(x=>x.scores[t]!==null).length])),categories};}
const group=key=>Object.fromEntries([...new Set(rows.map(r=>r[key]))].sort().map(k=>[k,stats(rows.filter(r=>r[key]===k))]));
const summary=stats(rows),bySource=group('source'),fingerprints=rows.flatMap(r=>r.periods.flatMap(p=>THEMES.filter(t=>p.missing[t]).map(t=>createHash('sha256').update(JSON.stringify([r.id,p.pillar,t,p.missing[t].category])).digest('hex').slice(0,24)))).sort();
const report={schema:1,policy:engine.SCORE_POLICY.version,sample:'1960–2019 ×12 months ×2 genders; four locations, solar/civil time, all60 for each day/grade encountered; structural fixtures separate',summary,bySource,byDay:group('day'),byStrength:group('level'),byPattern:group('pattern'),rows};
await fs.mkdir('maintenance',{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2));
if(process.argv.includes('--write-baseline')){await fs.mkdir(dirname(baselinePath),{recursive:true});await fs.writeFile(baselinePath,JSON.stringify({schema:1,sample:report.sample,summary,bySource,fingerprints},null,2));}
if(check){const baseline=JSON.parse(await fs.readFile(baselinePath,'utf8'));assert.equal(summary.periods,baseline.summary.periods);const allowed=new Set(baseline.fingerprints),newMissing=fingerprints.filter(f=>!allowed.has(f));assert.deepEqual(newMissing,[],'New unscored points: examine the matrix report, do not refresh baseline blindly');for(const t of THEMES)assert.ok(summary.scores[t]>=baseline.summary.scores[t],t+' coverage regressed');}
console.log(JSON.stringify({summary,bySource,days:Object.keys(group('day')),grades:Object.keys(group('level')),checked:check,points:pointCount},null,2));
