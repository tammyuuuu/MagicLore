const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
const roles={Sun:'自我方向与主动选择',Moon:'情绪需要与安全感',Mercury:'思考、学习与表达',Venus:'亲近方式与价值选择',Mars:'行动、欲望与边界',Jupiter:'成长、探索与信念',Saturn:'责任、规则与长期积累',Uranus:'独立与改变惯例',Neptune:'想象、理想与感受边界',Pluto:'深层调整与权责关系'};
const areas=['自我定位与行动','个人收入与价值感','学习与日常交流','家人与生活根基','恋爱表达与创造','日常工作与精力安排','伴侣关系与合作','共同资源与信任','进修、远行与信念','事业方向与社会位置','团队与长期目标','独处、休整与内在体验'];
const styles=['直接尝试，把想法付诸行动','稳步积累，重视实际感受','通过交流和多种角度理解事情','照顾情感联结与归属','借创造和表达找到自己的位置','整理细节，让安排更有效','比较不同立场，寻找关系中的平衡','深入了解，重视信任与界限','探索新的经验，寻找意义','制定计划，把责任落实','独立思考，寻找不同的做法','感受氛围，以想象和共情回应'];
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const relations={0:'合相把两种需要集中起来，往往很难只处理其中一端，可以先辨认它们怎样共同推动选择。',60:'六合留下了可以主动培养的合作空间，优势通常需要靠尝试、交流或具体安排慢慢建立。',90:'刑相强调需要协调的不同要求。它可以成为调整方式的动力，也需要你给时间和精力安排清楚的优先级。',120:'拱相让两种需要较容易配合，可以把已有长处用起来，也留意是否因为熟悉而忽略新的可能。',180:'对冲把两端的需要都带到面前，适合学习协商与边界，让其中一端得到照顾时，另一端也有位置。'};
const pairStories={
 'Sun:Uranus':['自我方向 · 给独立留出空间','太阳关乎你想成为怎样的人，天王星则让你留意惯例之外的可能。把它们放在一起，你可以探索哪些选择来自自己的兴趣，哪些只是习惯或外界期待。','需要改变时，先说清具体想调整什么，给新做法一点试行时间，让自主选择也能被别人理解。'],
 'Moon:Mars':['情绪与行动 · 先听见感受，再决定怎样回应','月亮关联安全感，火星关联行动与保护边界。这两颗星联系紧密时，情绪和行动可能很快接上：你可能先回应、保护或争取，之后才慢慢说清自己的需要。','面对争论、答应或拒绝，可以先给感受命名，再选择行动，让保护自己与表达需要有同样的空间。'],
 'Sun:Saturn':['自我要求 · 让成长有可以持续的标准','太阳的自我方向与土星的责任规则相遇，把想做的事与能够承担的事放到了一起。这条线可以帮助长期建设，也值得观察你是否把表现和自我价值绑得太紧。','把必要标准与额外要求分开，让完成、休息与逐步改进都成为计划的一部分。'],
 'Moon:Saturn':['安全感 · 责任之外也要照顾自己','月亮需要情感支持，土星关注责任与现实安排。这条关系会把照顾自己和承担事情联系起来，可以观察你是否习惯先把事做好，再承认自己的感受。','把休息与求助写进日常安排，让情绪需要有一个可以被说出来的位置。'],
 'Mercury:Uranus':['思考与表达 · 让新角度被理解','水星处理信息，天王星带来不同的想法。两者相连时，可以从惯例之外寻找答案，也需要照顾表达的节奏，让别人看见你的推理过程。','提出结论前补上两三步具体依据，再听听对方在哪一步需要更多说明。'],
 'Venus:Mars':['亲近与主动 · 让喜欢和边界一起被表达','金星关联亲近和价值偏好，火星关联行动与欲望。两者的关系可以帮助理解你怎样表达喜欢，以及靠近时怎样保留双方的节奏。','把期待、意愿和下一步行动分开沟通，留意双方是否都愿意接受同一种靠近方式。']
};
const gap=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function natalNarrative(chart){
 const planets=chart.planets.filter(p=>names[p.name]),by=Object.fromEntries(planets.map(p=>[p.name,p]));
 const sign=p=>signs[Math.floor(p.longitude/30)],position=p=>`${names[p.name]}${sign(p)}第${p.house}宫`;
 const rulerAt=h=>by[rulers[Math.floor(chart.cusps[h-1]/30)]],ruler=by[rulers[Math.floor(chart.asc/30)]];
 const inHouse=h=>planets.filter(p=>p.house===h),evidence=ps=>[...new Set(ps.filter(Boolean).map(position))].join(' · ');
 const pair=(a,b)=>chart.aspects.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));
 const aspectText=a=>`${names[a.a]}${a.label}${names[a.b]}`;
 const personal=new Set(['Sun','Moon','Mercury','Venus','Mars']);
 const important=chart.aspects.filter(a=>personal.has(a.a)||personal.has(a.b)||a.a===ruler.name||a.b===ruler.name).map(a=>({...a,score:((['Sun','Moon'].includes(a.a)||['Sun','Moon'].includes(a.b))?12:6)+(a.a===ruler.name||a.b===ruler.name?4:0)-a.orb})).sort((a,b)=>b.score-a.score);
 const talentLinks=important.filter(a=>[a.a,a.b].some(k=>['Sun','Mercury'].includes(k))).slice(0,2);
 const talent=by.Mercury,talentStyle=styles[Math.floor(talent.longitude/30)];
 const talentQualities=[['Uranus','独立判断与尝试新方法'],['Neptune','感受氛围与想象表达'],['Saturn','耐心整理与长期练习'],['Jupiter','扩展知识与整合视角'],['Mars','迅速实践与解决问题']].filter(([key])=>talentLinks.some(a=>a.a===key||a.b===key));
 const strengths=talentQualities.length?talentQualities.map(x=>x[1]).join('、'):talentStyle;
 const cards=[{title:'天赋 · 让自己的理解形成方法',evidence:evidence([talent,by.Sun,...talentLinks.flatMap(a=>[by[a.a],by[a.b]])]),paragraphs:[
 `这张盘的天赋，可以先从**${strengths}**来理解。水星处理学习、信息与表达，太阳关联主动发展的方向；把两者放在一起，比单看某个星座更能看见能力怎样形成。`,
 `水星在${sign(talent)}第${talent.house}宫，使思考方式带有「${talentStyle}」的特点，并主要进入${areas[talent.house-1]}。${talentLinks.map(a=>`${aspectText(a)}，让${roles[a.a]}与${roles[a.b]}联系起来；${relations[a.angle]}`).join('')}这些是天赋判断的具体线索，需要通过实践看哪些已经成为你的长处。`,
 `适合培养的方向，是把这个领域里反复出现的经验整理成**可以复用的方法、作品或专业能力**。可以先挑一个真实问题，记录怎样观察、怎样判断、怎样验证，逐步找到属于自己的工作方式。`
 ]}];
 const money=inHouse(2),moneyRuler=rulerAt(2),shared=inHouse(8),growth=money.some(p=>p.name==='Jupiter'),structure=money.some(p=>p.name==='Saturn');
 cards.push({title:`财富 · ${growth&&structure?'通过长期能力积累价值':money.length?'把资源主题落到实际积累':'找到能力获得回报的路径'}`,evidence:`第2宫宫主星${position(moneyRuler)}${money.length?' · '+evidence(money):''}`,paragraphs:[
 money.length?`财富是这张盘值得单独看的一条线，因为**${money.map(p=>names[p.name]).join('、')}落在第2宫**。第2宫对应个人收入、可支配资源与价值感，也就是你依靠什么获得现实回报。`:`理解你的财富模式，可以从**第2宫及其宫主星${names[moneyRuler.name]}**入手。第2宫没有主要行星不等于缺乏财富主题，宫主星仍会把收入与资源问题带到具体的生活领域。`,
 `${growth&&structure?'木星带来成长和扩大资源的需要，土星强调限制、责任与长期建设。两者在这里相遇，更值得关注怎样让增长建立在可持续的基础上。':money.length?money.map(p=>`${names[p.name]}象征${roles[p.name]}，让资源安排也带入这一层需要。`).join(''):''}第2宫宫主星${names[moneyRuler.name]}落在第${moneyRuler.house}宫，意味着个人收入与${areas[moneyRuler.house-1]}相联系。${shared.length?`第8宫还有${shared.map(p=>names[p.name]).join('、')}，因此共同资金、借贷或合作资源也应与自己的收入分开梳理。`:''}`,
 `实际积累时，可以重点问：投入的时间、技能与资源，是否正在形成**能够持续产生价值的东西**？结合${areas[moneyRuler.house-1]}里的实际机会，检验回报方式、成本和稳定性；这些配置解释关注点，不能据此估算财富金额或保证某种投资结果。`
 ]});
 const career=rulerAt(10),careerPlanets=inHouse(10),mcSign=signs[Math.floor(chart.mc/30)],cuspSign=signs[Math.floor(chart.cusps[9]/30)];
 cards.push({title:'事业 · 建立能代表自身价值的方向',evidence:`天顶${mcSign} · 第10宫宫主星${position(career)}${careerPlanets.length?' · '+evidence(careerPlanets):''}`,paragraphs:[
 `事业方向可以从**天顶与第10宫的联系**展开。你的天顶在${mcSign}，第10宫宫头在${cuspSign}，宫主星是${names[career.name]}。${chart.input?.system!=='placidus'?'所选宫制中天顶与第10宫宫头分别读取，两者都要结合来看。':''}这让职业选择既涉及怎样面向外界，也涉及什么样的责任值得长期承担。`,
 `${names[career.name]}落在第${career.house}宫，把职业主题带到${areas[career.house-1]}。${[2,8].includes(career.house)?'因此，职业的发展和能力如何形成资源之间有直接的宫主星联系；这正是事业与财富需要放在一起理解的原因。':`这意味着职业选择需要与${areas[career.house-1]}中的实际需要协调，才能形成适合自己的发展路径。`}${careerPlanets.some(p=>p.name==='Pluto')?'冥王星也在第10宫，增加了深入专业、处理权责与阶段性重整的主题。':careerPlanets.length?`${careerPlanets.map(p=>names[p.name]).join('、')}位于第10宫，则进一步让${careerPlanets.map(p=>roles[p.name]).join('、')}进入职业生活。`:''}`,
 `与其只问哪一个职位适合你，更值得比较：**这个方向能否积累真正属于自己的核心能力**？把专业深度、现实回报、自主空间和能够持续投入的精力一起衡量，才能把盘里的职业线索变成可执行的选择。`
 ]});
 const venus=by.Venus,partner=rulerAt(7),relationshipLinks=important.filter(a=>[a.a,a.b].includes('Venus')).slice(0,1);
 cards.push({title:`关系 · ${venus.house===11?'经营有共同方向的连接':venus.house===7?'让亲近与合作彼此支持':'找到适合双方的靠近方式'}`,evidence:evidence([venus,partner]),paragraphs:[
 `关系里最值得留意的，是**亲近方式与双方真正需要的连接**。金星象征喜欢、价值偏好和关系中的吸引，它在${sign(venus)}，使靠近的方式带有「${styles[Math.floor(venus.longitude/30)]}」的特点。`,
 `金星落第${venus.house}宫，让亲近与${areas[venus.house-1]}联系起来。${venus.house===11?'因此，共同兴趣、朋友或长期目标可能成为重要连接的入口；关系的价值也可能体现在彼此是否能共同成长。':''}第7宫宫主星${names[partner.name]}在第${partner.house}宫，则把伴侣与合作关系进一步带到${areas[partner.house-1]}。${relationshipLinks.map(a=>`${aspectText(a)}提醒你同时照顾${roles[a.a]}与${roles[a.b]}，${relations[a.angle]}`).join('')}`,
 `可以把**共同价值、彼此边界与日常相处方式**说得具体一点。比起只判断合不合适，更有帮助的是观察：双方是否愿意理解彼此的节奏，能否把期待落实成稳定的互动。`
 ]});
 const moon=by.Moon,mars=by.Mars,emotionLink=pair('Moon','Mars'),moonSaturn=pair('Moon','Saturn');
 cards.push({title:`行动与情绪 · ${emotionLink?.angle===0?'反应快，需要留出缓冲':moonSaturn?'承担事情时也照顾自己的感受':'让感受与行动找到共同节奏'}`,evidence:evidence([moon,mars])+(emotionLink?` · ${aspectText(emotionLink)}，偏差${emotionLink.orb.toFixed(2)}°`:''),paragraphs:[
 emotionLink?`**${aspectText(emotionLink)}**是理解行动与情绪的一条重要线索。月亮对应本能反应与安全感，火星对应行动、防御和争取；${emotionLink.angle===0?'合相使感受与行动靠得很近，察觉需求或边界变化后，可能很快产生回应的倾向。':relations[emotionLink.angle]}`:`你怎样恢复安全感，与怎样开始行动，需要放在一起看。月亮在${sign(moon)}，火星在${sign(mars)}；前者关乎**感受是否被照顾**，后者关乎怎样争取与表达边界。`,
 `月亮在第${moon.house}宫，让情绪需要更多进入${areas[moon.house-1]}；火星在第${mars.house}宫，让行动重点进入${areas[mars.house-1]}。${moonSaturn?`${aspectText(moonSaturn)}又把情绪与责任联系起来：除了把事情处理好，也值得留意自己的需要有没有被放到最后。`:emotionLink?.angle===0?'这样的连接可以支持快速回应和保护意识，但情绪强烈时也需要辨认反应与最终决定之间的距离。':'两者所在领域即使不同，也可能在一次决定里同时提出要求，需要协调而不是忽略其中一层。'}`,
 `重要决定前，可以增加一个缓冲步骤：**先确认正在感受什么，再决定采取什么行动**。这不是压抑反应，而是让感受被理解、行动有清楚的目标，也给后续调整留下空间。`
 ]});
 const inner=inHouse(12),innerRuler=rulerAt(12),sunUranus=pair('Sun','Uranus');
 if(inner.length||[8,12].includes(moon.house)||[8,12].includes(talent.house))cards.push({title:'内在与探索 · 把内在理解带回现实',evidence:evidence(inner.length?inner:[innerRuler,moon,talent]),paragraphs:[
 inner.length?`**${inner.map(p=>names[p.name]).join('、')}位于第12宫**，让独处、幕后活动与内在整理成为值得留意的主题。这里强调的是怎样消化经验、恢复精力和形成理解，而不是单凭位置判定灵性高低。`:`内在探索可以从第12宫及${moon.house===8?'月亮':'水星'}所在的深层体验领域理解。它关联**怎样消化感受、理解复杂经验与保留内在空间**，需要结合实际兴趣展开。`,
 `${inner.length?inner.map(p=>`${names[p.name]}带来${roles[p.name]}的需要`).join('；')+'。':''}第12宫宫主星${names[innerRuler.name]}在第${innerRuler.house}宫，把内部整理和${areas[innerRuler.house-1]}连接起来。${sunUranus?`${aspectText(sunUranus)}还让自我方向与独立判断联系起来，探索时可以保留自己的验证和选择。`:''}`,
 `心理、艺术、象征或独处中的思考，都可以成为理解自己的工具。关键是**把内在理解带回现实生活**：它有没有帮助你更清楚地做决定、改善安排、表达需要？能够留下实际改变的探索，更容易成为长期资源。`
 ]});
 const covered=new Set(talentLinks.concat(emotionLink?[emotionLink]:[],moonSaturn?[moonSaturn]:[],relationshipLinks).map(a=>`${a.a}:${a.b}:${a.angle}`));
 const extra=important.find(a=>!covered.has(`${a.a}:${a.b}:${a.angle}`));
 if(extra){const p=by[extra.a],q=by[extra.b],story=pairStories[`${extra.a}:${extra.b}`]||pairStories[`${extra.b}:${extra.a}`];cards.push({title:story?.[0]||'核心相位 · 协调盘中另一条重要线索',evidence:`${aspectText(extra)} · 偏差${extra.orb.toFixed(2)}°`,paragraphs:[story?.[1]||`**${aspectText(extra)}**把${names[extra.a]}的${roles[extra.a]}与${names[extra.b]}的${roles[extra.b]}联系起来。它涉及个人星体或命主星，且在当前盘里比较紧密，因此值得作为另一条主线理解。`,`${relations[extra.angle]}${position(p)}与${position(q)}，使这条线具体进入${areas[p.house-1]}${p.house===q.house?'':`与${areas[q.house-1]}`}。理解它时，既要看两颗星代表的需要，也要看这两种需要在哪里相遇。`,story?.[2]||`可以从最近一次与这两个领域有关的选择入手，分别写出想满足什么、遇到了什么限制，再寻找**能同时照顾两层需要的安排**。`]});}
 const clusters=[...new Set(planets.map(p=>p.house))].map(h=>({h,ps:inHouse(h)})).filter(x=>x.ps.length>=3&&x.ps.some(p=>personal.has(p.name))).sort((a,b)=>b.ps.length-a.ps.length).slice(0,2);
 cards.push({title:'整体主线 · 把理解逐步变成自己的生活方式',evidence:`上升${signs[Math.floor(chart.asc/30)]} · 命主星${position(ruler)}${clusters.map(x=>` · 第${x.h}宫${x.ps.length}颗行星`).join('')}`,paragraphs:[
 `把前面的主题放在一起，先抓住**理解自己的需要，再找到能够持续的表达方式**这条主线。上升${signs[Math.floor(chart.asc/30)]}关联你进入新环境的方式，命主星${names[ruler.name]}在第${ruler.house}宫，把这条起点带到${areas[ruler.house-1]}。`,
 clusters.length?`${clusters.map(x=>`${x.ps.map(p=>names[p.name]).join('、')}集中第${x.h}宫，让${areas[x.h-1]}反复出现`).join('；')}。再结合第2宫宫主星位于第${moneyRuler.house}宫、第10宫宫主星位于第${career.house}宫，可以看见个人需要、资源安排与职业方向怎样在不同领域之间连接。`:`太阳在第${by.Sun.house}宫，月亮在第${moon.house}宫，分别强调${areas[by.Sun.house-1]}与${areas[moon.house-1]}；收入线索由第2宫宫主星连接到第${moneyRuler.house}宫，职业线索由第10宫宫主星连接到第${career.house}宫。把这些实际联系放在一起，才能分清哪些需要互相支持、哪些需要协商。`,
 `长期发展的重点，是把这些理解落实成**适合自己的能力、关系与日常安排**。先选最有共鸣的一两个主题，观察它们怎样出现在真实生活里，再逐步调整；整张盘提供的是相互联系的线索，不需要把每一条都当成固定的性格结论。`
 ]});
 const overview=cards.pop();
 const definitions=[
 ['自我与行动','找到自己的生活节奏','进入环境、表达自己与开始行动','先分清自己的需要和外界期待，再决定怎样行动','Moon','Mars'],
 ['财富与价值','让能力形成稳定回报','个人收入、可支配资源与自我价值','检验投入是否形成可持续的技能、产品或资源','Venus','Jupiter'],
 ['学习与表达','把理解变成能被听懂的语言','日常学习、沟通、手足与近距离往来','把想法拆成清楚的步骤，给交流和反馈留下空间','Mercury'],
 ['家庭与根基','建立让自己安心的生活','家庭、居住、私人生活与归属感','说清怎样的居住环境和家人互动让你安心，也尊重彼此边界','Moon'],
 ['爱情与创造','让喜欢有自然的表达','恋爱、兴趣、创作、自发表达与子女议题','观察你怎样表达喜欢、享受相处，也给兴趣和创造留出时间','Venus','Sun'],
 ['工作与健康','找到可以持续的日常安排','日常工作、习惯、身体照顾与精力分配','把任务、休息和身体反馈一起记录，调整到能够持续的节奏','Mercury','Mars'],
 ['伴侣与合作','让两个人的需要都有位置','长期伴侣、一对一合作、契约与相处边界','把共同期待、实际分工和需要保留的空间讲清楚','Venus'],
 ['共同资源与信任','把共享与边界说清楚','共同资金、债务、亲密信任与深层调整','区分个人与共同资源，提前讨论承担方式和边界','Pluto'],
 ['远行与信念','让探索拓宽自己的理解','高等学习、远行、文化经验与人生信念','给新经验留出验证和消化的时间，再决定哪些观点适合自己','Jupiter'],
 ['事业与方向','积累能代表自己的核心能力','职业方向、公共角色、责任与社会位置','比较专业积累、现实回报与能够持续承担的职责','Sun','Saturn'],
 ['朋友与愿景','经营能够共同成长的连接','朋友、团队、社群与长期目标','辨认哪些关系可以互相支持，也核对团队目标是否与自己一致','Jupiter','Venus'],
 ['内在与灵性','把内在理解带回现实','独处、潜意识、幕后活动、休整与精神探索','用独处、艺术或反思整理经验，再把理解落实到生活选择','Neptune']
 ];
 const reuse={2:'财富',10:'事业',12:'内在与探索'};
 const houseCards=definitions.map((d,index)=>{
  const h=index+1,ps=inHouse(h),lord=rulerAt(h),cusp=signs[Math.floor(chart.cusps[index]/30)];
  const links=important.filter(a=>ps.some(p=>p.name===a.a||p.name===a.b)||a.a===lord.name||a.b===lord.name).slice(0,2);
  const weight=p=>['Sun','Moon'].includes(p.name)?5:personal.has(p.name)?3:2;
  const importance=ps.reduce((sum,p)=>sum+weight(p)+(p.name===ruler.name?4:0),0)+(lord.name===ruler.name?3:0)+(lord.house===h?3:0)+links.reduce((sum,a)=>sum+Math.max(0.5,2-a.orb/4),0)+ps.reduce((sum,p)=>sum+([chart.asc,chart.mc,(chart.asc+180)%360,(chart.mc+180)%360].some(angle=>gap(p.longitude,angle)<=8)?2:0),0);
  const stars=importance>=16?5:importance>=11?4:importance>=7?3:importance>=3?2:1;
  const source=reuse[h]&&cards.find(card=>card.title.startsWith(reuse[h]+' · '));
  const lead=ps.length?`**${ps.map(p=>names[p.name]).join('、')}落在第${h}宫**，使${d[2]}成为这张盘需要留意的领域。${ps.map(p=>`${names[p.name]}带来${roles[p.name]}的需要`).join('；')}，所以这里的几层需要要放在一起理解。`:`${d[0]}可以从**第${h}宫与宫主星${names[lord.name]}**展开。这里关联${d[2]}；没有主要行星落入，并不代表这部分生活不存在，只是它没有被落宫星体直接强调。`;
  const connection=`第${h}宫宫头在${cusp}，宫主星${names[lord.name]}落在${sign(lord)}第${lord.house}宫。这条联系可以理解为：${d[2]}的需要，会通过${areas[lord.house-1]}表达或寻找支持。${links.map(a=>`${aspectText(a)}（偏差${a.orb.toFixed(2)}°）又把${roles[a.a]}和${roles[a.b]}联系起来；${relations[a.angle]}`).join('')}`;
  const action=`实际生活里，最值得练习的是**${d[3]}**。${h===4?'家庭主题需要结合真实家人关系与成长经历理解，不能单凭配置认定家庭好坏。':h===5?'第5宫更偏向恋爱与喜欢的表达，长期承诺和共同生活还需要结合第7宫一起看。':h===6?'这里谈的是作息与精力的观察，不用于判断疾病。':h===8?'它关注承担与信任的方式，不预示一定发生债务或损失。':`可以从最近一次与${d[0]}有关的经历入手，看看宫主星所连接的领域怎样参与了你的选择。`}`;
  return {house:h,title:`${d[0]} · ${source?source.title.split(' · ')[1]:d[1]}`,stars,importance,meta:`重要性 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)} · 第${h}宫主题`,evidence:`第${h}宫${cusp} · 宫主星${position(lord)}${ps.length?' · '+evidence(ps):''}`,paragraphs:source?[source.paragraphs[0],source.paragraphs[1]+' '+(links.length?`${aspectText(links[0])}（偏差${links[0].orb.toFixed(2)}°）也参与这条主题。`:''),source.paragraphs[2]]:[lead,connection,action]};
 }).sort((a,b)=>b.stars-a.stars||b.importance-a.importance||a.house-b.house);
 const nodeCard=nodeNarrative(chart);
 const details=nodeCard?[...houseCards,nodeCard].sort((a,b)=>b.stars-a.stars||b.importance-a.importance):houseCards;
 const themes=details.slice(0,3).map(card=>card.title.split(' · ')[0]);
 overview.title=`整张盘的主线 · ${themes.join('、')}`;
 overview.paragraphs[0]=`这张盘最值得先读的是**${themes.join('、')}**。下方十二宫主题按当前盘的重要性排序，星级结合主要行星落宫、日月与命主星联系、关键相位及接近四轴的位置。星级表示主题的突出程度，不表示好坏或结果大小。上升${signs[Math.floor(chart.asc/30)]}的命主星${names[ruler.name]}在第${ruler.house}宫，也是串联${areas[ruler.house-1]}的一条起点。`;
 if(nodeCard)overview.paragraphs[2]+=` 南北交点还把${areas[nodeCard.southHouse-1]}与${areas[nodeCard.northHouse-1]}连成一条成长轴，下方会结合具体位置展开。`;
 return [overview,...details];
}

