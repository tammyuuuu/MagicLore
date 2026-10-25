import {GRAHA_METADATA} from '../metadata/grahas.js';

const chineseNumber=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
const houseName=number=>`第${chineseNumber[number-1]}宫`;
const ruleFor=(rules,type,predicate=()=>true)=>rules.find(rule=>rule.type===type&&predicate(rule));
const evidenceOf=rules=>rules.map(rule=>({ruleId:rule.id,sourceLevel:rule.sourceLevel,...rule.output.evidence}));
const dedup=units=>{const seen=new Set();return units.filter(unit=>{if(seen.has(unit.semanticKey))return false;seen.add(unit.semanticKey);return true;});};
const unit=(definition,rules)=>({...definition,evidence:evidenceOf(rules),sourceLevel:rules.some(rule=>rule.sourceLevel==='C')?'C':'B'});

function rashiInterpretation(context,rule){
  if(context.house.house===1&&rule?.output.possibleExpressions?.length)return `你的第一宫通过${context.house.rashiMeta.chineseName}表达。${rule.output.possibleExpressions[0]}`;
  return `你的${houseName(context.house.house)}通过${context.house.rashiMeta.chineseName}表达，因此这个领域可能更常以${context.house.rashiMeta.basicQualities.join('、')}的方式推进。`;
}
function lordInterpretation(context,rule){
  if(context.house.house===1&&rule?.output.possibleExpressions?.length)return `第一宫与第${context.house.lordHouse}宫建立连接。${rule.output.possibleExpressions[0]}`;
  const target=context.reading.houses.find(item=>item.house===context.house.lordHouse);
  return `${context.house.houseMeta.field}与${target.houseMeta.field}建立连接。在处理前者时，你可能也会不断碰到与后者有关的考虑；这描述的是领域连接，不等同于固定事件。`;
}
function occupantInterpretation(context,planet,rule){
  if(rule?.output.possibleExpressions?.length)return `${planet.meta.naturalSignifications.slice(0,2).join('与')}直接参与${context.house.houseMeta.field}。${rule.output.possibleExpressions[0]}`;
  return `${planet.meta.chineseName}所代表的${planet.meta.naturalSignifications.slice(0,3).join('、')}直接参与${context.house.houseMeta.field}。在相关情境被触发时，这些因素可能一起进入你的处理过程。`;
}
function occupantTension(context,planet,tensions){
  const matches=tensions.filter(item=>item.evidence.includes(planet.name)&&!item.evidence.includes('Graha Drishti'));
  return matches.map(item=>item.text).join('')||null;
}

