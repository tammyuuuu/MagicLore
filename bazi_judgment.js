/* 普通扶抑实验规则：权重为本项目启发式，非流派通用标准。 */
window.judgeBazi=function(r){
 const p=r.calculatedResult,ks=['year','month','day','hour'],els=['木','火','土','金','水'],idx=els.indexOf(p.day.stemAttributes.element),same=els[idx],print=els[(idx+4)%5],out=els[(idx+1)%5],money=els[(idx+2)%5],officer=els[(idx+3)%5];
 const supports=e=>e===same||e===print;let yes=0,no=0;const evidence=[];
 ks.forEach(k=>{if(k!=='day'){const ok=supports(p[k].stemAttributes.element);ok?yes++:no++;evidence.push(p[k].stem+'透干 '+(ok?'生扶':'泄耗制'));}const hidden=p[k].hiddenStems,total=hidden.length===1?1:hidden.length===2?1.3:1.5;hidden.forEach((h,i)=>{const weight=(i===0?1:i===1?.3:.2)/total*(k==='month'?3:1);supports(h.element)?yes+=weight:no+=weight;});});
 const roots=ks.flatMap(k=>p[k].hiddenStems.filter(h=>h.element===same).map(h=>p[k].branch+'藏'+h.stem));
 const ratio=yes/(yes+no),weak=ratio<.42,strong=ratio>.58,extreme=ratio<.15||ratio>.85;
 const clash=['子午','丑未','寅申','卯酉','辰戌','巳亥'].filter(pair=>ks.some(k=>p[k].branch===pair[0])&&ks.some(k=>p[k].branch===pair[1]));
 const uncertain=extreme||clash.some(pair=>pair.includes(p.month.branch));
 const leaningWeak=ratio<.5,balanced=Math.abs(ratio-.5)<.001;
 const verdict=weak?'日主偏弱':strong?'日主偏强':balanced?'日主接近平衡':leaningWeak?'接近平衡，略偏弱':'接近平衡，略偏强';
 const favorable=balanced?[]:leaningWeak?[print,same]:[out,money,officer],avoid=balanced?[]:leaningWeak?[out,money,officer]:[print,same];
 return {verdict,favorable,avoid,uncertain,balanced,leaningWeak,roots,ratio,clash,evidence,same,print,out,money,officer};
};
/* Conservative rule signals: no event probabilities or numeric fortune scores. */
window.buildBaziInsight=function(r,now=new Date()){
 const j=window.judgeBazi(r),p=r.calculatedResult,keys=['year','month','day','hour'];
 const stemElement=s=>'木木火火土土金金水水'['甲乙丙丁戊己庚辛壬癸'.indexOf(s)];
 const branches=keys.map(k=>p[k].branch),hidden=keys.flatMap(k=>p[k].hiddenStems),visible=keys.filter(k=>k!=='day').map(k=>p[k].stemAttributes.element);
 const supports=e=>e===j.same||e===j.print;
 // Strict sufficient subsets only: no assumed combination transformations.
 const stemCombines=['甲己','乙庚','丙辛','丁壬','戊癸'].some(pair=>keys.some(k=>p[k].stem===pair[0])&&keys.some(k=>p[k].stem===pair[1]));
 const branchComplications=['子午','丑未','寅申','卯酉','辰戌','巳亥','子丑','寅亥','卯戌','辰酉','巳申','午未','子未','丑午','寅巳','卯辰','申亥','酉戌','子卯','丑戌','未戌'].some(pair=>branches.includes(pair[0])&&branches.includes(pair[1]))||['辰','午','酉','亥'].some(b=>branches.filter(x=>x===b).length>1);
 const clean=!stemCombines&&!branchComplications;
 const allElements=[...visible,...hidden.map(h=>h.element)];
 const followStrong=clean&&allElements.every(supports)&&p.month.hiddenStems[0].element===j.same&&j.roots.length>0;
 const followWeak=clean&&!allElements.some(supports)&&new Set(allElements).size===1&&[j.out,j.money,j.officer].includes(allElements[0]);
 const follow=followStrong?'从强':followWeak?'从弱':null;
 const level=follow||(j.ratio<.25?'身弱':j.ratio<.42?'偏弱':j.ratio<=.58?'平衡':j.ratio<=.75?'偏强':'身强');
 const unresolved=!follow&&(j.ratio<.15||j.ratio>.85||j.uncertain);
 const favorable=followStrong?[j.same,j.print]:followWeak?[allElements[0]]:j.balanced||unresolved?[]:j.favorable;
 const avoid=followStrong?[j.officer,j.money]:followWeak?[j.same,j.print]:j.balanced||unresolved?[]:j.avoid;
 const clash=(a,b)=>['子午','丑未','寅申','卯酉','辰戌','巳亥'].some(pair=>pair.includes(a)&&pair.includes(b)&&a!==b);
 const join=(a,b)=>['子丑','寅亥','卯戌','辰酉','巳申','午未'].some(pair=>pair.includes(a)&&pair.includes(b)&&a!==b);
 const horse=b=>'寅午戌'.includes(b)?'申':'申子辰'.includes(b)?'寅':'巳酉丑'.includes(b)?'亥':'巳';
 const dateYear=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}).format(now));
 const start=new Date(r.luckCycles?.startDate),cycles=(r.luckCycles?.cycles||[]).map((c,i)=>{
  const a=new Date(start),b=new Date(start);a.setUTCFullYear(start.getUTCFullYear()+i*10);b.setUTCFullYear(start.getUTCFullYear()+(i+1)*10);
  const e=stemElement(c.pillar[0]),stem=favorable.includes(e)?'运干与命局所喜五行相合。':avoid.includes(e)?'运干带来命局需要节制的五行。':'';
  const gs=[c.stemTenGod,c.branchTenGod];
  const career=gs.some(g=>['正官','七杀'].includes(g))?'职责、考核与压力主题突出。':gs.some(g=>['食神','伤官'].includes(g))?'表达、产出与改进主题突出。':gs.some(g=>['正印','偏印'].includes(g))?'学习、资质与专业积累主题突出。':'';
  const wealth=gs.some(g=>['正财','偏财'].includes(g))?'财星进入大运，经营、收入安排和支出议题更值得关注。':gs.some(g=>['比肩','劫财'].includes(g))?'合作与资源分配值得关注，先明确预算和分账。':'';
  const relationship=clash(c.pillar[1],p.day.branch)?'运支与日支相冲，关系节奏或共同安排可能需要调整。':join(c.pillar[1],p.day.branch)?'运支与日支相合，关系连接与共同安排值得关注。':'';
  return {...c,current:now>=a&&now<b,scores:{overall:null,career:null,wealth:null,relationship:null},themes:{overall:stem+(clash(c.pillar[1],p.month.branch)?'运支冲月支，环境与工作安排的变化值得关注。':''),career,wealth,relationship}};
 });
 const events={love:[],career:[],wealth:[],move:[]},seen=new Set();
 for(const c of cycles)for(const y of c.years||[]){if(y.year<dateYear||y.year>dateYear+9||seen.has(y.year))continue;seen.add(y.year);const branch=y.annual?.pillar?.[1],g=y.annual?.stemTenGod;if(!branch)continue;
  if(clash(branch,p.day.branch)||join(branch,p.day.branch))events.love.push({year:y.year,text:join(branch,p.day.branch)?'流年与日支相合，适合关注关系连接与共同计划。':'流年与日支相冲，关系安排与沟通需要关注。'});
  if(clash(branch,p.month.branch))events.career.push({year:y.year,text:'流年冲月支，工作环境或职责安排有变化信号。'});
  if(['正财','偏财'].includes(g))events.wealth.push({year:y.year,text:'流年天干为财星，经营机会、收支和资源安排值得关注。'});
  if(branch===horse(p.day.branch)||branch===horse(p.year.branch))events.move.push({year:y.year,text:'流年触发年支或日支对应的驿马，出行与异地事务值得关注。'});
 }
 return {dayMaster:p.day.stem,element:j.same,level,follow,unresolved,favorable,avoid,patterns:[],cycles,events,dateYear};
};
window.renderBaziJudgment=function(r,host){
 const model=window.buildBaziInsight(r);host.replaceChildren();host.classList.add('bazi-summary-report');
 const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
 function card(title){const section=el('section');section.className='bazi-summary-card';section.append(el('h2',title));host.append(section);return section;}
 const core=card('命局核心');core.append(el('p',`${model.dayMaster}${model.element}日主 · ${model.level}`));

 for(const pattern of model.patterns)core.append(el('p',pattern));
 const elements=card('五行喜忌');elements.hidden=!model.favorable.length;elements.append(el('p',model.favorable.length?`喜：${model.favorable.join('、')}　忌：${model.avoid.join('、')}`:''));
 elements.append(el('p',model.follow?'以顺应命局主导气势为主。':model.unresolved?'':'以平衡命局的生扶与消耗为主。'));
 const trend=card('大运趋势'),tabs=el('div'),strip=el('div'),detail=el('p'),status=el('p','');tabs.className='bazi-insight-tabs';strip.className='bazi-cycle-strip';status.className='bazi-insight-note';trend.append(tabs,strip,detail);
 let theme='overall',selected=model.cycles.findIndex(c=>c.current);if(selected<0)selected=0;
 function update(){for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.theme===theme));for(const [i,b]of [...strip.children].entries())b.setAttribute('aria-pressed',String(i===selected));const c=model.cycles[selected];detail.textContent=c?`${c.startYear}—${c.endYear} · ${c.pillar}：${c.themes[theme]}`:'暂无可用的大运数据。';}
 for(const [key,label]of [['overall','综合'],['career','事业'],['wealth','财运'],['relationship','感情']]){const b=el('button',label);b.type='button';b.dataset.theme=key;b.onclick=()=>{theme=key;update();};tabs.append(b);}
 model.cycles.forEach((c,i)=>{const b=el('button');b.type='button';b.append(el('strong',c.pillar),el('small',`${c.startYear}—${c.endYear}`));if(c.current)b.append(el('small','当前'));b.onclick=()=>{selected=i;update();};strip.append(b);});update();
 const special=card('专题预测'),choices=el('div'),list=el('div');choices.className='bazi-insight-tabs';list.className='bazi-event-list';special.append(el('p',`未来十年（${model.dateYear}—${model.dateYear+9}）`),choices,list);
 function choose(key){for(const b of choices.children)b.setAttribute('aria-pressed',String(b.dataset.topic===key));list.replaceChildren();const rows=model.events[key];if(!rows.length)list.append(el('p','暂无对应年份。'));for(const row of rows){const item=el('p');item.append(el('strong',String(row.year)),el('span',row.text));list.append(item);}}
 for(const [key,label]of [['love','婚恋时间'],['career','事业变动'],['wealth','财运机会'],['move','迁移变动']]){const b=el('button',label);b.type='button';b.dataset.topic=key;b.onclick=()=>choose(key);choices.append(b);}choose('love');
};
