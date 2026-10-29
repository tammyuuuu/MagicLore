import { ELEMENTS, STEM_BY_NAME, BRANCH_BY_NAME } from '../data/fundamentals.js';
import { getHiddenStems } from '../data/hiddenStems.js';
import { getTenGod } from './tenGods.js';
import { SEXAGENARY_BY_NAME } from '../data/sexagenary.js';

export const NATAL_KEYS=['year','month','day','hour'];
export const JUDGMENT_VERSION='ziping-integrated-2';
export const PHASE_WEIGHT=Object.freeze({natal:1,luck:.7,annual:.35,month:.175});
export const DISPUTED_ROOT_AVAILABILITY=.65;
export const elementAfter=(element,steps)=>ELEMENTS[(ELEMENTS.indexOf(element)+steps+5)%5];
export const generates=(a,b)=>elementAfter(a,1)===b;
export const controls=(a,b)=>elementAfter(a,2)===b;
export const GOD_GROUP={比肩:'peer',劫财:'peer',正印:'resource',偏印:'resource',食神:'output',伤官:'output',正财:'wealth',偏财:'wealth',正官:'authority',七杀:'authority'};
export const groupForElement=(day,element)=>element===day?'peer':elementAfter(day,1)===element?'output':elementAfter(day,2)===element?'wealth':elementAfter(day,3)===element?'authority':'resource';
export const canonicalStem=(element,polarity='阳')=>Object.values(STEM_BY_NAME).find(s=>s.element===element&&s.polarity===polarity)?.name;
export function makeJudgmentFacts(input,periods=[]){
  if(!Array.isArray(periods))return null;
  const p=input?.calculatedResult||input;
  if(!NATAL_KEYS.every(key=>STEM_BY_NAME[p?.[key]?.stem]&&BRANCH_BY_NAME[p?.[key]?.branch]&&SEXAGENARY_BY_NAME[p[key].stem+p[key].branch]))return null;
  if(periods.length>3)return null;
  const day=p.day.stem;
  const make=(raw,id,index,source)=>{
    if(!raw||typeof raw!=='object')return null;
    const stem=raw.stem||raw.pillar?.[0],branch=raw.branch||raw.pillar?.[1];
    if(!STEM_BY_NAME[stem]||!BRANCH_BY_NAME[branch]||!SEXAGENARY_BY_NAME[stem+branch])return null;
    const hidden=Object.entries(getHiddenStems(branch)).filter(([,s])=>s).map(([role,s])=>({role,stem:s,element:STEM_BY_NAME[s].element,god:getTenGod(day,s)}));
    return {id,index,source,stem,branch,element:STEM_BY_NAME[stem].element,polarity:STEM_BY_NAME[stem].polarity,
      god:getTenGod(day,stem),hidden,title:raw.title||source};
  };
  const natal=NATAL_KEYS.map((key,i)=>make(p[key],key,i,'natal'));
  const extra=periods.map((period,i)=>make(period,period?.id||`period-${i}`,4+i,period?.source||'luck'));
  if(extra.some(n=>!n||NATAL_KEYS.includes(n.id)||!['luck','annual','month'].includes(n.source))||new Set(extra.map(n=>n.id)).size!==extra.length||new Set(extra.map(n=>n.source)).size!==extra.length)return null;
  const terms=input?.solarTerms||p.month.basis;
  const from=Date.parse(terms?.previous?.instant),to=Date.parse(terms?.next?.instant);
  const correction=input?.normalizedTime?.usedTimeBasis==='true_solar'?
    ((input.normalizedTime.longitudeCorrectionMinutes||0)+(input.normalizedTime.equationOfTimeMinutes||0))*60000:0;
  const instant=Date.parse(input?.normalizedTime?.utcInstant)+correction;
  const termBranch={立春:'寅',惊蛰:'卯',清明:'辰',立夏:'巳',芒种:'午',小暑:'未',立秋:'申',白露:'酉',寒露:'戌',立冬:'亥',大雪:'子',小寒:'丑'};
  const matchingTerm=!terms?.previous?.name||termBranch[terms.previous.name]===p.month.branch;
  const monthProgress=matchingTerm&&Number.isFinite(from)&&Number.isFinite(to)&&Number.isFinite(instant)&&to>from&&instant>=from&&instant<to?(instant-from)/(to-from):null;
  return {day,dayElement:STEM_BY_NAME[day].element,dayPolarity:STEM_BY_NAME[day].polarity,
    monthBranch:p.month.branch,natal,nodes:[...natal,...extra],periods:extra,
    gender:input?.input?.gender||null,solarTerms:input?.solarTerms||null,instant:input?.normalizedTime?.utcInstant||null,monthProgress};
}

export function seasonFor(branch){
  if('寅卯'.includes(branch))return '木';
  if('巳午'.includes(branch))return '火';
  if('申酉'.includes(branch))return '金';
  if('亥子'.includes(branch))return '水';
  return '土';
}
// These coefficients are explicit software conventions, not classical numerical laws.
export function seasonFactor(element,month){
  const season=seasonFor(month);
  return element===season?1.6:generates(season,element)?1.3:generates(element,season)?1:controls(element,season)?.75:.5;
}
export const roleWeight=role=>role==='main'?1:role==='middle'?.3:.2;
export function contextualSeasonFactor(element,facts){
 const base=seasonFactor(element,facts.monthBranch);
 if(facts.monthProgress===null)return base;
 const previous={寅:'水',卯:'木',辰:'木',巳:'木',午:'火',未:'火',申:'火',酉:'金',戌:'金',亥:'金',子:'水',丑:'水'}[facts.monthBranch];
 const prior=element===previous?1.6:generates(previous,element)?1.3:generates(element,previous)?1:controls(element,previous)?.75:.5;
 // Explicit continuity model, NOT an assertion that a particular hidden stem
 // commands a universally agreed number of days.
 const carry=.25*(1-facts.monthProgress);
 return base*(1-carry)+prior*carry;
}