export function nodeNarrative(chart){
 const north=chart.planets.find(p=>p.name==='NorthNode'),south=chart.planets.find(p=>p.name==='SouthNode');
 if(!north||!south)return null;
 const ns=Math.floor(north.longitude/30),ss=Math.floor(south.longitude/30);
 const by=Object.fromEntries(chart.planets.map(p=>[p.name,p]));
 const northLord=by[rulers[ns]],southLord=by[rulers[ss]];
 const nodeNames={NorthNode:'北交点',SouthNode:'南交点'};
 // An opposition to one node is a conjunction to the other: describe the axis once.
 const hits=chart.planets.filter(p=>names[p.name]).flatMap(p=>{
  const separation=gap(p.longitude,north.longitude);
  const options=[{node:north,angle:0,orb:separation},{node:south,angle:0,orb:Math.abs(separation-180)},{node:north,angle:90,orb:Math.abs(separation-90)}];
  const a=options.sort((a,b)=>a.orb-b.orb)[0];
  return a.orb<=3?[{...a,planet:p,score:(['Sun','Moon'].includes(p.name)?5:['Mercury','Venus','Mars'].includes(p.name)?3:2)-a.orb/3}]:[];
 }).sort((a,b)=>b.score-a.score).slice(0,3);
 const importance=4+hits.reduce((sum,a)=>sum+a.score,0)+([northLord.name,southLord.name].includes(rulers[Math.floor(chart.asc/30)])?2:0);
 const stars=importance>=16?5:importance>=11?4:importance>=7?3:importance>=3?2:1;
 const evidence=`北交点${signs[ns]}第${north.house}宫 · 南交点${signs[ss]}第${south.house}宫 · ${chart.input?.nodeType==='true'?'真交点（近似）':'平均交点'}`;
 return {title:'南北交点 · 从熟悉的模式走向新的表达',stars,importance,northHouse:north.house,southHouse:south.house,meta:`重要性 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)} · 第${south.house}宫—第${north.house}宫成长轴`,evidence,paragraphs:[
 `南北交点是月球轨道与黄道相交的位置，不是两颗行星。在本命解读中，可以把**南交点看作较熟悉的应对模式，北交点看作值得逐步练习的方向**。你的南交点在${signs[ss]}第${south.house}宫，关联「${styles[ss]}」与${areas[south.house-1]}；这是一份可以运用的经验，也值得观察自己是否总在这里寻找答案。`,
 `北交点在${signs[ns]}第${north.house}宫，把成长线索带向**${areas[north.house-1]}**，并尝试「${styles[ns]}」的表达方式。这里不是要放弃南交点的长处，而是让熟悉的能力支持另一端的发展。北交点所在星座的宫主星${names[northLord.name]}在第${northLord.house}宫，南交点所在星座的宫主星${names[southLord.name]}在第${southLord.house}宫，进一步把这条轴连接到${areas[northLord.house-1]}${northLord.house===southLord.house?'':`与${areas[southLord.house-1]}`}。`,
 `${hits.length?hits.map(a=>`${names[a.planet.name]}${a.angle===0?'合相':'刑相'}${nodeNames[a.node.name]}（偏差${a.orb.toFixed(2)}°），把${roles[a.planet.name]}带入这条成长线。${a.angle===0?'合相让这颗星的表达与交点主题较紧密地交织，值得看它怎样支持或反复强化这一模式。':'刑相提示两端之间还有需要协调的要求，可以观察同一类选择是否总让你在熟悉与改变之间拉扯。'}`).join(''):'以3°容许度检查日月与其余主要行星，本盘没有紧密合相或刑相落在交点轴上，因此这里先以星座、宫位和宫主星联系为主。'}可以从一件具体小事开始：**保留南交点的长处，同时给北交点所在领域一次新的尝试**。交点描述的是探索线索，不需要理解为必须完成的命运任务。`
 ]};
}
