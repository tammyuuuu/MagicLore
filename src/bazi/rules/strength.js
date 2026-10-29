import { ELEMENTS } from '../data/fundamentals.js';
import { elementAfter, seasonFactor, contextualSeasonFactor, roleWeight, canonicalStem,PHASE_WEIGHT,DISPUTED_ROOT_AVAILABILITY } from './judgmentFacts.js';
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
export function analyzeStrength(facts,interactions,{finalize=true}={}){
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
 const intervalUncertain=!stableKind;
 let uncertain=intervalUncertain;
 let level=first.label===last.label?first.label:stableKind?(first.kind==='weak'?'偏弱':first.kind==='strong'?'偏强':'平衡'):null;
 let kind=uncertain?'unknown':first.kind;
 const tokens=effectiveTokens(facts,interactions);
 const intact=tokens.filter(t=>!t.visible&&!interactions.disputedRootIds.includes(t.id));
 const rooted=tokens.filter(t=>t.visible&&!t.bound&&intact.some(r=>r.element===t.element));
 const support=rooted.filter(t=>supports(t.element)),drain=rooted.filter(t=>!supports(t.element));
 const command=seasonFactor(same,facts.monthBranch)>=1.3;
 const monthRoot=facts.natal[1].hidden[0].element===same&&!effectiveElement(facts.natal[1],'branch',interactions);
 const intactSelf=roots.filter(r=>r.role==='main'&&!r.disputed);
 const classificationEvidence={command,monthRoot,intactSelf:intactSelf.map(r=>r.id),support: support.map(t=>t.id),drain:drain.map(t=>t.id),rule:null};
 // Resolve only adjacent weak/balanced or balanced/strong alternatives using
 // independent qualitative evidence; no ratio midpoint and no following label.
 const adjacent=first.kind==='weak'&&last.kind==='balanced'||first.kind==='balanced'&&last.kind==='strong';
 if(intervalUncertain&&adjacent){
  if(command&&monthRoot&&new Set(drain.map(t=>t.element)).size>=2&&support.length===0){
   level='平衡';kind='balanced';uncertain=false;classificationEvidence.rule='得令通月根，财官食伤两路有根透出，无额外印比助势';
  }else if(!command&&intactSelf.length===0&&support.length===0&&new Set(drain.map(t=>t.element)).size>=2){
   level='偏弱';kind='weak';uncertain=false;classificationEvidence.rule='失令、无完整本气根及有根印比透援，泄耗制两路成立';
  }else if(command&&intactSelf.length>=1&&support.length>=1&&drain.length===0){
   level='偏强';kind='strong';uncertain=false;classificationEvidence.rule='得令、完整本气根与有根印比透援并见，无有效泄耗制透出';
  }
 }
 if(uncertain&&finalize){
  // A clash reduces a root's availability; it does not erase it. Final ordinary
  // classification uses separate seasonal, rooted-branch, exposed-stem and
  // actual-control evidence, rather than the midpoint of the ratio interval.
  const branchEvidence=facts.nodes.map(n=>{
   const ts=tokens.filter(t=>!t.visible&&t.id===n.id),clashed=interactions.disputedRootIds.includes(n.id);
   const weight=t=>t.role==='main'?1:t.role==='middle'?.7:.4;
   return {id:n.id,support:Math.max(0,...ts.filter(t=>supports(t.element)).map(weight)),demand:Math.max(0,...ts.filter(t=>!supports(t.element)).map(weight)),availability:clashed?DISPUTED_ROOT_AVAILABILITY:1,phase:PHASE_WEIGHT[n.source]};
  });
  const exposed=tokens.filter(t=>t.visible).map(t=>({id:t.id,support:supports(t.element),rooted:tokens.some(r=>!r.visible&&r.element===t.element),weight:(t.bound?.5:1)*PHASE_WEIGHT[facts.nodes.find(n=>n.id===t.id).source]}));
  let supportScore=branchEvidence.reduce((s,b)=>s+b.support*b.availability*b.phase,0),demandScore=branchEvidence.reduce((s,b)=>s+b.demand*b.availability*b.phase,0);
  for(const t of exposed){const value=t.weight*(t.rooted?1:.5);if(t.support)supportScore+=value;else demandScore+=value;}
  if(command)supportScore+=1.25;else demandScore+=1.25;
  const actualControl=[];
  for(const r of interactions.relations.filter(r=>r.kind==='克'&&r.layer==='stem')){
   const source=facts.nodes.find(n=>n.id===r.from),target=facts.nodes.find(n=>n.id===r.to);
   if(!source||!target||interactions.boundIds.includes(source.id)||!tokens.some(t=>!t.visible&&t.element===source.element))continue;
   if(supports(source.element)===supports(target.element))continue;
   if(supports(target.element))demandScore+=.2;else supportScore+=.2;
   actualControl.push({from:source.id,to:target.id});
  }
  const supportingBranches=branchEvidence.filter(b=>b.support>0).length,opposingBranches=branchEvidence.filter(b=>b.demand>0).length;
  const supportStems=exposed.filter(t=>t.rooted&&t.support).length,demandStems=exposed.filter(t=>t.rooted&&!t.support).length;
  if(command&&supportingBranches>=2&&supportStems>=2&&demandStems===0){level='身强';kind='strong';}
  else if(!command&&supportingBranches===0&&supportStems===0&&opposingBranches>=2&&demandStems>=2){level='身弱';kind='weak';}
  else if(supportScore-demandScore>.75){level='偏强';kind='strong';}
  else if(demandScore-supportScore>.75){level='偏弱';kind='weak';}
  else {level='平衡';kind='balanced';}
  uncertain=false;
  Object.assign(classificationEvidence,{rule:'月令、受冲仍存的根气、透干承接与实际生克综合定档',support:exposed.filter(t=>t.rooted&&t.support).map(t=>t.id),drain:exposed.filter(t=>t.rooted&&!t.support).map(t=>t.id),branchEvidence,exposed,actualControl,supportScore,demandScore});
 }
 return {level,kind,ratio,interval:[minimum,maximum],uncertain,intervalUncertain,classificationEvidence,weights,roots,contributions,
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

export function refineStrengthByPattern(strength,patterns,facts){
 if(!strength.uncertain||!['established','rescued'].includes(patterns.status))return strength;
 const [a,b]=strength.interval;
 if(!(a<.42&&b<=.58||a>=.42&&b>.58))return strength;
 const evidence=strength.classificationEvidence;
 if(!evidence.intactSelf.length||!evidence.support.length||!evidence.drain.length||!patterns.assistantGods.length)return strength;
 // The formation must already have been independently certified with the
 // unknown body; a prospective/forced formation cannot resolve its own premise.
 return {...strength,level:'平衡',kind:'balanced',uncertain:false,
  classificationEvidence:{...evidence,rule:'完整本气根、有根印比与泄耗制并存，独立成立的格局相神维持两侧制化',pattern:patterns.patterns.map(p=>p.name)},
  supportPreference:{method:'扶抑',favorable:[],avoid:[]}};
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
 // Joining toward the day master's existing element is an ordinary same-qi
 // action, not evidence that the master has changed identity into 化气格.
 if(dayJoin&&dayJoin.element!==same){
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
 // Extreme ratios do not themselves imply a following structure. An intact
 // main support root excludes 从弱; intact rooted 财官 excludes 印比从强.
 // Keep uncertainty only when the disputed action can change that premise.
 const intactMain=branches.filter(t=>t.role==='main'&&!interactions.disputedRootIds.includes(t.id));
 const excludesWeak=intactMain.some(t=>supports(t.element));
 const excludesStrong=intactMain.some(t=>[elementAfter(same,2),elementAfter(same,3)].includes(t.element));
 if(contested&&((strength.ratio<.15&&!excludesWeak)||(strength.ratio>.85&&!excludesStrong)))return {...base,status:'uncertain',blockers:['极端气势伴有根气或合冲争议']};
 const onlyWeakResource=branches.filter(t=>t.element===resource).every(t=>t.role==='residual')&&seasonFactor(resource,facts.monthBranch)<1;
 if(strength.ratio<.22&&!strength.mainRoots.length&&onlyWeakResource&&visible.filter(t=>t.element===resource).length===1)
  return {...base,status:'uncertain',blockers:['微弱印援是否有效，涉及普通身弱与从格分歧']};
 return base;
}
