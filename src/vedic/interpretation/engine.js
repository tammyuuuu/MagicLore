import {buildInterpretationContext,buildAllInterpretationContexts} from './context.js';
import {HOUSE1_RULES,HOUSE1_THEME_RULES} from './rules/house1.js';
import {genericHouseRules} from './rules/genericHouse.js';
import {GRAHA_METADATA} from '../metadata/grahas.js';
import {buildReadingUnits,buildSynthesis} from './readingUnits.js';
import {interpretAllGrahas} from './grahaEngine.js';

export function semanticDedup(items){const seen=new Set();return items.filter(item=>{const key=item.semanticKey||item;if(seen.has(key))return false;seen.add(key);return true;});}
const joinPlanets=items=>items.map(item=>item.meta.chineseName).join('、');

function genericThemes(context,rules){
  const house=context.house,target=context.reading.houses.find(item=>item.house===house.lordHouse),themes=[];
  themes.push({id:`THEME_H${house.house}_LORD_CONNECTION`,priority:1,title:`${house.houseMeta.title}，连接${target.houseMeta.title}`,themes:[...house.houseMeta.keywords.slice(0,3),...target.houseMeta.keywords.slice(0,3)],sourceLevel:'B',evidenceRuleIds:[rules[0].id],text:`在${house.houseMeta.field}中，第${house.lordHouse}宫所代表的${target.houseMeta.field}会成为重要参照。两者可能彼此牵动，但这只描述领域连接，并不等同于某个固定事件。`});
  if(context.occupantPlanets.length)themes.push({id:`THEME_H${house.house}_OCCUPANTS`,priority:2,title:`${joinPlanets(context.occupantPlanets)}直接参与这个领域`,themes:context.occupantPlanets.flatMap(item=>item.meta.naturalSignifications),sourceLevel:'B',evidenceRuleIds:rules.filter(item=>item.type==='occupant').map(item=>item.id),text:`${joinPlanets(context.occupantPlanets)}直接位于这里，使${context.occupantPlanets.flatMap(item=>item.meta.naturalSignifications.slice(0,2)).join('、')}等因素参与${house.houseMeta.field}。这里先保留各自的基础作用，不把未审核的组合写成确定结论。`});
  themes.push({id:`THEME_H${house.house}_RASHI`,priority:4,title:`以${house.rashiMeta.chineseName}的方式展开`,themes:house.rashiMeta.keywords,sourceLevel:'B',evidenceRuleIds:rules.filter(item=>item.type==='rashi_expression').map(item=>item.id),text:`这个领域更容易通过${house.rashiMeta.basicQualities.join('、')}的方式表达。Rashi描述的是运作方式，不是对整个人格的标签。`});
  return semanticDedup(themes.sort((a,b)=>a.priority-b.priority).map(item=>({...item,semanticKey:item.id}))).slice(0,4);
}
function genericExpressions(context){
  const house=context.house,target=context.reading.houses.find(item=>item.house===house.lordHouse),items=[
    {semanticKey:'lord_connection',text:`在处理${house.houseMeta.field}时，你可能也会不断碰到与${target.houseMeta.field}有关的考虑。`},
    {semanticKey:'rashi_method',text:`这个领域可能更常通过${house.rashiMeta.basicQualities.join('、')}的方式推进。`},
    {semanticKey:'lord_method',text:`作为宫主，${context.lordPlanet.meta.chineseName}所代表的${context.lordPlanet.meta.naturalSignifications.slice(0,2).join('、')}，可能成为你协调这个领域与${target.houseMeta.field}的切入点。`}
  ];
  if(context.occupantPlanets.length)items.push({semanticKey:'occupants',text:`当这一领域被直接触发时，${joinPlanets(context.occupantPlanets)}所代表的${context.occupantPlanets.flatMap(item=>item.meta.naturalSignifications.slice(0,2)).join('、')}也可能一起进入你的处理过程。`});
  if(context.incomingAspects.length)items.push({semanticKey:'drishti',text:`同时，这个领域还受到${[...new Set(context.incomingAspects.map(item=>GRAHA_METADATA[item.source].chineseName))].join('、')}的影响；它更像附加条件，不会取代宫主与落宫星体构成的主线。`});
  const node=context.occupantPlanets.find(item=>item.name==='Rahu'||item.name==='Ketu');if(node)items.push({semanticKey:'node_tension',text:node.name==='Rahu'?'在某些情况下，这个领域可能不断吸引新的尝试；顺畅时带来探索，过度时则可能较难满足于已有结果。':'在某些情况下，你可能倾向于简化、抽离或减少对这个领域的投入；这描述的是可能的处理方式，不代表必然失去。'});
  return semanticDedup(items).slice(0,6);
}
function tensions(context){const items=[];for(const planet of context.occupantPlanets){if(planet.name==='Rahu')items.push({id:`TENSION_RAHU_H${context.house.house}`,sourceLevel:'C',text:'罗睺可能放大对新经验或突破边界的需求；过度时，满足感可能较难稳定。',evidence:[planet.name]});if(planet.name==='Ketu')items.push({id:`TENSION_KETU_H${context.house.house}`,sourceLevel:'C',text:'计都可能带来简化、抽离或减少依附的倾向；它不自动等同于失去或坏结果。',evidence:[planet.name]});if(planet.condition.dignity?.label==='Debilitation')items.push({id:`TENSION_${planet.name.toUpperCase()}_DEBILITATION`,sourceLevel:'B',text:`${planet.meta.chineseName}在这里表达${planet.meta.naturalSignifications.slice(0,3).join('、')}时，传统上被认为需要面对更多条件与张力。`,evidence:[planet.name,planet.rashi,'Debilitation']});}
  for(const source of [...new Set(context.incomingAspects.map(item=>item.source).filter(name=>name==='Saturn'||name==='Mars'))])items.push({id:`TENSION_${source.toUpperCase()}_DRISHTI_H${context.house.house}`,sourceLevel:'B',text:`${source==='Saturn'?'土星带来的时间、责任、限制与持续投入':'火星带来的行动、切割、竞争与驱动力'}会进一步修饰这个领域，但不单独决定结果。`,evidence:[source,'Graha Drishti']});return semanticDedup(items.map(item=>({...item,semanticKey:item.id})));}

