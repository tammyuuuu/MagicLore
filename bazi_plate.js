/* 主表格式与查法独立于原排盘和存档；神煞为所列规则的命中项。 */
window.baziShortGod=g=>({'正印':'印','偏印':'枭','正官':'官','七杀':'杀','正财':'财','偏财':'才','食神':'食','伤官':'伤','比肩':'比','劫财':'劫'}[g]||g);
window.baziPlateStars=function(p,r){
 const c=r.calculatedResult,stems=[c.year.stem,c.day.stem],branches=[c.year.branch,c.day.branch],a=[];
 const hit=(name,yes)=>{if(yes)a.push(name)};
 const noble={甲:'丑未',乙:'子申',丙:'亥酉',丁:'亥酉',戊:'丑未',己:'子申',庚:'丑未',辛:'寅午',壬:'卯巳',癸:'卯巳'};
 hit('天乙贵人',stems.some(s=>noble[s].includes(p.branch)));
 const taiji={甲:'子午',乙:'子午',丙:'卯酉',丁:'卯酉',戊:'辰戌丑未',己:'辰戌丑未',庚:'寅亥',辛:'寅亥',壬:'巳申',癸:'巳申'};
 hit('太极贵人',stems.some(s=>taiji[s].includes(p.branch)));
 const groups=['申子辰','寅午戌','巳酉丑','亥卯未'];
 for(const [name,targets] of [['驿马','寅申亥巳'],['桃花','酉卯午子'],['华盖','辰戌丑未'],['将星','子午酉卯'],['亡神','亥巳申寅'],['劫煞','巳亥寅申']])hit(name,branches.some(b=>targets[groups.findIndex(g=>g.includes(b))]===p.branch));
 const lu={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
 hit('禄神',lu[c.day.stem]===p.branch);
 hit('金舆',stems.some(s=>'子丑寅卯辰巳午未申酉戌亥'[('子丑寅卯辰巳午未申酉戌亥'.indexOf(lu[s])+2)%12]===p.branch));
 return a;
};
window.renderBaziPlate=function(r,columns,u){
 const chart=document.getElementById('chart'),c=r.calculatedResult,day=c.day.stem,gan='甲乙丙丁戊己庚辛壬癸',zhi='子丑寅卯辰巳午未申酉戌亥';
 const life=(s,b)=>u.CHANG_SHENG[((u.CHANG_SHENG_OFFSET[s]+(gan.indexOf(s)%2===0?zhi.indexOf(b):-zhi.indexOf(b)))%12+12)%12];
 const heads=columns.map((p,i)=>i<4?['年柱','月柱','日柱','时柱'][i]:p.title);
 const all=[...columns];
 chart.style.setProperty('--chart-min',`${columns.length===4?320:(columns.length+1)*72}px`);
 const td=fn=>all.map((p,i)=>`<td${i===4?' class="transit-start"':''}>${p?fn(p,i):'—'}</td>`).join('');
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const t=r.normalizedTime;
 document.getElementById('timeSummary').innerHTML=`<div class="plate-birth"><b>${esc(t.usedTime)}（${r.options.trueSolarTime?'真太阳时':'标准时间'}）</b><span>${esc(r.calendar.lunar)}</span><span>法定时间：${esc(t.civil)} · ${esc(t.timezoneId)} · UTC${t.utcOffsetSeconds>=0?'+':''}${t.utcOffsetSeconds/3600}</span><span>UTC：${esc(t.utcInstant)}</span><span>经度修正 ${Number(t.longitudeCorrectionMinutes).toFixed(2)} 分；均时差 ${Number(t.equationOfTimeMinutes).toFixed(2)} 分</span><span>真太阳时：${esc(t.trueSolarTime)}；换日规则：${r.options.dayBoundaryRule==='zi_hour'?'23:00 子初':'00:00'}</span></div>`;
 const colored=(s,e,cls='')=>`<span class="element-${e} ${cls}">${esc(s)}</span>`;
 const row=(name,fn,cls='')=>`<tr class="${cls}"><th>${name}</th>${td(fn)}</tr>`;
 chart.classList.add('reference-plate');
 chart.innerHTML=`<thead><tr><th>时间</th>${heads.map((h,i)=>`<th${i===4?' class="transit-start"':''}>${h}</th>`).join('')}</tr></thead><tbody>`+
 row('主星',(p,i)=>i===2?(r.input.gender==='male'?'男':'女'):window.baziShortGod(p.tenGod))+
 row('天干',p=>colored(p.stem,p.stemAttributes.element,'plate-character'))+
 row('地支',p=>colored(p.branch,p.branchAttributes.element,'plate-character'))+
 row('藏干',p=>p.hiddenStems.map(h=>`<div class="plate-hidden">${colored(h.stem,h.element)}<span title="${esc(h.tenGod)}">${window.baziShortGod(h.tenGod)}</span></div>`).join(''),'plate-hidden-row')+
 row('星运',p=>life(day,p.branch))+row('自坐',p=>life(p.stem,p.branch))+
 row('空亡',p=>u.getXunKong(p.name||p.stem+p.branch))+row('纳音',p=>esc(p.nayin))+
 row('神煞',p=>window.baziPlateStars(p,r).map(s=>`<div>${s}</div>`).join('')||'—','plate-stars')+'</tbody>';
 window.installBaziPlateReading?.(r,columns);
 let note=document.getElementById('plateRuleNote');if(!note){note=document.createElement('details');note.id='plateRuleNote';chart.closest('.chart-wrap').after(note)}
 note.innerHTML='<summary>命盘查法</summary><p>星运以日干查各支，自坐以各柱天干查坐支，空亡为各柱旬空。神煞已实现：天乙、太极、驿马、桃花、华盖、将星、亡神、劫煞、禄神、金舆；未实现的神煞不代表不存在。天乙、太极、金舆按年干与日干，三合类按年支与日支，禄神按日干；不合并昼夜贵人和其他流派异法。参考：<a href="https://zh.wikisource.org/zh/三命通會/卷三" target="_blank" rel="noopener">三命通会·卷三</a>、<a href="https://6tail.cn/calendar/lunar.bazi.html" target="_blank" rel="noopener">lunar 八字文档</a>。</p>';
};
// One shared reading panel for natal positions and selected time periods.
window.describeBaziPosition=function(r,p,index,part){
 // Position descriptions need natal judgment, not every luck/annual score.
 const judgment=r.judgmentAnalysis||window.analyzeBaziJudgment?.(r),model=judgment?{judgment,level:judgment.level,favorable:judgment.preferences.favorable,avoid:judgment.preferences.avoid}:null,natal=index<4;
 const roles={比肩:'自主与平等协作',劫财:'同伴参与与资源分配',食神:'稳定表达与生活体验',伤官:'表达、改进与自主发挥',正财:'稳定经营与日常收支',偏财:'机会选择与资源合作',正官:'责任、规范与组织协作',七杀:'挑战、执行与压力',正印:'学习、支持与安全感',偏印:'专业探索与独立思考'};
 const favor=e=>!model?'':model.favorable.includes(e)?`${e}是命局偏喜的五行，较能顺应命局所需。`:model.avoid.includes(e)?`${e}是命局需要节制的五行，相关主题宜避免过度。`:'';
 if(!natal){
  if(window.analyzeBaziPeriod){
   const columns=typeof document!=='undefined'?document.getElementById('chart')?._readingColumns:null;
   const stages=columns?columns.slice(4,index+1):[p];
   const periods=stages.map(stage=>({pillar:stage.stem+stage.branch,id:stage.title?.startsWith('流月')?'month-period':stage.title?.startsWith('流年')?'annual':'luck',source:stage.title?.startsWith('流月')?'month':stage.title?.startsWith('流年')?'annual':'luck'}));
   const evaluated=window.analyzeBaziPeriod(r,periods),score=evaluated.scores.overall;
   const assessment=evaluated.assessments?.overall;
   return {title:`${p.title||'阶段'} · ${p.stem}${p.branch}`,text:`${Number.isFinite(score)?'综合 '+score+' 分。':''}${evaluated.themes.overall}`};
  }
  return {title:(p.title||'阶段')+' · '+p.stem+p.branch,text:'阶段判断尚未就绪。'};
 }
 const meanings=part==='stem'?['年干象征早年环境、家庭背景及对外呈现。','月干象征工作中的表达、角色与社会参与。','日干代表日主本人，是整张命盘的参照。','时干象征个人投入、长期目标与后续发展。']:['年支象征家庭根基与早年生活环境。','月支代表月令，也关联成长环境与日常工作节奏。','日支是传统所说的婚姻宫，关联亲密关系与共同生活。','时支象征长期安排，也关联对子女、晚辈或作品的投入。'];
 const character=part==='stem'?p.stem:p.branch,element=part==='stem'?p.stemAttributes.element:p.branchAttributes.element;
 let text=meanings[index];
 if(part==='stem')text+=index===2?`本盘以${p.stem}${element}为日主。${model?.level?'整体为'+model.level+'。':''}`:`本盘${character}属${element}，对应${p.tenGod}，在这个位置更侧重${roles[p.tenGod]||'该领域的生活安排'}。`;
 else {const hidden=p.hiddenStems||[],main=hidden[0];text+=`${character}属${element}，藏${hidden.map(h=>h.stem).join('、')}。`+(main?`以${main.stem}的${main.tenGod}主题为主，更重视${roles[main.tenGod]||'该领域的生活安排'}。`:'');if(new Set(hidden.map(h=>model?.favorable.includes(h.element)?'喜':model?.avoid.includes(h.element)?'忌':'未定')).size>1)text+='';}
 const converted=model?.judgment?.interactions.transformed.find(change=>change.layer===(part==='stem'?'stem':'branch')&&change.ids.includes(['year','month','day','hour'][index]));
 if(converted)text+=`此处参与${converted.kind}，作用按${converted.element}观察。`;
 text+=favor(converted?.element||(part==='branch'?(p.hiddenStems?.[0]?.element||element):element));

 return {title:`${['年柱','月柱','日柱','时柱'][index]}${part==='stem'?'天干':'地支'} · ${character}`,text};
};
window.installBaziPlateReading=function(r,columns){
 const chart=document.getElementById('chart'),wrap=chart.closest('.chart-wrap');if(!wrap)return;
 let panel=document.getElementById('baziPositionReading');if(!panel){panel=document.createElement('section');panel.id='baziPositionReading';panel.setAttribute('aria-live','polite');wrap.after(panel);}
 const signature=['year','month','day','hour'].map(k=>r.calculatedResult[k].name).join('/');
 chart._readingColumns=columns;
 const luck=document.getElementById('luck');if(luck&&!luck._readingBound){luck._readingBound=true;luck.addEventListener('click',event=>{const target=event.target.closest('[data-month-pillar],.annual-card,.luck-row>div');if(!target)return;const label=target.matches('[data-month-pillar]')?'流月':target.matches('.annual-card')?'流年':'大运';const index=(chart._readingColumns||[]).findIndex(p=>p.title?.startsWith(label));if(index>=0)chart.querySelector(`[data-bazi-pick][data-column="${index}"][data-part="stem"]`)?.click();});}
 const old=chart._readingState,shape=columns.map(p=>p.title+':'+p.stem+p.branch).join('/');
 let selected=old?.signature===signature?old.index:2,part=old?.signature===signature?old.part:'stem';
 if(columns.length>4&&old?.shape!==shape){selected=columns.length-1;part='stem';}if(selected>=columns.length)selected=2;
 function select(index,kind){selected=index;part=kind;chart._readingState={signature,shape,index,part:kind};const p=columns[index],reading=window.describeBaziPosition(r,p,index,kind);panel.replaceChildren();const h=document.createElement('h3'),text=document.createElement('p');h.textContent=reading.title;text.textContent=reading.text;panel.append(h,text);chart.querySelectorAll('[data-bazi-pick]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.column)===index&&(index>=4||b.dataset.part===kind))));}
 for(const [rowIndex,kind]of [[1,'stem'],[2,'branch']]){const row=chart.tBodies[0]?.rows[rowIndex];if(!row)continue;for(let i=0;i<columns.length;i++){const cell=row.cells[i+1],span=cell?.querySelector('.plate-character');if(!span)continue;const b=document.createElement('button');b.type='button';b.className='bazi-character-button';b.dataset.baziPick='';b.dataset.column=i;b.dataset.part=kind;b.setAttribute('aria-label',`${columns[i].title||['年柱','月柱','日柱','时柱'][i]}${kind==='stem'?'天干':'地支'}${span.textContent}，查看解读`);span.replaceWith(b);b.append(span);b.onclick=()=>select(i,kind);}}
 select(selected,part);
};
