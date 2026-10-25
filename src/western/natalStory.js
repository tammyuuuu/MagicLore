const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
const roles={Sun:'自己想成为怎样的人，以及希望如何被认可',Moon:'怎样得到安全感、怎样安放情绪',Mercury:'思考、学习和表达的方式',Venus:'怎样靠近别人，以及觉得什么值得投入',Mars:'怎样争取想要的事、怎样表达边界',Jupiter:'怎样拓展视野、建立信念与发展空间',Saturn:'怎样承担责任、建立标准和长期积累',Uranus:'怎样保留独立性、改变不适合的惯例',Neptune:'怎样理解理想、想象与感受的界限',Pluto:'怎样面对控制、深层变化与重新建立秩序'};
const styles=['先行动、直接表达自己的需要','耐心积累，确认具体可感的结果','多方了解，通过交流寻找新角度','照顾情感联系，重视归属与熟悉感','主动表达，期待创造的东西被看见','分辨细节，把事情做得更清楚有序','比较不同立场，寻找相处的平衡','深入理解信任与边界，不轻易停在表面','寻找更大的意义，愿意学习和探索','把目标变成计划，重视责任与实际成果','保留自己的判断，尝试不同的规则','感受气氛，通过想象和共情理解事情'];
const areas=['自我定位与行动','收入、资源与价值感','学习、表达与身边环境','家人、居住与内在归属','恋爱表达、创造与个人兴趣','日常工作、作息与习惯','伴侣、一对一关系与合作','共同资金、亲密与信任','进修、远行与信念','职业方向、公众角色与责任','朋友、团队与长期目标','独处、休整与内在体验'];
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const base={Sun:10,Moon:9,Mercury:6,Venus:6,Mars:6,Jupiter:4,Saturn:4,Uranus:2,Neptune:2,Pluto:2};
const gap=(a,b)=>Math.abs(((a-b+540)%360)-180);
const position=p=>`${names[p.name]}${signs[Math.floor(p.longitude/30)]}第${p.house}宫`;
export function natalPriorities(chart){
 const ruler=rulers[Math.floor(chart.asc/30)],angles=[['上升',chart.asc],['天顶',chart.mc],['下降',(chart.asc+180)%360],['天底',(chart.mc+180)%360]];
 return chart.planets.filter(p=>names[p.name]).map(p=>{
  const nearest=angles.map(([name,lon])=>({name,orb:gap(p.longitude,lon)})).sort((a,b)=>a.orb-b.orb)[0];
  const connections=chart.aspects.filter(a=>a.a===p.name||a.b===p.name),personal=connections.filter(a=>['Sun','Moon','Mercury','Venus','Mars'].includes(a.a===p.name?a.b:a.a));
  const angleScore=nearest.orb<=5?7-nearest.orb:0,score=base[p.name]+(p.name===ruler?7:0)+angleScore+Math.min(5,personal.reduce((s,a)=>s+(a.orb<=2?2:1),0));
  return {...p,score,ruler:p.name===ruler,nearest,connections};
 }).sort((a,b)=>b.score-a.score);
}
const pairStories={
 'Sun:Saturn':['成长与责任','你想表达自己的方向，也希望把事情做得可靠。这两种需要连在一起，容易把成长看成持续积累的过程。','把自己真正认可的目标，与外界或内心额外加上的标准分开，有助于让坚持更有方向。'],
 'Moon:Saturn':['情感与责任','情绪需要和责任感同时占有位置。面对事情时，你可能先考虑怎样撑住安排，再想到自己需要怎样被照顾。','给休息、求助和表达需要留出位置，能让可靠与柔软并存。'],
 'Sun:Uranus':['独立与自我表达','发展自我方向时，保留选择的空间可能格外重要。你可以留意自己怎样调整规则，也怎样让别人理解这些改变。','先说明不适合的部分，再尝试新的做法，会比突然抽离更容易让自主与合作一起存在。'],
 'Moon:Mars':['感受与行动','感受和行动之间有很近的联系。需求一出现，就可能很快转成争取、保护或拒绝；也值得辨认行动是否已经走在表达前面。','在回应之前，先说清此刻是担心、疲惫还是期待，再选择行动的力度。'],
 'Venus:Mars':['亲近与边界','喜欢一个人或一件事时，靠近的愿望与主动争取会互相影响。这里既有关系中的吸引，也需要照顾双方的意愿。','把喜欢、期待和边界分别说清，让行动有机会成为亲近，而不是代替对方做决定。'],
 'Mercury:Uranus':['想法与独立判断','思考中可能有跳出惯例的需要，容易从不同线索里寻找新的连接。让新想法被理解，也需要给推理留下可跟随的步骤。','表达结论之前，补上关键依据，并给别人确认和提问的时间。'],
 'Mercury:Neptune':['表达与想象','理性整理信息和感受气氛、想象可能性会相互影响。丰富的联想可以帮助理解故事，但也需要辨认事实与设想的边界。','重要信息可以写下来核对，让直觉和可验证的细节互相补充。'],
 'Venus:Pluto':['亲密与信任','关系中的价值选择可能与深层的信任、决定权和投入程度联系在一起。可以留意亲近怎样让你感到更有力量，也怎样影响自主空间。','关系越重要，越值得把双方的选择权与承诺谈具体。']
};
const phase={0:'合相把两种主题集中起来，往往需要一起理解。它们可以相互强化，也可能让你较难分开辨认各自的需要。',60:'六合留下可以主动培养的合作空间，通常需要表达、练习和具体安排，长处才会逐渐落实。',120:'拱相让两种需要较容易配合，可以从熟悉的长处中得到支持，同时也值得主动使用这份条件。',90:'刑相让两种需要容易互相牵制。它更适合被理解成需要反复学习的协调过程，而不是一种固定缺点。',180:'对冲把两端不同的需要呈现出来。重要的是兼顾自己与外界、或两种不同的期待，逐步建立边界与协商方式。'};
export function natalStory(chart){
 const planets=chart.planets.filter(p=>names[p.name]),sun=planets.find(p=>p.name==='Sun'),moon=planets.find(p=>p.name==='Moon'),ranked=natalPriorities(chart),ruler=ranked.find(p=>p.ruler),cards=[];
 cards.push({title:'全盘主线 · 自己的方向与内心需要怎样相遇',evidence:`上升${signs[Math.floor(chart.asc/30)]} · ${position(sun)} · ${position(moon)}`,paragraphs:[
  `先从整张盘的两条线来看：太阳描述${roles.Sun}，月亮描述${roles.Moon}。你的太阳在${signs[Math.floor(sun.longitude/30)]}，发展方向偏向${styles[Math.floor(sun.longitude/30)]}；月亮在${signs[Math.floor(moon.longitude/30)]}，内在需要则更接近${styles[Math.floor(moon.longitude/30)]}。`,
  sun.house===moon.house?`太阳和月亮都落在第${sun.house}宫，因此${areas[sun.house-1]}同时承载了自我发展与情绪需要。这个领域值得优先阅读，也可以观察：你希望做成的事，是否同时给内心足够的安稳。`:`太阳落在第${sun.house}宫，把发展方向带到${areas[sun.house-1]}；月亮落在第${moon.house}宫，更需要从${areas[moon.house-1]}得到支持。两条线可以彼此补充，也提醒你给不同的需要分别留出位置。`,
  `上升${signs[Math.floor(chart.asc/30)]}则描述进入新环境的起点，倾向${styles[Math.floor(chart.asc/30)]}。接下来的解读会沿上升守护星、突出的行星与重要相位继续展开，看看这些需要怎样在你的盘中连接。`
 ]});
 cards.push({title:`人生的着力点 · ${areas[ruler.house-1]}`,evidence:`上升${signs[Math.floor(chart.asc/30)]} · 守护星${position(ruler)}`,paragraphs:[
  `上升的守护星是${names[ruler.name]}，可以沿它观察你怎样把最初的行动方式落到生活中。它在${signs[Math.floor(ruler.longitude/30)]}第${ruler.house}宫，因此${areas[ruler.house-1]}是这张盘的一条重要发展线。`,
  `${names[ruler.name]}关联${roles[ruler.name]}，在这个星座中更倾向${styles[Math.floor(ruler.longitude/30)]}。可以把这两层放在一起理解：你面对新环境时的姿态，最终会怎样变成这个领域里的具体选择。`,
  `这条线适合用真实经历慢慢核对。选择一件与${areas[ruler.house-1]}有关、而且自己愿意持续投入的事，观察它是否支持你的方向与内心需要。`
 ]});
 for(const p of ranked.filter(p=>!p.ruler).slice(0,2)){
  const why=[['Sun','Moon'].includes(p.name)?'它是太阳或月亮，直接关联自我方向或内心需要':'',p.nearest.orb<=5?`它距${p.nearest.name}约${p.nearest.orb.toFixed(2)}°，与人生轴点靠得很近`:'',p.connections.filter(a=>['Sun','Moon','Mercury','Venus','Mars'].includes(a.a===p.name?a.b:a.a)).length>=2?'它与多颗个人星体形成相位，把数种需要连接在一起':''].filter(Boolean).join('；');
  cards.push({title:`突出行星 · ${names[p.name]}与${areas[p.house-1]}`,evidence:position(p),paragraphs:[`这张盘里，${names[p.name]}值得多看一层：${why||'它在个人星体和相位联系的综合比较中较突出'}。${names[p.name]}描述${roles[p.name]}，这使它成为理解你的选择方式的一条重要线索。`,`落在${signs[Math.floor(p.longitude/30)]}，让这颗星更倾向${styles[Math.floor(p.longitude/30)]}；第${p.house}宫则把它带入${areas[p.house-1]}。它并不包办整个人生，而是说明这个领域里有哪些需要值得认真辨认。`,`当你回顾${areas[p.house-1]}中的重要经历时，可以留意${roles[p.name]}怎样参与其中。下面的相位解读会进一步说明，它与其他需要怎样配合。`]});
 }
 const houseGroups=new Map();for(const p of planets){if(!houseGroups.has(p.house))houseGroups.set(p.house,[]);houseGroups.get(p.house).push(p);}
 const cluster=[...houseGroups].filter(([h,ps])=>ps.length>=3&&ps.some(p=>base[p.name]>=6)).sort((a,b)=>b[1].reduce((s,p)=>s+base[p.name],0)-a[1].reduce((s,p)=>s+base[p.name],0))[0];
 if(cluster){const [house,ps]=cluster;cards.push({title:`集中领域 · ${areas[house-1]}`,evidence:`第${house}宫：${ps.map(p=>names[p.name]).join('、')}`,paragraphs:[`这张盘有${ps.length}颗行星落在第${house}宫，${areas[house-1]}因此同时承载了好几种不同的需要。这里说的是宫位集中，不自动把它判断为星座群星或特定格局。`,`${ps.slice(0,3).map(p=>`${names[p.name]}带来${roles[p.name]}`).join('；')}。同一个领域既可能提供投入的动力，也需要你区分不同需求的优先次序。`,`不必要求所有需要一次得到满足。回到${areas[house-1]}中的具体事项，分清什么支持自我发展、什么照顾内心、什么只是外界的期待，会比笼统追求更有帮助。`]});}
 const scores=new Map(ranked.map(p=>[p.name,p.score])),selected=chart.aspects.filter(a=>['Sun','Moon','Mercury','Venus','Mars'].includes(a.a)||['Sun','Moon','Mercury','Venus','Mars'].includes(a.b)).map(a=>({...a,score:(scores.get(a.a)+scores.get(a.b))/2+(['Sun','Moon'].includes(a.a)||['Sun','Moon'].includes(a.b)?6:0)-a.orb*1.5})).sort((a,b)=>b.score-a.score).slice(0,3);
 for(const a of selected){const p=planets.find(p=>p.name===a.a),q=planets.find(p=>p.name===a.b),pair=pairStories[`${a.a}:${a.b}`]||pairStories[`${a.b}:${a.a}`];cards.push({title:`重要相位 · ${pair?pair[0]:`${names[a.a]}与${names[a.b]}的需要怎样配合`}`,evidence:`${names[a.a]}${a.label}${names[a.b]} · 偏差${a.orb.toFixed(2)}°`,paragraphs:[pair?pair[1]:`${names[a.a]}关联${roles[a.a]}，${names[a.b]}关联${roles[a.b]}。这条相位把两种需要接到一起，是理解你怎样做选择、怎样回应生活的一条线索。`,`${phase[a.angle]}具体到你的盘，${position(p)}与${position(q)}相连，${p.house===q.house?`主要在${areas[p.house-1]}中体现`:`把${areas[p.house-1]}与${areas[q.house-1]}这两个领域联系起来`}。`,pair?pair[2]:`可以从这两个领域的一件实际事情开始，分别说清${names[a.a]}与${names[a.b]}所代表的需要，再安排哪一步先落实。`]});}
 return cards;
}
