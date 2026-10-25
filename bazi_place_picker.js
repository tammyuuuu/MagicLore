/* Adapt the shared astrology birthplace picker without changing chart inputs. */
(()=>{
 const form=document.getElementById('form'),place=form.querySelector('[name="place"]');
 const label=place.closest('label');
 place.id='birthPlace';
 for(const name of ['latitude','longitude']){
  const field=form.querySelector(`[name="${name}"]`);field.id=name;
  field.min=name==='latitude'?-90:-180;field.max=name==='latitude'?90:180;
  field.step='any';
 }
 const originalZone=form.querySelector('[name="timezoneId"]'),zoneLabel=originalZone.closest('label');
 const zone=document.createElement('select');zone.name='timezoneId';zone.required=true;
 const zones=typeof Intl.supportedValuesOf==='function'?Intl.supportedValuesOf('timeZone'):['Asia/Shanghai','Asia/Hong_Kong','Asia/Macau','Asia/Taipei','Asia/Tokyo','Asia/Seoul','Asia/Singapore','Europe/London','Europe/Paris','America/New_York','America/Los_Angeles','Australia/Sydney'];
 const preferred=['Asia/Shanghai','Asia/Hong_Kong','Asia/Macau','Asia/Taipei','UTC'];
 const names={'Asia/Shanghai':'中国内地','Asia/Hong_Kong':'香港','Asia/Macau':'澳门','Asia/Taipei':'台湾','UTC':'协调世界时','Asia/Tokyo':'日本','Asia/Seoul':'韩国','Asia/Singapore':'新加坡','Europe/London':'伦敦','Europe/Paris':'巴黎','America/New_York':'纽约','America/Los_Angeles':'洛杉矶','Australia/Sydney':'悉尼'};
 for(const id of [...new Set([...preferred,...zones,originalZone.value])])zone.append(new Option(names[id]?`${names[id]} · ${id}`:id,id));
 zone.value=originalZone.value;originalZone.replaceWith(zone);
 zoneLabel.style.display='none';
 zoneLabel.firstChild.textContent='出生时区';
 label.classList.add('bazi-birth-location');
 form.querySelector(':scope>button').before(label);
 const solar=form.querySelector('[name="trueSolarTime"]').closest('label');
 const correction=document.createElement('div');correction.className='bazi-time-correction';
 const heading=document.createElement('span');heading.textContent='时间校正';
 const zoneText=document.createElement('span');zoneText.className='bazi-zone-summary';
 solar.before(correction);correction.append(heading,zoneText,solar);
 function showZone(){
  try{const instant=new Date(`${form.querySelector('[name="date"]').value||'2000-01-01'}T12:00:00Z`);
   const part=new Intl.DateTimeFormat('en',{timeZone:zone.value,timeZoneName:'longOffset'}).formatToParts(instant).find(p=>p.type==='timeZoneName');
   zoneText.textContent='出生时区 · '+(part?.value||zone.value).replace('GMT','UTC');
  }catch{zoneText.textContent='出生时区 · '+zone.value;}
 }
 const zoneEditor=document.createElement('details');zoneEditor.className='bazi-zone-editor';
 const zoneEditTitle=document.createElement('summary');zoneEditTitle.textContent='调整时区';
 zoneEditor.append(zoneEditTitle,zoneLabel);correction.append(zoneEditor);
 zoneLabel.style.display='block';
 zone.addEventListener('input',showZone);zone.addEventListener('change',showZone);form.querySelector('[name="date"]').addEventListener('change',showZone);
 // Keep seconds in the native time input.
 form.querySelector('[name="time"]').step='1';
 function normalizePlace(){
  const rows=window.CHINA_BIRTHPLACES||[];
  const matches=rows.filter(r=>r.level===1&&(r.name===place.value||r.name.replace(/市$/,'')===place.value));
  if(matches.length===1)place.value=matches[0].path;
  showZone();
 }
 function restore(){normalizePlace();window.dispatchEvent(new Event('magiccat-place-restored'));}
 restore();
 function syncZone(){
  const value=place.value;
  if(value.includes('香港'))zone.value='Asia/Hong_Kong';
  else if(value.includes('澳门'))zone.value='Asia/Macau';
  else if(value.includes('台湾'))zone.value='Asia/Taipei';
  else if((window.CHINA_BIRTHPLACES||[]).some(r=>r.path===value))zone.value='Asia/Shanghai';
  showZone();
 }
 place.addEventListener('change',syncZone);
 form.querySelector('[name="longitude"]').addEventListener('change',syncZone);
 // Archive restoration preserves its named inputs and exact coordinates.
 window.addEventListener('magiccat-place-restored',normalizePlace);
 window.addEventListener('DOMContentLoaded',restore);
 function unifyArrows(){
  form.querySelectorAll('.china-place-regions select').forEach(select=>{
   const height=Math.min(190,Math.max(76,select.options.length*38))+'px';
   if(select.style.height!==height)select.style.setProperty('height',height,'important');
  });
  form.querySelectorAll('.compact-place-value').forEach(button=>{
   const text=button.textContent.replace(/\s*▾$/,'');
   if(button.textContent!==text)button.textContent=text;
  });
 }
 new MutationObserver(unifyArrows).observe(form,{subtree:true,childList:true,characterData:true});
 window.addEventListener('DOMContentLoaded',unifyArrows);
})();
