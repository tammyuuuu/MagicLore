import { controls, generates, seasonFor, seasonFactor } from './judgmentFacts.js';

export const BRANCH_CLASH=['子午','丑未','寅申','卯酉','辰戌','巳亥'];
export const BRANCH_JOIN=[['子丑','土'],['寅亥','木'],['卯戌','火'],['辰酉','金'],['巳申','水'],['午未','土']];
export const STEM_JOIN=[['甲己','土'],['乙庚','金'],['丙辛','水'],['丁壬','木'],['戊癸','火']];
export const TRIPLES=[['申子辰','水','三合'],['亥卯未','木','三合'],['寅午戌','火','三合'],['巳酉丑','金','三合'],
 ['寅卯辰','木','三会'],['巳午未','火','三会'],['申酉戌','金','三会'],['亥子丑','水','三会']];
const HARM=['子未','丑午','寅巳','卯辰','申亥','酉戌'],BREAK=['子酉','卯午','辰丑','未戌','寅亥','巳申'];
export const paired=(list,a,b)=>a!==b&&list.some(s=>(Array.isArray(s)?s[0]:s).includes(a)&&(Array.isArray(s)?s[0]:s).includes(b));
const touches=(a,b)=>a.some(id=>b.includes(id));
const relation=(kind,nodes,layer='branch',extra={})=>({kind,layer,ids:nodes.map(n=>n.id),chars:nodes.map(n=>layer==='stem'?n.stem:n.branch),state:'present',...extra});
const close=(a,b)=>a.source!=='natal'||b.source!=='natal'||Math.abs(a.index-b.index)===1;