export function buildReadingUnits(context,rules,tensions=[]){
  const house=context.house,units=[];
  const rashiRule=ruleFor(rules,'rashi_expression');
  if(rashiRule)units.push(unit({id:`H${house.house}_RASHI_UNIT`,semanticKey:`rashi_${house.rashi}`,type:'house_rashi',label:'Rashi',title:`${houseName(house.house)}落${house.rashiMeta.chineseName}`,knowledge:'Rashi描述一个宫位的基础表达方式；宫位说明人生领域，Rashi说明这个领域倾向如何运作。',interpretation:rashiInterpretation(context,rashiRule),tension:null,links:[],technicalLabel:`${house.house}H · ${house.rashi}`},[rashiRule]));

  const lordRule=ruleFor(rules,'house_lord_placement');
  if(lordRule)units.push(unit({id:`H${house.house}_LORD_UNIT`,semanticKey:`lord_${house.house}_${house.lordHouse}`,type:'lord_placement',label:'宫主落宫',title:`${houseName(house.house)}主${GRAHA_METADATA[house.lord].chineseName}落入${houseName(house.lordHouse)}`,knowledge:'一个宫的宫主落入另一个宫位时，两个生活领域会建立联系。',interpretation:lordInterpretation(context,lordRule),tension:null,links:[{type:'planet',id:house.lord,label:`阅读${GRAHA_METADATA[house.lord].chineseName}`},{type:'house',id:house.lordHouse,label:`阅读${houseName(house.lordHouse)}`}],technicalLabel:`${house.house}L ${house.lord} → ${house.lordHouse}H`},[lordRule]));

  for(const planet of context.occupantPlanets){
    const occupantRule=ruleFor(rules,'occupant',candidate=>candidate.output.evidence.items.some(item=>item.value===planet.name));
    if(!occupantRule)continue;
    const dignityRule=ruleFor(rules,'dignity_modifier',candidate=>candidate.output.evidence.items.some(item=>item.value===planet.name));
    const node=planet.name==='Rahu'||planet.name==='Ketu';
    const knowledge=node?`在当前基础规则中，${planet.name}用于描述${planet.meta.naturalSignifications.join('、')}等倾向；它不单独决定事件或人格。`:'Graha直接落入一个宫位时，它所代表的力量会直接参与这个生活领域。';
    const dignityText=dignityRule?` ${dignityRule.output.traditionalMeaning}`:'';
    units.push(unit({id:`H${house.house}_${planet.name.toUpperCase()}_UNIT`,semanticKey:`occupant_${planet.name}`,type:'occupant',label:dignityRule?'落宫 Graha · Condition':'落宫 Graha',title:`${planet.meta.chineseName}落入${houseName(house.house)}`,knowledge:`${knowledge}${dignityText}`,interpretation:occupantInterpretation(context,planet,occupantRule),tension:occupantTension(context,planet,tensions),links:[{type:'planet',id:planet.name,label:`阅读${planet.meta.chineseName}`}],technicalLabel:`${planet.name} → ${house.house}H${dignityRule?` · ${planet.condition.dignity.label}`:''}`},[occupantRule,...(dignityRule?[dignityRule]:[])]));
  }

  const conjunctionRule=ruleFor(rules,'conjunction');
  if(conjunctionRule&&context.conjunction){
    const names=context.conjunction.planets.map(name=>GRAHA_METADATA[name].chineseName),personal=conjunctionRule.output.possibleExpressions?.[0]||`${names.join('与')}共同参与${house.houseMeta.field}。当前没有经过审核的高级组合规则，因此这里只保留共同参与这一结构事实，不进一步推导固定结果。`;
    const conjunctionTension=context.house.house===1&&context.conjunction.planets.includes('Mercury')&&context.conjunction.planets.includes('Rahu')?'当信息与解释的需求被放大时，可能不断追逐下一种说法，而较难停留在一个已经形成的答案上。':null;
    units.push(unit({id:`H${house.house}_CONJUNCTION_UNIT`,semanticKey:`conjunction_${[...context.conjunction.planets].sort().join('_')}`,type:'conjunction',label:'同宫关系',title:`${names.join('与')}共同位于${houseName(house.house)}`,knowledge:'两颗或更多Graha位于同一Bhava时，会共同参与这个领域；只有存在已审核组合规则时，才进一步解释两种力量相遇后的倾向。',interpretation:personal,tension:conjunctionTension,links:context.conjunction.planets.map(name=>({type:'planet',id:name,label:`阅读${GRAHA_METADATA[name].chineseName}`})),technicalLabel:`${context.conjunction.planets.join(' + ')} → ${house.house}H · Whole Sign same-house`},[conjunctionRule]));
  }

  const significantNames=new Set(context.incomingAspects.map(item=>item.source).filter(name=>name==='Saturn'||name==='Mars'));
  const drishtiRules=rules.filter(rule=>rule.type==='incoming_drishti'&&[...significantNames].some(name=>rule.id.startsWith(name.toUpperCase())));
  if(drishtiRules.length){
    const names=[...significantNames],chinese=names.map(name=>GRAHA_METADATA[name].chineseName);
    units.push(unit({id:`H${house.house}_DRISHTI_UNIT`,semanticKey:`drishti_${names.sort().join('_')}`,type:'incoming_drishti',label:'Graha Drishti',title:`${chinese.join('与')}正在影响${houseName(house.house)}`,knowledge:'Graha Drishti表示一颗行星从自身所在宫位对另一个宫位产生影响；在这里它只是主线之外的修饰。',interpretation:`${chinese.join('与')}参与这个领域后，可能进一步强调${names.flatMap(name=>GRAHA_METADATA[name].naturalSignifications.slice(0,3)).join('、')}。它不会取代宫主落宫与落宫Graha构成的主线。`,tension:tensions.filter(item=>item.evidence.includes('Graha Drishti')).map(item=>item.text).join('')||null,links:names.map(name=>({type:'planet',id:name,label:`阅读${GRAHA_METADATA[name].chineseName}`})),technicalLabel:context.incomingAspects.filter(aspect=>significantNames.has(aspect.source)).map(aspect=>`${aspect.source} · 第${aspect.aspectNumber}相位 → ${house.house}H`).join(' · ')},drishtiRules));
  }
  return dedup(units);
}

export function buildSynthesis(context,summary,themes,possibleExpressions,units){
  const occupants=context.occupantPlanets.map(item=>item.meta.chineseName),target=context.reading.houses.find(item=>item.house===context.house.lordHouse);
  const text=context.house.house===1?'你的第一宫同时连接了对环境的感受、知识与信念、思考表达，以及持续探索新的自我定义。对你来说，“我是谁”可能更像一个不断形成的过程，而不是很早确定、之后基本不再变化的答案。':`这组结构把${context.house.houseMeta.field}与${target.houseMeta.field}连接起来${occupants.length?`，同时让${occupants.join('、')}直接参与其中`:''}。${context.house.rashiMeta.chineseName}所代表的${context.house.rashiMeta.basicQualities.join('、')}，则提供了这个领域较常使用的表达方式。`;
  return {summary,text,themes:themes.map(theme=>theme.id),possibleExpressions:possibleExpressions.slice(0,5),unitIds:units.map(unit=>unit.id),evidenceRuleIds:[...new Set(units.flatMap(unit=>unit.evidence.map(item=>item.ruleId)))]};
}
