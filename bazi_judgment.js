/* All judgments use the same versioned engine; no separate percentage fallback. */
window.judgeBazi=r=>window.legacyBaziJudgment(r);
window.buildBaziInsight=(r,now=new Date())=>window.buildUnifiedBaziInsight(r,now);
window.renderBaziJudgment=function(r,host){
 const model=window.buildBaziInsight(r);host.replaceChildren();host.classList.add('bazi-summary-report');
 const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
 function card(title){const section=el('section');section.className='bazi-summary-card';section.append(el('h2',title));host.append(section);return section;}
 const core=card('命局核心');core.append(el('p',`${model.dayMaster}${model.element}日主 · ${model.level}`));

 for(const pattern of model.patterns){
  const state=pattern.status==='rescued'?'有救应':pattern.status==='broken'?'关键作用受损':'成格';
  core.append(el('p',`${pattern.name} · ${state}${pattern.combinations.length?' · '+pattern.combinations.join('、'):''}`));
  core.append(el('p',pattern.explanation));
 }
 const godLabel=g=>`${g.stem}${g.transformed?'化'+g.element:''}（${g.tenGod}）`;
 if(model.structureGod)core.append(el('p',`格局用神：${godLabel(model.structureGod)}`));
 if(model.assistantGods.length)core.append(el('p','相神：'+[...new Set(model.assistantGods.map(godLabel))].join('、')));
 const elements=card('五行喜忌');elements.hidden=!model.favorable.length&&!model.avoid.length&&!model.conditional?.length;
 if(model.favorable.length)elements.append(el('p',`喜：${model.favorable.join('、')}`));
 if(model.avoid.length)elements.append(el('p',`忌：${model.avoid.join('、')}`));
 if(model.conditional?.length)elements.append(el('p',`需结合配置取用：${model.conditional.join('、')}`));
 if(model.climate?.needs.length)elements.append(el('p','调候：'+model.climate.explanation+'。'));
 const trend=card('大运趋势'),tabs=el('div'),graph=el('div'),strip=el('div'),detail=el('p'),yearBox=el('div'),yearDetail=el('p'),status=el('p',model.scorePolicy);
 tabs.className='bazi-insight-tabs';strip.className='bazi-cycle-strip';graph.className='bazi-trend-graph';yearBox.className='bazi-year-choice';status.className='bazi-insight-note';
 graph.addEventListener?.('click',event=>{const target=event.target.closest('[data-cycle]');if(target){selected=Number(target.dataset.cycle);update();}});
 graph.addEventListener?.('keydown',event=>{if(event.key==='Enter'||event.key===' '){const target=event.target.closest('[data-cycle]');if(target){event.preventDefault();selected=Number(target.dataset.cycle);update();}}});
 trend.append(tabs,graph,strip,detail,yearBox,yearDetail,status);
 let theme='overall',selected=model.cycles.findIndex(c=>c.current);if(selected<0)selected=0;const selectedYears=new Map();
 function update(){
  for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.theme===theme));
  for(const [i,b]of [...strip.children].entries())b.setAttribute('aria-pressed',String(i===selected));
  graph.innerHTML=window.renderBaziTrendSvg(model.cycles,theme,selected);
  graph.dataset.theme=theme;
  const c=model.cycles[selected],score=c?.scores[theme];
  detail.textContent=c?`${c.periodLabel||c.startYear+'—'+c.endYear} · ${c.pillar} · ${Number.isFinite(score)?score+'分':'未评分'}：${c.themes[theme]}`:'暂无可用的大运数据。';
  yearBox.replaceChildren();yearDetail.textContent='';
  if(c?.years.length){
   const label=el('label','流年'),select=el('select');select.setAttribute('aria-label','选择流年查看综合作用');
   for(const row of c.years){const option=el('option',String(row.year));option.value=String(row.year);select.append(option);}
   const current=c.years.find(y=>y.year===selectedYears.get(selected))||c.years.find(y=>y.year===model.currentAnnualYear)||c.years[0];select.value=String(current.year);
   function chooseYear(){const row=c.years.find(y=>String(y.year)===select.value);if(row)selectedYears.set(selected,row.year);const value=row?.scores[theme];yearDetail.textContent=row?`${row.year}年 · ${Number.isFinite(value)?value+'分':'未评分'}：${row.themes[theme]}`:'';}
   select.onchange=chooseYear;label.append(select);yearBox.append(label);chooseYear();
  }
 }
 for(const [key,label]of [['overall','综合'],['career','事业'],['wealth','财运'],['relationship','感情']]){const b=el('button',label);b.type='button';b.dataset.theme=key;b.onclick=()=>{theme=key;update();};tabs.append(b);}
 model.cycles.forEach((c,i)=>{const b=el('button');b.type='button';b.append(el('strong',c.pillar),el('small',`${c.displayStartYear??c.startYear}—${c.displayEndYear??c.endYear}`));if(c.periodLabel)b.setAttribute('title',c.periodLabel);if(c.current)b.append(el('small','当前'));b.onclick=()=>{selected=i;update();};strip.append(b);});update();
 const special=card('专题预测'),choices=el('div'),list=el('div');choices.className='bazi-insight-tabs';list.className='bazi-event-list';special.append(el('p',`未来十年（${model.dateYear}—${model.dateYear+9}）`),choices,list);
 function choose(key){for(const b of choices.children)b.setAttribute('aria-pressed',String(b.dataset.topic===key));list.replaceChildren();const rows=model.events[key];if(!rows.length)list.append(el('p','暂无对应年份。'));for(const row of rows){const item=el('p');item.append(el('strong',String(row.year)),el('span',row.text));list.append(item);}}
 for(const [key,label]of [['love','婚恋时间'],['career','事业变动'],['wealth','财运机会'],['move','迁移变动']]){const b=el('button',label);b.type='button';b.dataset.topic=key;b.onclick=()=>choose(key);choices.append(b);}choose('love');
};
