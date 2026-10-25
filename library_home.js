/* Common module home for numerology and astrology. Existing reports remain in their own views. */
(()=>{
 function init(){
 const astro=document.body.dataset.librarySystem==='vedic'||document.body.dataset.librarySystem==='western';
 const system=astro?document.body.dataset.librarySystem:'numerology';
 const definitions=astro?[['natal','本命盘','NATAL CHART','出生时刻 · 你的本命星盘'],['transit','行运盘','TRANSITS','指定时刻 · 与本命位置对照'],['archive','档案','MY ARCHIVE','保存资料 · 回看命盘']]:[['life','本命盘','NUMEROLOGY','出生数字 · 人生周期'],['match','合盘','RELATIONSHIP','双人数字 · 关系结构'],['archive','档案','MY ARCHIVE','保存报告 · 随时回看']];
 if(system==='western')definitions.splice(2,0,['relocation','重置盘','RELOCATION','现居城市 · 比较发展领域']);
 const home=document.createElement('section');home.className='library-module-home';home.setAttribute('aria-label','体系功能首页');
 const heading=document.createElement('h1');heading.textContent=astro?(system==='vedic'?'印度占星':'西洋占星'):'生命灵数';home.append(heading);
 const grid=document.createElement('div');grid.className='library-entry-grid';home.append(grid);
 for(const [id,title,english,description] of definitions){const button=document.createElement('button');button.type='button';button.className='library-entry';button.innerHTML=`<span class="library-entry-sigil"><strong>${title}</strong><small>${english}</small></span><span class="library-entry-caption">${description}</span>`;button.onclick=()=>location.hash=id;grid.append(button);}
 document.body.append(home);
 const back=document.createElement('button');back.type='button';back.className='library-home-return';back.textContent='← 返回首页';back.onclick=()=>location.hash='home';document.body.append(back);
 let transit,archive,transitArchiveSelect;
 let selectedTransitArchive='';
 let editingArchiveId='',archiveName,archiveSave;
 const key=`magiccat_${system}_chart_archive_v1`;
 const api=()=>{if(!window.magiccatAstrology)throw new Error('排盘程序正在加载，请稍后重试。');return window.magiccatAstrology;};
 const readArchives=()=>{const rows=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(rows))throw new Error('档案格式无法读取。');return rows;};
 function transitInput(){if(!selectedTransitArchive)return api().getInput();const row=readArchives().find(row=>String(row.id)===selectedTransitArchive);if(!row?.input)throw new Error('所选档案已不可用，请重新选择。');return {...row.input};}
 function refreshTransitArchives(){if(!transitArchiveSelect)return;const source=transit.querySelector('.library-transit-source');try{const rows=readArchives().filter(row=>row?.input&&row.id!==undefined);transitArchiveSelect.replaceChildren();const current=document.createElement('option');current.value='';current.textContent='当前本命资料（未选择档案）';transitArchiveSelect.append(current);for(const row of rows){const option=document.createElement('option');option.value=String(row.id);option.textContent=`${row.title} · ${row.input.date} ${row.input.time} · ${row.input.place||'自定义坐标'}`;transitArchiveSelect.append(option);}if(selectedTransitArchive&&!rows.some(row=>String(row.id)===selectedTransitArchive))selectedTransitArchive='';transitArchiveSelect.value=selectedTransitArchive;const row=rows.find(row=>String(row.id)===selectedTransitArchive);source.textContent=row?`已选档案：${row.title}；出生 ${row.input.date} ${row.input.time} · ${row.input.place||'自定义坐标'}`:rows.length?'可直接选择档案，或使用当前本命资料。':'还没有本体系档案；可在本命盘保存后直接在这里选择。';}catch(error){source.textContent=error.message;}}
 function archiveList(){
  const list=archive.querySelector('.library-archive-list');list.replaceChildren();
  const message=archive.querySelector('.library-archive-status');
  const trashKey=key+'_trash',readTrash=()=>{const rows=JSON.parse(localStorage.getItem(trashKey)||'[]');if(!Array.isArray(rows))throw new Error('最近删除列表无法读取。');return rows;};
  function card(row,deleted=false){
   const item=document.createElement('article');item.className='library-archive-card';
   const info=document.createElement('div'),title=document.createElement('b'),meta=document.createElement('small');title.textContent=row.title||'本命盘';meta.textContent=`${row.input.date} ${row.input.time} · ${row.input.place||'自定义坐标'}`;info.append(title,meta);if(system==='western'){const residence=document.createElement('small');residence.textContent='现居地：'+(row.input.residence?.place||'未填写');info.append(residence);}
   const actions=document.createElement('div');actions.className='library-archive-actions';
   const open=document.createElement('button');open.type='button';open.className='quiet-btn';open.textContent=deleted?'恢复':'查看';open.setAttribute('aria-label',`${deleted?'恢复':'查看'}档案 ${row.title||'本命盘'}`);
   open.onclick=()=>{try{if(deleted){const rows=readArchives();if(!rows.some(r=>String(r.id)===String(row.id)))rows.unshift(row);localStorage.setItem(key,JSON.stringify(rows));localStorage.setItem(trashKey,JSON.stringify(readTrash().filter(r=>String(r.id)!==String(row.id))));archiveList();refreshTransitArchives();message.textContent='档案已恢复。';}else{editingArchiveId='';if(archiveSave)archiveSave.textContent='保存到档案';if(api().openNatal)api().openNatal(row.input);else api().restore(row.input);window.dispatchEvent(new Event('magiccat-place-restored'));location.hash='report';}}catch(error){message.textContent=error.message;}};
   actions.append(open);
   if(system==='western'&&!deleted){const edit=document.createElement('button');edit.type='button';edit.className='quiet-btn';edit.textContent='编辑';edit.setAttribute('aria-label','编辑档案 '+(row.title||'本命盘'));edit.onclick=()=>{api().restore(row.input);window.dispatchEvent(new Event('magiccat-place-restored'));editingArchiveId=String(row.id);archiveName.value=row.title||'本命盘';archiveSave.textContent='更新档案';location.hash='natal';};actions.append(edit);}

   if(!deleted){const remove=document.createElement('button');remove.type='button';remove.className='quiet-btn';remove.textContent='删除';remove.setAttribute('aria-label',`删除档案 ${row.title||'本命盘'}`);remove.onclick=()=>{try{const trash=readTrash().filter(r=>String(r.id)!==String(row.id));trash.unshift(row);localStorage.setItem(trashKey,JSON.stringify(trash));localStorage.setItem(key,JSON.stringify(readArchives().filter(r=>String(r.id)!==String(row.id))));if(selectedTransitArchive===String(row.id)){selectedTransitArchive='';transit.querySelector('.library-transit-output').replaceChildren();transit.querySelector('.library-transit-status').textContent='所选档案已移至最近删除，请重新选择本命资料。';for(const selector of ['.finance-scan-results','.curve-result'])transit.querySelector(selector)?.replaceChildren();}archiveList();refreshTransitArchives();message.textContent='已移至最近删除，可以恢复。';}catch(error){message.textContent=error.message;}};actions.append(remove);}
   item.append(info,actions);return item;
  }
  try{const rows=readArchives();if(!rows.length){const empty=document.createElement('p');empty.className='note';empty.textContent='还没有档案。在本命盘填写出生资料后，可以保存到这里。';list.append(empty);}rows.forEach(row=>list.append(card(row)));const trash=readTrash();if(trash.length){const details=document.createElement('details');details.className='library-archive-trash';const summary=document.createElement('summary');summary.textContent=`最近删除（${trash.length}）`;details.append(summary);trash.forEach(row=>details.append(card(row,true)));list.append(details);}}catch(error){message.textContent=error.message;}
 }
 if(astro){
  window.magiccatTransitInput=transitInput;
  transit=document.createElement('section');transit.className='library-module-page';transit.hidden=true;
  transit.innerHTML='<h1>行运盘</h1><p>直接选择已保存的本命档案，查看指定时刻的行运；也可以使用当前本命资料。</p><form class="library-transit-form"><label>行运日期<input name="transitDate" type="date" required></label><label>行运时间<input name="transitTime" type="time" step="1" value="12:00:00" required></label><label>行运时刻 UTC 偏移<input name="transitOffset" value="+08:00" pattern="[+-][0-9]{2}:[0-9]{2}" required></label><button class="quiet-btn" type="submit">生成行运盘</button></form><p class="library-transit-status" role="status"></p><div class="library-transit-output"></div>';
  const choice=document.createElement('label');choice.className='library-transit-archive';choice.textContent='选择本命档案';transitArchiveSelect=document.createElement('select');transitArchiveSelect.setAttribute('aria-label','选择本命档案');choice.append(transitArchiveSelect);const source=document.createElement('p');source.className='note library-transit-source';source.setAttribute('role','status');transit.querySelector('form').before(choice,source);
  transitArchiveSelect.onchange=()=>{selectedTransitArchive=transitArchiveSelect.value;refreshTransitArchives();transit.querySelector('.library-transit-output').replaceChildren();transit.querySelector('.library-transit-status').textContent='';for(const selector of ['.finance-scan-results','.curve-result'])transit.querySelector(selector)?.replaceChildren();for(const selector of ['.finance-scan-status','.wealth-curves [role=status]']){const status=transit.querySelector(selector);if(status)status.textContent='本命资料已切换，请重新生成相应曲线。';}if(transit.querySelector('form').reportValidity())transit.querySelector('form').requestSubmit();};
  const now=new Date();transit.querySelector('[type=date]').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const signs=['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  const position=x=>`${signs[Math.floor(x/30)]} ${(x%30).toFixed(3)}°`;
  transit.querySelector('form').onsubmit=e=>{e.preventDefault();const status=transit.querySelector('.library-transit-status'),output=transit.querySelector('.library-transit-output');try{const engine=api(),natal=transitInput(),fields=e.currentTarget.elements,target={...natal,date:fields.namedItem('transitDate').value,time:fields.namedItem('transitTime').value};target[system==='vedic'?'timezoneOffset':'offset']=fields.namedItem('transitOffset').value.trim();const birth=engine.positions(natal),current=engine.transitPositions?engine.transitPositions(natal,target):engine.positions(target);const table=document.createElement('table');table.innerHTML='<thead><tr><th>星体</th><th>本命位置</th><th>行运位置</th><th>行运状态</th></tr></thead>';if(system==='western'){const th=document.createElement('th');th.textContent='行运落本命宫位';table.querySelector('thead tr').append(th);}const tbody=document.createElement('tbody');for(const p of current){const tr=document.createElement('tr');for(const value of [p.name,position(birth.find(b=>b.name===p.name).longitude),position(p.longitude),p.retrograde?'逆行':'顺行']){const td=document.createElement('td');td.textContent=value;tr.append(td);}if(system==='western'){const td=document.createElement('td');td.textContent=`第 ${p.house} 宫`;tr.append(td);}tbody.append(tr);}table.append(tbody);const charts=document.createElement('div');charts.className='library-transit-charts';for(const [label,input] of [['本命盘',natal],['行运盘',target]]){const panel=document.createElement('div');const title=document.createElement('h2');title.textContent=label;const host=document.createElement('div');host.className='chart-paper';panel.append(title,host);charts.append(panel);if(system==='western'&&label==='行运盘'&&engine.drawTransit){title.textContent='行运盘 · 本命宫位';engine.drawTransit(natal,target,host);}else{engine.draw(input,host);}}output.replaceChildren(charts,table);if(engine.transitInterpretation){const reading=document.createElement('div');reading.innerHTML=engine.transitInterpretation(natal,target);output.append(reading);}status.textContent=`本命：${natal.date} ${natal.time} ${natal.place||''}；行运：${target.date} ${target.time} UTC${fields.namedItem('transitOffset').value.trim()}。${system==='vedic'?'恒星黄道':'回归黄道'}，与本命使用相同设置。${system==='western'?'行运图沿用本命上升与宫头；不表示行运时刻的当地宫位。':''}`;}catch(error){output.replaceChildren();status.textContent=error.message;}};
  archive=document.createElement('section');archive.className='library-module-page library-archive-page';archive.hidden=true;archive.innerHTML='<div class="library-archive-heading"><div class="eyebrow">SAVED CHARTS</div><h1>我的档案</h1><p>保存重要的出生资料与命盘设置，随时回来查看。</p></div><p class="library-archive-status note" role="status"></p><div class="library-archive-list"></div>';
  document.body.append(transit,archive);
  const form=document.getElementById(system==='vedic'?'birthForm':'westernForm');
  const natalArchiveLabel=document.createElement('label');natalArchiveLabel.className='library-natal-archive';natalArchiveLabel.append(document.createTextNode('选择本命档案'));
  const natalArchiveSelect=document.createElement('select');natalArchiveSelect.setAttribute('aria-label','本命盘选择档案');natalArchiveLabel.append(natalArchiveSelect);form.prepend(natalArchiveLabel);
  function refreshNatalArchives(){const selected=natalArchiveSelect.value;natalArchiveSelect.replaceChildren(new Option('当前填写资料（未选择档案）',''));try{for(const row of readArchives().filter(r=>r?.input&&r.id!==undefined))natalArchiveSelect.append(new Option(`${row.title||'本命盘'} · ${row.input.date} ${row.input.time} · ${row.input.place||'自定义坐标'}`,String(row.id)));natalArchiveSelect.value=selected;}catch(error){natalArchiveSelect.value='';}}
  natalArchiveSelect.onchange=()=>{if(!natalArchiveSelect.value)return;try{const row=readArchives().find(r=>String(r.id)===natalArchiveSelect.value);if(!row)throw new Error('档案已不可用，请重新选择。');editingArchiveId='';archiveSave.textContent='保存到档案';archiveName.value=row.title||'本命盘';if(api().openNatal)api().openNatal(row.input);else api().restore(row.input);window.dispatchEvent(new Event('magiccat-place-restored'));message.textContent='已载入档案：'+(row.title||'本命盘');}catch(error){message.textContent=error.message;}};
  window.addEventListener('magiccat-archive-updated',refreshNatalArchives);window.addEventListener('hashchange',refreshNatalArchives);refreshNatalArchives();

  const save=document.createElement('button');save.type='button';save.className='quiet-btn library-save-chart';save.textContent='保存到档案';
  const name=document.createElement('input');name.className='library-archive-name';name.placeholder='档案名称（可选）';name.setAttribute('aria-label','档案名称');
  const message=document.createElement('span');message.className='library-save-status';message.setAttribute('role','status');
  archiveName=name;archiveSave=save;const actions=document.createElement('div');actions.className='library-save-actions';actions.append(name,save,message);form.after(actions);if(system==='vedic'||system==='western'){form.querySelector('.form-actions').append(actions);form.after(natalArchiveLabel);}
  save.onclick=()=>{try{if(!form.reportValidity())return;const input=api().getInput();api().positions(input);const rows=readArchives();const existing=editingArchiveId&&rows.find(r=>String(r.id)===editingArchiveId);if(existing){existing.input=input;existing.title=name.value.trim()||'本命盘';}else rows.unshift({id:Date.now(),title:name.value.trim()||'本命盘',input});localStorage.setItem(key,JSON.stringify(rows));message.textContent=existing?'档案已更新':'已保存到档案';editingArchiveId='';save.textContent='保存到档案';window.dispatchEvent(new Event('magiccat-archive-updated'));}catch(e){message.textContent=e.message;}};
 }
 function route(){const value=location.hash.slice(1);const view=(astro&&value==='report')?'report':definitions.some(d=>d[0]===value)?value:'home';document.body.dataset.libraryView=view;back.hidden=view==='home';home.hidden=view!=='home';if(astro){transit.hidden=view!=='transit';archive.hidden=view!=='archive';if(view==='archive')archiveList();if(view==='transit')refreshTransitArchives();}else if(view!=='home'){document.querySelector(`.tool[data-view="${view}"]`)?.click();}window.scrollTo({top:0,behavior:'instant'});}
 window.addEventListener('hashchange',route);route();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();