export function analyzeInteractions(facts){
 const nodes=facts.nodes,relations=[],unresolved=[];
 for(let i=0;i<nodes.length;i++)for(let k=i+1;k<nodes.length;k++){
  const a=nodes[i],b=nodes[k],pair=[a,b];
  if(paired(BRANCH_CLASH,a.branch,b.branch))relations.push(relation('冲',pair));
  if(paired(HARM,a.branch,b.branch))relations.push(relation('害',pair));
  if(paired(BREAK,a.branch,b.branch))relations.push(relation('破',pair));
  if(a.branch===b.branch&&'辰午酉亥'.includes(a.branch))relations.push(relation('自刑',pair));
  if(paired(['子卯'],a.branch,b.branch))relations.push(relation('刑',pair));
  if(paired(['寅巳','巳申','寅申','丑未','未戌','丑戌'],a.branch,b.branch))relations.push(relation('刑',pair,'branch',{state:'partial'}));
  const join=BRANCH_JOIN.find(([s])=>a.branch!==b.branch&&s.includes(a.branch)&&s.includes(b.branch));
  if(join)relations.push(relation('六合',pair,'branch',{element:join[1],state:'bound'}));
  const stem=STEM_JOIN.find(([s])=>a.stem!==b.stem&&s.includes(a.stem)&&s.includes(b.stem));
  if(stem&&close(a,b))relations.push(relation('五合',pair,'stem',{element:stem[1],state:'bound'}));
  if(close(a,b)&&controls(a.element,b.element))relations.push(relation('克',pair,'stem',{from:a.id,to:b.id}));
  if(close(a,b)&&controls(b.element,a.element))relations.push(relation('克',pair,'stem',{from:b.id,to:a.id}));
  if(close(a,b)&&generates(a.element,b.element))relations.push(relation('生',pair,'stem',{from:a.id,to:b.id}));
  if(close(a,b)&&generates(b.element,a.element))relations.push(relation('生',pair,'stem',{from:b.id,to:a.id}));
 }
 // A set is certified once, including its actual occurrence IDs (duplicates never fill a missing member).
 for(const [chars,element,kind]of TRIPLES){
  const matches=[...chars].map(ch=>nodes.filter(n=>n.branch===ch));
  if(matches.every(list=>list.length)){
   const sets=matches.reduce((acc,list)=>acc.flatMap(set=>list.map(n=>[...set,n])),[[]]);
   for(const set of sets)relations.push(relation(kind,set,'branch',{element,state:'bound'}));
  }else if(kind==='三合'&&matches.filter(list=>list.length).length===2){
   const found=matches.flat();relations.push(relation('半合',found,'branch',{element,state:'partial'}));
  }
 }
 for(const chars of ['寅巳申','丑未戌'])if([...chars].every(ch=>nodes.some(n=>n.branch===ch)))
  relations.push(relation('三刑',nodes.filter(n=>chars.includes(n.branch))));
 const merging=relations.filter(r=>['六合','五合','三合','三会'].includes(r.kind));
 const contained=(small,big)=>small.ids.every(id=>big.ids.includes(id)||big.chars.includes(nodes.find(n=>n.id===id)?.branch));
 const conditions=r=>{
  const clashes=relations.filter(other=>other.kind==='冲'&&touches(r.ids,other.ids));
  const clash=clashes.length>0;
  const season=seasonFor(facts.monthBranch);
  const supported=season===r.element||(['三合','三会'].includes(r.kind)&&generates(season,r.element));
  const exposed=nodes.some(n=>n.element===r.element)||(r.kind==='五合'&&season===r.element&&facts.natal.some(n=>n.hidden[0].element===r.element));
  const opposed=nodes.some(n=>!r.ids.includes(n.id)&&controls(n.element,r.element)&&nodes.some(root=>root.hidden.some(h=>h.element===n.element&&h.role==='main')));
  const weakOutsideClash=['三合','三会'].includes(r.kind)&&clashes.length>0&&clashes.every(c=>{
   const outsiders=c.ids.filter(id=>!r.ids.includes(id));
   return outsiders.length===1&&outsiders.every(id=>{const n=nodes.find(n=>n.id===id),e=n.hidden[0].element;
    return seasonFactor(e,facts.monthBranch)<1&&nodes.filter(other=>other.hidden[0].element===e).length===1&&!nodes.some(other=>other.id!==id&&other.element===e);});
  });
  return {clash,weakOutsideClash,eligible:supported&&exposed&&(!clash||weakOutsideClash)&&!opposed};
 };
 // A qualified complete set absorbs its own internal two-branch bind. Otherwise
 // 巳午未 could never form fire because 午未 also appears in the 六合 table.
 const complete=merging.filter(r=>['三合','三会'].includes(r.kind)&&conditions(r).eligible&&
  !merging.some(other=>other!==r&&other.layer==='branch'&&touches(r.ids,other.ids)&&other.element!==r.element&&
   !(other.kind==='六合'&&contained(other,r))));
 const holders=new Map(merging.filter(r=>r.kind==='六合').map(r=>[r,complete.find(big=>contained(r,big))]));
 for(const r of merging){
  const holder=holders.get(r);
  if(holder){r.state='subsumed';r.resolution=`归入${holder.kind}${holder.element}局`;continue;}
  const competitors=merging.filter(other=>other!==r&&!holders.get(other)&&other.layer===r.layer&&touches(r.ids,other.ids)&&other.element!==r.element);
  const contestedSame=['五合','六合'].includes(r.kind)&&merging.some(other=>other!==r&&!holders.get(other)&&other.kind===r.kind&&other.layer===r.layer&&other.element===r.element&&touches(r.ids,other.ids)&&
   !r.ids.every(id=>other.ids.includes(id))&&!other.ids.every(id=>r.ids.includes(id)));
  const {clash,weakOutsideClash,eligible}=conditions(r);
  // Chemical transformation is conditional, not a lookup-table substitution.
  if(competitors.length||contestedSame){r.state='contested';unresolved.push({code:'contested-combination',ids:r.ids,detail:'争合或会合方向冲突'});}
  else if(eligible){r.state='transformed';if(weakOutsideClash)r.resolution='旺局约束孤弱冲支';}
  else if(clash){r.state='contested';unresolved.push({code:'clash-combination',ids:r.ids,detail:'冲合并见，解冲主次未定'});}
 }
 // Do not globally delete a clash because another combination exists. A resolution
 // requires one exclusive transformed branch set, no second competing set.
 for(const r of relations.filter(r=>r.kind==='冲')){
  const protect=merging.filter(m=>m.state==='transformed'&&m.layer==='branch'&&touches(m.ids,r.ids));
  const uniqueProtect=new Set(protect.map(p=>p.kind+p.element+[...new Set(p.chars)].sort().join('')));
  if(uniqueProtect.size===1&&!merging.some(m=>!protect.includes(m)&&protect.some(p=>touches(m.ids,p.ids))&&m.state==='contested'))r.state='mitigated';
 }
 return {relations,unresolved,
  transformed:relations.filter(r=>r.state==='transformed'),
  boundIds:[...new Set(merging.filter(r=>r.layer==='stem'&&r.state!=='transformed').flatMap(r=>r.ids))],
  disputedRootIds:[...new Set(relations.filter(r=>r.kind==='冲'&&r.state!=='mitigated').flatMap(r=>r.ids))]};
}

export function effectiveElement(node,layer,interactions){
 const transforms=interactions.transformed.filter(r=>r.layer===layer&&r.ids.includes(node.id));
 const targets=[...new Set(transforms.map(r=>r.element))];
 return targets.length===1?targets[0]:layer==='stem'?node.element:null;
}
