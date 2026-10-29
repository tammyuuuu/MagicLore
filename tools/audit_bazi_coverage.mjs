import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {calculateBaziWithPatterns} from '../src/bazi/services/analyzeBazi.js';
import {analyzeBaziJudgment} from '../src/bazi/rules/judgmentEngine.js';
import {analyzeBaziPeriod,THEMES} from '../src/bazi/rules/periodScoring.js';
const rows=[];
for(let y=1990;y<2010;y++)for(let m=1;m<=12;m++)for(const gender of ['male','female']){
 const date=`${y}-${String(m).padStart(2,'0')}-${String(5+(y+m)%22).padStart(2,'0')}`;
 const time=`${String((y+m*3)%24).padStart(2,'0')}:30`;
 const r=calculateBaziWithPatterns({date,time,gender,place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'});
 rows.push(evaluate(`${date} ${time} ${gender}`,r,'calendar',r.luckCycles.cycles.map(c=>c.pillar)));
}
const special=['癸卯 乙卯 甲寅 乙亥','丙午 甲午 丙午 甲午','辛巳 辛丑 乙酉 乙酉','丁卯 壬寅 庚午 丙戌','乙亥 壬子 乙卯 癸亥','乙卯 乙卯 辛卯 癸亥','丙午 丙午 甲午 戊午','癸亥 乙卯 甲寅 乙未','甲寅 丁巳 丙午 乙未','戊申 辛酉 庚戌 己酉','癸亥 壬子 壬子 辛丑','丙戌 戊戌 己丑 己丑','戊戌 戊戌 甲戌 己丑','壬寅 壬寅 庚寅 戊寅'];
for(const text of special){const r={input:{gender:'female'},calculatedResult:Object.fromEntries(text.split(' ').map((s,i)=>[['year','month','day','hour'][i],{stem:s[0],branch:s[1]}]))};rows.push(evaluate(text,r,'structure',['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未']));}
function evaluate(id,r,source,pillars){
 const j=analyzeBaziJudgment(r),periods=pillars.map(pillar=>{
  assert.ok(j.level===null||['从弱','身弱','偏弱','平衡','偏强','身强','从强'].includes(j.level));
  if(j.special.status==='ordinary')assert.ok(j.level!==null);
  const p=analyzeBaziPeriod(r,[{pillar,source:'luck',id:'luck'}],j);
  for(const t of THEMES)if(p.scores[t]!==null){assert.ok(p.contributions[t].length);assert.equal(p.scores[t],Math.round(Math.max(0,Math.min(100,50+p.contributions[t].reduce((s,c)=>s+c.value,0)))*10)/10);for(const sentence of p.themes[t].split('。').filter(Boolean))assert.ok(p.contributions[t].some(c=>c.text.includes(sentence)));}
  return {pillar,scores:p.scores,reasons:Object.fromEntries(THEMES.map(t=>[t,p.scores[t]===null?(p.reasons[t].length?p.reasons[t]:['无独立确定贡献']):[]])),contributions:p.contributions};
 });
 return {id,source,day:j.dayMaster,strength:j.level,strengthKnown:['从弱','身弱','偏弱','平衡','偏强','身强','从强'].includes(j.level),classificationEvidence:j.strength.classificationEvidence,preferenceKnown:j.preferences.favorable.length+j.preferences.avoid.length>0,preferenceReady:j.preferences.ready,patterns:j.patternAnalysis.patterns.map(p=>p.name).join('/')||'未命名',special:j.special.status,blockers:j.special.blockers,periods};
}
function stats(list){const n=list.length,periods=list.flatMap(r=>r.periods),count=k=>list.filter(r=>r[k]).length;const reasons={};for(const p of periods)for(const t of THEMES)for(const reason of p.reasons[t])reasons[reason]=(reasons[reason]||0)+1;return {charts:n,strength:count('strengthKnown'),preference:count('preferenceKnown'),preferenceReady:count('preferenceReady'),periods:periods.length,scores:Object.fromEntries(THEMES.map(t=>[t,periods.filter(p=>p.scores[t]!==null).length])),reasons:Object.fromEntries(Object.entries(reasons).sort((a,b)=>b[1]-a[1]))};}
const group=k=>Object.fromEntries([...new Set(rows.map(r=>r[k]))].sort().map(v=>[v,stats(rows.filter(r=>r[k]===v))]));
const formations=['壬戌 庚戌 癸未 乙亥','癸未 丁未 辛巳 戊申','庚辰 丙午 癸巳 庚午','辛酉 己未 辛亥 壬子','辛丑 戊寅 丙午 乙丑','癸亥 甲辰 庚申 己亥','丙寅 戊戌 壬戌 辛丑','壬申 丙午 甲午 壬申'].map(text=>{
 const r={input:{gender:'female'},calculatedResult:Object.fromEntries(text.split(' ').map((s,i)=>[['year','month','day','hour'][i],{stem:s[0],branch:s[1]}]))};
 return evaluate(text,r,'formation',['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未']);
});
const report={schema:1,sample:'calendar grid 1990–2009 ×12 months ×2 genders, fixed dates/hours; structural fixtures separate',summary:stats(rows),bySource:group('source'),byDay:group('day'),byStrength:group('strength'),byPattern:group('patterns'),formationChecks:{summary:stats(formations),rows:formations},rows};
const output=process.argv[2]||'maintenance/bazi-coverage.json';await fs.mkdir('maintenance',{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2));console.log(JSON.stringify({summary:report.summary,byStrength:report.byStrength,byPattern:report.byPattern},null,2));
