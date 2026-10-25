import {houseOf} from './calculateWesternChart.js';
import {tropicalLongitude} from '../vedic/astronomy.js';
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',MC:'天顶'};
const roles={Sun:'自我方向与认可',Moon:'情感需要与安全感',Mercury:'判断、学习与表达',Venus:'亲近方式与价值选择',Mars:'行动、欲望与边界',Jupiter:'成长、学习与发展空间',Saturn:'责任、规则与长期积累',Uranus:'独立与改变旧方式',Neptune:'理想、想象与感受边界',Pluto:'深层调整与权责关系',MC:'职业方向与社会位置'};
const labels={0:'合相',60:'六合',90:'刑相',120:'拱相',180:'对冲'};
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const fields={1:['自我定位','找到自己的行动方向','你怎样认识自己、怎样开始行动'],2:['财富与收入','看清投入和回报的关系','收入来源、报酬与拥有的资源'],3:['学习与表达','让想法找到清楚的表达','学习、信息处理与日常沟通'],4:['家人与归属','照顾生活里的安全感','家人关系、居住安排与私人空间'],5:['爱情与创造','给喜欢的事留出表达空间','恋爱中的表达、创作与个人兴趣'],6:['健康与日常','把精力放回可持续的节奏','作息、精力分配与日常工作'],7:['亲密关系与合作','让双方的需要被看见','伴侣关系、一对一合作与协商'],8:['共同资源与信任','把共享的责任说清','分账、共同资金与亲密中的信任'],9:['信念与探索','重新理解自己相信的方向','进修、远行与对生活意义的理解'],10:['事业','让职业方向落到具体安排','职业选择、岗位责任与社会位置'],11:['社群与长期目标','辨认值得一起走的人和方向','团队、朋友与长期计划'],12:['内在与灵性','给内心留一点安静空间','独处、休整、反思与内在体验']};
const weights={Sun:1,Moon:1,Mercury:3,Venus:4,Mars:5,Jupiter:8,Saturn:10,Uranus:9,Neptune:9,Pluto:10};
const relation={0:'合相把两端的主题集中起来，相关要求可能一起出现，需要看清它们怎样相互影响。',60:'六合提供可以主动连接的空间，适合通过沟通、尝试或具体安排把它落实。',90:'刑相容易让不同要求彼此牵制，比起急着解决一切，更适合先调整优先级。',120:'拱相让两端较容易配合，可以从已有经验和条件中寻找支持。',180:'对冲呈现两端不同的需要，重点是协商边界与找到可以兼顾的安排。'};
export function transitThemes(natal,current,options={}){
 const short=options.mode==='short',unified=options.mode==='unified',excluded=new Set(options.exclude||[]);
 const groups=new Map();
 for(const t of current.planets.filter(p=>unified?Boolean(weights[p.name]):short?['Sun','Moon','Mercury','Venus','Mars'].includes(p.name):weights[p.name]>=3))for(const n of [...natal.planets,{name:'MC',longitude:natal.mc}].filter(p=>short?['Sun','Moon','Mercury','Venus','Mars','MC'].includes(p.name):names[p.name])){
  const gap=Math.abs(((t.longitude-n.longitude+540)%360)-180);
  for(const angle of [0,60,90,120,180]){const orb=Math.abs(gap-angle);if(orb>(unified?(current.input?.transitOrb??3):short?(t.name==='Moon'?1.5:2):3)||excluded.has(`${t.name}:${n.name}:${angle}`))continue;
   const transitHouse=houseOf(t.longitude,natal.cusps),links=new Map();
   if(n.name==='MC')links.set(10,{weight:10,reason:'相位直接触及天顶，天顶关联职业方向与社会位置'});
   else{
    links.set(n.house,{weight:7,reason:`本命${names[n.name]}落在第${n.house}宫，这个领域与它的${roles[n.name]}主题相连`});
    natal.cusps.forEach((lon,i)=>{if(rulers[Math.floor(lon/30)]===n.name&&!links.has(i+1))links.set(i+1,{weight:4,reason:`第${i+1}宫由${names[n.name]}掌管，因此相位也能沿宫主关系联系到这个领域`});});
   }
   if(!links.has(transitHouse))links.set(transitHouse,{weight:3,reason:`行运${names[t.name]}经过本命第${transitHouse}宫，把${roles[t.name]}带入这个生活领域`});
   for(const [house,link] of links){if(!fields[house])continue;const hit={house,t:t.name,n:n.name,angle,orb,transitHouse,natalHouse:n.house,reason:link.reason,score:weights[t.name]+link.weight+(['Sun','Moon','MC'].includes(n.name)?5:['Mercury','Venus','Mars'].includes(n.name)?3:0)-orb};const groupKey=unified?`${t.name}:${n.name}:${angle}`:house;if(!groups.has(groupKey))groups.set(groupKey,[]);groups.get(groupKey).push(hit);}
  }
 }
 const chosen=new Set();
 return [...groups].map(([groupKey,hits])=>{hits.sort((a,b)=>b.score-a.score);const top=hits[0],house=top.house,support=hits.find(h=>h.t!==top.t||h.n!==top.n),field=fields[house];
  const start=house===10?'职业上，':house===2?'谈到收入，':house===4?'回到家人和生活环境，':house===6?'精力与日常安排方面，':house===12?'如果最近更想安静下来，':`${field[0]}这条线，`;
  const text=`${start}可以先留意${field[2]}。当前行运${names[top.t]}${labels[top.angle]}${top.n==='MC'?'天顶':`本命${names[top.n]}`}，让「${roles[top.t]}」与「${roles[top.n]}」这两层需要相遇。${relation[top.angle]}`;
  const grounding=`这个领域之所以突出，是因为${top.reason}。${top.natalHouse&&top.natalHouse!==house?`被触及的本命${names[top.n]}实际落在第${top.natalHouse}宫，因此还会联系${fields[top.natalHouse][2]}。`:''}这段时间，行运${names[top.t]}在你的本命第${top.transitHouse}宫，可以从${fields[top.transitHouse][2]}中的具体变化，理解这条相位怎样进入生活。`;
  const closing=support?`同一领域还受到行运${names[support.t]}${labels[support.angle]}${support.n==='MC'?'天顶':`本命${names[support.n]}`}的关注。${names[support.t]}带来${roles[support.t]}，${support.angle===90||support.angle===180?'说明这里也有需要协调的要求，适合把支持与压力一起看。':'为这个主题提供了另一层观察角度，可以对照实际经历看看两条线是否汇合。'}`:`可以从一件与${field[2]}有关的实际事情开始，观察它需要你调整什么，而不用把相位理解成已经确定的结果。`;
  const actions={1:'可以从一个自己愿意承担的行动开始，分清主动选择和为了回应他人而答应的事。',2:'具体到钱，可以核对报酬、投入时间和固定支出是否匹配。',3:'把重要想法写清楚，再与别人核对理解是否一致。',4:'可以先从居住安排、陪伴方式或家务分工中，找出最需要照顾的一件事。',5:'给表达喜欢和创作留出实际时间，也听听对方怎样回应。',6:'先检查休息、工作量和日常习惯是否支持当前的精力；这里不据此判断疾病或身体事件。',7:'把双方的期待说具体，看看哪些可以共同安排、哪些需要保留边界。',8:'涉及共同资金时，把分账、付款与责任约定说明白，也留意双方是否有相称的决定权。',9:'可以用一次学习或真实体验检验自己的想法，慢慢形成更适合自己的信念。',10:'先核对岗位要求、自己想走的方向与能够投入的精力，找出需要谈清或调整的一处。',11:'留意哪些团队或朋友支持你的长期目标，哪些承诺正在消耗本来有限的时间。',12:'给独处与休整留一点时间，可以记录内心变化，再决定哪些感受值得继续探索。'};
  const rhythm=short?(top.t==='Moon'?'这是当下的情绪节奏，变化较快，适合照顾此刻的需要。':top.t==='Sun'?'太阳带来的是近期的注意力与自我表达，可以从当前正在回应的事情理解。':'这里关注近期的沟通、关系或行动节奏，适合用具体的小安排来回应。')+' ':'';
  return {title:`${field[0]} · ${field[1]}`,aspect:{planet:top.t,target:top.n,angle:top.angle},configurationKeys:[`${top.t}:${top.n}:${top.angle}`,...(support?[`${support.t}:${support.n}:${support.angle}`]:[])],evidence:`行运${names[top.t]}${labels[top.angle]}${top.n==='MC'?'天顶':`本命${names[top.n]}`} · 偏差${top.orb.toFixed(2)}°`,paragraphs:[text,grounding,short?rhythm+actions[house]:unified?actions[house]:closing+' '+actions[house]],score:top.score+(unified?0:Math.min(3,hits.filter(h=>h.score>=top.score-3).length-1))};
 }).sort((a,b)=>b.score-a.score).filter(item=>{if(chosen.has(item.evidence))return false;chosen.add(item.evidence);return true;}).slice(0,unified?4:short?2:3).map(item=>{
  if(!unified)return item;const duration=transitDuration(item.aspect,natal,current);const stars=item.score>=22?5:item.score>=18?4:item.score>=14?3:item.score>=10?2:1;
  return {...item,meta:`重要性 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)} · ${duration.label}`,duration,stars};
 });
}
export function transitDuration(aspect,natal,current){
 const long=['Jupiter','Saturn','Uranus','Neptune','Pluto'].includes(aspect.planet),step=long?86400000:3600000,limit=long?730:24*180;
 const target=aspect.target==='MC'?natal.mc:natal.planets.find(p=>p.name===aspect.target).longitude,at=new Date(current.utc).getTime();
 const active=ms=>Math.abs(Math.abs(((tropicalLongitude(aspect.planet,new Date(ms))-target+540)%360)-180)-aspect.angle)<=(current.input?.transitOrb??3);
 function boundary(direction){let inside=at;for(let i=1;i<=limit;i++){const outside=at+direction*i*step;if(active(outside)){inside=outside;continue;}let a=inside,b=outside;for(let j=0;j<12;j++){const mid=(a+b)/2;if(active(mid))a=mid;else b=mid;}return {ms:a,clipped:false};}return {ms:inside,clipped:true};}
 const start=boundary(-1),end=boundary(1),offset=current.input?.offset||'+08:00',m=/^([+-])(\d{2}):(\d{2})$/.exec(offset),shift=m?(m[1]==='-'?-1:1)*(Number(m[2])*60+Number(m[3]))*60000:0;
 const format=ms=>new Date(ms+shift).toISOString().slice(0,long?10:16).replace('T',' ').replaceAll('-','.');
 const hours=(end.ms-start.ms)/3600000,span=hours<48?`约${Math.max(1,Math.round(hours))}小时`:`约${Math.round(hours/24)}天`;
 return {start:new Date(start.ms).toISOString(),end:new Date(end.ms).toISOString(),clippedStart:start.clipped,clippedEnd:end.clipped,label:`${long?'长期':'短期'} · ${start.clipped||end.clipped?'至少':''}${span} · ${format(start.ms)} — ${format(end.ms)}${start.clipped||end.clipped?'（扫描边界）':''}`};
}
