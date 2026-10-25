import {calculateWesternChart} from './calculateWesternChart.js';
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
const areas=['自我与行动','财富与价值','学习与表达','家庭与根基','爱情与创造','工作与健康','伴侣与合作','共同资源与信任','远行与信念','事业与方向','朋友与愿景','内在与灵性'];
const roles={Sun:'主动发展与自我表达',Moon:'情绪需要与生活归属',Mercury:'学习、分析与沟通',Venus:'关系经营、审美与价值选择',Mars:'行动效率与边界表达',Jupiter:'学习拓展与成长空间',Saturn:'责任、标准与长期积累',Uranus:'自主性与新的做法',Neptune:'想象、共情与理想边界',Pluto:'深入调整与权责关系'};
const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const actions=['给主动选择与独立行动留出空间','检验技能是否能形成可持续回报','用具体学习与沟通积累方法','经营适合自己的居住环境与家庭边界','主动创造相处机会，也为兴趣和作品留时间','协调工作任务、休息与身体反馈','说清合作意愿、分工与长期承诺','提前明确共享资金、承担与信任边界','把进修、远行或新经验变成可消化的成长','寻找能积累专业深度与明确职责的方向','经营相互支持的团队与长期关系','留出独处整理的时间，把理解带回生活'];
const gap=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function calculateRelocation(natalInput,destination){
 if(!destination||destination.latitude===''||destination.longitude===''||destination.latitude==null||destination.longitude==null)throw new Error('请选择现居城市，或填写完整的目的地坐标。');
 const natal=calculateWesternChart(natalInput);
 // Keep the original civil birth time AND original birth offset: they encode the same instant worldwide.
 const relocated=calculateWesternChart({...natalInput,latitude:destination.latitude,longitude:destination.longitude,place:destination.place||'自定义城市'});
 return {natal,relocated,destination:{...destination}};
}
export function relocationNarrative({natal,relocated}){
 const planets=relocated.planets.filter(p=>names[p.name]),by=Object.fromEntries(planets.map(p=>[p.name,p])),birth=Object.fromEntries(natal.planets.map(p=>[p.name,p]));
 const axes=[{name:'上升',longitude:relocated.asc,house:1},{name:'天底',longitude:(relocated.mc+180)%360,house:4},{name:'下降',longitude:(relocated.asc+180)%360,house:7},{name:'天顶',longitude:relocated.mc,house:10}];
 const angular=planets.flatMap(p=>axes.filter(a=>gap(p.longitude,a.longitude)<=5).map(a=>({planet:p,axis:a,orb:gap(p.longitude,a.longitude)})));
 return areas.map((area,i)=>{
  const h=i+1,ps=planets.filter(p=>p.house===h),old=planets.filter(p=>birth[p.name].house===h),entered=ps.filter(p=>birth[p.name].house!==h),left=old.filter(p=>p.house!==h);
  const lord=by[rulers[Math.floor(relocated.cusps[i]/30)]],oldLord=names[rulers[Math.floor(natal.cusps[i]/30)]];
  const angles=angular.filter(a=>a.axis.house===h);
  const importance=ps.reduce((sum,p)=>sum+(['Sun','Moon'].includes(p.name)?5:['Mercury','Venus','Mars'].includes(p.name)?3:2),0)+angles.reduce((sum,a)=>sum+6-a.orb,0)+(lord.house===h?2:0);
  const stars=importance>=16?5:importance>=11?4:importance>=7?3:importance>=3?2:1;
  const oldAxes=[{longitude:natal.asc,house:1},{longitude:(natal.mc+180)%360,house:4},{longitude:(natal.asc+180)%360,house:7},{longitude:natal.mc,house:10}];
  const oldAngles=natal.planets.filter(p=>names[p.name]).flatMap(p=>oldAxes.filter(a=>a.house===h&&gap(p.longitude,a.longitude)<=5).map(a=>gap(p.longitude,a.longitude)));
  const oldLordPlanet=birth[rulers[Math.floor(natal.cusps[i]/30)]];
  const oldImportance=old.reduce((sum,p)=>sum+(['Sun','Moon'].includes(p.name)?5:['Mercury','Venus','Mars'].includes(p.name)?3:2),0)+oldAngles.reduce((sum,orb)=>sum+6-orb,0)+(oldLordPlanet.house===h?2:0);
  const oldStars=oldImportance>=16?5:oldImportance>=11?4:oldImportance>=7?3:oldImportance>=3?2:1;
  const change=importance-oldImportance;
  const emphasis=change>0.1?'比出生地更突出':change<-.1?'比出生地减弱':'突出程度基本不变';
  const headline=change<-.1&&left.length?`${left.map(p=>names[p.name]).join('、')}移出，${emphasis}`:angles.length?`${names[angles[0].planet.name]}靠近${angles[0].axis.name}，${emphasis}`:entered.length?`${entered.map(p=>names[p.name]).join('、')}移入，${emphasis}`:left.length?`${left.map(p=>names[p.name]).join('、')}移出，${emphasis}`:ps.length?`${ps.map(p=>names[p.name]).join('、')}仍在第${h}宫，${emphasis}`:oldLord!==names[lord.name]?`宫主星由${oldLord}变为${names[lord.name]}`:`仍无主要行星落入，${emphasis}`;

  const support=ps.filter(p=>['Sun','Mercury','Venus','Jupiter'].includes(p.name));
  const demands=ps.filter(p=>['Mars','Saturn','Uranus','Neptune','Pluto'].includes(p.name));
  const relation=relocated.aspects.filter(a=>a.a===lord.name||a.b===lord.name).sort((a,b)=>a.orb-b.orb)[0];
  return {house:h,importance,stars,supportText:support.map(p=>`${names[p.name]}：${roles[p.name]}`).join('；'),demandText:demands.map(p=>`${names[p.name]}：${roles[p.name]}`).join('；'),title:`${area} · ${headline}`,meta:`领域突出度 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)} · 出生地${oldStars}星 → 重置后${stars}星`,evidence:`重置第${h}宫${signs[Math.floor(relocated.cusps[i]/30)]} · 宫主星${names[lord.name]}第${lord.house}宫${angles.map(a=>` · ${names[a.planet.name]}近${a.axis.name}，偏差${a.orb.toFixed(2)}°`).join('')}`,paragraphs:[
  entered.length?`与出生地相比，**${entered.map(p=>names[p.name]).join('、')}从本命${entered.map(p=>`第${birth[p.name].house}宫`).join('、')}进入重置第${h}宫**，把${entered.map(p=>roles[p.name]).join('、')}更多地带向${area}。${left.length?`${left.map(p=>names[p.name]).join('、')}则从这个宫位转入其他领域。`:''}变化来自宫位重新分配，行星本身的星座和相位没有改变。`:ps.length?`**${ps.map(p=>names[p.name]).join('、')}仍在第${h}宫**，所以这个城市延续了本命${area}的主要落宫线索。${angles.map(a=>`${names[a.planet.name]}离${a.axis.name}约${a.orb.toFixed(2)}°，让${roles[a.planet.name]}更容易成为外在生活的关注点。`).join('')}这种延续也值得看，不需要为了比较城市而制造变化。`:`这个城市的第${h}宫没有主要行星落入，**${area}仍可以通过宫主星理解**。它不表示这个领域无法发展，而是缺少直接落宫的强调，需要结合连接领域寻找机会。`,
  `重置第${h}宫宫主星是${names[lord.name]}，落在第${lord.house}宫，连接${areas[lord.house-1]}；出生地的宫主星是${oldLord}。${support.length?`${support.map(p=>`${names[p.name]}带来${roles[p.name]}`).join('；')}，可以作为培养这个领域的支持线索。`:''}${demands.length?`${demands.map(p=>`${names[p.name]}涉及${roles[p.name]}`).join('；')}，也意味着发展时需要处理相应的投入、节奏或边界。`:''}${relation?`宫主星的${names[relation.a]}${relation.label}${names[relation.b]}（偏差${relation.orb.toFixed(2)}°）仍是本命已有关系，搬家不会消除它，需要连同实际条件一起理解。`:''}`,
  `在这个城市，比较值得尝试的是**${actions[i]}**。星级说明这个领域在重置盘中有多突出，不能直接理解为收益、恋爱成功率或城市优劣。把这些线索与就业机会、生活成本、关系网络及你的目标对照，才更容易判断这里是否适合你的发展。`
 ]};
 }).sort((a,b)=>b.stars-a.stars||b.importance-a.importance||a.house-b.house);
}
