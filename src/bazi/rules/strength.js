import { ELEMENTS } from '../data/fundamentals.js';
import { elementAfter, seasonFactor, contextualSeasonFactor, roleWeight, canonicalStem,PHASE_WEIGHT } from './judgmentFacts.js';
import { effectiveElement } from './interactions.js';
import { STEM_BY_NAME } from '../data/fundamentals.js';
import { getTenGod } from './tenGods.js';

export const STRENGTH_BANDS=Object.freeze([
 {max:.22,label:'身弱',kind:'weak'}, {max:.42,label:'偏弱',kind:'weak'},
 {max:.58,label:'平衡',kind:'balanced'}, {max:.78,label:'偏强',kind:'strong'}, {max:1,label:'身强',kind:'strong'}
].map(b=>Object.freeze(b)));
export const classifyStrengthRatio=ratio=>{
 if(!Number.isFinite(ratio)||ratio<0||ratio>1)return {label:'旺衰待定',kind:'unknown'};
 const snapped=[.22,.42,.58,.78].find(edge=>Math.abs(ratio-edge)<1e-10)??ratio;
 return STRENGTH_BANDS.find(b=>b.max===.42?snapped<b.max:snapped<=b.max)||STRENGTH_BANDS.at(-1);
};
const band=classifyStrengthRatio;
export function analyzeStrength(facts,interactions){
 const same=facts.dayElement,resource=elementAfter(same,4),supports=e=>e===same||e===resource;
 const weights=Object.fromEntries(ELEMENTS.map(e=>[e,0])),low={yes:0,no:0},high={yes:0,no:0},contributions=[],roots=[];
 const add=(e,base,range,source)=>{
  const value=base*contextualSeasonFactor(e,facts);weights[e]+=value*(range[0]+range[1])/2;
  const side=supports(e)?'yes':'no';low[side]+=value*range[0];high[side]+=value*range[1];
  contributions.push({element:e,base,season:contextualSeasonFactor(e,facts),range,source});
 };
 for(const node of facts.nodes){
  const phase=PHASE_WEIGHT[node.source];
  if(node.id!=='day')add(effectiveElement(node,'stem',interactions),phase,interactions.boundIds.includes(node.id)?[.35,.65]:[1,1],`${node.id}:stem`);
  const transformed=effectiveElement(node,'branch',interactions),disputed=interactions.disputedRootIds.includes(node.id);
  const total=node.hidden.reduce((sum,h)=>sum+roleWeight(h.role),0),branchWeight=(node.id==='month'?3:1)*phase;
  const parts=transformed?[{element:transformed,role:'main',stem:canonicalStem(transformed),weight:1}]:node.hidden.map(h=>({...h,weight:roleWeight(h.role)/total}));
  for(const h of parts){
   add(h.element,branchWeight*h.weight,disputed?[.45,1]:[1,1],`${node.id}:branch:${h.role}`);
   if(h.element===same)roots.push({id:node.id,stem:h.stem,role:h.role,disputed,source:node.source});
  }
 }
 const minimum=low.yes/(low.yes+high.no),maximum=high.yes/(high.yes+low.no),ratio=(minimum+maximum)/2;
 const first=band(minimum),last=band(maximum),stableKind=first.kind===last.kind;
 const uncertain=!stableKind;
 const level=first.label===last.label?first.label:stableKind?(first.kind==='weak'?'偏弱':first.kind==='strong'?'偏强':'平衡'):'旺衰待定';
 const kind=uncertain?'unknown':first.kind;
 return {level,kind,ratio,interval:[minimum,maximum],uncertain,weights,roots,contributions,
  mainRoots:roots.filter(r=>r.role==='main'&&!r.disputed),
  season:contextualSeasonFactor(same,facts),monthProgress:facts.monthProgress,method:'season-root-flow-v2',
  // The entire balanced interval has the same neutral support preference.
  supportPreference:{method:'扶抑',favorable:kind==='weak'?[resource,same]:kind==='strong'?[elementAfter(same,1),elementAfter(same,2),elementAfter(same,3)]:[],
   avoid:kind==='weak'?[elementAfter(same,1),elementAfter(same,2),elementAfter(same,3)]:kind==='strong'?[resource,same]:[]}};
}

