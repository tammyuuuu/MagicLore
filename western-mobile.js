import {DEFAULT_ASPECT_ORBS} from './src/western/aspectOrbs.js';
// Presentation only: reuse existing controls, chart SVG and calculation output.
export function installWesternMobile(){
 if(!document.body.dataset.librarySystem||document.body.dataset.librarySystem!=='western')return;
 document.body.classList.add('mw-enabled');
 const context=document.querySelector('.mc-context'),row=context.querySelector('.mc-person-row'),modeRow=context.querySelector('.mc-mode-row'),menu=context.querySelector('.mc-settings-menu');
 const back=document.createElement('a');back.href='index.html#home';back.className='mw-back';back.textContent='‹';back.setAttribute('aria-label','返回藏馆');row.prepend(back);
 const edit=context.querySelector('.mc-edit');edit.textContent='编辑';row.append(edit);
 const add=context.querySelector('.mc-new');add.textContent='＋';add.setAttribute('aria-label','新建人物档案');
 const tabs=document.createElement('div');tabs.className='mw-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','星盘功能');
 for(const label of ['本命盘','行运盘','重置盘']){const button=[...menu.querySelectorAll('button')].find(b=>b.textContent===label);if(button){button.setAttribute('role','tab');button.dataset.mode={本命盘:'report',行运盘:'transit',重置盘:'relocation'}[label];button.onclick=()=>location.hash=button.dataset.mode;tabs.append(button);}}
 modeRow.prepend(tabs);context.querySelector('.mc-settings').remove();const syncTabs=()=>{const hash=location.hash.slice(1);for(const button of tabs.children){const active=button.dataset.mode===(['transit','relocation'].includes(hash)?hash:'report');button.setAttribute('aria-selected',String(active));}};window.addEventListener('hashchange',syncTabs);syncTabs();
 const main=document.querySelector('body>main'),hero=main?.querySelector(':scope>.hero');if(hero)hero.hidden=true;
 const result=document.getElementById('wResult'),section=result?.querySelector(':scope>.section'),wheel=document.getElementById('wWheel'),summary=document.getElementById('wSummary');
 if(!section||!wheel||!summary)return;
 section.classList.add('mw-chart-section');section.querySelector(':scope>h2')?.setAttribute('hidden','');
 const birth=document.createElement('details');birth.className='mw-birth';const birthSummary=document.createElement('summary');birthSummary.setAttribute('aria-label','出生信息，展开完整排盘口径');birth.append(birthSummary);summary.before(birth);birth.append(summary);
 const updateBirth=()=>{const input=window.magiccatAstrology?.getInput();if(!input)return;const place=(input.place||'').replaceAll('北京市 北京市','北京').replaceAll('上海市 上海市','上海').replaceAll('天津市 天津市','天津').replaceAll('重庆市 重庆市','重庆').replaceAll(' ',' · ');birthSummary.textContent=`${input.date} ${input.time} · ${place}`;birthSummary.title=birthSummary.textContent;};updateBirth();new MutationObserver(updateBirth).observe(summary,{childList:true,subtree:true,characterData:true});
 const layout=wheel.parentElement,aside=layout.querySelector('.selection-panel');
 if(aside){const settings=document.createElement('details');settings.className='mw-chart-settings';const heading=document.createElement('summary');heading.textContent='设置';aside.before(settings);settings.append(heading,aside);
  const tools=document.createElement('div');tools.className='mw-chart-tools';const mode=aside.querySelector('.western-mode');if(mode)tools.append(mode);const parameters=document.createElement('button');parameters.type='button';parameters.className='mw-parameters';parameters.textContent='设置';parameters.onclick=()=>{settings.open=!settings.open;parameters.setAttribute('aria-expanded',String(settings.open));if(settings.open)settings.scrollIntoView({block:'nearest'});};parameters.setAttribute('aria-expanded','false');settings.addEventListener('toggle',()=>parameters.setAttribute('aria-expanded',String(settings.open)));tools.append(parameters);layout.before(tools);
  // Keep engine-owned output nodes available, but settings contain only calculation choices.
  aside.hidden=true;aside.style.setProperty('display','none','important');
  const panel=document.createElement('div');panel.className='mw-preferences';settings.append(panel);
  const system=document.getElementById('wSystem'),systemLabel=document.createElement('label');systemLabel.textContent='分宫制';systemLabel.append(system);panel.append(systemLabel);
  const title=document.createElement('h4');title.textContent='相位容许度';panel.append(title);const grid=document.createElement('div');grid.className='mw-orb-grid';panel.append(grid);
  function refreshPreferences(){try{const api=window.magiccatAstrology;api.openNatal(api.getInput());if(location.hash==='#transit')document.querySelector('.library-transit-form').requestSubmit();if(location.hash==='#relocation'&&document.querySelector('.relocation-output svg'))document.querySelector('.relocation-form').requestSubmit();document.querySelector('.mw-preference-error')?.remove();}catch(error){let message=panel.querySelector('.mw-preference-error');if(!message){message=document.createElement('p');message.className='mw-preference-error';message.setAttribute('role','alert');panel.append(message);}message.textContent=error.message;}}
  system.addEventListener('change',e=>{e.stopImmediatePropagation();refreshPreferences();},true);
  const saved=window.magiccatAstrology?.getInput()?.aspectOrbs||{};
  for(const [angle,name]of [[0,'合相'],[60,'六合'],[90,'刑相'],[120,'拱相'],[180,'对冲']]){const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name+'容许度');select.dataset.westernOrb=angle;select.dataset.defaultOrb=DEFAULT_ASPECT_ORBS[angle];for(let n=0;n<=15;n+=.5)select.append(new Option(n+'°',String(n)));select.value=String(saved[angle]??DEFAULT_ASPECT_ORBS[angle]);select.onchange=refreshPreferences;label.append(select);grid.append(label);}
  const transitLabel=document.createElement('label');transitLabel.textContent='行运相位';const transitOrb=document.createElement('select');transitOrb.id='mwTransitOrb';transitOrb.setAttribute('aria-label','行运相位容许度');for(let n=0;n<=15;n+=.5)transitOrb.append(new Option(n+'°',String(n)));transitOrb.value=String(window.magiccatAstrology?.getInput()?.transitOrb??3);transitOrb.onchange=refreshPreferences;transitLabel.append(transitOrb);grid.append(transitLabel);
  const reset=document.createElement('button');reset.type='button';reset.textContent='恢复默认容许度';reset.onclick=()=>{for(const select of grid.querySelectorAll('select'))select.value=select.dataset.defaultOrb||'3';refreshPreferences();};panel.append(reset);
  const hosts=new Map();for(const selector of ['.mw-transit-page','.library-relocation-page']){const page=selector==='.mw-transit-page'?document.querySelector('.library-transit-form')?.closest('section'):document.querySelector(selector);if(!page)continue;const host=document.createElement('div');host.className='mw-secondary-settings';const anchor=page.querySelector('.mw-time-step,.relocation-form')||page.querySelector('form');anchor.after(host);hosts.set(selector,host);}
  const locateSettings=()=>{const selector=location.hash==='#transit'?'.mw-transit-page':location.hash==='#relocation'?'.library-relocation-page':null,host=hosts.get(selector);if(host){host.append(parameters,settings);}else{tools.append(parameters);layout.prepend(settings);}};
  // Secondary pages are decorated below, after their existing forms have been found.
  queueMicrotask(locateSettings);window.addEventListener('hashchange',locateSettings);


 }
 const adjustWheel=()=>{const svg=wheel.querySelector('svg');if(svg)svg.setAttribute('viewBox','8 8 604 604');};adjustWheel();new MutationObserver(adjustWheel).observe(wheel,{childList:true});
 function reading(){const content=document.getElementById('wInterpretation');if(content&&!content.closest('.mw-reading')){const details=document.createElement('details');details.className='mw-reading';const label=document.createElement('summary');label.textContent='命盘解析';content.before(details);details.append(label,content);}}
 reading();new MutationObserver(reading).observe(result,{childList:true});
 installSecondaryCharts();
}

