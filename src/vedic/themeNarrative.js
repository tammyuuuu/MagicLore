import {buildReadingStructure} from './readingStructure.js';
export const themes=[['自我与方向','找到适合自己的行动节奏','自我定位、开始行动与面对环境','分清自己的选择与外界期待，给真正想做的事留出位置'],['财富与积累','让能力形成稳定资源','收入、储蓄、价值感与家庭资源','把收入来源、支出与可持续技能放在一起衡量'],['学习与表达','在练习中形成自己的方法','沟通、技能、手足与主动尝试','用持续练习和实际反馈改进表达与技能'],['家庭与归属','建立安心的生活根基','居住、家人、内在安定与生活基础','说清居住需要与家庭分工，经营可以恢复精力的环境'],['爱情与创造','给喜欢和创造留出空间','恋爱、创作、兴趣、子女与判断力','让喜欢有具体表达，也给作品和兴趣稳定的投入'],['工作与健康','调整能够持续的日常','日常工作、服务、竞争与身体照顾','协调任务、休息与身体反馈，建立可持续的习惯'],['伴侣与合作','让双方的需要都有位置','长期伴侣、一对一合作与承诺','提前讨论合作期待、分工与彼此的边界'],['共同资源与转变','在变化中厘清承担','共享资源、亲密信任与深层变化','说清共同资金和责任，给不确定的变化保留缓冲'],['远行与信念','让探索形成自己的理解','高等学习、师长、远行与信念','将学习和新经验消化成能用于生活的判断'],['事业与责任','建立值得长期投入的方向','职业、社会角色与实际职责','比较专业成长、职责与现实回报，选择能积累能力的方向'],['朋友与收获','经营目标一致的连接','社群、长期目标、收益与支持网络','经营相互支持的团队，明确共同目标和投入方式'],['内在与灵性','在独处中整理再回到生活','独处、幕后准备、释放与精神探索','留出恢复和内在整理的时间，再将理解带回现实']];
export function vedicThemeNarrative(chart){
 const reading=buildReadingStructure(chart),by=Object.fromEntries(reading.planets.map(p=>[p.name,p]));
 const name=n=>by[n].meta.chineseName,role=n=>by[n].meta.basicMeaning;
 const cards=reading.houses.map((house,i)=>{
  const [area,subtitle,meaning,action]=themes[i],lord=by[house.lord],ps=house.occupants.map(n=>by[n]);
  const importance=ps.reduce((s,p)=>s+(['Sun','Moon'].includes(p.name)?5:['Rahu','Ketu'].includes(p.name)?3:2),0)+house.incomingAspects.length*2+(house.lord===reading.houses[0].lord?3:0)+(lord.house===house.house?2:0)+house.incoming.length;
  const stars=importance>=13?5:importance>=9?4:importance>=6?3:importance>=3?2:1;
  const entry=ps.length?`${ps.map(p=>name(p.name)).join('、')}落在**第${house.house}宫**，让${meaning}成为需要认真理解的一条线。${ps.map(p=>`${name(p.name)}代表${role(p.name)}`).join('；')}。这些需要会在同一个生活领域相遇，具体怎样表现，还要看宫主星把它带向哪里。`:`${area}的线索，可以从**第${house.house}宫${house.rashiMeta.chineseName}的宫主星${name(house.lord)}**开始。这里关联${meaning}；没有九曜直接落入时，宫主星的落宫与照射仍能说明它怎样与其他生活需要连接。`;
  const aspect=house.incomingAspects.slice(0,2).map(a=>`${name(a.source)}从第${a.fromHouse}宫以第${a.aspectNumber}照射影响这里，把${role(a.source)}也带入${area}。`).join('');
  const condition={own_sign:'位于自己的守护星座，相关表达较有自身依据',exaltation:'处于擢升位置，相关能力有较明确的发挥条件',debilitation:'处于落陷位置，更需要调整表达方式和现实条件'}[lord.condition.dignity?.type];
  const ruled=lord.ruledHouses.map(h=>`第${h}宫（${themes[h-1][0]}）`).join('、');
  const link=`宫主星**${name(house.lord)}在${lord.rashiMeta.chineseName}第${lord.house}宫**，掌管${ruled}。这意味着${area}并非单独运作，它会通过**${themes[lord.house-1][0]}**寻找落实方式：${themes[lord.house-1][2]}里的选择，也可能影响这里的安排。${condition?`${name(house.lord)}${condition}；这描述表达条件，不是结果保证。`:''}${aspect}`;
  const ending=`对你来说，可以把重点放在**${action}**。${ps.some(p=>p.name==='Saturn')?'这里有土星参与，更值得看长期承担是否换来稳定积累，而不是把所有责任都接下来。':ps.some(p=>p.name==='Rahu')?'罗睺会放大探索和追求，值得分清真实需要与不断追逐的新刺激。':ps.some(p=>p.name==='Ketu')?'计都提示简化与抽离，留意哪些投入确实可以减少，哪些重要连接仍需要照顾。':`把${area}与${themes[lord.house-1][0]}一起观察，比孤立地判断一颗星更容易抓住重点。`}`;
  return {house:house.house,title:`${area} · ${subtitle}`,importance,stars,evidence:`第${house.house}宫${house.rashiMeta.chineseName} · 宫主星${name(house.lord)}第${lord.house}宫${ps.length?' · '+ps.map(p=>name(p.name)).join('、')+'落宫':''}`,paragraphs:[entry,link,ending]};
 }).sort((a,b)=>b.importance-a.importance||a.house-b.house);
 const asc=reading.houses[0],lagnaLord=by[asc.lord],moon=by.Moon,rahu=by.Rahu,ketu=by.Ketu;
 return {overview:[`这张印占盘，先从**${cards.slice(0,3).map(c=>c.title.split(' · ')[0]).join('、')}**读起。它们综合了九曜落宫、宫主星联系与行星照射，是当前盘较突出的生活主题。星级表示重点程度，不表示吉凶。`,`上升在**${asc.rashiMeta.chineseName}**，命主星${name(asc.lord)}落第${lagnaLord.house}宫，先把自我发展连接到${themes[lagnaLord.house-1][0]}。月亮在${moon.rashiMeta.chineseName}第${moon.house}宫、${moon.nakshatra}月宿，情绪与心智需要则更多落在${themes[moon.house-1][0]}。`,`**罗睺在第${rahu.house}宫，计都在第${ketu.house}宫**，把${themes[rahu.house-1][0]}与${themes[ketu.house-1][0]}连成探索和简化的一条轴。可以留意一端的追求如何与另一端的抽离相处；具体关系在下方对应主题展开。`],cards};
}
