import {readPeople,listPeople,getPerson,savePerson,setPersonDeleted,selectPerson,legacyRecords,personFromLegacy,hideLegacy} from './person-store.js';
import {resolveWallTime} from './profile-time.js';
import {mountPersonEditor} from './person-editor.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateText=p=>p.birth.date.value?`${p.birth.date.calendar==='lunar'?'农历'+(p.birth.date.isLeapMonth===null?'（闰月待核对） ':p.birth.date.isLeapMonth?'闰月 ':' '):'公历 '}${p.birth.date.value}`:'出生日期未知';
const timeText=p=>p.birth.time||'时间未知';
const placeText=p=>p.birth.place.name||'地点未知';
const messages={gap:'这个当地时刻落在夏令时跳过的时段内，请核对。原始输入会保留，不会自动调整。',ambiguous:'这个当地时刻出现过两次，请核对当时的 UTC 偏移；暂不确定也可以先保存。',conflict:'时区规则与所填 UTC 偏移不一致，请核对；资料不会自动改写。','unknown-zone':'时区未知，暂不换算出生瞬间。','unknown-date':'出生日期未知，暂不换算出生瞬间。','unknown-time':'出生时间未知，不以中午或零点代替。'};
export function mountProfiles(main,{notify,backup,initialView='people',management=false,startNew=false,startEdit=null,onEditorSaved=null,onEditorCancel=null}){
  let view=initialView,query='';
  function backButton(){const button=main.querySelector('[data-back]');if(button)button.onclick=render;}
  function render(){
    main.innerHTML=management?`<a class="ml-back" href="#settings">← 返回我的</a><div class="pf-page-head"><h1>${view==='trash'?'最近删除':'旧记录管理'}</h1></div><label class="pf-search">搜索记录<input id="personSearch" aria-label="搜索档案" type="search" placeholder="名称、出生日期或地点" value="${esc(query)}"></label><p id="pfCount" class="pf-caption" role="status"></p><div id="profileList"></div>`:`<div class="pf-list-top"><input id="personSearch" aria-label="搜索档案" type="search" placeholder="搜索名称、出生日期或地点" value="${esc(query)}"><button class="pf-add" id="newProfile" aria-label="添加人物档案"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></div><div id="profileList"></div>`;
    main.querySelector('#newProfile')?.addEventListener('click',()=>edit());
    main.querySelector('#personSearch').oninput=e=>{query=e.target.value;drawList();};drawList();
  }
  function matches(text){return text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());}
  function drawList(){
    const list=main.querySelector('#profileList');list.replaceChildren();let data;
    try{data=readPeople();}catch(error){list.innerHTML=`<p class="ml-warning">${esc(error.message)} 原始数据未清空，请先导出备份。</p>`;return;}
    const legacy=legacyRecords(),hidden=new Set(data.hiddenLegacy);let count=0;
    if(view==='people'&&!management){drawCompactList(list,data,legacy,hidden);return;}

    if(view!=='legacy')for(const p of data.records.filter(p=>view==='trash'?!!p.deletedAt:!p.deletedAt)){
      if(!matches(`${p.name} ${dateText(p)} ${placeText(p)}`))continue;count++;
      const card=document.createElement('article');card.className='ml-profile';card.innerHTML=view==='people'?`<button class="pf-person" data-detail><span><b>${esc(p.name)}</b><small>${esc(dateText(p))} · ${esc(timeText(p))}</small><small>${esc(placeText(p))}</small></span><span aria-hidden="true">›</span></button>`:`<h2>${esc(p.name)}</h2><p>${esc(dateText(p))} · ${esc(timeText(p))}</p><div class="ml-tools"><button class="ml-secondary" data-detail>查看资料</button><button class="ml-secondary" data-restore>恢复档案</button></div>`;
      card.querySelector('[data-detail]').onclick=()=>detail(p.id);card.querySelector('[data-edit]')?.addEventListener('click',()=>edit(p.id));card.querySelector('[data-select]')?.addEventListener('click',()=>safe(()=>{selectPerson(p.id);drawList();notify('已选择：'+p.name);}));card.querySelector('[data-restore]')?.addEventListener('click',()=>safe(()=>{setPersonDeleted(p.id,false);render();notify('档案已恢复。');}));list.append(card);
    }
    for(const item of legacy.rows.filter(x=>view==='people'?x.type==='relationship'&&!hidden.has(x.key):view==='trash'?hidden.has(x.key):!hidden.has(x.key))){
      const r=item.record,p=personFromLegacy(item),title=r.title||r.name||r.input?.place||item.label+'旧命盘';if(!matches(`${title} ${p.birth.date.value||''} ${r.isoA||''} ${r.isoB||''} ${placeText(p)}`))continue;count++;
      const card=document.createElement('article');card.className='ml-profile';card.innerHTML=`<div class="ml-eyebrow">${esc(item.label)}${item.type==='relationship'?'':' · 原记录保留'}</div><h2>${esc(title)}</h2><p>${esc(item.type==='relationship'?`${r.isoA||'未知'} × ${r.isoB||'未知'}`:dateText(p)+' · '+timeText(p))}</p><div class="ml-tools"><button class="ml-secondary" data-old>${item.type==='relationship'?'查看合盘':'查看旧记录'}</button>${view==='trash'?'<button class="ml-secondary" data-restore>恢复显示</button>':''}</div>`;card.querySelector('[data-old]').onclick=()=>legacyDetail(item);card.querySelector('[data-restore]')?.addEventListener('click',()=>safe(()=>{hideLegacy(item.key,false);render();}));list.append(card);
    }
    if(management)for(const error of legacy.errors)list.insertAdjacentHTML('beforeend',`<p class="ml-warning">${esc(error.message)} 原始内容仍可导出。</p>`);
    if(main.querySelector('#pfCount'))main.querySelector('#pfCount').textContent=`${count} 份${view==='legacy'?'旧记录':view==='trash'?'可恢复记录':'人物档案'}`;
    if(!count)list.insertAdjacentHTML('beforeend',`<p class="pf-empty">${query.trim()?'没有匹配的档案':view==='people'?'暂无人物档案，点击右上角 ＋ 添加。':'暂无记录'}</p>`);

  }
  function drawCompactList(list,data,legacy,hidden){
    const rows=[];
    for(const p of data.records.filter(p=>!p.deletedAt))rows.push({key:'person:'+p.id,name:p.name,info:`${dateText(p)} ${timeText(p)} · ${placeText(p)}`,open:()=>detail(p.id)});
    for(const item of legacy.rows.filter(x=>x.type==='relationship'&&!hidden.has(x.key))){
      const r=item.record,index=legacy.rows.filter(x=>x.type==='relationship').findIndex(x=>x.key===item.key);
      rows.push({key:'pair:'+(r.id||item.key),name:r.title||r.name||'关系合盘',info:`${r.isoA||'日期未知'} × ${r.isoB||'日期未知'}`,open:()=>{location.href=`destiny_book_web.html?mlStore=relationship&mlArchive=${index}&mlRef=${encodeURIComponent(item.ref)}#match`;}});
    }
    let stored=[];try{const raw=JSON.parse(localStorage.getItem('magiclore_profile_order_v1')||'[]');if(Array.isArray(raw))stored=raw.filter(k=>typeof k==='string');}catch{notify('排序记录无法读取，档案资料未受影响。');}
    const ordered=[...new Set([...stored,...rows.map(r=>r.key)])].filter(k=>rows.some(r=>r.key===k));
    const visible=ordered.map(key=>rows.find(r=>r.key===key)).filter(r=>matches(r.name+' '+r.info));
    list.classList.add('pf-compact-list');
    for(const row of visible){
      const card=document.createElement('article');card.className='pf-list-card';card.dataset.orderKey=row.key;
      card.innerHTML=`<button class="pf-list-open"><b class="pf-list-name">${esc(row.name)}</b><small>${esc(row.info)}</small></button><button class="pf-drag" aria-label="长按拖动排序：${esc(row.name)}" title="长按拖动；也可使用上下方向键"><svg viewBox="0 0 18 24" aria-hidden="true" fill="currentColor"><circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/></svg></button>`;
      card.querySelector('.pf-list-open').onclick=row.open;list.append(card);
      const handle=card.querySelector('.pf-drag');let timer=null,dragging=false,startX=0,startY=0,dropTarget=null,dropAfter=false;
      const persist=()=>{const keys=[...list.querySelectorAll('[data-order-key]')].map(c=>c.dataset.orderKey),visibleKeys=new Set(keys);let i=0;const next=ordered.map(k=>visibleKeys.has(k)?keys[i++]:k);try{localStorage.setItem('magiclore_profile_order_v1',JSON.stringify(next));ordered.splice(0,ordered.length,...next);}catch{notify('排序未能保存，请检查设备存储空间。');drawList();}};
      handle.onpointerdown=e=>{if(e.button!==0)return;startX=e.clientX;startY=e.clientY;handle.setPointerCapture(e.pointerId);timer=setTimeout(()=>{dragging=true;card.classList.add('pf-dragging');handle.setAttribute('aria-pressed','true');},180);};
      handle.onpointermove=e=>{if(!dragging){if(Math.hypot(e.clientX-startX,e.clientY-startY)>20)clearTimeout(timer);return;}e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.pf-list-card');list.querySelectorAll('.pf-drop').forEach(c=>c.classList.remove('pf-drop'));dropTarget=target&&target!==card&&target.parentElement===list?target:null;if(dropTarget){dropAfter=e.clientY>=dropTarget.getBoundingClientRect().top+dropTarget.getBoundingClientRect().height/2;dropTarget.classList.add('pf-drop');}if(e.clientY<80)window.scrollBy(0,-12);else if(e.clientY>window.innerHeight-115)window.scrollBy(0,12);};
      handle.onpointerup=()=>{clearTimeout(timer);if(dragging){dragging=false;card.classList.remove('pf-dragging');handle.setAttribute('aria-pressed','false');if(dropTarget?.isConnected){list.insertBefore(card,dropAfter?dropTarget.nextSibling:dropTarget);dropTarget.classList.remove('pf-drop');}dropTarget=null;persist();}};
      handle.onpointercancel=()=>{clearTimeout(timer);if(dragging){dragging=false;drawList();}};
      handle.oncontextmenu=e=>e.preventDefault();
      handle.onkeydown=e=>{if(!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowUp'&&card.previousElementSibling)list.insertBefore(card,card.previousElementSibling);else if(e.key==='ArrowDown'&&card.nextElementSibling)list.insertBefore(card.nextElementSibling,card);persist();handle.focus();};
    }
    if(!visible.length)list.innerHTML=`<p class="pf-empty">${query.trim()?'没有匹配的档案':'暂无档案，点击右上角 ＋ 添加。'}</p>`;
  }
  function safe(action){try{action();}catch(error){notify(error.message);}}
  function factsHtml(p){const b=p.birth;let resolution;try{resolution=resolveWallTime(b.date.gregorian,b.time,b.zone);if(b.date.calendar==='lunar'&&!b.date.gregorian)resolution={status:'unconverted',message:'农历原值已保留，尚无可靠的公历日期；排盘前请核对转换。',candidates:[]};}catch(error){resolution={status:'error',message:error.message};}
    return `<dl class="pf-facts"><div><dt>出生日期</dt><dd>${esc(dateText(p))}${b.date.calendar==='lunar'&&b.date.gregorian?`<small>对应公历 ${esc(b.date.gregorian)}</small>`:''}</dd></div><div><dt>出生时间</dt><dd>${esc(timeText(p))}</dd></div><div><dt>出生地点</dt><dd>${esc(placeText(p))}</dd></div><div><dt>经纬度</dt><dd>${b.place.longitude??'未知'} / ${b.place.latitude??'未知'}</dd></div><div><dt>时区</dt><dd>${esc(b.zone.iana||'未知')}${b.zone.fixedOffset?`<small>原始 UTC 偏移 ${esc(b.zone.fixedOffset)}</small>`:''}</dd></div>${resolution.offset?`<div><dt>出生时偏移</dt><dd>UTC${esc(resolution.offset)}</dd></div>`:''}</dl>${messages[resolution.status]||resolution.message?`<p class="ml-warning">${esc(messages[resolution.status]||resolution.message)}</p>`:''}${p.residence?.place?.name?`<h2>现居地点</h2><p>${esc(p.residence.place.name)}</p><p>${esc(p.residence.place.longitude??'未知')} / ${esc(p.residence.place.latitude??'未知')} · ${esc(p.residence.zone.iana||p.residence.zone.fixedOffset||'时区未知')}</p>`:''}${p.notes?`<h2>备注</h2><p class="pf-notes">${esc(p.notes)}</p>`:''}${b.originalInput?`<details class="pf-original"><summary>原始输入留存</summary><pre>${esc(JSON.stringify(b.originalInput,null,2))}</pre></details>`:''}`;
  }
  function detail(id){safe(()=>{const p=getPerson(id);if(!p)throw Error('档案不存在。');main.innerHTML=`<button class="ml-back pf-back" data-back>← 返回档案</button><div class="ml-eyebrow">BIRTH RECORD</div><h1>${esc(p.name)}</h1>${factsHtml(p)}<div class="ml-tools">${p.deletedAt?'<button class="ml-primary" data-restore>恢复档案</button>':'<button class="ml-primary" data-edit>编辑资料</button><button class="ml-secondary" data-select>选择档案</button><button class="ml-secondary" data-delete>删除档案</button>'}</div><h2 class="pf-chart-title">命盘</h2><div class="ml-tools"><a class="ml-secondary" href="bazi_web.html?mlPerson=${encodeURIComponent(p.id)}">八字排盘</a><a class="ml-secondary" href="western_web.html?mlPerson=${encodeURIComponent(p.id)}">西洋占星</a><a class="ml-secondary" href="vedic_web.html?mlPerson=${encodeURIComponent(p.id)}">印度占星</a><a class="ml-secondary" href="destiny_book_web.html?mlPerson=${encodeURIComponent(p.id)}#life">生命灵数</a></div>`;backButton();main.querySelector('[data-edit]')?.addEventListener('click',()=>edit(id));main.querySelector('[data-select]')?.addEventListener('click',()=>safe(()=>{selectPerson(id);notify('已选择：'+p.name);}));main.querySelector('[data-delete]')?.addEventListener('click',()=>safe(()=>{setPersonDeleted(id);render();notify('已移至最近删除，可以恢复。');}));main.querySelector('[data-restore]')?.addEventListener('click',()=>safe(()=>{setPersonDeleted(id,false);render();}));window.scrollTo(0,0);});}
  function legacyDetail(item){const p=personFromLegacy(item),pair=item.type==='relationship',page={birth:null,bazi:'bazi_web.html',personal:'destiny_book_web.html',relationship:'destiny_book_web.html',western:'western_web.html',vedic:'vedic_web.html',westernTrash:'western_web.html',vedicTrash:'vedic_web.html'}[item.type];const rows=legacyRecords().rows.filter(x=>x.type===item.type),index=rows.findIndex(x=>x.key===item.key),url=page?`${page}?mlStore=${item.type}&mlArchive=${index}&mlRef=${item.ref}#${pair?'match':item.type==='personal'?'life':'natal'}`:null;
    main.innerHTML=`<button class="ml-back pf-back" data-back>← 返回档案</button><div class="ml-eyebrow">${esc(item.label)} · 旧记录</div><h1>${esc(p.name||'未命名旧记录')}</h1><p>原记录保持原样。另存人物资料后，可独立编辑，不会修改这份命盘。</p>${pair?`<p>人物 A：${esc(item.record.isoA||'未知')}<br>人物 B：${esc(item.record.isoB||'未知')}</p>`:factsHtml(p)}<div class="ml-tools">${url?`<a class="ml-secondary" href="${url}">查看原命盘</a>`:''}<button class="ml-primary" data-copy>${pair?'另存人物 A':'另存为人物档案'}</button>${pair?'<button class="ml-secondary" data-copy-b>另存人物 B</button>':''}<button class="ml-secondary" data-hide>收起旧记录</button></div><details class="pf-original"><summary>完整旧记录</summary><pre>${esc(JSON.stringify(item.record,null,2))}</pre></details>`;backButton();main.querySelector('[data-copy]').onclick=()=>edit(null,p);main.querySelector('[data-copy-b]')?.addEventListener('click',()=>edit(null,personFromLegacy(item,'b')));main.querySelector('[data-hide]').onclick=()=>safe(()=>{hideLegacy(item.key);render();notify('旧记录已收起；可在最近删除恢复显示，原数据未删除。');});window.scrollTo(0,0);
  }
  function edit(id=null,seed=null){mountPersonEditor(main,{id,seed,notify,onCancel:onEditorCancel||render,onSaved:p=>onEditorSaved?onEditorSaved(p):detail(p.id)});}

  if(startNew||startEdit)edit(startEdit);else render();
}
