/* 扶抑 / 调候观察小样，不把软件启发式冒充古籍定论。 */
window.renderBaziMethods=function(r,host){
 const p=r.calculatedResult,keys=['year','month','day','hour'],names=['年','月','日','时'],cycle=['木','火','土','金','水'],d=cycle.indexOf(p.day.stemAttributes.element);
 const same=cycle[d],resource=cycle[(d+4)%5],output=cycle[(d+1)%5],wealth=cycle[(d+2)%5],control=cycle[(d+3)%5];
 function relation(e){return e===same?'同类比劫':e===resource?'印星生扶':e===output?'食伤泄秀':e===wealth?'财星耗身':'官杀制身';}
 function add(title,text){const block=document.createElement('details');const summary=document.createElement('summary');summary.textContent=title;const para=document.createElement('p');para.textContent=text;block.append(summary,para);host.append(block);return block;}
 const rootEvidence=keys.flatMap((k,i)=>p[k].hiddenStems.filter(h=>h.element===same).map(h=>names[i]+'支'+p[k].branch+'藏'+h.stem+'（'+h.role+'）'));
 const main=p.month.hiddenStems.find(h=>h.role==='main')||p.month.hiddenStems[0];
 const stemEvidence=keys.filter(k=>k!=='day').map(k=>p[k].stem+' '+p[k].stemAttributes.element+'：'+relation(p[k].stemAttributes.element));
 const support=add('六 · 旺衰法 · 扶抑观察',`月令观察：${p.month.branch}月，本气${main?.stem||'待核对'}，与日主的关系为${main?relation(main.element):'待核对'}。本气关系是月令证据之一，不能替代节气深浅与整局判断。

通根证据：${rootEvidence.length?rootEvidence.join('；'):'藏干未见日主同五行'}。

透干关系：${stemEvidence.join('；')}。

当前不以打分强行定旺衰。下方可以分别查看“身偏弱”“身偏强”的扶抑假设；从格、化气、合化以及受冲根气暂未裁定。`);
 const label=document.createElement('label');label.textContent='扶抑假设 ';const select=document.createElement('select');select.setAttribute('aria-label','扶抑假设');[['pending','尚未定旺衰'],['weak','假设身偏弱'],['strong','假设身偏强']].forEach(([v,t])=>select.add(new Option(t,v)));label.append(select);const result=document.createElement('p');result.className='reading-evidence';support.append(label,result);
 function scenario(){result.textContent=select.value==='weak'?`若核验为普通身弱格局，先观察${resource}印星与${same}比劫能否有效生扶；${output}食伤、${wealth}财星、${control}官杀的作用须结合承受条件。此为扶抑候选，不是最终喜忌。`:select.value==='strong'?`若核验为普通身强格局，先观察${output}泄、${wealth}耗、${control}制是否有适当作用；${resource}与${same}继续生扶未必合适。仍须兼顾调候、组合及格局。`:'旺衰未定，暂不输出固定喜神、忌神。先核对月令、通根、透干及合冲作用。';}select.addEventListener('change',scenario);scenario();
 const winter='亥子丑'.includes(p.month.branch),summer='巳午未'.includes(p.month.branch);
 const fire=keys.flatMap(k=>[p[k].stemAttributes.element,...p[k].hiddenStems.map(h=>h.element)]).includes('火');
 const water=keys.flatMap(k=>[p[k].stemAttributes.element,...p[k].hiddenStems.map(h=>h.element)]).includes('水');
 add('七 · 调候法 · 季节观察',`${p.month.branch}月：${winter?'冬令背景，先观察寒气与火的温暖条件。':summer?'夏令背景，先观察暑热与水的润泽条件。':'春秋背景，需结合具体节气及日干逐月取法。'}

原局天干或藏干${fire?'见火':'未见火'}，${water?'见水':'未见水'}。出现不等于能发挥作用，尚需核对是否透出、通根及受制。

这只是季节观察，不是完整调候取用表。辰丑与未戌的湿燥条件、十干逐月取法尚未逐条校勘。调候需求与扶抑喜忌应分别保留，不能直接合成同一结论。`);
 const luck=add('八 · 大运走向 · 五行关系','逐运列出运干、运支本气与日主的关系，查看某运后再结合原局核验。这里不直接标注“吉运”“凶运”，起运日期仍沿用现有验盘结果。');
 const list=document.createElement('div');list.className='reading-luck';
 (r.luckCycles?.cycles||[]).forEach(c=>{const block=document.createElement('details'),s=document.createElement('summary');s.textContent=`${c.pillar} · ${c.startYear}—${c.endYear} · 约${c.ageStart.toFixed(1)}岁起`;const text=document.createElement('p');const stem=c.pillar[0],branch=c.pillar[1],stemIndex='甲乙丙丁戊己庚辛壬癸'.indexOf(stem),e=['木','木','火','火','土','土','金','金','水','水'][stemIndex],be=({子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'})[branch];text.textContent=`运干${stem}${e}：${relation(e)}（${c.stemTenGod}）；运支${branch}本气属${be}：${relation(be)}。

若生扶为所需，此运的生扶部分可列为候选；若泄耗制为所需，则观察对应部分是否有效。干支作用可能不同，不能把整个十年归为单一喜忌。原局与大运的合冲刑害、流年触发尚需进一步分析。`;block.append(s,text);list.append(block);});luck.append(list);
 add('九 · 婚姻、事业与财富 · 观察分栏',`婚姻与相处：日支${p.day.branch}可作为传统配偶宫观察位置；本页不据此断定婚期、离合或伴侣特征。

事业与工作：先分别观察${control}官杀的职责主题、${output}食伤的表达主题、${resource}印星的学习支持。作用有利与否仍取决于原局条件。

财富与资源：日主所克的${wealth}属财星范围，代表传统解释中的资源主题。财星出现不等于一定有钱，缺少透财也不等于贫困。可结合现实预算与经营经历回看。`);
 const sources=document.createElement('p');sources.className='reading-evidence';sources.append('方法说明：本小样为开发中的关系观察，非古籍逐条推断。参考阅读：');[['滴天髓 · 寒暖燥湿','https://zh.wikisource.org/zh/滴天髓'],['穷通宝鉴','https://zh.wikisource.org/zh/穷通宝鉴']].forEach(([title,url])=>{const a=document.createElement('a');a.textContent=title;a.href=url;a.target='_blank';a.rel='noopener';sources.append(a,'　');});host.append(sources);
};
