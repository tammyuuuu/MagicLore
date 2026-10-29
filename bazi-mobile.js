// Compact Bazi presentation; all pillars and fortune interactions reuse existing DOM.
export function installBaziMobile(){
 if(!location.pathname.endsWith('bazi_web.html'))return;
 document.body.classList.add('bm-enabled');const context=document.querySelector('.mc-context'),row=context.querySelector('.mc-person-row'),modeRow=context.querySelector('.mc-mode-row'),menu=context.querySelector('.mc-settings-menu');
 const back=document.createElement('a');back.className='bm-back';back.href='index.html#home';back.textContent='‹';back.setAttribute('aria-label','返回藏馆');row.prepend(back);const edit=context.querySelector('.mc-edit');edit.textContent='编辑';row.append(edit);const add=context.querySelector('.mc-new');add.textContent='＋';add.setAttribute('aria-label','新建人物档案');
 const form=document.getElementById('form'),chart=document.getElementById('chart'),overview=chart.closest('.bazi-overview'),resultArea=overview.parentElement,workspace=resultArea.parentElement,rail=document.querySelector('.layout>aside');
 const reference=document.createElement('section');reference.className='bm-reference';reference.hidden=true;workspace.append(reference);
 const tabs=document.createElement('div');tabs.className='bm-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','八字功能');modeRow.prepend(tabs);let current='basic';
 const buttons=new Map();function mark(key){current=key;for(const [id,button]of buttons)button.setAttribute('aria-selected',String(id===key));}
 let renderedReading=null;
 function ensureReading(){const r=window.pendingBaziReading||window.magicLoreBazi?.getResult();if(r&&r!==renderedReading){window.renderBaziReadingNow(r);renderedReading=r;moveReferences();}}
 window.addEventListener('bazi-reading-updated',()=>{if(current==='reference')ensureReading();});
 function view(key){mark(key);reference.hidden=key!=='reference';rail.querySelector('[data-module="chart"]').click();if(key==='reference'){ensureReading();resultArea.hidden=true;form.hidden=true;}}
 for(const [key,label]of [['basic','基础'],['reference','参考']]){const button=document.createElement('button');button.type='button';button.setAttribute('role','tab');button.textContent=label;button.onclick=()=>view(key);buttons.set(key,button);tabs.append(button);}mark('basic');
 context.querySelector('.mc-settings').remove();
 // The original form remains internal input state for the unchanged calculator.
 form.hidden=true;form.style.setProperty('display','none','important');
 const wrap=chart.closest('.chart-wrap'),time=document.getElementById('timeSummary'),timeDetails=time.closest('details'),birth=document.createElement('details'),birthLine=document.createElement('summary');birth.className='bm-birth';birthLine.setAttribute('aria-label','出生时间与换算详情');birth.append(birthLine);overview.before(birth);birth.append(time);if(timeDetails)timeDetails.remove();
 let lastProfile=context.querySelector('select').value;
 function updateBirth(){const result=window.magicLoreBazi?.getResult();if(result)birthLine.textContent=`${result.normalizedTime.usedTime.slice(0,16)} · ${result.options.trueSolarTime?'真太阳时':'标准时间'}`;const selected=context.querySelector('select').value;if(selected!==lastProfile){lastProfile=selected;view('basic');}}updateBirth();new MutationObserver(updateBirth).observe(time,{childList:true,subtree:true});
 overview.querySelector('.pillar-column>h2')?.setAttribute('hidden','');
 chart.closest('.chart-wrap').setAttribute('aria-label','四柱、大运、流年与流月命盘');
 const sizeColumns=()=>{chart.style.setProperty('--bm-chart-min','0px');for(const th of chart.querySelectorAll('thead th'))if(th.textContent.startsWith('流年 ')&&!th.dataset.compactYear){th.dataset.compactYear='true';const text=th.textContent;th.title=text;th.innerHTML='流年<small>'+text.slice(3)+'</small>';}};sizeColumns();new MutationObserver(sizeColumns).observe(chart,{childList:true,subtree:true});
 const expand=document.createElement('button');expand.type='button';expand.className='bm-expand';expand.textContent='展开星运 · 纳音 · 神煞 ⌄';expand.setAttribute('aria-expanded','false');expand.onclick=()=>{const full=wrap.classList.toggle('bm-full');expand.setAttribute('aria-expanded',String(full));expand.textContent=full?'收起专业信息 ⌃':'展开星运 · 纳音 · 神煞 ⌄';};wrap.after(expand);
 const column=overview.querySelector('.luck-column'),heading=column.querySelector('h2');if(heading)heading.textContent='大运';
 function moveReferences(){for(const id of ['compare','debug']){const node=document.getElementById(id);if(!node)continue;const details=node.closest('details');node.hidden=true;node.style.setProperty('display','none','important');if(details){details.before(node);details.remove();}}document.getElementById('plateRuleNote')?.remove();const reading=document.getElementById('baziReading');if(reading&&reading.parentElement!==reference)reference.append(reading);}
 moveReferences();new MutationObserver(moveReferences).observe(resultArea,{childList:true,subtree:true});
 const luck=document.getElementById('luck');function fortuneNotes(){for(const node of luck.querySelectorAll('.pair strong')){const text=node.textContent.trim();for(const [chars,element] of [['甲乙寅卯','木'],['丙丁巳午','火'],['戊己辰戌丑未','土'],['庚辛申酉','金'],['壬癸亥子','水']])if(text.length===1&&chars.includes(text))node.classList.add('element-'+element);}document.querySelector('#annualDetail>p')?.remove();}fortuneNotes();new MutationObserver(fortuneNotes).observe(luck,{childList:true,subtree:true});
 installDenseFortunes(luck,chart);
 form.addEventListener('submit',()=>queueMicrotask(()=>{if(!document.getElementById('error').textContent){reference.hidden=true;mark('basic');}}));
}

