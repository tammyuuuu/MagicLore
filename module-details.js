// Make retained professional tables keyboard-scrollable.
export function installDetails(){
  function group(){
    for(const host of document.querySelectorAll('.table-wrap,.table-scroll,.chart-wrap')){host.tabIndex=0;host.setAttribute('aria-label','专业数据，可横向滚动');}
  }
  group();const result=document.getElementById('wResult');if(result)new MutationObserver(group).observe(result,{childList:true});
}
