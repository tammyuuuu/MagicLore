import {CHART_SYSTEMS,chartURL,chartProfileInput} from './chart-profile.js';
import {listPeople,ensureDefaultPerson,getPerson,getSelectedPerson,selectPerson} from './person-store.js';
import {homeIcon} from './home-icons.js';
export async function installChartContext({header,nav}){
 const system=CHART_SYSTEMS.find(r=>location.pathname.endsWith(r[1]))?.[0];if(!system)return;
 ensureDefaultPerson();
 document.body.classList.add('mc-enabled');
 const transitIntro=document.querySelector('.library-transit-form')?.closest('section')?.querySelector('h1+p');if(transitIntro)transitIntro.textContent='使用当前人物档案作为本命，选择行运时刻。';
 const relocationIntro=document.querySelector('.library-relocation-page h1+p');if(relocationIntro)relocationIntro.textContent='使用当前人物档案，选择目的地对照四轴与宫位变化。';
 const old=new URLSearchParams(location.search).has('mlStore');
 const panel=document.createElement('section');panel.className='mc-context';panel.innerHTML='<div class="mc-person-row"><label>人物档案<select aria-label="选择人物档案"><option value="">选择档案</option></select></label><a class="mc-new">＋ 新建</a></div><div class="mc-mode-row"><span class="mc-current-mode"></span><details class="mc-settings"><summary>设置</summary><div class="mc-settings-menu"></div></details></div><p class="mc-status" role="status" hidden></p><a class="mc-edit" hidden>编辑出生资料 ›</a>';
 header.after(panel);const choice=panel.querySelector('select'),message=panel.querySelector('.mc-status'),edit=panel.querySelector('.mc-edit'),newLink=panel.querySelector('.mc-new');
 newLink.href='index.html?mlCreate='+system+'#profiles';
 let activeId=null,sequence=0;
 const updateNav=()=>{nav.innerHTML=CHART_SYSTEMS.map(([key,page,label,icon])=>`<a href="${chartURL(key,activeId)}" ${key===system?'aria-current="page"':''}><span>${homeIcon(icon)}</span>${label}</a>`).join('');};
 nav.setAttribute('aria-label','排盘体系');
 const modes=system==='western'?[['report','本命盘'],['transit','行运盘'],['relocation','重置盘']]:system==='vedic'?[['report','本命盘'],['transit','行运盘']]:system==='life'?[['life','生命灵数'],['match','关系合盘']]:[['chart','八字命盘']];
 const menu=panel.querySelector('.mc-settings-menu');for(const [hash,label]of modes){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{if(system==='bazi'){document.querySelector('[data-module="chart"]')?.click();}else location.hash=hash;panel.querySelector('details').open=false;};menu.append(b);}
 if(system==='western'||system==='vedic'){const b=document.createElement('button');b.type='button';b.textContent='排盘参数';b.onclick=()=>{location.hash='natal';panel.querySelector('details').open=false;};menu.append(b);}
 const updateMode=()=>{const hash=location.hash.slice(1);panel.querySelector('.mc-current-mode').textContent=(hash==='natal'?'排盘参数':modes.find(([key])=>key===hash)?.[1])||modes[0][1];};window.addEventListener('hashchange',updateMode);updateMode();
 const refresh=()=>{const selected=choice.value;choice.replaceChildren(new Option('选择档案',''));try{for(const person of listPeople())choice.append(new Option(person.name,person.id));choice.value=selected;}catch(e){message.textContent=e.message;message.hidden=false;}};refresh();
 async function apply(id){const run=++sequence;activeId=id||null;message.hidden=true;edit.hidden=!id;choice.value=id||'';updateNav();document.body.dataset.mcProfile=old&&!id?'ready':'pending';
  if(!id){if(!old){message.textContent='选择一份人物档案，或新建出生资料。';message.hidden=false;}return;}
  edit.href='index.html?mlEdit='+encodeURIComponent(id)+'&mlCreate='+system+'#profiles';
  try{selectPerson(id);const url=new URL(location.href);url.searchParams.set('mlPerson',id);history.replaceState(null,'',url);
   if(system!=='life'){for(let count=0;count<100&&!((system==='bazi'?window.magicLoreBazi:window.magiccatAstrology));count++)await new Promise(resolve=>setTimeout(resolve,50));}
   if(run!==sequence)return;
   const api=system==='bazi'?window.magicLoreBazi:window.magiccatAstrology;
   const input=chartProfileInput(id,system,api?.getInput?.()||{});
   if(system==='bazi'){if(!api)throw Error('排盘模块尚未就绪，请重选档案重试。');api.restore(input);}
   else if(system==='life'){document.querySelector('[data-view="life"]')?.click();document.getElementById('birthDate').value=input.date;document.getElementById('birthForm').requestSubmit();if(location.hash!=='#match')location.hash='life';}
   else{if(!api)throw Error('排盘模块尚未就绪，请重选档案重试。');const offsetField=document.getElementById(system==='western'?'wOffset':'timezone'),offsetValue=system==='western'?input.offset:input.timezoneOffset;if(offsetField?.tagName==='SELECT'&&![...offsetField.options].some(o=>o.value===offsetValue))offsetField.append(new Option('UTC'+offsetValue,offsetValue));if(api.openNatal)api.openNatal(input);else api.restore(input);location.hash='report';window.dispatchEvent(new Event('magiccat-place-restored'));}
   document.body.dataset.mcProfile='ready';updateMode();
   for(const select of document.querySelectorAll('.library-transit-archive select,.relocation-form>label>select'))select.value='';
  }catch(e){document.body.dataset.mcProfile='incomplete';message.textContent=e.message;message.hidden=false;}
 }
 choice.onchange=()=>{if(!choice.value){selectPerson(null);const url=new URL(location.href);url.searchParams.delete('mlPerson');history.replaceState(null,'',url);}apply(choice.value);};
 window.addEventListener('pageshow',()=>{refresh();if(activeId){const p=getPerson(activeId);if(!p||p.deletedAt)apply('');}});
 window.addEventListener('storage',event=>{if(event.key==='magiclore_people_v1'){refresh();if(activeId)apply(activeId);}});
 let initial=new URLSearchParams(location.search).get('mlPerson');if(!initial&&!old){try{initial=getSelectedPerson()?.id;}catch{}}
 if(!old&&!initial&&(system==='western'||system==='vedic')&&!location.hash)location.hash='report';
 await apply(initial||'');
}
