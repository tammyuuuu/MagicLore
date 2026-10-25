import {julianTimes,tropicalLongitude} from './astronomy.js';
import {getAyanamsa} from './ayanamsa.js';
import {nodePair} from './nodes.js';
import {normalizeLongitude} from './zodiac.js';
import {calculateVedicChart} from './calculateVedicChart.js';
import {bhavaForSign} from './houses.js';
import {buildReadingStructure} from './readingStructure.js';
import {buildGrahaAspects,angularSeparation} from './relations.js';
import {GRAHA_METADATA} from './metadata/grahas.js';
import {themes} from './themeNarrative.js';
const weights={Saturn:8,Jupiter:7,Rahu:6,Ketu:6,Mars:4,Sun:3,Venus:3,Mercury:3,Moon:1};
const name=n=>GRAHA_METADATA[n].chineseName,role=n=>GRAHA_METADATA[n].basicMeaning;
export function calculateVedicTransit(natalInput,target){
 const settings={ayanamsaMode:natalInput.ayanamsaMode,nodeType:natalInput.nodeType};
 const natal=calculateVedicChart(natalInput,settings),current=calculateVedicChart({...natalInput,...target},settings);
 const grahas=current.grahas.map(p=>({...p,bhava:bhavaForSign(p.signIndex,natal.lagna.signIndex)}));
 return {natal,current,transit:{...current,lagna:natal.lagna,houses:natal.houses,grahas}};
}
export function vedicTransitWindow(result,planetName){
 const selected=result.current.grahas.find(p=>p.name===planetName),center=new Date(result.current.utc).getTime(),hour=3600000;
 const matches=ms=>{const date=new Date(ms),times=julianTimes(date),ayan=getAyanamsa(result.natal.ayanamsaMode,times.jde).value;const nodes=planetName==='Rahu'||planetName==='Ketu'?nodePair(times.jde,result.natal.input.nodeType):null;const tropical=nodes?(planetName==='Rahu'?nodes.rahu:nodes.ketu):tropicalLongitude(planetName,date);return Math.floor(normalizeLongitude(tropical-ayan)/30)===selected.signIndex;};
 const step=planetName==='Moon'?hour:24*hour,limit=planetName==='Moon'?7*24*hour:4*366*24*hour;
 function edge(direction){let inside=center;for(let elapsed=step;elapsed<=limit;elapsed+=step){const outside=center+direction*elapsed;if(matches(outside)){inside=outside;continue;}let a=inside,b=outside;while(Math.abs(a-b)>hour){const middle=(a+b)/2;if(matches(middle))a=middle;else b=middle;}return {time:(a+b)/2,truncated:false};}return {time:center+direction*limit,truncated:true};}
 const start=edge(-1),end=edge(1),offset=result.current.input.timezoneOffset,sign=offset[0]==='-'?-1:1,minutes=sign*(Number(offset.slice(1,3))*60+Number(offset.slice(4,6)));
 const format=ms=>new Date(ms+minutes*60000).toISOString().slice(0,16).replace('T',' ');
 return {start:format(start.time),end:format(end.time),startUtc:start.time,endUtc:end.time,truncated:start.truncated||end.truncated,days:Math.max(1,Math.round((end.time-start.time)/86400000)),offset,planet:planetName};
}
export function vedicTransitNarrative(natalInput,target){
 const result=calculateVedicTransit(natalInput,target),birth=buildReadingStructure(result.natal),transit=result.transit,aspects=buildGrahaAspects(transit);
 const cards=birth.houses.map((house,i)=>{
  const [area,subtitle,meaning,action]=themes[i],placed=transit.grahas.filter(p=>p.bhava===house.house),incoming=aspects.filter(a=>a.targetHouse===house.house);
  const score=placed.reduce((s,p)=>s+weights[p.name],0)+incoming.reduce((s,a)=>s+weights[a.source]*.5,0)+placed.filter(p=>p.name===house.lord).length*3;
  const leading=[...placed].sort((a,b)=>weights[b.name]-weights[a.name])[0]||transit.grahas.find(p=>p.name===incoming.sort((a,b)=>weights[b.source]-weights[a.source])[0]?.source);
  if(!leading)return null;
  const lord=birth.planets.find(p=>p.name===house.lord),natalLeading=birth.planets.find(p=>p.name===leading.name);
  const contacts=placed.flatMap(p=>result.natal.grahas.filter(b=>b.bhava===house.house&&angularSeparation(p.siderealLongitude,b.siderealLongitude)<=5).map(b=>`${name(p.name)}接近本命${name(b.name)}，偏差${angularSeparation(p.siderealLongitude,b.siderealLongitude).toFixed(2)}°`));
  const direct=placed.some(p=>p.name===leading.name),slow=['Saturn','Jupiter','Rahu','Ketu'].includes(leading.name),stars=score>=18?5:score>=12?4:score>=8?3:score>=4?2:1;
  const focus=direct?`${name(leading.name)}行经本命第${house.house}宫`:`${name(leading.name)}照射本命第${house.house}宫`;
  const evidence=placed.map(p=>`行运${name(p.name)}在${birth.houses[p.bhava-1].rashiMeta.chineseName}第${p.bhava}宫`).concat(incoming.map(a=>`${name(a.source)}从第${a.fromHouse}宫以第${a.aspectNumber}照射这里`),contacts).join(' · ');
  const first=`这段时间，**${area}**值得先看，因为**${focus}**。${name(leading.name)}代表${role(leading.name)}，而第${house.house}宫涉及${meaning}。${direct?'这颗星正在直接经过这个生活领域，相关需要会成为安排事情时的一层重点。':'这颗星虽然不在这个宫位，却以印占的行星照射把相关需要带到这里，因此还要兼顾它所在宫位的事情。'}${leading.name==='Saturn'?'更适合梳理责任、限制与长期投入：哪些承担能形成稳定基础，哪些只是消耗，需要分清。':leading.name==='Jupiter'?'可以留意学习、支持与扩大理解的机会，但扩展也需要对应的时间和实际能力。':leading.name==='Rahu'?'罗睺会放大追求和新经验，适合探索不同做法，同时辨认自己真正想要的与一时刺激。':leading.name==='Ketu'?'计都提示简化与抽离，值得看看哪些旧投入可以减少，哪些重要关系仍需要保留。':`可以从${role(leading.name)}在日常中的具体表现开始观察，再决定怎样回应。`}`;
  const second=`这条行运与你的本命盘相连：**${name(leading.name)}本命在第${natalLeading.house}宫**${natalLeading.ruledHouses.length?'，掌管'+natalLeading.ruledHouses.map(h=>themes[h-1][0]).join('、'):''}。本命第${house.house}宫的宫主星**${name(house.lord)}位于第${lord.house}宫**，把${area}连接到${themes[lord.house-1][0]}。因此，观察${themes[lord.house-1][2]}里的变化，可以帮助你理解这次行运怎样进入现实。${contacts.length?'同时，'+contacts.join('；')+'，让原本的表达方式也需要一起考虑。':''}`;
  const third=`实际安排上，先试着**${action}**。${placed.length>1?'同宫还有'+placed.filter(p=>p.name!==leading.name).map(p=>name(p.name)+'的'+role(p.name)).join('、')+'，这些需要要一起协调。':''}${incoming.length?'照射来自'+[...new Set(incoming.map(a=>name(a.source)))].join('、')+'，所以这个主题还与其他生活领域相互牵动。':''}${slow?'这是由慢行九曜带出的较长期背景，短期心情变化不能代替长期安排。':'这更偏向短期节奏，适合调整近期交流、行动或休息，不必据此重写长期方向。'}`;
  return {leadingName:leading.name,focus,house:house.house,title:`${area} · ${subtitle}`,score,stars,meta:`重要性 ${'★'.repeat(stars)}${'☆'.repeat(5-stars)} · ${slow?'长期背景':'短期节奏'}`,evidence,paragraphs:[first,second,third]};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.house-b.house).slice(0,4);
 const windows=new Map();for(const card of cards){if(!windows.has(card.leadingName))windows.set(card.leadingName,vedicTransitWindow(result,card.leadingName));card.window=windows.get(card.leadingName);}
 const period=result.natal.dasha.timeline.find(p=>new Date(result.current.utc)>=new Date(p.start)&&new Date(result.current.utc)<new Date(p.end));
 return {cards,period:period?`${name(period.lord)}大运`:null};
}
export function vedicTransitHTML(natal,target){
 const report=vedicTransitNarrative(natal,target),text=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
 return '<section class="vedic-theme-reading vedic-transit-reading"><h2>行运 · 当前最重要的生活主题</h2><p class="theme-evidence">'+text(`行运时刻：${target.date} ${target.time} · UTC${target.timezoneOffset||natal.timezoneOffset}`)+'</p><p>'+text(`先看**${report.cards.map(c=>c.title.split(' · ')[0]).join('、')}**。${report.period?'这一天处于本命'+report.period+'；大运说明背景，不能把同一行运对所有人的含义等同。':''}`)+'</p><div class="vedic-theme-grid">'+report.cards.map(c=>'<article class="vedic-theme-card"><h3>'+text(c.title)+'</h3><div class="theme-stars">'+c.meta+'</div><p class="theme-window">'+text(`${c.window.start} — ${c.window.end} · 约${c.window.days}天${c.window.truncated?'（扫描边界）':''}`)+'</p><p>'+text(`主要时间配置：${c.focus}`)+'</p><div class="theme-evidence">'+text(c.evidence)+'</div>'+c.paragraphs.map(p=>'<p>'+text(p)+'</p>').join('')+'</article>').join('')+'</div><p class="note">按慢行九曜、落宫与照射的权重选择前4个主题。行运落宫以本命上升的整宫制计算，照射沿用当前印占规则；卡片日期为主导九曜本次连续停留在该星座期间，对应落宫或照射的持续背景；起止近似到1小时，使用所选UTC偏移。其他同宫星体、接近本命星的时间可能更短。逆行后重新进入另算，最多前后扫描4年（月亮7天）。罗睺计都只按落宫解读。</p></section>';
}
