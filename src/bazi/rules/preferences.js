import { ELEMENTS, STEM_BY_NAME } from '../data/fundamentals.js';

export function reconcilePreferences(strength,special,climate,patterns){
 const support=strength.supportPreference;
 const established=special.status==='established';
 const structural=patterns.structureGod?[patterns.structureGod,...patterns.assistantGods]:[];
 const protectedElements=[...new Set(structural.map(n=>n.element||STEM_BY_NAME[n.stem]?.element).filter(Boolean))];
 const assistingElements=[...new Set(patterns.assistantGods.map(n=>n.element||STEM_BY_NAME[n.stem]?.element).filter(Boolean))];
 const damaged=patterns.candidates.flatMap(c=>c.damage||[]);
 const harmful=[...new Set(damaged.map(d=>d.attack?.element||STEM_BY_NAME[d.attack?.stem]?.element).filter(Boolean))];
 const deferredClimate=[];
 const evaluations=ELEMENTS.map(element=>{
  const evidence=[];
  const put=(axis,value,reason)=>{if(value)evidence.push({axis,value,reason});};
  if(established)put('special',special.favorable.includes(element)?1:special.avoid.includes(element)?-1:0,special.name+'顺逆');
  else put('support',support.favorable.includes(element)?1:support.avoid.includes(element)?-1:0,'扶抑平衡');
  if(!established){
   // 格局用神 is not automatically an element to increase (e.g. strong killing).
   if(assistingElements.includes(element))put('structure',1,'支持已成立的相神作用');
   if(harmful.includes(element))put('structure',-1,'原局已有同类损伤路径');
  }
  const climateSign=climate.favorable.includes(element)?1:climate.avoid.includes(element)?-1:0;
  const specialSign=established?(special.favorable.includes(element)?1:special.avoid.includes(element)?-1:0):0;
  if(climateSign&&specialSign&&climateSign!==specialSign)deferredClimate.push({element,reason:'真从及专旺先顺气势，调候不直接逆格'});
  else put('climate',climateSign,'寒暖燥湿');
  const signs=[...new Set(evidence.map(e=>Math.sign(e.value)))];
  const conditional=signs.length>1;
  return {element,sign:special.status==='uncertain'?null:conditional?null:signs[0]||0,status:special.status==='uncertain'?'unresolved':conditional?'conditional':signs[0]>0?'favorable':signs[0]<0?'avoid':'neutral',evidence};
 });
 const criticalConflict=evaluations.some(e=>e.status==='conditional'&&e.evidence.some(x=>x.axis==='structure'||x.axis==='special'));
 const reasons=[];
 if(strength.uncertain)reasons.push('旺衰区间跨越强弱边界');
 if(special.status==='uncertain')reasons.push('特殊格局的顺逆尚未确定');
 if(criticalConflict)reasons.push('格局、扶抑或调候存在关键冲突');
 const ready=!reasons.length&&evaluations.some(e=>e.sign===1||e.sign===-1);
 return {method:'separate-axes-reconciliation-v2',support,structure:{god:patterns.structureGod,assistants:patterns.assistantGods,protectedElements},
  climate:{favorable:climate.favorable,avoid:climate.avoid},special:established?special.name:null,
  evaluations,favorable:evaluations.filter(e=>e.sign===1).map(e=>e.element),avoid:evaluations.filter(e=>e.sign===-1).map(e=>e.element),
  conditional:evaluations.filter(e=>e.status==='conditional').map(e=>e.element),deferredClimate,criticalConflict,ready,reasons};
}
