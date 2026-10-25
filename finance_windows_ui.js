(()=>{
 function init(){
  if(document.body.dataset.librarySystem!=='western')return;
  const transitForm=document.querySelector('.library-transit-form');if(!transitForm)return;
  const section=document.createElement('section');section.className='western-reading finance-scan';
  section.innerHTML='<h2>财务主题窗口</h2><p class="note">使用当前本命资料，观察收入与事业、合作资源和财务压力的占星主题。窗口反映象征配置，不代表实际收入或获利概率。</p><form class="finance-scan-form"><label>扫描起始日期<input type="date" required></label><label>扫描时长<select aria-label="扫描时长"><option value="1">1年</option><option value="3">3年</option><option value="5" selected>5年</option><option value="10">10年</option><option value="20">20年</option><option value="30">30年</option></select></label><button class="quiet-btn" type="submit">开始扫描</button></form><p class="note finance-scan-status" role="status"></p><div class="finance-scan-results"></div>';
  transitForm.closest('section').append(section);
  const form=section.querySelector('form'),date=form.querySelector('input'),button=form.querySelector('button'),status=section.querySelector('[role=status]'),output=section.querySelector('.finance-scan-results');
  date.value=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const categories=[['all','按相关度查看财务主题']];
  form.onsubmit=async e=>{
   e.preventDefault();button.disabled=true;output.replaceChildren();
   try{
    const api=window.magiccatAstrology;if(!api?.scanFinanceWindows)throw new Error('扫描程序正在加载，请稍后重试。');
    const input=window.magiccatTransitInput?window.magiccatTransitInput():api.getInput(),result=await api.scanFinanceWindows(input,date.value,{years:Number(form.querySelector('select').value),onProgress:percent=>{status.textContent=`本地扫描中 ${percent}%`;}});
    if(JSON.stringify(window.magiccatTransitInput?window.magiccatTransitInput():api.getInput())!==JSON.stringify(input))throw new Error('本命档案已切换，请重新扫描。');status.textContent=`本命：${input.date} ${input.time} · ${input.place||'自定义坐标'}；扫描 ${result.start} 至 ${result.end}，每日12:00 UTC${input.offset}。`;
    const basis=document.createElement('p');basis.className='note';basis.textContent='依据：'+result.targets.map(t=>t.role).join('、')+'。木星/土星的合相、六合、拱相归入建设主题；其余慢行星的合相及五颗慢行星的刑相、对冲归入调整主题。固定本命宫制；统一容许度2°，每日取样，边界及最接近日期约有一天误差。按财务相关性从高到低排列，同星级按窗口开始日期先后排列。星级表示财务关联的直接程度，不表示收益大小、好坏或获利概率；4—5星直接触及收入或共同资金宫主，3星为接到财务宫的间接或辅助关系，1—2星为职业或价值线索。';output.append(basis);
    for(const [key,title] of categories){
     const group=document.createElement('section');group.className='western-reading';const heading=document.createElement('h3');heading.textContent=title;group.append(heading);
     const rows=result.windows.slice().sort((a,b)=>b.relevance.stars-a.relevance.stars||a.start.localeCompare(b.start)||a.peak.localeCompare(b.peak)||a.title.localeCompare(b.title));
     if(!rows.length){const empty=document.createElement('p');empty.className='note';empty.textContent='扫描范围内没有符合这组规则的窗口，不代表现实中没有机会或压力。';group.append(empty);}
     const grid=document.createElement('div');grid.className='western-reading-grid';group.append(grid);
     function card(row){
      const article=document.createElement('article');article.className='finance-window-card';const h=document.createElement('h4');h.className='finance-aspect';h.textContent=row.title;const focus=document.createElement('p');focus.className='finance-focus';focus.textContent=row.planet==='Saturn'&&row.target==='MC'&&row.angle===120?'把事业慢慢做稳':row.planet==='Saturn'&&row.topicHouse===10&&row.angle===0?'落实职业责任与发展安排':row.plainTitle;const range=document.createElement('p');range.className='reading-evidence';range.textContent=`${row.start} — ${row.end}${row.clippedStart||row.clippedEnd?'（窗口在扫描边界截断）':''}`;
      const view=windowRow=>{if(JSON.stringify(window.magiccatTransitInput?window.magiccatTransitInput():api.getInput())!==JSON.stringify(input)){status.textContent='本命资料已改变，请重新扫描后再查看该日行运。';return;}const inputs=transitForm.querySelectorAll('input');inputs[0].value=windowRow.peak;inputs[1].value='12:00:00';inputs[2].value=input.offset;transitForm.requestSubmit();transitForm.scrollIntoView({block:'start'});};
      const inspect=document.createElement('button');inspect.type='button';inspect.className='quiet-btn';inspect.textContent='查看当日行运';inspect.onclick=()=>view(row);
      const relevance=document.createElement('p');relevance.className='finance-relevance';relevance.textContent='财务相关性 '+ '★'.repeat(row.relevance.stars)+'☆'.repeat(5-row.relevance.stars);relevance.setAttribute('aria-label','财务相关性 '+row.relevance.stars+'星，共5星');const reason=document.createElement('p');reason.className='note';reason.textContent=row.relevance.reason+' · '+({income:'收入与事业',shared:'共同资源',pressure:'压力与调整'}[row.category]);article.append(h,focus,range,relevance,reason);
      range.textContent=`${row.start.replaceAll('-','.')} — ${row.end.replaceAll('-','.')} · ${row.theme}${row.clippedStart||row.clippedEnd?'（扫描边界截断）':''}`;
      for(const [index,paragraph] of (row.narrative||[]).entries()){
       const p=document.createElement('p');p.className='reading-detail';
       const phrases=index===0?[paragraph.match(/重点，是([^。]+)/)?.[1]]:index===1?[paragraph.match(/(?:天顶|它)落在([^，。]+)/)?.[1],...paragraph.matchAll(/(?:木星|土星|火星|金星|水星|太阳|月亮)落在(第\d+宫)/g)].map(v=>typeof v==='string'?v:v?.[1]):index===2?[paragraph.match(/本命[^，。]+落在([^，。]+)/)?.[1],paragraph.match(/并掌管([^。]+)/)?.[1]]:[paragraph.match(/行运[^，。]+经过你的本命(第\d+宫)/)?.[1],paragraph.match(/也和([^。]+)有关/)?.[1]];
       const fallback=[paragraph.match(/(?:先|重点，是)([^。；]+?)(?:，|。)/)?.[1],paragraph.match(/(?:落在|落在本命)([^，。]+宫)/)?.[1],paragraph.match(/第\d+宫由([^。]+)掌管/)?.[1],...paragraph.matchAll(/第\d+宫/g)].map(v=>typeof v==='string'?v:v?.[0]);
       const terms=[...new Set([...phrases.filter(Boolean),...fallback.filter(Boolean)].filter(t=>t.length<28))].slice(0,3);let cursor=0;
       const spans=terms.map(term=>({term,start:paragraph.indexOf(term)})).filter(s=>s.start>=0).sort((a,b)=>a.start-b.start);
       for(const span of spans){if(span.start<cursor)continue;p.append(document.createTextNode(paragraph.slice(cursor,span.start)));const strong=document.createElement('strong');strong.textContent=span.term;p.append(strong);cursor=span.start+span.term.length;}
       p.append(document.createTextNode(paragraph.slice(cursor)));article.append(p);
      }
      article.append(inspect);return article;
     }
     rows.slice(0,4).forEach(row=>grid.append(card(row)));
     if(rows.length>4){const more=document.createElement('details');more.className='reading-more';const summary=document.createElement('summary');summary.textContent=`展开其余 ${rows.length-4} 个时间窗口`;const rest=document.createElement('div');rest.className='western-reading-grid';rows.slice(4).forEach(row=>rest.append(card(row)));more.append(summary,rest);group.append(more);}
     output.append(group);
    }
    const link=document.createElement('a');link.href='https://www.astro.com/astrowiki/en/Transits';link.target='_blank';link.rel='noopener';link.textContent='行运象征参考 · Astrodienst';output.append(link);
   }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();



