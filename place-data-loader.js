// Keep the local catalogue off chart startup. Editors request it on first use.
(()=>{
 const base=document.currentScript.src;let pending,need;
 const needed=new Promise(resolve=>need=resolve);
 window.magicLoreWhenPlacesNeeded=()=>needed;
 window.magicLoreLoadPlaces=()=>{
  if(Array.isArray(window.CHINA_BIRTHPLACES))return Promise.resolve(window.CHINA_BIRTHPLACES);
  if(!pending)pending=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=new URL('china_places.js',base).href;
   script.onload=()=>{if(!Array.isArray(window.CHINA_BIRTHPLACES)){pending=null;reject(Error('地点库未能读取'));return;}window.dispatchEvent(new Event('magiccat-place-data-ready'));resolve(window.CHINA_BIRTHPLACES);};
   script.onerror=()=>{pending=null;script.remove();reject(Error('地点库未能加载，可先使用自定义坐标。'));};document.head.append(script);
  });
  return pending;
 };
 const request=()=>{need();window.magicLoreLoadPlaces().catch(error=>console.warn(error.message));};
 const route=()=>{if(['#natal','#relocation'].includes(location.hash))request();};
 window.addEventListener('hashchange',route);
 document.addEventListener('focusin',event=>{if(event.target.closest('#westernForm,.birth-panel,#form,.residence-picker'))request();});
 route();
})();
