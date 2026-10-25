let localPromise;
export async function loadBirthOffset(){
  if(location.protocol!=='file:')return import('./civil-offset.js');
  if(!localPromise)localPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('civil-offset.file.js',document.baseURI).href;script.onload=()=>resolve(window.MagicLoreCivilOffset);script.onerror=()=>{localPromise=undefined;reject(Error('出生时区转换文件未能加载，请使用一键预览或 HTTPS 站点。'));};document.head.append(script);});
  return localPromise;
}
