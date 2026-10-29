import { ELEMENTS, STEM_BY_NAME } from '../data/fundamentals.js';
import { getHiddenStems } from '../data/hiddenStems.js';
import { getTenGod } from './tenGods.js';
import { makeJudgmentFacts, canonicalStem } from './judgmentFacts.js';
import { analyzeInteractions, effectiveElement } from './interactions.js';
import { analyzeStrength } from './strength.js';

// A conservative, versioned subset of 月令—成败—救应. Unknown is not false.
// No transformation, distance coefficient or fortune score is inferred here.
export const PATTERN_RULE_VERSION = 'ziping-month-command-2';
const KEYS = ['year', 'month', 'day', 'hour'];
const SOURCES = {
  selection: '子平真诠·论用神变化、论杂气如何取用',
  outcome: '子平真诠·论用神成败救应',
  killing: '子平真诠·论偏官',
  hurt: '子平真诠·论伤官'
};
const GROUP = { 正官:'officer', 七杀:'killing', 正财:'wealth', 偏财:'wealth', 正印:'resource', 偏印:'resource', 食神:'food', 伤官:'hurt', 比肩:'peer', 劫财:'peer' };
const NAMES = { officer:'正官格', killing:'七杀格', wealth:'财格', resource:'印格', food:'食神格', hurt:'伤官格' };
const generates = (a,b) => (ELEMENTS.indexOf(a)+1)%5 === ELEMENTS.indexOf(b);
const controls = (a,b) => (ELEMENTS.indexOf(a)+2)%5 === ELEMENTS.indexOf(b);
const unique = list => [...new Set(list)];
const ref = n => ({ stem:n.stem, element:n.element, transformed:!!n.transformed,tenGod:n.god, position:n.position||KEYS[n.index], layer:n.layer });

function context(input,options={}) {
  const pillars = input?.calculatedResult || input;
  if (!KEYS.every(k=>STEM_BY_NAME[pillars?.[k]?.stem] && pillars?.[k]?.branch && (()=>{try{return !!getHiddenStems(pillars[k].branch);}catch{return false;}})())) return null;
  const day = pillars.day.stem, dayElement = STEM_BY_NAME[day].element;
  const facts=options.facts||makeJudgmentFacts(input);if(!facts)return null;
  const interactions=options.interactions||analyzeInteractions(facts);
  const strength=options.strength||analyzeStrength(facts,interactions);
  // Derive facts from canonical tables, never from UI abbreviations or supplied tenGod labels.
  const branches = facts.nodes.map(n=>{const transformed=effectiveElement(n,'branch',interactions);return {index:n.index,id:n.id,branch:n.branch,
    hidden:transformed?[{role:'main',stem:canonicalStem(transformed,n.polarity),element:transformed,god:getTenGod(day,canonicalStem(transformed,n.polarity))}]:n.hidden};});
  const roots = element => branches.flatMap(b=>b.hidden.filter(h=>h.element===element).map(h=>({ ...h,index:b.index,branch:b.branch,
    disputed:interactions.disputedRootIds.includes(b.id) })));
  const node = (stem,index,layer='stem') => {
    const fact=facts.nodes[index],element=layer==='stem'?effectiveElement(fact,'stem',interactions):STEM_BY_NAME[stem].element,rs=roots(element);
    const bound=layer==='stem'&&interactions.boundIds.includes(fact.id);
    return {stem,index,position:fact?.id,layer,element,transformed:element!==STEM_BY_NAME[stem].element,god:getTenGod(day,canonicalStem(element,STEM_BY_NAME[stem].polarity)),roots:rs,bound,
      usable:!bound&&rs.some(r=>!r.disputed),mainRoot:rs.some(r=>r.role==='main'&&!r.disputed)};
  };
  const visible=facts.nodes.filter(n=>n.id!=='day').map(n=>node(n.stem,n.index));
  const month=branches[1];
  // The same strength result drives both formation prerequisites and the report.
  const body=strength.kind;
  const path = (a,b,kind) => {
    if(!a?.usable||!b?.usable)return false;
    if(!(kind==='generate'?generates(a.element,b.element):controls(a.element,b.element)))return false;
    // Same pillar, adjacent pillars; generation can pass the day-master position.
    return a.index>=4||b.index>=4||Math.abs(a.index-b.index)<=1 || (kind==='generate'&&a.index===1&&b.index===3) || (kind==='generate'&&a.index===3&&b.index===1);
  };
  const uncertainMonth=interactions.disputedRootIds.includes('month')||interactions.unresolved.some(r=>r.ids.includes('month'));
  return {pillars,day,dayElement,branches,month,visible,node,path,body,roots,uncertainMonth,facts,interactions,strength};
}