export function interpretHouse(chart,houseNumber,existingContext=null){
  if(houseNumber<1||houseNumber>12)return null;const context=existingContext||buildInterpretationContext(chart,houseNumber),genericRules=genericHouseRules(context);
  if(houseNumber===1){const triggeredRules=HOUSE1_RULES.filter(rule=>rule.match(context)).map(rule=>({...rule,priority:genericRules.find(item=>item.type===rule.type)?.priority||2,output:rule.interpret(context)})),semanticTags=new Set(triggeredRules.flatMap(rule=>rule.semanticTags)),themes=HOUSE1_THEME_RULES.filter(theme=>theme.requires.every(tag=>semanticTags.has(tag))).map((theme,index)=>({...theme,priority:index+1,evidenceRuleIds:triggeredRules.filter(rule=>rule.themes.some(value=>theme.themes.includes(value))).map(rule=>rule.id)})),possibleExpressions=semanticDedup(triggeredRules.flatMap(rule=>rule.output.possibleExpressions.map(text=>({semanticKey:rule.semanticTags.at(-1),text,ruleIds:[rule.id]})))).slice(0,6),houseTensions=tensions(context),readingUnits=buildReadingUnits(context,triggeredRules,houseTensions);return {house:1,context,summary:themes[0]?.title||context.house.houseMeta.title,triggeredRules,themes,possibleExpressions,tensions:houseTensions,readingUnits,synthesis:buildSynthesis(context,themes[0]?.title||context.house.houseMeta.title,themes,possibleExpressions,readingUnits)};}
  const themes=genericThemes(context,genericRules),possibleExpressions=genericExpressions(context),houseTensions=tensions(context),readingUnits=buildReadingUnits(context,genericRules,houseTensions);return {house:houseNumber,context,summary:themes[0].title,triggeredRules:genericRules,themes,possibleExpressions,tensions:houseTensions,readingUnits,synthesis:buildSynthesis(context,themes[0].title,themes,possibleExpressions,readingUnits)};
}

export function interpretChart(chart){const contexts=buildAllInterpretationContexts(chart),houses=Object.fromEntries(Object.entries(contexts).map(([number,context])=>[number,interpretHouse(chart,Number(number),context)]));return {chartContext:{ayanamsaMode:chart.ayanamsaMode,nodeType:chart.input.nodeType,ayanamsa:chart.ayanamsa},house1:houses[1],houses,grahas:interpretAllGrahas(chart)};}
