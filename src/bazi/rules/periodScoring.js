import { SEXAGENARY_CYCLE } from '../data/sexagenary.js';
import { getTenGod } from './tenGods.js';
import { analyzeBaziJudgment } from './judgmentEngine.js';
import { roleWeight,groupForElement,PHASE_WEIGHT } from './judgmentFacts.js';
import { effectiveElement } from './interactions.js';
import { lichunForYear } from '../core/solarTerms.js';

export const SCORE_POLICY=Object.freeze({version:'ziping-rule-trend-2',base:50,min:0,max:100,minimumCoverage:.8,
 element:Object.freeze({overall:12,career:10,wealth:12,relationship:8}),balance:10,climate:8,formation:14,palace:12});
export const THEMES=Object.freeze(['overall','career','wealth','relationship']);
const clamp=v=>Math.max(0,Math.min(100,v));
const round=v=>Math.round(v*10)/10;
const delta=(id,value,text)=>({id,value:round(value),text});
const distance=r=>r<.42?.42-r:r>.58?r-.58:0;
const themeGroups={overall:['peer','resource','output','wealth','authority'],career:['authority','resource','output'],wealth:['wealth','output','peer'],relationship:['wealth','authority','peer']};
const boundaryCache=new Map();
function annualBoundary(year){
 if(!boundaryCache.has(year))boundaryCache.set(year,+lichunForYear(year).instant);
 return boundaryCache.get(year);
}

