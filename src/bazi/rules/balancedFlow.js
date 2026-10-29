import {effectiveTokens} from './strength.js';
import {groupForElement,generates,controls,PHASE_WEIGHT,DISPUTED_ROOT_AVAILABILITY} from './judgmentFacts.js';

// Only rooted, unbound actors with an effective positional path participate.
// A balanced body does not automatically like every element or every ten-god.
function flowContext(){
 const close=(a,b)=>(a.id!==b.id||a.layer!==b.layer)&&(a.node.source!=='natal'||b.node.source!=='natal'||Math.abs(a.node.index-b.node.index)<=1);
 const actors=j=>{
  const tokens=effectiveTokens(j.facts,j.interactions),roots=tokens.filter(t=>!t.visible);
  const availability=t=>j.interactions.disputedRootIds.includes(t.id)?DISPUTED_ROOT_AVAILABILITY:1;
  const candidates=tokens.filter(t=>!t.bound&&(t.visible||t.role==='main')).map(t=>({
   ...t,node:j.facts.nodes.find(n=>n.id===t.id),group:groupForElement(j.element,t.element),rooted:roots.some(r=>r.element===t.element),weight:(t.visible?.4:.6)*PHASE_WEIGHT[j.facts.nodes.find(n=>n.id===t.id).source]/PHASE_WEIGHT.luck*Math.min(t.visible?1:availability(t),Math.max(0,...roots.filter(r=>r.element===t.element).map(availability)))
  }));
  const direct=candidates.filter(t=>t.rooted).map(t=>({...t,rootType:'direct'}));
  // One-step supplied qi is not a direct root and must never feed its own
  // qualification recursively. Only an independently rooted source can supply it.
  const supplied=candidates.filter(t=>!t.rooted).flatMap(t=>{
   const sources=direct.filter(s=>close(s,t)&&generates(s.element,t.element));
   if(!sources.length)return [];
   return [{...t,rootType:'supplied',sources:sources.map(s=>s.id),weight:Math.min((t.visible?.4:.6)*PHASE_WEIGHT[t.node.source]/PHASE_WEIGHT.luck*.5,...sources.map(s=>s.weight))}];
  });
  return [...direct,...supplied];
 };
 const types={
  'output:wealth':{id:'output-wealth',themes:['overall','career','wealth'],text:'表达与产出衔接经营资源，利于落实成果。'},
  'wealth:authority':{id:'wealth-authority',themes:['overall','career','wealth'],text:'经营资源与职责相接，利于有序推进事务。'},
  'authority:resource':{id:'authority-resource',themes:['overall','career'],text:'职责与学习支持衔接，更容易承接工作要求。'}
 };
 const routes=list=>list.flatMap(a=>list.filter(b=>close(a,b)&&generates(a.element,b.element)&&types[a.group+':'+b.group]).map(b=>({a,b,...types[a.group+':'+b.group]})));
 return {actors,close,routes};
}
export function balancedFlowProfile(j){
 if(j.strength.kind!=='balanced'||j.special.status!=='ordinary')return [];
 const {actors,routes}=flowContext();
 const valid=routes(actors(j)).filter(r=>[r.a,r.b].every(t=>![null,-1].includes(j.preferences.evaluations.find(p=>p.element===t.element)?.sign)));
 return [...new Map(valid.map(r=>[r.id,{id:r.id,text:r.text}])).values()];
}
export function flowActors(j){return flowContext().actors(j);}
export function balancedFlowEffects(baseline,state){
 if(baseline.strength.kind!=='balanced'||baseline.special.status!=='ordinary'||state.special.status!=='ordinary')return [];
 const {actors,close,routes}=flowContext();
 const old=actors(baseline),current=actors(state),effects=[];
 const sign=e=>baseline.preferences.evaluations.find(p=>p.element===e)?.sign;
 const spouse=baseline.facts.gender==='male'?'wealth':'authority';
 for(const r of routes(current)){
  if(![r.a,r.b].some(t=>t.node.source!=='natal'))continue;
  if([r.a,r.b].some(t=>sign(t.element)===null||sign(t.element)===-1))continue;
  if(state.strength.kind==='weak'&&r.id!=='authority-resource')continue;
  const themes=[...r.themes];if([r.a.group,r.b.group].includes(spouse))themes.push('relationship');
  const weight=Math.min(...[r.a,r.b].filter(t=>t.node.source!=='natal'||t.rootType==='supplied').map(t=>t.weight));
  const evidence=[r.a,r.b].map(t=>({id:t.id,layer:t.layer,rootType:t.rootType,sources:t.sources||[]}));
  for(const theme of themes)effects.push({theme,id:'flow-'+r.id,direction:1,weight,text:r.text,evidence});
 }
 // A clash or another ten-god merely coexisting is not a broken flow. There
 // must be a rooted period actor directly controlling an existing route actor.
 for(const r of routes(old).filter(r=>[r.a,r.b].every(t=>![null,-1].includes(sign(t.element)))))for(const p of current.filter(t=>t.node.source!=='natal')){
  if(![r.a,r.b].some(t=>close(p,t)&&controls(p.element,t.element)))continue;
  const themes=[...r.themes];if([r.a.group,r.b.group].includes(spouse))themes.push('relationship');
  const weight=Math.min(p.weight,...[r.a,r.b].filter(t=>t.rootType==='supplied').map(t=>t.weight));
  const evidence=[p,r.a,r.b].map(t=>({id:t.id,layer:t.layer,rootType:t.rootType,sources:t.sources||[]}));
  for(const theme of themes)effects.push({theme,id:'flow-disruption-'+r.id,direction:-1,weight,text:'阶段力量干扰了原有配合，事务衔接需要更多协调。',evidence});
 }
 return effects;
}
