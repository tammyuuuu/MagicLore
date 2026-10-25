import {calculateWesternChart,houseOf} from './calculateWesternChart.js';
import {localToUtc,tropicalLongitude,isRetrograde} from '../vedic/astronomy.js';
const day=86400000;
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',MC:'天顶'};
const labels={0:'合相',60:'六合',90:'刑相',120:'拱相',180:'对冲'};
export function financeRelevance(row){
 const moneyHouse=[2,8].includes(row.natalHouse);
 if(row.topicHouse===2)return {stars:moneyHouse?5:4,reason:moneyHouse?'直接触及第2宫宫主，且宫主落在财务宫':'直接触及第2宫宫主，关联个人收入与资源'};
 if(row.topicHouse===8)return {stars:moneyHouse?5:4,reason:moneyHouse?'直接触及第8宫宫主，且宫主落在财务宫':'直接触及第8宫宫主，关联共同资金与财务责任'};
 if(row.target==='MC'||row.topicHouse===10)return {stars:moneyHouse?3:1,reason:moneyHouse?'事业宫主落在财务宫，职业与资金有间接联系':'主要关联职业方向，直接财务依据较少'};
 return {stars:moneyHouse?3:2,reason:moneyHouse?'价值与交换主题落在财务宫，提供辅助联系':'价值与交换的辅助线索，未直接触及财务宫主'};
}
export function financeTargets(chart){
 const rows=[];
 for(const [house,category] of [[2,'income'],[8,'shared'],[10,'income']]){
  const name=rulers[Math.floor(chart.cusps[house-1]/30)],planet=chart.planets.find(p=>p.name===name);
  rows.push({name,longitude:planet.longitude,role:`第${house}宫宫主星${names[name]}`,category,topicHouse:house,natalHouse:planet.house});
 }
 rows.push({name:'MC',longitude:chart.mc,role:'天顶（事业方向）',category:'income',topicHouse:10},{name:'Venus',longitude:chart.planets.find(p=>p.name==='Venus').longitude,role:'本命金星（价值与资源选择）',category:'income',topicHouse:0,natalHouse:chart.planets.find(p=>p.name==='Venus').house});
 return rows;
}
export function financeSignals(targets,positions){
 const hits=[];
 for(const [planet,longitude] of Object.entries(positions))for(const target of targets){
  const gap=Math.abs(((longitude-target.longitude+540)%360)-180);
  for(const angle of [0,60,90,120,180]){
   const orb=Math.abs(gap-angle);if(orb>2)continue;
   const supportive=['Jupiter','Saturn'].includes(planet)&&[0,60,120].includes(angle);
   if(!supportive&&![0,90,180].includes(angle))continue;
   const category=supportive?target.category:'pressure';
   hits.push({key:`${category}:${planet}:${target.name}:${target.topicHouse??''}:${angle}`,category,planet,target:target.name,role:target.role,topicHouse:target.topicHouse,natalHouse:target.natalHouse,angle,orb,title:`行运${names[planet]}${labels[angle]}${target.role}`});
  }
 }
 return hits;
}
export function scanFinanceWindows(input,startDate,options={}){
 return (async()=>{
 const natal=calculateWesternChart(input),targets=financeTargets(natal);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate))throw new Error('请填写完整扫描起始日期。');
 const start=localToUtc(startDate,'12:00',input.offset),endLocal=new Date(`${startDate}T12:00:00Z`);
 if(endLocal.toISOString().slice(0,10)!==startDate)throw new Error('扫描日期无效。');
 const years=options.years??5;if(!Number.isInteger(years)||years<1||years>30)throw new Error('扫描时长需为1至30年。');
 endLocal.setUTCFullYear(endLocal.getUTCFullYear()+years);
 const end=localToUtc(endLocal.toISOString().slice(0,10),'12:00',input.offset);
 if(start.getUTCFullYear()<1800||end.getUTCFullYear()>2100)throw new Error('扫描范围需在1800至2100年内。');
 const active=new Map(),windows=[],months=new Map(),total=Math.round((end-start)/day);
 for(let i=0;i<total;i++){
  const utc=new Date(start.getTime()+i*day),date=new Date(Date.parse(`${startDate}T12:00:00Z`)+i*day).toISOString().slice(0,10);
  const positions=Object.fromEntries(['Jupiter','Saturn','Uranus','Neptune','Pluto'].map(name=>[name,tropicalLongitude(name,utc)]));
  const seen=new Set(),month=date.slice(0,7);if(!months.has(month))months.set(month,{month,income:0,shared:0,pressure:0,days:0});const bucket=months.get(month);bucket.days++;
  for(const hit of financeSignals(targets,positions)){
   if(seen.has(hit.key))continue;seen.add(hit.key);bucket[hit.category]+=1-hit.orb/2;
   let row=active.get(hit.key);
   if(!row){row={...hit,start:date,end:date,peak:date,minOrb:hit.orb,clippedStart:i===0};windows.push(row);active.set(hit.key,row);}
   row.end=date;if(hit.orb<row.minOrb){row.minOrb=hit.orb;row.peak=date;}row.clippedEnd=i===total-1;
  }
  for(const key of active.keys())if(!seen.has(key))active.delete(key);
  if(i%90===0){options.onProgress?.(Math.round(100*i/total));await new Promise(resolve=>setTimeout(resolve,0));}
 }
 for(const row of windows){const peakUtc=localToUtc(row.peak,'12:00',input.offset);row.transitHouse=houseOf(tropicalLongitude(row.planet,peakUtc),natal.cusps);row.retrograde=isRetrograde(row.planet,peakUtc);Object.assign(row,financeWindowReading(row,windows),financeExplanation(row,natal));}
 options.onProgress?.(100);
 const monthly=[...months.values()].map(row=>({...row,income:row.income/row.days,shared:row.shared/row.days,pressure:row.pressure/row.days}));const maximum=Math.max(1e-9,...monthly.flatMap(row=>[row.income,row.shared,row.pressure]));
 return {start:startDate,end:new Date(endLocal.getTime()-day).toISOString().slice(0,10),targets,windows:windows.sort((a,b)=>a.minOrb-b.minOrb||a.start.localeCompare(b.start)),days:total,monthly:monthly.map(row=>({...row,income:100*row.income/maximum,shared:100*row.shared/maximum,pressure:100*row.pressure/maximum}))};
 })();
}
const domains={2:['自己的收入与劳动报酬','报酬是否匹配投入、收入来源是否稳定','收入来源、定价和固定支出'],8:['合作分账与共同承担的钱','分账规则、共同支出和双方责任是否写清','分账、借款和共同支出'],10:['职业方向与工作责任','岗位权责、成果评价与职业路径是否一致','岗位职责、报酬条件和发展空间'],0:['付出与回报是否值得','关系中的交换、消费偏好和投入回报是否平衡','付出、消费和合作交换']};
const areas=['自我定位与行动','个人收入与价值感','沟通、学习和技能','家庭与居住安排','创作与个人项目','日常工作与习惯','一对一合作','共同财务与责任','进修与专业视野','职业角色与公众评价','团队与长期计划','休整与幕后准备'];
const signNames=['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
const planetRoles={Sun:'自我方向、选择与被认可',Moon:'安全感、生活需要与情绪',Mercury:'思考、技能、谈判与信息',Venus:'价值判断、关系交换与享受',Mars:'行动、争取与边界',Jupiter:'扩展、学习与发展空间',Saturn:'责任、限制、规则与长期积累',Uranus:'改变旧方式、独立与突破',Neptune:'理想、想象与容易模糊的界限',Pluto:'权力、深层调整与控制关系'};
export function financeExplanation(row,natal){
 const moving=natal.planets.find(p=>p.name===row.planet),target=natal.planets.find(p=>p.name===row.target);
 const ruled=name=>natal.cusps.map((lon,i)=>rulers[Math.floor(lon/30)]===name?i+1:null).filter(Boolean);
 const rulerText=name=>{const houses=ruled(name);return houses.length?`按本页采用的宫主规则，掌管${houses.map(h=>`第${h}宫（${areas[h-1]}）`).join('、')}。`:'在本页采用的宫主规则里，不单独担任宫主。';};
 const location=p=>`${signNames[Math.floor(p.longitude/30)]}座、第${p.house}宫（${areas[p.house-1]}）`;
 const first=`行运${names[row.planet]}是正在移动的一端，象征${planetRoles[row.planet]}。最接近日期时它落入你的本命第${row.transitHouse}宫，表示这些要求可以从${areas[row.transitHouse-1]}这个领域被观察。`;
 const firstNatal=moving?`你的本命${names[row.planet]}位于${location(moving)}；${rulerText(row.planet)}本命位置与当前行运位置是两层资料，不能混为同一个宫位。`:'';
 const careerRulerName=rulers[Math.floor(natal.cusps[9]/30)],careerRuler=natal.planets.find(p=>p.name===careerRulerName);
 let second,chain,wealthReason,connection;
 if(row.target==='MC'){
  second=`天顶是出生时的一个角度，不是行星。这里用它观察职业方向、社会角色与外界评价；这层含义与第10宫有关。${natal.input?.system&&natal.input.system!=='placidus'?`你采用${natal.input.system==='whole'?'整宫':'等宫'}制，天顶不一定是第10宫宫头；这里分别读取天顶相位与第10宫宫主关系。`:''}你的第10宫宫头在${signNames[Math.floor(natal.cusps[9]/30)]}座，宫主星是${names[careerRulerName]}，落在本命第${careerRuler.house}宫（${areas[careerRuler.house-1]}）。`;
  chain=`天顶 → 第10宫职业方向 → 宫主星${names[careerRulerName]} → 第${careerRuler.house}宫${areas[careerRuler.house-1]}`;
  if([2,8].includes(careerRuler.house)){connection='职业与财务的间接联系';wealthReason=`因为事业宫主星落在第${careerRuler.house}宫，所以职业主题与${careerRuler.house===2?'个人收入、报酬和价值感':'共同财务、分账和他人资源'}存在本命结构上的联系。因此把这个相位放入财务观察，但它首先仍是职业相位，不能单独推成收入增加。`;}
  else{connection='职业为主，财务依据有限';wealthReason=`这条链首先落到${areas[careerRuler.house-1]}，没有直接落入第2宫或第8宫。因此它放在这里是为了观察职业对收入的可能间接影响；单凭这条配置，不能称为明确的财富机会。`;}
 }else{
  second=`被触及的是你的本命${names[row.target]}，象征${planetRoles[row.target]}，位于${location(target)}。${rulerText(row.target)}${row.topicHouse?`本卡专门读取它作为第${row.topicHouse}宫宫主的身份。`:'本卡读取金星的价值与交换主题，并不把金星自动等同于财富。'}`;
  chain=row.topicHouse?`第${row.topicHouse}宫${areas[row.topicHouse-1]} → 宫主星${names[row.target]} → 第${target.house}宫${areas[target.house-1]}`:`金星的价值与交换主题 → 第${target.house}宫${areas[target.house-1]}`;
  connection=row.topicHouse===2?'直接涉及收入宫':row.topicHouse===8?'直接涉及共同财务':row.topicHouse===10?'职业与财务的间接联系':'价值与交换的辅助线索';
  wealthReason=row.topicHouse===2?'第2宫用来观察个人收入、拥有的资源和价值感。相位直接触及它的宫主，所以财务关联来自这个宫主关系，不能只凭行运行星的名字判断。':row.topicHouse===8?'第8宫用来观察共同财务及与别人共同承担的钱。这里更接近分账、共享资金和责任边界，不等于你的个人收入会增加。':row.topicHouse===10?`第10宫先说明职业。它的宫主星落第${target.house}宫，把职业与${areas[target.house-1]}联系起来。${[2,8].includes(target.house)?'这里确实接到财务宫，因此值得核对工作安排如何影响报酬或共同财务。':'这是一条职业线索，和财富的关系仍是间接的，不能作为明确的收入证据。'}`:`金星关联价值选择与交换；本命第${target.house}宫提供发生领域。只有进一步接到收入或共同财务的宫位及宫主关系，才有更具体的金钱含义。本卡是辅助观察，不是获利指标。`;
 }
 const aspectReason={0:'合相约为0°：两端主题集中在一起。这里需要把行运行星提出的要求，与被触及的职业或财务主题一起处理；集中也可能意味着压力增加。',60:'六合约为60°：两端有可以主动建立的合作空间。实际落实通常需要争取、沟通或安排，不等于机会自动发生。',120:'拱相约为120°：在占星解释中，两端较容易配合。因此可把行运行星的主题用于被触及的领域，但“较易配合”不代表已经获得报酬。',90:'刑相约为90°：两端要求可能相互牵制。它提示需要调整成本、时间或责任，并不能直接推断财务损失。',180:'对冲约为180°：两端需求需要协调。可以观察自己的安排与外界要求怎样分配，但不能单凭对冲断定结果好坏。'}[row.angle];
 const synthesis=row.planet==='Saturn'&&row.target==='MC'&&row.angle===120?'把这三层合起来：土星代表规则与长期积累，天顶代表职业位置，拱相表示两者较容易配合。因此可以观察已有经验、承担责任和建立清晰标准，是否帮助职业位置稳定下来。只有岗位、报酬或实际收入也发生对应变化，才能进一步讨论财务结果。':`${names[row.planet]}带来“${planetRoles[row.planet]}”这一主题，相位连接到${row.target==='MC'?'职业方向':row.role}。再沿上面的宫主链判断它是否真的接到财务领域，这才是本卡解读的依据。`;
 const theme=row.target==='MC'||row.topicHouse===10?'事业方向':row.topicHouse===2?'收入与资源':row.topicHouse===8?'共同财务':'价值与交换';
 const opening={Saturn:'把相关安排慢慢做稳',Jupiter:'为新的发展留出空间',Uranus:'重新寻找适合自己的方式',Neptune:'把心里的期待与现实条件对照',Pluto:'看清深层的权责关系，逐步调整失衡的安排'}[row.planet];
 const cooperation={0:'两种主题会集中到一起，需要同时回应',60:'两者有可以主动建立的联系，适合通过沟通和安排把它落实',120:'两者比较容易配合，更适合运用已经积累的经验',90:'两者之间可能出现牵制，需要重新安排时间、成本或责任',180:'两端的需要都值得照顾，重点是找到可以协调的安排'}[row.angle];
 const targetRole=row.target==='MC'?'职业方向与社会位置':planetRoles[row.target];
 let introduction=`这段时间的重点，是${opening}。${names[row.planet]}代表${planetRoles[row.planet]}，${row.target==='MC'?'天顶':`本命${names[row.target]}`}代表${targetRole}；形成${labels[row.angle]}时，${cooperation}。`;
 if(row.planet==='Saturn'&&row.target==='MC'&&row.angle===120)introduction='这段时间的重点，是把事业慢慢做稳。土星代表责任、规则和长期积累，天顶代表职业方向与社会位置；形成拱相时，两者比较容易配合，所以更适合确认长期方向、承担重要职责，或把已有经验变成稳定能力。';
 let personal;
 if(row.target==='MC'){
  const placidus=!natal.input?.system||natal.input.system==='placidus';
  personal=`你的天顶落在${signNames[Math.floor(natal.mc/30)]}座${placidus?`，第10宫的宫主星是${names[careerRulerName]}`:`。你采用${natal.input.system==='whole'?'整宫':'等宫'}制，天顶和第10宫宫头分别读取；第10宫在${signNames[Math.floor(natal.cusps[9]/30)]}座，宫主星是${names[careerRulerName]}`}，而${names[careerRulerName]}落在第${careerRuler.house}宫。第${careerRuler.house}宫和${areas[careerRuler.house-1]}有关，${[2,8].includes(careerRuler.house)?`因此这次虽然首先是事业主题，但职业上的变化也可能进一步影响${careerRuler.house===2?'收入、资源与价值感':'共同资金、分账与财务责任'}。`:'因此这次更适合从职业与这个生活领域的联系来理解，和财富的关系仍需结合实际报酬安排来看。'}`;
 }else personal=`这次触及的，是你的本命${names[row.target]}。它落在${signNames[Math.floor(target.longitude/30)]}座第${target.house}宫，和${areas[target.house-1]}这个领域相连。${row.topicHouse?`同时，它掌管第${row.topicHouse}宫，关联${areas[row.topicHouse-1]}。所以这次行运会把这两个领域带到一起：${wealthReason}`:wealthReason}`;
 const houses=ruled(row.planet);
 const natalThread=moving?`同时，你的本命${names[row.planet]}落在${signNames[Math.floor(moving.longitude/30)]}座第${moving.house}宫${houses.length?`，并掌管${houses.map(h=>`第${h}宫`).join('和')}`:'，在这里采用的宫主体系中不单独担任宫主'}。理解这次行运时，可以把${names[row.planet]}的主题放回这层本命背景，联系${[...new Set([areas[moving.house-1],...houses.map(h=>areas[h-1])])].join('、')}来看。`:'';
 const current=`这段时间，行运${names[row.planet]}经过你的本命第${row.transitHouse}宫，说明这段经历也和${areas[row.transitHouse-1]}有关。${row.transitHouse===1?'这不只是外在安排的变化，也关系到你怎样定位自己、怎样开始行动。':`可以留意这个领域的实际变化，怎样与${theme}互相影响。`}`;
 const topic=row.target==='MC'?10:row.topicHouse||0;
 const leads={
  Saturn:{10:'事业要走得长，职责和位置就需要慢慢落定。',2:'谈到收入，这次更值得留意的是它能否持续，以及你为它承担了多少。',8:'共同承担的钱，往往需要先把双方的责任说清。',0:'有些付出值得长期坚持，有些则需要重新衡量。'},
  Jupiter:{10:'职业的发展空间，是这次相位可以留意的一条线索。',2:'收入有没有拓展空间，可以从新的渠道和已有能力之间的联系来看。',8:'合作可能带来资源，也会带来新的承诺。',0:'面对想增加的投入，先看看它能带来怎样的回报。'},
  Uranus:{10:'如果旧的职业路径已不合适，这次相位可以用来观察调整的方向。',2:'收入方式的变化，比单纯关注收入数字更值得留意。',8:'合作规则是否还适合双方，是共同财务中需要重新核对的部分。',0:'原有的交换方式，可能需要给新的选择留一点空间。'},
  Neptune:{10:'职业上的理想，需要找到可以落实和核对的条件。',2:'看上去有吸引力的收入设想，需要与确定的报酬分开来看。',8:'涉及共同资金时，模糊的承诺尤其需要说清。',0:'想得到的回报与实际得到的回报，值得放在一起比较。'},
  Pluto:{10:'职业中的决定权与责任分配，是这次解读的切入点。',2:'收入结构里是否存在过度依赖，可以借这个相位重新审视。',8:'共同财务不仅涉及钱，也涉及谁决定、谁承担后果。',0:'在持续投入的关系里，自己的选择空间也值得照顾。'}
 };
 const aspectBridge={0:`合相让${names[row.planet]}的主题与${row.target==='MC'?'职业位置':`本命${names[row.target]}`}靠得很近，相关要求可能集中出现。`,60:'六合提供了可以主动连接的空间，通常需要通过沟通、争取或具体安排来落实。',120:'拱相让两端较容易配合，可以先从已有经验和条件中寻找接点。',90:'刑相更容易显出两端的牵制，先看清时间、成本与责任哪里不匹配。',180:'对冲把两端的不同需要摆到面前，更适合协商安排和边界。'}[row.angle];
 if(!(row.planet==='Saturn'&&row.target==='MC'&&row.angle===120))introduction=`${leads[row.planet][topic]}${names[row.planet]}象征${planetRoles[row.planet]}，而${row.target==='MC'?'天顶关联职业方向与社会位置':`${names[row.target]}关联${targetRole}`}。${aspectBridge}`;
 else introduction=introduction.replace('这段时间的重点，是把事业慢慢做稳。','先把事业慢慢做稳，是这段时间可以把握的方向。');
 if(row.target!=='MC')personal=personal.replace(`这次触及的，是你的本命${names[row.target]}。它落在`,`${row.topicHouse?`这次与${theme}的联系，来自你的第${row.topicHouse}宫。它由${names[row.target]}掌管。`:`这层联系要回到你的本命${names[row.target]}来看。`}本命${names[row.target]}落在`).replace('同时，它掌管','它也掌管').replace('所以这次行运会把这两个领域带到一起：','这就把两个生活领域联系起来。');
 if(row.planet===row.target)introduction=introduction.replace(`，而${names[row.target]}关联${targetRole}`,'；这里触及的是本命中同一颗行星');
 if(row.target!=='MC'){
  const place=`你的本命${names[row.target]}落在${signNames[Math.floor(target.longitude/30)]}座第${target.house}宫`;
  personal=row.topicHouse===2?`收入这条线来自第2宫，它的宫主星是${names[row.target]}。${place}，于是个人收入与${areas[target.house-1]}发生联系。这次相位触及这颗宫主星，因此可以沿这条关系观察收入安排，而不只是凭${names[row.planet]}的名字判断财运。`:row.topicHouse===8?`第8宫由${names[row.target]}掌管，观察的是共同资金、分账及双方承担的钱。${place}，把共同财务带到${areas[target.house-1]}这个领域。因此这里的重点是合作中的资源与责任，不应直接理解成个人收入增加。`:row.topicHouse===10?`这颗${names[row.target]}为什么与职业有关？因为它掌管你的第10宫。${place}，职业方向便与${areas[target.house-1]}联系起来。${[2,8].includes(target.house)?'这个落宫接到了财务领域，可以进一步看工作安排怎样影响报酬或共同资金。':'这首先是职业线索，是否影响收入，还要看实际的岗位与报酬安排。'}`:`从本命背景看，${place}。金星的价值与交换主题落在${areas[target.house-1]}中，所以这次可以从这里衡量投入与回报；它提供的是选择的线索，不能单凭这一相位判断获利。`;
  personal=personal.replace(`这颗${names[row.target]}为什么与职业有关？因为它掌管你的第10宫。`,`职业上的联系来自第10宫，它由${names[row.target]}掌管。`);
 }
 const showNatal=row.target==='MC'||moving?.house===2||moving?.house===8||houses.includes(2)||houses.includes(8);
 const localLead={10:'事业方向还需要落实到你自己的生活安排中。',2:'回到收入的具体来源，也可以留意',8:'双方怎样处理共同资金，还会涉及',0:'真正衡量是否值得时，不妨看看'}[topic];
 const localContext=`${localLead}${topic===10?'':`${areas[row.transitHouse-1]}。`}这段时间，行运${names[row.planet]}经过你的本命第${row.transitHouse}宫。${row.transitHouse===1?'你怎样定位自己、怎样开始行动，会参与这段经历。':`它把${planetRoles[row.planet]}的主题带到${areas[row.transitHouse-1]}中，可以从这里观察与${theme}的联系。`}`;
 const narrative=row.target==='MC'?[introduction,personal,natalThread,localContext]:row.topicHouse===8?[personal,introduction,showNatal?natalThread:localContext,showNatal?localContext:'']:[introduction,personal,showNatal?`${natalThread} ${localContext}`:localContext];
 return {relevance:financeRelevance({...row,natalHouse:row.target==='MC'?careerRuler.house:row.natalHouse}),connection,chain,narrative:narrative.filter(Boolean),theme,explanation:[{title:`① ${names[row.planet]}扮演什么角色`,text:first,note:firstNatal},{title:`② ${row.target==='MC'?'天顶':names[row.target]}扮演什么角色`,text:second},{title:`③ ${labels[row.angle]}怎样连接两端`,text:aspectReason},{title:'④ 为什么与财富有关',text:wealthReason},{title:'⑤ 合起来怎样理解',text:synthesis}],readingBasis:'先算实际相位，再读取行星象征、宫位领域与宫主关系。这是占星解释的规则，不是统计验证的收益预测；本页没有加入推运、太阳返照或现实财务数据。'};
}
export function financeWindowReading(row,windows=[]){
 const domain=domains[row.topicHouse]||domains[0];
 const focus={Jupiter:'增加机会与扩大投入',Saturn:'落实责任与建立稳定安排',Uranus:'调整旧模式与尝试新路径',Neptune:'澄清理想与实际条件',Pluto:'重订权责与减少失衡'}[row.planet];
 const titles={Jupiter:{10:'工作发展：机会来了，条件也要谈清',2:'收入拓展：多一条路，也要算清成本',8:'合作资源：机会与责任一起看',0:'投入回报：判断什么值得增加'},Saturn:{10:'职业建设：把责任变成明确的位置',2:'收入稳定：先把收支结构立起来',8:'共同财务：把双方责任落实',0:'价值选择：减少不值得的长期付出'},Uranus:{10:'职业调整：旧路径可能需要换一种做法',2:'收入方式：为变化留出余地',8:'合作变化：重新核对共同规则',0:'交换方式：重新选择适合自己的安排'},Neptune:{10:'职业理想：把期待变成可核对的条件',2:'收入判断：分清设想与确定收入',8:'共同资金：把模糊承诺说清',0:'价值判断：留意理想化的回报'},Pluto:{10:'职业权责：看清谁决定、谁承担',2:'收入结构：检查依赖和控制',8:'共同财务：处理权责失衡',0:'投入关系：重新辨认自主权'}};
 const relation={0:'合相把两者集中到同一件事上，需要直接回应相关要求；即使列在建设类，也可能同时增加负担。',60:'六合提供可以主动连接的空间，通常需要沟通、申请或合作去落实，不能只等事情自然发生。',120:'拱相更适合利用已经具备的经验和条件，让原有能力接上机会；顺畅并不等于无需投入。',90:'刑相强调不同要求之间的牵制，先找出是时间、成本还是权责不匹配，再决定调整哪一部分。',180:'对冲强调自己与外界的不同要求，需要协商投入和回报，避免为了满足一方而把负担全部留给自己。'}[row.angle];
 const actions={Jupiter:`对照${domain[2]}，把新增机会的报酬、时间成本和承诺列在一起；有兴趣与真正划算是两回事。`,Saturn:`围绕${domain[2]}制定可持续安排：明确期限、标准和自己承担的部分，区分长期积累与无报酬地增加责任。`,Uranus:`在${domain[2]}中先试行小范围调整，给变化留出备选方案；观察新做法是否真的改善旧问题。`,Neptune:`核对${domain[2]}中的书面条件、实际付款与交付标准；暂时无法验证的部分不要当成已经确定的回报。`,Pluto:`梳理${domain[2]}里谁有决定权、谁承担后果；留意过度依赖单一人或单一渠道的安排。`};
 const siblings=windows.filter(w=>w.key===row.key).sort((a,b)=>a.start.localeCompare(b.start)),index=siblings.findIndex(w=>w.start===row.start);
 const recurrence=siblings.length>1?`同一配置在所选范围内出现${siblings.length}段，这是第${index+1}段${index>0?`，上一段为${siblings[index-1].start}至${siblings[index-1].end}，可以对照上次尚未落实的问题`:''}。这属于同一主题的再次接近，不应算作另一份独立机会。`:'';
 const personalThemes={Sun:'个人方向与认可',Moon:'安全感与情绪需要',Mercury:'判断、谈判和技能',Venus:'价值选择与交换',Mars:'主动行动与边界',Jupiter:'专业成长、扩展和信念',Saturn:'长期责任与现实限制'};
 const context=row.target==='MC'?'直接触及天顶，重点是职业位置、方向和外界评价，并不是单独指向收入。':`${row.role}${row.natalHouse?`落本命第${row.natalHouse}宫，把${domain[0]}与${areas[row.natalHouse-1]}联系起来`:'是本次观察的依据'}。${personalThemes[row.target]?`被触及的${names[row.target]}还关联${personalThemes[row.target]}，需要把这一层需要和${focus}一起考虑。`:''}`;
 return {plainTitle:titles[row.planet]?.[row.topicHouse]||`${domain[0]}：${focus}`,meaning:`重点是${domain[0]}，可以留意${domain[1]}。行运${names[row.planet]}带来的观察角度是${focus}。${relation}`,action:actions[row.planet],context:`${context}${row.transitHouse?`窗口最接近的取样日，行运${names[row.planet]}在本命第${row.transitHouse}宫，可从${areas[row.transitHouse-1]}中的实际事情核对这一主题。`:''}`,timing:`${row.retrograde?'最接近的取样日处于逆行，适合对照已出现过的安排或讨论；逆行本身不等于坏事。':'最接近的取样日处于顺行；是否有实际进展仍需结合现实事项。'}${recurrence}${row.clippedStart?'这段窗口在扫描开始前可能已经启动，当前起始日只是扫描边界。':''}`};
}