export function analyzeBaziPeriod(input,periods,baseline=analyzeBaziJudgment(input)){
 const state=analyzeBaziJudgment(input,periods),scores=Object.fromEntries(THEMES.map(t=>[t,null]));
 const contributions=Object.fromEntries(THEMES.map(t=>[t,[]])),reasons=Object.fromEntries(THEMES.map(t=>[t,[]]));
 const themes=Object.fromEntries(THEMES.map(t=>[t,'该阶段暂缺少可确定的作用条件。']));
 if(!baseline.facts||!state.facts)return {state,scores,contributions,reasons,themes};
 const add=(theme,id,value,text)=>{if(value)contributions[theme].push(delta(id,value,text));};
 const block=(theme,text)=>reasons[theme].push(text);
 for(const theme of THEMES){
  if(!baseline.preferences.ready)block(theme,baseline.preferences.reasons.join('；')||'原局取用未明确');
  if(state.strength.uncertain)block(theme,'阶段作用后的旺衰跨越判断边界');
  if(state.special.status==='uncertain')block(theme,'阶段特殊格局存在争议');
  if(state.preferences.criticalConflict)block(theme,'阶段格局、扶抑或调候存在关键冲突');
  if(baseline.special.status==='established'&&state.special.name!==baseline.special.name)block(theme,'原有从格或专旺条件改变，需要重新核定结构');
  if(baseline.special.level==='化气'&&theme!=='overall')block(theme,'化气格的专题取象尚不能确定');
 }
 const fresh=state.facts.periods;
 const influences=fresh.flatMap(n=>{
  const stage=PHASE_WEIGHT[n.source]/PHASE_WEIGHT.luck;
  const transformed=effectiveElement(n,'branch',state.interactions),total=n.hidden.reduce((s,h)=>s+roleWeight(h.role),0);
  return [{node:n,layer:'stem',element:effectiveElement(n,'stem',state.interactions),god:getTenGod(state.facts.day,n.stem),weight:.4*stage},
   ...(transformed?[{node:n,layer:'branch',element:transformed,god:null,weight:.6*stage}]:n.hidden.map(h=>({node:n,layer:'branch',element:h.element,god:h.god,weight:.6*stage*roleWeight(h.role)/total})))];
 });
 for(const theme of THEMES){
  if(theme==='relationship'&&!['male','female'].includes(state.facts.gender))block(theme,'缺少用于配偶星分栏的性别资料');
  let total=0,value=0,uncertain=0;
  for(const influence of influences){
   const preference=baseline.preferences.evaluations.find(e=>e.element===influence.element);
   const group=groupForElement(state.facts.dayElement,influence.element);
   const relevant=theme==='overall'||themeGroups[theme].includes(group);
   if(!relevant)continue;
   total+=influence.weight;
   if(preference.sign===null)uncertain+=influence.weight;
   else value+=preference.sign*influence.weight;
  }
  if(uncertain>0)block(theme,'进入的五行涉及尚未解决的取用冲突');
  if(total&&value)add(theme,'incoming-element',SCORE_POLICY.element[theme]*value/total,
    value>0?'阶段干支对命局所需形成支持。':'阶段干支增加了命局需要节制的力量。');
 }
 if(baseline.special.status!=='established'){
  const improvement=Math.max(-1,Math.min(1,(distance(baseline.strength.ratio)-distance(state.strength.ratio))/.2));
  add('overall','balance-improvement',improvement*SCORE_POLICY.balance,improvement>0?'生扶与消耗更接近平衡。':'生扶与消耗的偏向加大。');
 }
 const climateDelta=baseline.climate.needs.length-state.climate.needs.length;
 if(climateDelta)for(const theme of THEMES)add(theme,'climate-change',Math.sign(climateDelta)*SCORE_POLICY.climate*(theme==='overall'?1:.5),climateDelta>0?'阶段力量补足了寒暖燥湿的需要。':'阶段使寒暖燥湿的需要更加突出。');
 const old=baseline.patternAnalysis.status,next=state.patternAnalysis.status;
 const patternSign=old==='broken'&&['established','rescued'].includes(next)?1:['established','rescued'].includes(old)&&next==='broken'?-1:old==='rescued'&&next==='established'?.5:0;
 if(patternSign)for(const theme of ['overall','career','wealth'])add(theme,'structure-change',patternSign*SCORE_POLICY.formation*(theme==='wealth'?.7:1),patternSign>0?'阶段出现有效救应，原有结构得到维护。':'阶段损伤了原有结构的关键环节。');
 const criticalIds=new Set([baseline.patternAnalysis.structureGod,...baseline.patternAnalysis.assistantGods].filter(Boolean).map(n=>n.position));
 for(const relation of state.interactions.relations){
  if(!relation.ids.some(id=>fresh.some(n=>n.id===id)))continue;
  const newInteraction=!baseline.interactions.relations.some(old=>old.kind===relation.kind&&old.layer===relation.layer&&old.ids.join('/')===relation.ids.join('/'));
  if(!newInteraction)continue;
  if(relation.state==='contested'&&relation.ids.some(id=>criticalIds.has(id)||id==='month'))for(const theme of ['overall','career','wealth'])block(theme,'关键宫位冲合主次未定');
  if(relation.ids.includes('day')&&relation.layer==='branch'){
   if(relation.state==='contested')block('relationship','日支冲合主次未定');
   if(relation.kind==='冲'&&relation.state!=='mitigated')add('relationship','palace-clash',-SCORE_POLICY.palace,'日支受到冲动，共同生活和相处安排需要调整。');
   if(['刑','三刑','害','破','自刑'].includes(relation.kind))add('relationship','palace-friction',-5,'日支受到刑害破的牵动，相处节奏需要协调。');
   if(['六合','三合','三会'].includes(relation.kind)&&relation.state==='transformed'){
    const sign=baseline.preferences.evaluations.find(e=>e.element===relation.element)?.sign;
    if(sign===null)block('relationship','日支化局的喜忌有冲突');
    else if(sign)add('relationship','palace-transformation',sign*8,sign>0?'日支参与有利化局，关系中的合作力量增加。':'日支参与的化局偏离命局所需。');
   }
  }
 }
 // Spouse-star direction is distinct from palace movement; a star's mere presence is not a bonus.
 const spouse=state.facts.gender==='male'?'wealth':'authority';
 for(const influence of influences.filter(i=>groupForElement(state.facts.dayElement,i.element)===spouse)){
  const sign=baseline.preferences.evaluations.find(e=>e.element===influence.element)?.sign;
  if(sign)add('relationship','spouse-star',sign*6*influence.weight,sign>0?'配偶星方向得到命局所需的支持。':'配偶星带来的压力需要留意。');
 }
 for(const theme of THEMES){
  // Collapse repeated same-kind palace/spouse terms; occurrence count is not a multiplier.
  const merged=[];for(const item of contributions[theme]){const existing=merged.find(x=>x.id===item.id);if(!existing)merged.push(item);else if(Math.abs(item.value)>Math.abs(existing.value))Object.assign(existing,item);}
  contributions[theme]=merged;
  reasons[theme]=[...new Set(reasons[theme])];
  if(!reasons[theme].length&&merged.length)scores[theme]=round(clamp(SCORE_POLICY.base+merged.reduce((sum,c)=>sum+c.value,0)));
  themes[theme]=reasons[theme].length?reasons[theme][0]+'。':merged.slice().sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,2).map(c=>c.text).join('')||'该主题没有足够的明确作用信号。';
 }
 const stageClash=state.interactions.relations.some(r=>r.kind==='冲'&&r.ids.includes('month')&&r.ids.some(id=>fresh.some(n=>n.id===id)));
 const horse=b=>'寅午戌'.includes(b)?'申':'申子辰'.includes(b)?'寅':'巳酉丑'.includes(b)?'亥':'巳';
 const horseMove=fresh.some(n=>n.source==='annual'&&[horse(state.facts.natal[0].branch),horse(state.facts.natal[2].branch)].includes(n.branch));
 return {state,scores,contributions,reasons,themes,policy:SCORE_POLICY.version,signals:{stageClash,horseMove}};
}