// Choose through the original controls: no duplicate calendar or pillar calculation.
function installDenseFortunes(luck,chart){
 let queued=false;
 function update(){queued=false;for(const node of luck.querySelectorAll('.minor,.bm-rule-note,.luck-row>.fortune-card>small'))node.remove();const heading=luck.querySelector('#annualDetail>h3');if(heading&&heading.textContent.includes('／小运'))heading.textContent=heading.textContent.replace('／小运','');const row=luck.querySelector('.luck-row'),cards=[...row?.children||[]];if(!cards.length)return;row.style.setProperty('--bm-luck-count',cards.length);
  for(const grid of luck.querySelectorAll('.fortune-grid'))grid.style.setProperty('--bm-fortune-count',grid.children.length);
  for(const small of luck.querySelectorAll('.pair small')){const text=small.textContent,short=window.baziShortGod?.(text)||text;if(short!==text){small.title=text;small.textContent=short;}}
  for(const card of cards){card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-pressed',String(card.classList.contains('active')));if(!card.onkeydown)card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};}
  for(const card of luck.querySelectorAll('.annual-card,[data-month-pillar]'))card.setAttribute('aria-pressed',String(card.classList.contains('active')));
  const r=window.magicLoreBazi?.getResult(),now=new Date(),year=now.getFullYear();if(!r)return;
  if(!cards.some(c=>c.classList.contains('active'))){let i=r.luckCycles.cycles.findIndex(c=>c.years.some(y=>y.year===year));if(i<0)i=year<r.luckCycles.cycles[0].startYear?0:cards.length-1;cards[i]?.click();return;}
  const annual=[...luck.querySelectorAll('.annual-card')];if(annual.length&&!annual.some(c=>c.classList.contains('active'))){const target=annual.find(c=>Number(c.querySelector('.date').textContent)===year)||annual[0];target.click();return;}
  const months=[...luck.querySelectorAll('[data-month-pillar]')];if(months.length&&!months.some(c=>c.classList.contains('active'))){const current=annual.find(c=>c.classList.contains('active')),ci=Number(current?.dataset.cycle),yi=Number(current?.dataset.year),data=r.luckCycles.cycles[ci]?.years[yi],cutoff=data?.year===year?+now:Date.UTC(data?.year||year,now.getMonth(),now.getDate(),12);let index=0;for(let i=0;i<(data?.months.length||0);i++)if(Date.parse(data.months[i].instant)<=cutoff)index=i;months[index]?.click();}
 }
 const schedule=()=>{if(!queued){queued=true;queueMicrotask(update);}};new MutationObserver(schedule).observe(luck,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});schedule();
}
