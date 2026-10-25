// Move existing sections rather than reproduce data or calculation output.
export function installDetails(){
  function group(){
    for(const section of document.querySelectorAll('#wResult>.section')){
      const title=section.querySelector('h2')?.textContent;
      if(!['行星位置','十二宫宫头','主要相位'].includes(title))continue;
      const details=document.createElement('details'),summary=document.createElement('summary');details.className='ml-data-details';summary.textContent=title;section.before(details);details.append(summary,section);
    }
    for(const host of document.querySelectorAll('.table-wrap,.table-scroll,.chart-wrap')){host.tabIndex=0;host.setAttribute('aria-label','专业数据，可横向滚动');}
  }
  group();const result=document.getElementById('wResult');if(result)new MutationObserver(group).observe(result,{childList:true});
}
