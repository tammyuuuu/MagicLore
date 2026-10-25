// HTTP keeps ESM. Direct file previews use generated classic bundles of the same sources.
(() => {
  const loader=document.currentScript,entry=loader.dataset.entry;
  if(!['app','module-mobile'].includes(entry))return;
  const local=location.protocol==='file:',script=document.createElement('script');
  if(!local)script.type='module';
  script.src=new URL(`${entry}${local?'.file':''}.js`,loader.src).href;
  script.onerror=()=>{document.body.dataset.mlReady='true';document.querySelector('.ml-startup')?.remove();const p=document.createElement('p');p.className='ml-warning';p.textContent='启动文件未能加载。请保留完整文件夹，或双击 Start-MagicLore.cmd 预览。';document.body.prepend(p);};
  document.head.append(script);
  if(local)document.querySelector('link[rel="manifest"]')?.remove();
})();
