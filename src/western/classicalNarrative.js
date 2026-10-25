import {Equator,Horizon,Observer} from '../../node_modules/astronomy-engine/esm/astronomy.js';
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星'};
const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const exaltations={Sun:0,Moon:1,Mercury:5,Venus:11,Mars:9,Jupiter:3,Saturn:6};
// Dorothean triplicities: day, night, participating ruler; no point tally.
const triplicities=[['Sun','Jupiter','Saturn'],['Venus','Moon','Mars'],['Saturn','Mercury','Jupiter'],['Venus','Mars','Moon']];
const topics=['自我与行动','财富与积累','学习与表达','家庭与根基','爱情与创造','工作与健康','伴侣与合作','共同资源','进修与远行','事业与责任','朋友与支持','独处与内在'];
const questions=['怎样争取自己的位置','收入怎样形成并留下来','知识怎样成为可用的技能','怎样建立安稳的生活基础','喜欢怎样获得表达的空间','事务与精力怎样分配','承诺怎样落实为合作','共享与承担怎样分清','学习与视野怎样得到拓展','职业职责怎样获得支撑','哪些连接能够提供帮助','怎样安排休整与幕后准备'];
const methods={Sun:'确定方向、承担主导职责，并让自己的成果被看见',Moon:'照顾生活需要、维持日常节奏，并建立可信赖的关系',Mercury:'学习技能、交换信息，并把想法表达清楚',Venus:'协调彼此的意愿、建立合作，并判断什么值得投入',Mars:'主动尝试、争取机会，并在分歧中维护边界',Jupiter:'扩展知识和经验、寻找发展机会，并形成自己的判断',Saturn:'接受必要规则、反复练习，并把责任和成果长期积累下来'};
const venues=['你自己的选择、行动和对外表现','收入、预算和能够独立支配的资源','日常交流、技能练习和信息往来','居住安排、家人关系和私人生活','恋爱、创作和真正愿意投入的兴趣','日常事务、工作负担和精力分配','伴侣、客户和需要协商的一对一合作','共同资金、借贷和双方承担的责任','进修、远行和接触不同知识体系','职业职责、组织评价和公开成果','朋友、社群和共同项目','独处、幕后工作和休整'];
const actions=['先做一个由自己决定的小项目，用行动检验方向','把收入方式、投入成本和留下的结余放在一起核对','选一项技能持续练习，并让学习产生可展示的成果','把居住、照顾家人和个人休息的安排谈清楚','给喜欢的人或创作留出实际时间，表达具体的意愿','把必须完成的事务与可用精力对齐，给休息留出位置','把承诺落实为时间安排、分工和可以商量的边界','明确共同资金的归属、使用权限和承担方式','选择能够拓展判断的学习或经历，避免只收集观点','选择能够累积专业成果的职责，并明确评价标准','围绕一个共同目标合作，观察谁愿意持续参与','留出不被事务占满的时间，将幕后准备转成下一步行动'];
const drives={Sun:'明确主导权和发展方向',Moon:'照顾需求与建立安稳感',Mercury:'用学习和沟通打开局面',Venus:'通过合作与协调推进',Mars:'主动争取，也要处理分歧',Jupiter:'通过探索扩大选择',Saturn:'通过责任与长期积累建立位置'};
const gap=(a,b)=>Math.abs(((a-b+540)%360)-180);
const signIndex=p=>Math.floor(((p.longitude%360)+360)%360/30);
export function classicalConditions(chart){
  const by=Object.fromEntries(chart.planets.filter(p=>names[p.name]).map(p=>[p.name,p]));
  const date=new Date(chart.utc),observer=new Observer(Number(chart.input.latitude),Number(chart.input.longitude),0);
  const eq=Equator('Sun',date,observer,true,true);
  const altitude=Horizon(date,observer,eq.ra,eq.dec).altitude;
  const day=altitude>=0;
  const states={};
  for(const p of Object.values(by)){
    const s=signIndex(p),host=rulers[s],dignities=[];
    if(host===p.name)dignities.push('入庙');
    if(exaltations[p.name]===s)dignities.push('擢升');
    const detriment=rulers[(s+6)%12]===p.name,fall=(exaltations[p.name]+6)%12===s;
    const tri=triplicities[s%4];
    if(tri[day?0:1]===p.name)dignities.push('当令三分主星');
    else if(tri[2]===p.name)dignities.push('参与三分主星');
    const distance=gap(p.longitude,by.Sun.longitude);
    const solar=['Mercury','Venus','Mars','Jupiter','Saturn'].includes(p.name)?distance<=17/60?'日心':distance<8.5&&s===signIndex(by.Sun)?'灼伤':distance<17?'日光下':null:null;
    const sect=p.name==='Mercury'?null:(day?['Sun','Jupiter','Saturn']:['Moon','Venus','Mars']).includes(p.name);
    const angular=[1,4,7,10].includes(p.house),cadent=[3,6,9,12].includes(p.house);
    states[p.name]={p,host,dignities,detriment,fall,solar,sect,angular,cadent};
  }
  return {by,states,day,altitude};
}
function conditionText(s,topic){
  const n=names[s.p.name],good=s.dignities.length?`${n}有**${s.dignities.join('、')}**，在古占中这为“${methods[s.p.name]}”提供了较适合发挥的条件。`:'';
  return good+(s.detriment||s.fall?` ${n}处于**${[s.detriment?'失势':'',s.fall?'落陷':''].filter(Boolean).join('、')}**：想通过${methods[s.p.name]}推进${topic}时，较容易遇到与自身节奏不同的要求，需要先谈清规则、分工和能自主决定的部分。`:'')+
    (s.angular?` 第${s.p.house}宫是角宫，${topic}更容易通过${venues[s.p.house-1]}直接进入行动，不只是停留在想法中。`:s.cadent?` 第${s.p.house}宫是果宫，${topic}较多通过${venues[s.p.house-1]}逐步推进；学习、服务或准备的过程，比马上得到公开结果更值得留意。`:` 第${s.p.house}宫是续宫，${topic}更需要在${venues[s.p.house-1]}中保持连续投入，关注成果能否留下来。`)+
    (s.p.retrograde?' 逆行又增加了回顾、修改或反复处理的意味。':'')+
    (s.solar==='日心'?' 距太阳不超过17′，本版按日心处理，单独作为集中与强化的条件。':s.solar==='灼伤'?' 与太阳同星座且相距不足8.5°，处于灼伤范围：其事务可能被更强的职责、权威或目标覆盖，需要为自身需求争取表达空间。':s.solar==='日光下'?' 与太阳相距不足17°，处于日光下；相关行动的可见性与自主空间需要一并考虑。':'');
}
export function classicalNarrative(chart){
  const {by,states,day,altitude}=classicalConditions(chart);
  const lord=h=>by[rulers[Math.floor(chart.cusps[h-1]/30)]],ascLord=lord(1);
  const reception=(a,b)=>rulers[signIndex(a)]===b.name||exaltations[b.name]===signIndex(a);
  const cards=topics.map((topic,i)=>{
    const h=i+1,p=lord(h),s=states[p.name],occupants=Object.values(by).filter(q=>q.house===h);
    const links=chart.aspects.filter(a=>a.a===p.name||a.b===p.name).sort((a,b)=>a.orb-b.orb).slice(0,2);
    const host=by[s.host],hs=states[host.name];
    const supported=s.dignities.length>0&&!s.detriment&&!s.fall,visible=s.angular;
    const subtitle=s.solar==='灼伤'?'在强势职责之外保留自主空间':drives[p.name];
    const importance=occupants.reduce((v,q)=>v+(['Sun','Moon'].includes(q.name)?5:3),0)+(p.name===ascLord.name?4:0)+(visible?3:0)+links.length+(h===10||h===7?1:0);
    const stars=Math.min(5,Math.max(1,Math.ceil(importance/4)));
    const linkText=links.map(a=>{
      const q=by[a.a===p.name?a.b:a.a],incoming=reception(p,q),outgoing=reception(q,p),mutual=incoming&&outgoing;
      const concrete=`${names[q.name]}把“${methods[q.name]}”带进${topic}，并牵涉${venues[q.house-1]}`;
      return `${names[p.name]}${a.label}${names[q.name]}（偏差${a.orb.toFixed(2)}°），${concrete}。${mutual?`两者通过庙或擢升**互容**，可以用${topics[q.house-1]}中的安排承接${topic}，也让${topic}反过来服务这部分生活；${[90,180].includes(a.angle)?'不过，互容没有取消分歧，双方要求仍要逐项协调。':'两条线有相互支持的入口。'}`:incoming?`${names[q.name]}通过庙或擢升接纳${names[p.name]}，因此“${methods[q.name]}”可以成为${topic}的帮助方式。`:outgoing?`${names[p.name]}通过庙或擢升接纳${names[q.name]}，因此，在${topic}中需要为“${methods[q.name]}”留出位置；相应的安排主要发生在${venues[q.house-1]}。`:[90,180].includes(a.angle)?`两者没有庙或擢升接纳：推进${topic}与照顾${topics[q.house-1]}可能争用时间或要求不同做法，需要明确先后顺序。`:`这条相位较适合把${topics[q.house-1]}中的经验和安排用到${topic}，而不是让两部分生活各自运转。`}`;
    }).join(' ');
    const sectText=['Mars','Saturn','Jupiter','Venus'].includes(p.name)?`在这张${day?'昼':'夜'}盘中，${names[p.name]}${s.sect?'属于同阵营':'不属于同阵营'}。${p.name==='Saturn'?(s.sect?'它的限制更适合以规则、耐心与长期建设来运用。':'其责任与延迟较需要缓冲，不宜把所有要求同时压在自己身上。'):p.name==='Mars'?(s.sect?'行动与争取较适合被具体目标承接。':'行动与冲突较需要节奏和边界，过快推进容易增加消耗。'):p.name==='Jupiter'?(s.sect?'拓展知识、寻求指导和争取发展机会，是较适合运用的助力。':'拓展的意愿需要和投入能力对齐，避免机会增加时承诺也不断增加。'):(s.sect?'协调关系、取得共识和建立合作，是较适合运用的助力。':'希望维持和谐时，也要讲清投入和责任，避免为了好相处而接受不合适的安排。')}`:'';
    return {house:h,importance,stars,title:`${topic} · ${subtitle}`,meta:`重要性 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}`,evidence:`第${h}宫${signs[Math.floor(chart.cusps[i]/30)]} · 宫主星${names[p.name]}${signs[signIndex(p)]}第${p.house}宫`,paragraphs:[
      `这张盘的${topic}，重点在于**${methods[p.name]}**。依据是第${h}宫由${names[p.name]}掌管，落在第${p.house}宫：${p.house===h?`这部分生活较直接取决于你怎样处理${venues[p.house-1]}。`:`它把${topic}带到${venues[p.house-1]}中；例如，${actions[p.house-1]}，会参与这部分生活的发展。`}${occupants.length?`第${h}宫的${occupants.map(q=>names[q.name]).join('、')}又加入了${occupants.map(q=>methods[q.name]).join('；')}的要求。`:''}`,
      conditionText(s,topic)+' '+sectText,
      host.name===p.name?`${names[p.name]}落在自己掌管的星座，**${methods[p.name]}**本身就是这部分生活的重要手段，较能按自己的方式组织它。 ${linkText}`:`${names[p.name]}在${signs[signIndex(p)]}，由${names[host.name]}定位。换成生活里的意思：想要${methods[p.name]}，落实时的做法是**${methods[host.name]}**。这件事主要发生在${venues[host.house-1]}，因为${names[host.name]}落在第${host.house}宫。${hs.dignities.length?`${names[host.name]}有${hs.dignities.join('、')}，使这种做法较有发挥条件。`:''}${hs.detriment||hs.fall?`${names[host.name]}也有失势或落陷，这条路径容易遇到不同规则或期待，需要先确认自己能决定什么、哪些事必须协商。`:''}${hs.p.retrograde?`${names[host.name]}逆行，推进时较可能反复修改做法；适合留下调整余地。`:''}${host.name==='Mars'&&!hs.sect?'火星不属本盘阵营，主动争取的同时尤其需要控制冲突与过度消耗。':host.name==='Saturn'&&!hs.sect?'土星不属本盘阵营，责任和等待需要设定边界，避免把持续承担变成无法停下。':''} ${linkText}`,
      `可以从一件具体的事开始：**${actions[i]}**。${p.house!==h?`同时留意${venues[p.house-1]}会怎样参与这件事，把这条宫主星联系用到实际安排里。`:''}${h===6?'这里描述劳务、精力与日常负担，不从星体状态推断疾病。':''}`
    ]};
  }).sort((a,b)=>b.importance-a.importance||a.house-b.house);
  return [{title:`整张盘的主线 · ${day?'昼盘':'夜盘'}中的资源与落实条件`,evidence:`太阳几何高度${altitude.toFixed(2)}° · 命主星${names[ascLord.name]}第${ascLord.house}宫`,paragraphs:[
    `出生时太阳在地平线${day?'上':'下'}方，因此这是**${day?'昼盘':'夜盘'}**。${day?'太阳、木星、土星属于昼间阵营；土星的约束较容易被规则承接，火星的急切则较需要管理。':'月亮、金星、火星属于夜间阵营；火星的行动较容易获得承接，土星的压力则较需要缓冲。'}这不是吉凶结论，而是判断同一颗星为什么在不同盘中需要不同处理方式的起点。`,
    `本盘优先阅读**${cards.slice(0,3).map(c=>topics[c.house-1]).join('、')}**。命主星${names[ascLord.name]}落第${ascLord.house}宫，使${topics[ascLord.house-1]}成为连接自我与生活条件的一条主线。下面每个主题都会同时回答：负责它的行星有没有资源、在哪里落实，以及谁能承接它。`,
    '采用七星宫主星、入庙与失势、擢升与落陷、多罗修斯昼夜及参与三分主星、角续果宫、逆行和太阳距离，并在主要相位中判断庙与擢升接纳。星级表示关注重点，不以尊贵分数预测人生结果。界、面、入相出相与完整海兹尚未纳入；水星不按太阳前后方粗略归入昼夜阵营。'
  ]},...cards];
}
