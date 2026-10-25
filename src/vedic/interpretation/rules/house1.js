import {createEvidence,houseOneEvidence,occupantEvidence} from '../evidence.js';

const rule=definition=>({house:1,modifiers:[],...definition});

export const HOUSE1_RULES=[
  rule({
    id:'H1_BASE',type:'house',sourceLevel:'B',themes:['identity','body','life_direction'],semanticTags:['house_role'],match:()=>true,
    interpret:()=>({fact:'这是命盘的第一宫。',traditionalMeaning:'第一宫是整张命盘的起点，主要描述一个人如何进入世界、形成自我感，以及身体和生命方向的基本状态。',possibleExpressions:[],evidence:createEvidence([{label:'解释对象',value:'第一宫 · 1st Bhava'}],['1H'],'第一宫的基础主题来自本解释系统的 House metadata。')})
  }),
  rule({
    id:'H1_CANCER',type:'rashi_expression',sourceLevel:'B',themes:['identity','responsiveness','protection'],semanticTags:['responsive_identity'],match:context=>context.house.rashi==='Cancer',
    interpret:context=>({fact:'你的第一宫落在巨蟹座 · Cancer。',traditionalMeaning:'第一宫通过巨蟹座的接收、保护、回应环境与随情境移动等性质表达。',possibleExpressions:['面对新环境时，你可能会先感受周围的人、关系与氛围，再决定自己如何进入其中。'],evidence:createEvidence([{label:'第一宫 Rashi',value:'Cancer · 巨蟹座'},{label:'Element',value:context.house.rashiMeta.element},{label:'Modality',value:context.house.rashiMeta.modality},{label:'传统守护星',value:context.house.rashiMeta.ruler}],['1H','Cancer'],'第一宫的表达方式读取其所在 Rashi 的结构化基础性质。')})
  }),
  rule({
    id:'H1L_IN_H9',type:'house_lord_placement',sourceLevel:'B',themes:['identity','belief','knowledge','life_direction'],semanticTags:['identity_meaning'],match:context=>context.house.lordHouse===9,
    interpret:context=>({fact:'第一宫主月亮 · Moon 位于第九宫。',traditionalMeaning:'宫主落宫用于观察两个生活领域如何建立联系；这里是第一宫与第九宫的连接。',possibleExpressions:['接触新的知识体系时，你可能不只是“学到东西”，而是连带改变自己对人生和自己的理解。'],evidence:houseOneEvidence(context)})
  }),
  rule({
    id:'MERCURY_IN_H1',type:'occupant',sourceLevel:'B',themes:['identity','thinking','communication'],semanticTags:['thinking_identity'],match:context=>context.house.occupants.includes('Mercury'),
    interpret:context=>({fact:'水星 · Mercury 位于第一宫。',traditionalMeaning:'直接落入第一宫的水星，使思考、语言、学习与信息交换参与自我呈现。',possibleExpressions:['你可能会通过提问、解释、写作、整理信息或与人讨论，逐渐确认自己真正的观点。'],evidence:occupantEvidence(context,'Mercury')})
  }),
  rule({
    id:'RAHU_IN_H1',type:'occupant',sourceLevel:'C',themes:['identity','amplification','unconventionality'],semanticTags:['identity_expansion'],match:context=>context.house.occupants.includes('Rahu'),
    interpret:context=>({fact:'罗睺 · Rahu 位于第一宫。',traditionalMeaning:'在本规则库中，罗睺只表示放大、渴望、跨越边界与非传统倾向；其表现仍依赖 Rashi、宫主、同宫与相位条件。',possibleExpressions:['你可能会持续尝试新的身份表达或非传统路径；顺畅时表现为愿意探索边界，过度时则可能难以满足于已经形成的自我定义。'],evidence:occupantEvidence(context,'Rahu')})
  }),
  rule({
    id:'MERCURY_RAHU_SAME_HOUSE',type:'conjunction',sourceLevel:'C',themes:['thinking','communication','amplification','unconventionality'],semanticTags:['amplified_thinking'],match:context=>context.conjunction?.planets.includes('Mercury')&&context.conjunction.planets.includes('Rahu'),
    interpret:context=>({fact:'水星与罗睺同在第一宫。',traditionalMeaning:'本阶段的同宫表示两颗 Graha 共同参与第一宫；这是 Whole Sign 关系，不使用角度 orb 判断紧密程度。',possibleExpressions:['在某些情况下，思考与表达的需求可能被放大，使你愿意接触新奇、复杂或非传统的信息；过度时也可能不断追逐下一种说法，而较难停在一个稳定定义上。'],evidence:createEvidence([{label:'水星所在',value:'第1宫'},{label:'罗睺所在',value:'第1宫'},{label:'关系',value:'同宫 · Conjunction'},{label:'角距离',value:`${context.conjunction.separations.find(item=>item.planets.includes('Mercury')&&item.planets.includes('Rahu')).degrees.toFixed(3)}°`}],['Mercury · 1H','same-house','Rahu · 1H'],'两颗 Graha 位于同一个 Whole Sign Bhava，因此触发同宫组合规则。')})
  })
];

export const HOUSE1_THEME_RULES=[
  {id:'THEME_IDENTITY_MEANING',title:'在理解世界的过程中认识自己',requires:['responsive_identity','identity_meaning'],themes:['identity','responsiveness','belief','knowledge'],text:'你对“我是谁”的理解，可能并不是完全固定的。新的知识、逐渐形成的信念，以及对长期方向的寻找，都可能反过来改变你对自己的认识。你也更容易先感受周围的人、关系与氛围，再决定自己如何进入其中。'},
  {id:'THEME_THINKING_IDENTITY',title:'思考与表达参与自我形成',requires:['thinking_identity'],themes:['identity','thinking','communication'],text:'思考和表达本身，可能就是你认识自己的方式之一。很多时候，把一个问题说出来、写下来或解释清楚，会帮助你逐渐确认自己真正怎么想。'},
  {id:'THEME_EXPANDING_IDENTITY',title:'自我不是一个容易停止变化的答案',requires:['identity_expansion','amplified_thinking'],themes:['identity','amplification','unconventionality'],text:'新的身份、新的观点和不同于常规的表达方式，可能持续吸引你探索“我还可以是谁”。水星与罗睺同宫进一步放大了对信息和新解释的需求；当这种探索过度时，也可能很难停留在一个已经形成的答案上。'}
];
