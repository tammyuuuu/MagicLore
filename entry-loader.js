// HTTP keeps ESM. Direct file previews use generated classic bundles of the same sources.
(() => {
  const loader=document.currentScript,entry=loader.dataset.entry;
  if(!['app','module-mobile'].includes(entry))return;
  const local=location.protocol==='file:',script=document.createElement('script');
  if(!local)script.type='module';
  script.src=new URL(`${entry}${local?'.file':'.web'}.js`,loader.src).href;
  script.onerror=()=>{const p=document.querySelector('.ml-startup')||document.createElement('p');p.className='ml-startup ml-warning';p.textContent='启动文件未能加载。请保留完整文件夹，或双击 Start-MagicLore.cmd 预览。';document.body.prepend(p);};
  // Discover the bundled entry while parsing the head, then execute only once
  // the page's DOM and legacy deferred initializers are available.
  if(document.readyState==='loading'){
    if(!local){const preload=document.createElement('link');preload.rel='modulepreload';preload.href=script.src;document.head.append(preload);}
    document.addEventListener('DOMContentLoaded',()=>document.head.append(script),{once:true});
  }else document.head.append(script);
  if(local)document.querySelector('link[rel="manifest"]')?.remove();
})();
