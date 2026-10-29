import { analyzeBaziJudgment } from './judgmentEngine.js';
import { scoreLuckCycles } from './periodScoring.js';
import { elementAfter } from './judgmentFacts.js';
import {balancedFlowProfile} from './balancedFlow.js';

const cache=new WeakMap();
export function buildUnifiedBaziInsight(input,now=new Date()){
 if(!input||typeof input!=='object')return {dayMaster:'',element:'',level:'资料不完整',patterns:[],favorable:[],avoid:[],conditional:[],cycles:[],events:{love:[],career:[],wealth:[],move:[]},unresolved:true};
 const signature=JSON.stringify([input.calculatedResult||input,input.input?.gender,input.luckCycles]);
 let saved=cache.get(input);
 if(!saved||saved.signature!==signature){const judgment=analyzeBaziJudgment(input);saved={signature,judgment,cycles:judgment.facts?scoreLuckCycles(input,judgment):[]};cache.set(input,saved);}
 const j=saved.judgment;
 if(!j.facts)return {dayMaster:'',element:'',level:'资料不完整',patterns:[],favorable:[],avoid:[],conditional:[],cycles:[],events:{love:[],career:[],wealth:[],move:[]},unresolved:true};
 const cycles=saved.cycles.map(c=>({...c,current:c.startInstant&&+now>=Date.parse(c.startInstant)&&+now<Date.parse(c.endInstant)}));
 const dateYear=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}).format(now));
 const currentAnnualYear=cycles.find(c=>c.current)?.years.find(y=>+now>=Date.parse(y.from)&&+now<Date.parse(y.to))?.year||dateYear;
 const events={love:[],career:[],wealth:[],move:[]};
 const seen=new Set();
 for(const cycle of cycles)for(const year of cycle.years){
  if(year.year<dateYear||year.year>dateYear+9||seen.has(year.year))continue;seen.add(year.year);
  if(year.scores.relationship!==null&&year.contributions.relationship.some(c=>c.id.startsWith('palace-')||c.id==='spouse-star'))events.love.push({year:year.year,text:year.themes.relationship});
  if(year.scores.career!==null&&(year.signals.stageClash||year.contributions.career.some(c=>c.id==='structure-change')))events.career.push({year:year.year,text:year.themes.career});
  if(year.scores.wealth>=60)events.wealth.push({year:year.year,text:year.themes.wealth});
  if(year.scores.overall!==null&&year.signals.horseMove)events.move.push({year:year.year,text:'阶段出现驿马触发，出行与异地事务值得关注。'+year.themes.overall});
 }
 const p=j.preferences;
 return {judgment:j,dayMaster:j.dayMaster,element:j.element,level:j.level,follow:j.special.level,
  unresolved:!p.ready,favorable:p.favorable,avoid:p.avoid,conditional:p.conditional,balanceUse:balancedFlowProfile(j),
  supportPreference:j.strength.supportPreference,climate:j.climate,patternAnalysis:j.patternAnalysis,
  structureGod:j.patternAnalysis.structureGod,assistantGods:j.patternAnalysis.assistantGods,patterns:j.patternAnalysis.patterns,
  cycles,events,dateYear,currentAnnualYear,scorePolicy:''};
}

export function legacyJudgmentView(input){
 const j=analyzeBaziJudgment(input);if(!j.facts)return {verdict:'资料不完整',favorable:[],avoid:[],uncertain:true};
 const same=j.element;
 return {judgment:j,verdict:j.level,same,print:elementAfter(same,4),out:elementAfter(same,1),money:elementAfter(same,2),officer:elementAfter(same,3),
  favorable:j.preferences.favorable,avoid:j.preferences.avoid,uncertain:!j.preferences.ready,balanced:j.strength.kind==='balanced',
  leaningWeak:j.strength.kind==='weak',ratio:j.strength.ratio,roots:j.strength.roots.map(r=>r.id+'藏'+r.stem),
  clash:j.interactions.relations.filter(r=>r.kind==='冲').map(r=>r.chars.join('')),evidence:j.strength.contributions};
}