export function effectiveTokens(facts,interactions){
 return facts.nodes.flatMap(node=>{
  const stemElement=effectiveElement(node,'stem',interactions),branchElement=effectiveElement(node,'branch',interactions);
  const tokens=node.id==='day'?[]:[{id:node.id,layer:'stem',element:stemElement,stem:node.stem,visible:true,bound:interactions.boundIds.includes(node.id)}];
  return [...tokens,...(branchElement?[{id:node.id,layer:'branch',element:branchElement,stem:canonicalStem(branchElement),role:'main',transformed:true}]:node.hidden.map(h=>({...h,id:node.id,layer:'branch'})))];
 });
}

export function classifySpecial(facts,interactions,strength){
 const tokens=effectiveTokens(facts,interactions),same=facts.dayElement,resource=elementAfter(same,4);
 const supports=e=>e===same||e===resource;
 const base={status:'ordinary',name:null,level:null,favorable:[],avoid:[],requirements:[],blockers:[]};
 const contested=interactions.unresolved.length||interactions.boundIds.length||interactions.disputedRootIds.length;
 const visible=tokens.filter(t=>t.visible),branches=tokens.filter(t=>!t.visible);
 const residualOutput=t=>!t.visible&&t.role!=='main'&&t.element===elementAfter(same,1)&&!visible.some(v=>v.element===t.element);
 const otherVisible=visible.filter(t=>!supports(t.element));
 const inverseRoots=branches.filter(t=>supports(t.element));
 const seasonMain=effectiveElement(facts.natal[1],'branch',interactions)||facts.natal[1].hidden[0].element;
 const dayJoin=interactions.transformed.find(r=>r.layer==='stem'&&r.ids.includes('day'));
 if(dayJoin){
  const originalRoot=branches.some(t=>t.element===same);
  const branchSupport=interactions.transformed.some(r=>r.layer==='branch'&&r.element===dayJoin.element&&r.ids.includes('month'))||
    seasonMain===dayJoin.element&&facts.natal.filter(n=>n.hidden[0].element===dayJoin.element).length>=3;
  if(!originalRoot&&branchSupport&&!contested&&visible.every(t=>t.element===dayJoin.element||elementAfter(t.element,1)===dayJoin.element))
   return {...base,status:'established',name:`化${dayJoin.element}格`,level:'化气',favorable:[dayJoin.element,elementAfter(dayJoin.element,4)],avoid:[elementAfter(dayJoin.element,3)],requirements:['日干真化','月令同化气','无原根与逆神']};
  return {...base,status:'uncertain',blockers:['日干参与合化，但化气格条件不全']};
 }
 // Pure-direction structures take precedence over ordinary following; full branch
 // formation and an exposed, unopposed leading qi are required.
 const leading=interactions.transformed.find(r=>r.layer==='branch'&&['三合','三会'].includes(r.kind)&&r.element===same&&r.ids.includes('month'));
 const dedicated={木:'曲直格',火:'炎上格',金:'从革格',水:'润下格'};
 const hostile=tokens.some(t=>t.element===elementAfter(same,3));
 if(!contested&&leading&&dedicated[same]&&!hostile&&visible.every(t=>supports(t.element))&&branches.every(t=>supports(t.element)||residualOutput(t)))
  return {...base,status:'established',name:dedicated[same],level:'从强',favorable:[same,resource,elementAfter(same,1)],avoid:[elementAfter(same,3)],requirements:['月令参与完整化局','主气有透干','无有效逆势官杀']};
 const crop=same==='土'&&facts.natal.every(n=>'辰戌丑未'.includes(n.branch))&&!tokens.some(t=>t.element==='木')&&visible.every(t=>['土','火'].includes(t.element));
 if(!contested&&crop)return {...base,status:'established',name:'稼穑格',level:'从强',favorable:['土','火','金'],avoid:['木'],requirements:['四支土聚','无木克破','火土透干']};
 if(same==='土'&&facts.natal.every(n=>'辰戌丑未'.includes(n.branch))&&visible.every(t=>['土','火'].includes(t.element)))
  return {...base,status:'uncertain',blockers:['四库土聚，但余气及刑冲是否破坏专旺尚未核定']};
 const pureSame=tokens.every(t=>t.element===same);
 const pureSupport=tokens.every(t=>supports(t.element)||residualOutput(t));
 if(!contested&&pureSupport&&supports(seasonMain)&&strength.mainRoots.length&&visible.some(t=>t.element===same))
  {const followingSelf=pureSame||branches.filter(t=>t.role==='main').every(t=>t.element===same);
   return {...base,status:'established',name:followingSelf?'从旺格':'从强格',level:'从强',favorable:followingSelf?[same,resource,elementAfter(same,1)]:[same,resource],avoid:[elementAfter(same,2),elementAfter(same,3)],requirements:['印比成势，食伤余气未另成党','得令有根','无有效财官逆势']};}
 const floatingPeer=visible.filter(t=>t.element===same&&!branches.some(b=>b.element===same||b.element===resource));
 const unsupported=t=>floatingPeer.length===1&&floatingPeer.includes(t);
 if(!contested&&!inverseRoots.length&&!visible.some(t=>supports(t.element)&&!unsupported(t))&&!supports(seasonMain)){
  const opposite=[...new Set(tokens.filter(t=>!unsupported(t)).map(t=>t.element))];
  const kinds=[[elementAfter(same,1),'从儿格'],[elementAfter(same,2),'从财格'],[elementAfter(same,3),'从杀格']];
  const leader=kinds.find(([e])=>e===seasonMain);
  // Multiple qi are allowed only if they form one forward chain ending in the
  // month leader. Financial qi must not divert a following-output structure.
  const compatible=leader&&opposite.every(e=>e===leader[0]||
    (leader[1]==='从儿格'?elementAfter(leader[0],1)===e:elementAfter(e,1)===leader[0]));
  if(compatible){const child=leader[1]==='从儿格',kill=leader[1]==='从杀格';
   const authorityGods=[...new Set(visible.filter(t=>t.element===leader[0]).map(t=>getTenGod(facts.day,canonicalStem(t.element,STEM_BY_NAME[t.stem].polarity))))];
   const name=kill?(authorityGods.length===1&&authorityGods[0]==='正官'?'从官格':authorityGods.length>1?'从官杀格':'从杀格'):leader[1];
   return {...base,status:'established',name,level:'从弱',favorable:child?[leader[0],elementAfter(same,2),same]:kill?[leader[0],elementAfter(same,2)]:[leader[0],elementAfter(same,1),elementAfter(same,3)],
    avoid:child?[resource]:kill?[same,resource,elementAfter(same,1)]:[same,resource],requirements:['无有效印比根援，孤比无根不成党','月令主导气势','异党顺生且不争战']};}
  if(opposite.length>=2&&opposite.every(e=>!supports(e)))return {...base,status:'uncertain',blockers:['无根但气势多向，从势及顺逆尚不清']};
 }
 // A strict transformation structure additionally needs day-master participation,
 // absence of original roots and a branch transformation supporting the same qi.
 if((strength.ratio<.15||strength.ratio>.85)&&contested)return {...base,status:'uncertain',blockers:['极端气势伴有根气或合冲争议']};
 const onlyWeakResource=branches.filter(t=>t.element===resource).every(t=>t.role==='residual')&&seasonFactor(resource,facts.monthBranch)<1;
 if(strength.ratio<.22&&!strength.mainRoots.length&&onlyWeakResource&&visible.filter(t=>t.element===resource).length===1)
  return {...base,status:'uncertain',blockers:['微弱印援是否有效，涉及普通身弱与从格分歧']};
 return base;
}
