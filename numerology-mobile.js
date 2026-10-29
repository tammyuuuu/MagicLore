import {listPeople} from './person-store.js';
// Compact numerology presentation; calculations and interpretation copy stay in their original modules.
export function installNumerologyMobile(){
 if(!location.pathname.endsWith('destiny_book_web.html'))return;
 document.body.classList.add('nm-enabled');const context=document.querySelector('.mc-context'),row=context.querySelector('.mc-person-row'),modeRow=context.querySelector('.mc-mode-row'),report=document.getElementById('report');
 const back=document.createElement('a');back.className='nm-back';back.href='index.html#home';back.textContent='‹';back.setAttribute('aria-label','返回藏馆');row.prepend(back);const edit=context.querySelector('.mc-edit');edit.textContent='编辑';row.append(edit);const add=context.querySelector('.mc-new');add.textContent='＋';add.setAttribute('aria-label','新建人物档案');
 const tabs=document.createElement('div');tabs.className='nm-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','灵数功能');modeRow.prepend(tabs);const map=new Map();for(const [hash,label]of [['life','生命灵数'],['match','关系合盘']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('role','tab');b.onclick=()=>{location.hash=hash;document.querySelector(`[data-view="${hash}"]`)?.click();};tabs.append(b);map.set(hash,b);}const syncTabs=()=>{for(const [hash,b]of map)b.setAttribute('aria-selected',String(location.hash==='#match'?hash==='match':hash==='life'));};window.addEventListener('hashchange',syncTabs);syncTabs();
 context.querySelector('.mc-settings').remove();
 const match=document.getElementById('matchView'),pairChoice=document.createElement('div');pairChoice.className='nm-pair-choice';pairChoice.innerHTML='<label>人物一<select aria-label="合盘人物一"></select></label><span aria-hidden="true">×</span><label>人物二<select aria-label="合盘人物二"></select></label><p role="status" hidden></p>';row.insertBefore(pairChoice,add);
 const savePair=document.createElement('button');savePair.type='button';savePair.className='nm-save-pair';savePair.textContent='保存';savePair.onclick=()=>{const original=match.querySelector('#savePair');if(original){try{original.click();savePair.textContent='已保存';}catch(error){notice.textContent='保存失败：'+error.message;notice.hidden=false;}}};row.insertBefore(savePair,add);
 const selectors=[...pairChoice.querySelectorAll('select')],people=listPeople().filter(p=>p.birth.date.gregorian),notice=pairChoice.querySelector('p');modeRow.after(notice);
 selectors.forEach((select,index)=>{select.append(new Option('选择档案',''));for(const p of people)select.append(new Option(p.name,p.id));const preferred='magiclore-default-20000101';select.value=people.find(p=>p.id===preferred)?.id||people[index]?.id||'';select.onchange=()=>openPair();});
 function openPair(){savePair.textContent='保存';const selected=selectors.map(s=>people.find(p=>p.id===s.value));if(selected.some(p=>!p)){notice.textContent='请选择两份人物档案';notice.hidden=false;savePair.disabled=true;match.replaceChildren();return;}notice.hidden=true;savePair.disabled=false;window.RelationshipUI.openDates(selected[0].birth.date.gregorian,selected[1].birth.date.gregorian,selected.map(p=>({id:p.id,name:p.name})));}
 function pairLayout(){match.querySelector('.pair-report-head')?.setAttribute('hidden','');if(match.querySelector('.pair-entry'))openPair();}
 function pairMode(){const active=location.hash==='#match';pairChoice.hidden=!active;savePair.hidden=!active;add.hidden=active;notice.hidden=true;row.querySelector(':scope>label').hidden=active;edit.hidden=active||!document.body.dataset.mcProfile||document.body.dataset.mcProfile!=='ready';if(active){document.querySelector('[data-view="match"]')?.click();if(!match.querySelector('.pair-report'))openPair();pairLayout();}}
 new MutationObserver(pairLayout).observe(match,{childList:true});window.addEventListener('hashchange',pairMode);pairMode();

 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function decorate(){
  if(!report.querySelector('#core')||report.querySelector('.nm-unified'))return;
  const date=document.getElementById('birthDate').value;let result;try{result=window.Numerology.calculate(date,new Date().getFullYear());}catch{return;}
  const C=window.NumerologyContent;
  const entries=[['lifePath','生命路径'],['birthday','生日数'],['attitude','态度数'],['birthYear','出生年数']];
  const retained=document.createElement('div');retained.hidden=true;retained.className='nm-retained-content';
  for(const node of [...report.children])if(!['energy','cycles','year'].includes(node.id)&&!node.classList.contains('report-head')&&!node.classList.contains('disclaimer'))retained.append(node);
  const energy=document.getElementById('energy'),cycles=document.getElementById('cycles'),year=document.getElementById('year');
  if(energy){
    energy.classList.add('nm-unified');energy.querySelector('.missing')?.remove();energy.querySelector('h2').textContent='我的数字';energy.querySelector(':scope>.intro').textContent='点击数字查看解读；同心圆的圈数表示生日中出现的次数，淡色圆框表示未出现。';
    const canvas=energy.querySelector('.star-field'),panel=document.getElementById('energyDetail');canvas.classList.add('nm-unified-grid');canvas.setAttribute('role','group');canvas.setAttribute('aria-label','核心数字与出生数字分布');panel.setAttribute('aria-live','polite');canvas.replaceChildren();
    const values=[...new Set([...Array.from({length:9},(_,i)=>i+1),...entries.map(([key])=>result[key].value)])];
    function choose(n){for(const button of canvas.children)button.setAttribute('aria-pressed',String(Number(button.dataset.value)===n));const roles=entries.filter(([key])=>result[key].value===n);const core=roles.map(([key,label])=>{const copy=key==='lifePath'?C.lifePath(n,result.lifePath.steps):C.position(key,n);return `<h3>${label} ${n} · ${esc(C.number(n).title)}</h3><p>${esc(copy.lead)}</p>`;}).join('');const count=result.birthFrequency[n];let frequency='';if(count!==undefined){const copy=C.frequency(n,count,{isHighest:count===Math.max(...Object.values(result.birthFrequency))});const texts=copy.sections.map(([,text])=>text),groups=(count===0?[texts.slice(0,1),texts.slice(1,3),texts.slice(3)]:[texts.slice(0,2),texts.slice(2,4),texts.slice(4)]).filter(g=>g.length);frequency=`<h3>数字 ${n} · ${esc(C.number(n).title)}</h3>${groups.map(g=>`<p>${esc(g.join(''))}</p>`).join('')}`;}panel.innerHTML=core+frequency;}
    for(const n of values){const roles=entries.filter(([key])=>result[key].value===n),count=result.birthFrequency[n],b=document.createElement('button');b.type='button';b.className='nm-unified-node'+(count?' nm-present':'')+(roles.length?' nm-core-node':'');b.dataset.value=n;b.innerHTML=`<span class="nm-node-rings" aria-hidden="true">${Array.from({length:Math.max(1,count||0)},(_,i)=>`<span style="--ring:${i}"></span>`).join('')}</span><span class="nm-node-value">${n}</span>`;b.setAttribute('aria-label',`${n}${count===undefined?' 大师数':'，出生数字出现 '+count+' 次'}${roles.length?'，'+roles.map(([,label])=>label).join('、'):''}`);b.onclick=()=>choose(n);canvas.append(b);}
    choose(result.lifePath.value);
  }
  if(cycles){cycles.querySelector(':scope>.meaning-grid')?.remove();const challenges=cycles.querySelector('.challenge-line');const buttons=[...cycles.querySelectorAll('.era')];buttons.forEach((button,index)=>{const challenge=challenges?.children[0];if(challenge){challenge.classList.add('nm-stage-challenge');button.append(challenge);}button.setAttribute('aria-label',`第${index+1}阶段：${button.textContent.trim().replace(/\s+/g,' ')}`);});challenges?.remove();const active=cycles.querySelector('.era.current');active?.click();}
for(const section of [energy,cycles,year])if(section)report.append(section);report.append(retained);const disclaimer=report.querySelector(':scope>.disclaimer');if(disclaimer)report.append(disclaimer);


 }
 decorate();new MutationObserver(decorate).observe(report,{childList:true});window.scrollTo({top:0,behavior:'instant'});
}
