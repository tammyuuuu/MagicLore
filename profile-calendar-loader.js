let pending;
export async function loadProfileCalendar(){
  if(typeof location==='undefined'||location.protocol!=='file:')return import('./profile-calendar.js');
  if(!pending)pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('profile-calendar.file.js',document.baseURI).href;script.onload=()=>resolve(window.MagicLoreProfileCalendar);script.onerror=()=>{pending=undefined;reject(Error('农历转换未能加载，请使用一键预览后重试。'));};document.head.append(script);});
  return pending;
}
