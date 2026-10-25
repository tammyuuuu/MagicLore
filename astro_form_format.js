/* Shared birthplace and input presentation; calculation fields remain intact. */
(()=>{
 function init(){
  const form=document.querySelector('#westernForm,#birthForm');if(!form)return;
  const offset=form.querySelector('#wOffset,#timezone');
  if(offset&&offset.tagName==='INPUT'){
   const select=document.createElement('select');select.id=offset.id;select.name=offset.name;select.required=true;
   for(let minutes=-720;minutes<=840;minutes+=15){
    const absolute=Math.abs(minutes),value=(minutes<0?'-':'+')+String(Math.floor(absolute/60)).padStart(2,'0')+':'+String(absolute%60).padStart(2,'0');
    select.append(new Option('UTC'+value,value));
   }
   if(![...select.options].some(o=>o.value===offset.value))select.append(new Option('UTC'+offset.value,offset.value));
   select.value=offset.value;offset.replaceWith(select);
  }
  const archive=document.querySelector('.library-natal-archive');
  if(archive)form.querySelector('.form-actions').append(archive);
  function refresh(){
   form.querySelectorAll('.compact-place-value').forEach(button=>{const text=button.textContent.replace(/\s*▾$/,'');if(text!==button.textContent)button.textContent=text;});
   form.querySelectorAll('.china-place-regions select').forEach(select=>{const height=Math.min(190,Math.max(76,select.options.length*38))+'px';if(select.style.height!==height)select.style.setProperty('height',height,'important');});
   form.querySelectorAll('.compact-place-actions :is(.china-place-manual,.quiet-btn)').forEach(button=>{
    const parent=button.closest('label,.residence-picker'),panel=parent?.querySelector('.china-place-regions');
    button.dataset.expanded=String(!!panel?.hidden);
   });
  }
  new MutationObserver(refresh).observe(form,{subtree:true,childList:true,characterData:true});
  form.addEventListener('click',()=>requestAnimationFrame(refresh));window.addEventListener('magiccat-place-restored',refresh);refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