// Keep the engine-owned forms and handlers; change only their presentation.
function installSecondaryCharts(){
 const transitForm=document.querySelector('.library-transit-form'),relocation=document.querySelector('.library-relocation-page');
 const fold=(node,label)=>{if(!node||node.closest('.mw-secondary-details'))return;const d=document.createElement('details');d.className='mw-secondary-details';const title=document.createElement('summary');title.textContent=label;node.before(d);d.append(title,node);return d;};
 const outputs=[document.querySelector('.library-transit-output'),relocation?.querySelector('.relocation-output')].filter(Boolean);
 for(const output of outputs){
  const decorate=()=>{const charts=output.querySelector('.library-transit-charts');if(!charts||charts.dataset.mobile)return;charts.dataset.mobile='true';
   // Both original generators emit natal first and the requested chart second.
   if(charts.children.length===2)charts.firstElementChild.remove();
   charts.querySelector('h2')?.remove();const svg=charts.querySelector('svg');if(svg)svg.setAttribute('viewBox','8 8 604 604');
   for(const node of [...output.children]){if(node===charts)continue;const details=fold(node,node.tagName==='TABLE'||node.classList.contains('table-scroll')?'行星与宫位数据':node.tagName==='P'?'排盘信息':'详细解读');if(details)output.append(details);}
   const info=[...output.querySelectorAll(':scope>.mw-secondary-details')].filter(d=>d.querySelector('summary').textContent==='排盘信息');if(info.length){for(const d of info.slice(1)){for(const child of [...d.children])if(child.tagName!=='SUMMARY')info[0].append(child);d.remove();}output.append(info[0]);}
  };decorate();new MutationObserver(decorate).observe(output,{childList:true});
 }
 if(transitForm){const page=transitForm.closest('section');page.classList.add('mw-transit-page');
  const offset=transitForm.querySelector('[name=transitOffset]').closest('label');offset.hidden=true;offset.style.setProperty('display','none','important');
  const submit=transitForm.querySelector('[type=submit]');submit.textContent='更新';
  const step=document.createElement('div');step.className='mw-time-step';for(const [label,delta]of [['前一天',-1],['后一天',1]]){const button=document.createElement('button');button.type='button';button.textContent=delta<0?'‹':'›';button.setAttribute('aria-label',label);button.onclick=()=>{const date=transitForm.elements.namedItem('transitDate'),d=new Date(date.value+'T00:00:00Z');if(!Number.isFinite(+d))return;d.setUTCDate(d.getUTCDate()+delta);date.value=d.toISOString().slice(0,10);transitForm.requestSubmit();};step.append(button);}transitForm.before(step);step.append(transitForm);
  transitForm.addEventListener('change',()=>{if(transitForm.checkValidity())transitForm.requestSubmit();});
  const status=page.querySelector('.library-transit-status'),statusDetails=fold(status,'排盘口径');page.querySelector('.library-transit-output').after(statusDetails);new MutationObserver(()=>{statusDetails.open=!page.querySelector('.library-transit-output svg')&&!!status.textContent;}).observe(status,{childList:true});
  for(const node of [...page.children])if(node.matches('.finance-scan,.wealth-curves'))fold(node,node.querySelector('h2')?.textContent||'更多工具');
 }
 if(relocation){const form=relocation.querySelector('.relocation-form');form.querySelector('[type=submit]').textContent='更新命盘';const compare=form.querySelector('.relocation-compare');const compareDetails=fold(compare,'城市对比');relocation.append(compareDetails);const status=relocation.querySelector('.relocation-status'),details=fold(status,'排盘口径');relocation.querySelector('.relocation-output').after(details);new MutationObserver(()=>{details.open=!relocation.querySelector('.relocation-output svg')&&!!status.textContent;}).observe(status,{childList:true});fold(relocation.querySelector('.relocation-comparisons'),'城市对比结果');
  const destination=form.querySelector('.relocation-destination');destination.classList.add('mw-destination');
  const note=destination.querySelector('.residence-picker>.note'),placeDetails=fold(note,'地点信息');if(placeDetails)relocation.append(placeDetails);const actions=destination.querySelector('.compact-place-actions');if(actions){actions.append(form.querySelector('[type=submit]'));const manual=actions.querySelector('.quiet-btn');if(manual&&manual.type!=='submit')manual.textContent='自定义';}
 }
 const enter=()=>{if(document.body.dataset.mcProfile!=='ready')return;if(location.hash==='#transit'&&transitForm?.checkValidity())transitForm.requestSubmit();
  if(location.hash==='#relocation'&&relocation){const fields=relocation.querySelector('.residence-coordinates');if([...fields.querySelectorAll('input')].every(x=>x.value!==''))relocation.querySelector('form').requestSubmit();}};
 window.addEventListener('hashchange',enter);enter();
}
