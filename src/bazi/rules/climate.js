import { effectiveTokens } from './strength.js';
import {DISPUTED_ROOT_AVAILABILITY} from './judgmentFacts.js';

// Seasonal climate is deliberately kept separate from 格局用神. These are
// reproducible seasonal conditions, not an invented 120-entry classical table.
const MONTH_CLIMATE={寅:[-1,0],卯:[0,0],辰:[0,1],巳:[1,-1],午:[2,-1],未:[2,-2],申:[0,0],酉:[0,-1],戌:[0,-2],亥:[-1,1],子:[-2,1],丑:[-2,2]};
export function analyzeClimate(facts,interactions){
 const [temperature,moisture]=MONTH_CLIMATE[facts.monthBranch];
 const tokens=effectiveTokens(facts,interactions);
 const supply=element=>{
  const roots=tokens.filter(t=>!t.visible&&t.element===element);
  const availability=r=>interactions.disputedRootIds.includes(r.id)?DISPUTED_ROOT_AVAILABILITY:1;
  const rootedVisible=tokens.filter(t=>t.visible&&!t.bound&&t.element===element&&roots.length);
  return roots.reduce((sum,r)=>sum+(r.role==='main'?1:r.role==='middle'?.3:.2)*availability(r),0)+rootedVisible.length*.75*Math.max(0,...roots.map(availability));
 };
 const fire=supply('火'),water=supply('水');
 const cold=temperature<=-1&&fire<(temperature===-2?1.2:.6),hot=temperature>=1&&water<(temperature===2?1.2:.6);
 const dry=moisture<=-1&&water<1,wet=moisture>=1&&fire<.6&&water>=2;
 const needs=[];
 if(cold||wet)needs.push({element:'火',stems:['丙'],purpose:'温暖解寒',priority:temperature===-2?'urgent':'normal'});
 if(hot||dry)needs.push({element:'水',stems:facts.dayElement==='木'?['癸']:['壬','癸'],purpose:'润燥降热',priority:temperature===2||moisture===-2?'urgent':'normal'});
 const favorable=[...new Set(needs.map(n=>n.element))];
 const avoid=cold&&water>=2?['水']:hot&&fire>=2?['火']:[];
 return {method:'seasonal-climate-v2',temperature,moisture,supply:{fire,water},cold,hot,dry,wet,needs,favorable,avoid,
  status:needs.length?'needed':'no-urgent-need',
  explanation:needs.length?needs.map(n=>`${n.purpose}，关注${n.stems.join('、')}${n.element}`).join('；'):'寒暖燥湿未见突出的单向需求',
  scope:'季节与有效透藏条件；未把经验取用表当作无条件喜忌'};
}
