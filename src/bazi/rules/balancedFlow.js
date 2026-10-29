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
// Indirect thematic effects require an actual rooted/supplied period actor
// acting on a natal actor in that theme. A resource is not itself money, but
// can support a needed peer or restrain excessive output. Keep opposing paths
// separately, and never use mere coexistence or an unresolved preference.
export function indirectThemeEffects(baseline,state,themeGroups){
 if(baseline.special.status!=='ordinary'||state.special.status!=='ordinary')return [];
 const {actors,close}=flowContext(),current=actors(state),effects=[];
 const labels={career:'工作中的承接与执行',wealth:'经营中的承载与产出',relationship:'相处中的支持与协调'};
 for(const [theme,groups]of Object.entries(themeGroups)){
  if(theme==='overall')continue;
  for(const source of current.filter(a=>a.node.source!=='natal'&&!groups.includes(a.group)))
   for(const target of current.filter(a=>a.node.source==='natal'&&groups.includes(a.group))){
    if(!close(source,target))continue;
    const sign=baseline.preferences.evaluations.find(p=>p.element===target.element)?.sign;
    if(sign!==1&&sign!==-1)continue;
    const action=generates(source.element,target.element)?1:controls(source.element,target.element)?-1:0;
    if(!action)continue;
    const direction=action*sign;
    effects.push({theme,id:`indirect-${source.group}-${target.group}-${action}`,direction,
     weight:Math.min(source.weight,target.weight),
     text:direction>0?`阶段力量${action>0?'扶持命局需要的':'节制命局偏多的'}${{peer:'自身力量',resource:'学习支持',output:'表达与产出',wealth:'经营资源',authority:'职责压力'}[target.group]}，有助于${labels[theme]}。`:
      `阶段力量${action>0?'加重命局偏多的':'削弱命局需要的'}${{peer:'自身力量',resource:'学习支持',output:'表达与产出',wealth:'经营资源',authority:'职责压力'}[target.group]}，${labels[theme]}需要更多协调。`,
     evidence:[source,target].map(t=>({id:t.id,layer:t.layer,element:t.element,rootType:t.rootType,sources:t.sources||[]}))});
   }
 }
 return effects;
}
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