function assess(c,core) {
  const group=GROUP[core.god], visible=c.visible.filter(n=>n!==core), nodes=unique([...visible,core]);
  const by = (...groups) => nodes.filter(n=>n.usable&&groups.includes(GROUP[n.god]));
  const resources=by('resource'),wealth=by('wealth'),officers=by('officer'),killings=by('killing'),foods=by('food'),hurts=by('hurt'),peers=by('peer');
  const formations=[],damage=[],rescues=[],uncertainties=[];
  const route=(id,name,actors,text)=>formations.push({id,name,actors,explanation:text});
  const fault=(kind,text,attack,target)=>{
    const id=`${kind}:${attack.index}:${attack.stem}:${target.index}:${target.stem}`;
    if(!damage.some(d=>d.id===id))damage.push({id,kind,text,attack,target});
  };
  const rescue=(fault,actors,text)=>rescues.push({damageId:fault.id,actors,text});
  const gen=(a,b)=>c.path(a,b,'generate'),cut=(a,b)=>c.path(a,b,'control');
  const feedBody=n=>n.usable&&n.element===ELEMENTS[(ELEMENTS.indexOf(c.dayElement)+4)%5]&&
    (n.index>=4||Math.abs(n.index-2)<=1||c.visible.some(other=>other.usable&&other.stem===n.stem&&Math.abs(other.index-2)<=1));
  const killPrint=(kill,print)=>gen(kill,print)&&feedBody(print)&&c.body==='weak';
  const hurtPrint=(hurt,print)=>hurt.mainRoot&&c.body==='weak'&&cut(print,hurt)&&feedBody(print);
  const lu={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  const blade={甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
  const peerName=blade[c.day]===c.month.branch?'阳刃格':lu[c.day]===c.month.branch?'建禄格':'月劫格';
  if(group==='peer'&&c.body==='strong') {
    for(const authority of [...officers,...killings])if(cut(authority,core)) {
      if(peerName==='阳刃格')route('blade-authority','阳刃用官杀',[authority],'以有根官杀约束过旺之气，发挥行动与担当。');
      else for(const money of wealth)if(gen(money,authority))route('peer-officer','禄劫用财官',[money,authority],'财生官制比劫，将自主力量用于经营与职责。');
    }
    if(peerName!=='阳刃格')for(const food of [...foods,...hurts])for(const money of wealth)
      if(gen(core,food)&&gen(food,money))route('peer-output-wealth','禄劫用食伤生财',[food,money],'以表达与产出转化旺气，落实为经营资源。');
  }

  if(group==='officer') {
    for(const print of resources)if(gen(core,print)&&feedBody(print))route('officer-resource','官印相生',[print],'以印承接官星，兼顾职责与自身支持。');
    for(const money of wealth)if(gen(money,core)&&c.body==='strong')route('wealth-officer','财生官',[money],'财星生官，日主具备承接财官的基础。');
  }
  if(group==='killing') {
    for(const print of resources)if(killPrint(core,print))route('killing-resource','杀印相生',[print],'七杀生印、印再生身，以支持和积累承接压力。');
    for(const food of foods)if(c.body==='strong'&&cut(food,core))route('food-killing','食神制杀',[food],'食神有根制杀，将压力转为可发挥的行动。');
  }
  if(group==='wealth') {
    for(const food of [...foods,...hurts])if(c.body==='strong'&&gen(food,core))route('output-wealth','食伤生财',[food],'表达与产出成为经营资源的来源。');
    for(const officer of officers)if(c.body==='strong'&&gen(core,officer))route('wealth-officer','财生官',[officer],'财官相生，通过职责与规则组织资源。');
    // 财印并用 only when neither can directly injure the other at these positions.
    for(const print of resources)if(c.body==='weak'&&feedBody(print)&&!cut(core,print)&&Math.abs(core.index-print.index)>1)route('wealth-resource','财格配印',[print],'财与印各有位置，以印提供承接资源所需的支持。');
  }
  if(group==='resource') {
    for(const officer of officers)if(c.body==='weak'&&gen(officer,core)&&feedBody(core))route('officer-resource','官印相生',[officer],'官生印、印生身，职责与学习支持相接。');
    for(const kill of killings)if(killPrint(kill,core))route('killing-resource','杀印相生',[kill],'以印承接七杀，化压力为支持。');
    for(const food of [...foods,...hurts])if(c.body==='strong'&&food.mainRoot&&!cut(core,food))route('resource-output','印格用食伤',[food],'身印有力，以表达和产出疏导力量。');
  }
  if(group==='food') {
    for(const money of wealth)if(c.body==='strong'&&gen(core,money))route('food-wealth','食神生财',[money],'稳定产出与经营资源相接。');
    for(const kill of killings)if(c.body==='strong'&&cut(core,kill))route('food-killing','食神制杀',[kill],'食神制杀，以产出和方法应对压力。');
  }
  if(group==='hurt') {
    for(const print of resources)if(hurtPrint(core,print))route('hurt-resource','伤官配印',[print],'以有根之印约束过旺表达，同时扶助日主。');
    for(const money of wealth)if(c.body==='strong'&&gen(core,money))route('hurt-wealth','伤官生财',[money],'把表达和改进落实为经营成果。');
    for(const kill of killings)for(const print of resources)if(killPrint(kill,print)&&cut(print,core)&&core.mainRoot)route('hurt-killing-resource','伤官用杀印',[kill,print],'杀生印、印扶身制伤，形成连续的调节路径。');
  }

  if(group==='officer') {
    for(const hurt of hurts)if(cut(hurt,core))fault('hurt-officer','伤官直接克制所用官星。',hurt,core);
    if(visible.some(n=>GROUP[n.god]==='killing'))uncertainties.push('官杀并见，去留取清尚未核定。');
  }
  if(group==='killing'&&visible.some(n=>GROUP[n.god]==='officer'))uncertainties.push('官杀并见，去留取清尚未核定。');
  if(group==='resource')for(const money of wealth)if(c.body==='weak'&&cut(money,core))fault('wealth-resource','财直接损伤所需之印。',money,core);
  if(group==='food')for(const print of resources)if(cut(print,core))fault('resource-food','印直接克制所用食神。',print,core);
  if(group==='hurt')for(const officer of officers)if(cut(core,officer))fault('hurt-officer','伤官与有效官星直接相克。',core,officer);
  if(group==='wealth') {
    if(c.body==='strong'&&peers.length>=2&&core.roots.filter(r=>!r.disputed).length===1)
      for(const peer of peers)if(cut(peer,core))fault('peer-wealth','比劫有力而财根单薄，财星直接受制。',peer,core);
    for(const kill of killings)if(gen(core,kill)&&!foods.some(food=>cut(food,kill))&&!resources.some(print=>killPrint(kill,print)))fault('wealth-killing','财转而生杀，未形成制化。',kill,core);
  }
  // A formation has its own indispensable helper; damaging it is not a generic five-element penalty.
  for(const f of formations) {
    for(const helper of f.actors) {
      if(GROUP[helper.god]==='resource')for(const money of wealth)if(cut(money,helper))fault('helper-print-'+f.id,'成格所用的印受财直接克制。',money,helper);
      if(GROUP[helper.god]==='food')for(const print of resources)if(cut(print,helper))fault('helper-food-'+f.id,'制杀或生财所用食神受印克制。',print,helper);
      if(GROUP[helper.god]==='officer')for(const hurt of hurts)if(cut(hurt,helper))fault('hurt-officer','所用官星受伤官直接克制。',hurt,helper);
    }
  }
  for(const d of damage) {
    if(d.kind==='hurt-officer') {
      const hurt=GROUP[d.attack.god]==='hurt'?d.attack:core;
      for(const print of resources)if(cut(print,hurt))rescue(d,[print],'印制伤护官。');
      for(const money of wealth)if(gen(hurt,money)&&gen(money,d.target))rescue(d,[money],'伤官生财、财再生官，形成通关。');
    }
    if(d.kind==='wealth-resource'||d.kind.startsWith('helper-print'))for(const peer of peers)if(cut(peer,d.attack))rescue(d,[peer],'比劫制财，保护所需印星。');
    if(d.kind==='resource-food'||d.kind.startsWith('helper-food'))for(const money of wealth)if(cut(money,d.attack))rescue(d,[money],'财制印，保护所用食神。');
    if(d.kind==='peer-wealth') {
      for(const officer of [...officers,...killings])if(cut(officer,d.attack))rescue(d,[officer],'官杀制比劫，保护财星。');
      for(const food of [...foods,...hurts])if(gen(d.attack,food)&&gen(food,core))rescue(d,[food],'食伤转化比劫之力而生财。');
    }
  }
  // Rescue must survive: a rescue actor damaged by another usable node is not certified.
  const effectiveRescues=rescues.filter(r=>r.actors.every(actor=>!nodes.some(other=>other!==actor&&cut(other,actor))));
  const unresolvedDamage=damage.filter(d=>!effectiveRescues.some(r=>r.damageId===d.id));
  const helperIds=unique(formations.flatMap(f=>f.actors));
  if((group==='killing'||group==='food')&&formations.some(f=>f.id==='food-killing')&&
    wealth.some(money=>[core,...killings].some(kill=>GROUP[kill.god]==='killing'&&gen(money,kill))))
    uncertainties.push('食神制杀与财生杀并见，制化主次尚未核定。');
  if(formations.some(f=>f.id==='killing-resource')&&foods.some(food=>[core,...killings].some(kill=>GROUP[kill.god]==='killing'&&cut(food,kill))))
    uncertainties.push('制杀与化杀路径并见，主次尚未核定。');
  if(group==='hurt'&&formations.some(f=>f.id==='hurt-wealth')&&resources.some(print=>cut(print,core)))
    uncertainties.push('伤官生财与印制伤同时作用，轻重尚未核定。');
  if(group==='hurt'&&c.dayElement==='金'&&core.element==='水'&&officers.length)
    uncertainties.push('金水伤官见官涉及调候例外，本阶段不直接判破。');
  const critical=[core,...helperIds,...effectiveRescues.flatMap(r=>r.actors)];
  if(nodes.some(n=>!n.usable&&critical.some(target=>Math.abs(n.index-target.index)<=1&&controls(n.element,target.element))))uncertainties.push('可能损伤关键环节的透干作用尚未核定。');
  const status=uncertainties.length?'uncertain':unresolvedDamage.length?'broken':formations.length?(damage.length?'rescued':'established'):'uncertain';
  const combinations=status==='established'||status==='rescued'?unique(formations.filter(f=>f.id==='killing-resource'||f.id==='hurt-resource'||f.id==='hurt-killing-resource').map(f=>f.name)):[];
  return {name:group==='peer'?peerName:NAMES[group],group,status,core:ref(core),formations:formations.map(f=>({...f,actors:f.actors.map(ref)})),
    damage:damage.map(d=>({id:d.id,kind:d.kind,text:d.text,attack:ref(d.attack),target:ref(d.target)})),rescues:effectiveRescues.map(r=>({...r,actors:r.actors.map(ref)})),
    uncertainties,combinations,assistants:unique([...helperIds,...effectiveRescues.flatMap(r=>r.actors)]).map(ref)};
}

export function analyzeMonthPatterns(input,options={}) {
  const result={version:PATTERN_RULE_VERSION,school:'子平真诠月令格局法',status:'uncertain',selection:null,
    structureGod:null,assistantGods:[],patterns:[],candidates:[],bodySupport:null,sources:SOURCES};
  const c=context(input,options);if(!c)return {...result,reason:'四柱数据不完整。'};
  result.bodySupport={kind:c.body,method:'月令、有效根气及透干支持；独立于格局用神',isFinalFavorability:false};
  if(c.uncertainMonth)return {...result,reason:'月令涉及冲合或会局，需要先核定作用及是否变化。'};
  const transformed=effectiveElement(c.facts.natal[1],'branch',c.interactions);
  const exposed=transformed?c.visible.filter(n=>n.element===transformed).map(n=>({stem:n.stem,god:n.god})):
    c.month.hidden.filter(h=>c.visible.some(n=>n.stem===h.stem));
  if(transformed&&!exposed.length)return {...result,reason:'月令化局后缺少可明确取用的透神。'};
  if(!transformed&&GROUP[c.month.hidden[0].god]==='peer') {
    const h=c.month.hidden[0],candidate=assess(c,c.node(h.stem,1,'month-hidden'));
    result.selection={monthBranch:c.month.branch,source:'禄刃月劫',stems:[h.stem]};result.candidates=[candidate];result.status=candidate.status;
    if(candidate.status!=='uncertain'){
      result.structureGod={...candidate.core,source:'月令',function:'格局用神'};
      result.assistantGods=candidate.status==='broken'?[]:candidate.assistants.map(n=>({...n,function:'相神'}));
      result.patterns=[{name:candidate.name,status:candidate.status,combinations:candidate.formations.map(f=>f.name),explanation:candidate.status==='broken'?'关键制化受损。':candidate.formations[0]?.explanation||''}];
    }
    return result;
  }
  const selected=exposed.length?exposed:[c.month.hidden[0]];
  const groups=unique(selected.map(h=>GROUP[h.god]));
  result.selection={monthBranch:c.month.branch,source:transformed?'月令化局透神':exposed.length?'透干':'月令本气',stems:selected.map(h=>h.stem)};
  if(groups.includes('peer'))return {...result,reason:'月令比劫，转入建禄、月劫、阳刃专门规则。'};
  if(selected.some(h=>c.visible.filter(n=>n.stem===h.stem).length>1))return {...result,reason:'月令之神多处透出，作用主次未能明确。'};
  const cores=selected.map(h=>c.visible.find(n=>n.stem===h.stem)||c.node(h.stem,1,'month-hidden'));
  if(cores.some(n=>!n.usable))return {...result,reason:'月令取用之神尚未形成有效作用。'};
  // Multiple month gods are resolved only by a certified shared formation with the
  // exposed main qi. Mere array order or "first exposed" is never a tie breaker.
  const assessments=cores.map(core=>assess(c,core));result.candidates=assessments;
  let candidate=assessments[0];
  if(cores.length>1) {
    const mainIndex=cores.findIndex(n=>n.stem===c.month.hidden[0].stem);
    const main=assessments[mainIndex];
    const coherent=main&&assessments.every(a=>['established','rescued'].includes(a.status))&&
      main.formations.some(f=>cores.every((n,i)=>i===mainIndex||f.actors.some(actor=>actor.stem===n.stem&&actor.position===KEYS[n.index])));
    if(!coherent)return {...result,reason:groups.length>1?'月令多神透出，主次及兼格未能明确。':'同类多透，具体取用与纯杂待核定。'};
    candidate=main;result.selection.resolution='本气透出，其他月令透神参与同一有效成格路径';
  }
  result.status=candidate.status;
  if(candidate.status==='uncertain')return result;
  result.structureGod={...candidate.core,source:'月令',function:'格局用神'};
  result.assistantGods=candidate.status==='broken'?[]:candidate.assistants.map(n=>({...n,function:'相神'}));
  result.patterns=[{name:candidate.name,status:candidate.status,combinations:candidate.combinations,
    explanation:candidate.status==='broken'?'格局的关键作用受到损伤。':candidate.status==='rescued'?'关键作用受到干扰，但原局有有效救应。':candidate.formations[0].explanation}];
  return result;
}