export function cycleStart(startDate,index){
 if(typeof startDate!=='string'||!/(?:Z|[+-]\d{2}:\d{2})$/i.test(startDate)||!Number.isInteger(index)||index<0)return null;
 const date=new Date(startDate);if(!Number.isFinite(+date))return null;
 const month=date.getUTCMonth();date.setUTCFullYear(date.getUTCFullYear()+index*10);
 // A leap-day anniversary falls on Feb 28 rather than leaking into March.
 if(date.getUTCMonth()!==month)date.setUTCDate(0);
 return date;
}

export function scoreLuckCycles(input,baseline=analyzeBaziJudgment(input)){
 const source=input.luckCycles?.cycles||[],annual=new Map();
 for(const cycle of source)for(const year of cycle.years||[])if(!annual.has(year.year))annual.set(year.year,year);
 return source.map((cycle,index)=>{
  const start=cycleStart(input.luckCycles.startDate,index),end=cycleStart(input.luckCycles.startDate,index+1);
  const luck={pillar:cycle.pillar,source:'luck',id:'luck'};
  const direct=analyzeBaziPeriod(input,[luck],baseline),years=[];
  if(start&&end){
   for(let year=start.getUTCFullYear()-1;year<=end.getUTCFullYear();year++){
    const row=annual.get(year);
    const a=new Date(annualBoundary(year)),b=new Date(annualBoundary(year+1));
    const expected=SEXAGENARY_CYCLE[((year-4)%60+60)%60].name;
    if((row&&row.annual?.pillar!==expected)||!Number.isFinite(+a)||!Number.isFinite(+b)||a.getUTCFullYear()!==year||b.getUTCFullYear()!==year+1||+b<=+a)continue;
    const left=Math.max(+a,+start),right=Math.min(+b,+end);if(right<=left)continue;
    const result=analyzeBaziPeriod(input,[luck,{pillar:expected,source:'annual',id:'annual'}],baseline);
    years.push({year,pillar:expected,boundaryRule:'astronomy-lichun',from:new Date(left).toISOString(),to:new Date(right).toISOString(),weight:(right-left)/(+end-+start),
      scores:result.scores,themes:result.themes,contributions:result.contributions,reasons:result.reasons,signals:result.signals});
   }
  }
  const scores=start&&end?{...direct.scores}:Object.fromEntries(THEMES.map(t=>[t,null])),annualAverage={},coverage={},themes=start&&end?{...direct.themes}:Object.fromEntries(THEMES.map(t=>[t,'缺少明确的起运时间，暂不评分。']));
  for(const theme of THEMES){
   const valid=years.filter(y=>Number.isFinite(y.scores[theme]));coverage[theme]=valid.reduce((sum,y)=>sum+y.weight,0);
   annualAverage[theme]=coverage[theme]>=SCORE_POLICY.minimumCoverage?round(valid.reduce((sum,y)=>sum+y.scores[theme]*y.weight,0)/coverage[theme]):null;
  }
  const yearFormat=new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}),monthFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit'});
  return {...cycle,index,startInstant:start?.toISOString()||null,endInstant:end?.toISOString()||null,
    displayStartYear:start?Number(yearFormat.format(start)):null,displayEndYear:end?Number(yearFormat.format(end)):null,
    periodLabel:start&&end?`${monthFormat.format(start)}—${monthFormat.format(end)}`:null,
    scores,annualAverage,coverage,themes,years,
    directScores:direct.scores,contributions:direct.contributions,policy:SCORE_POLICY.version};
 });
}
