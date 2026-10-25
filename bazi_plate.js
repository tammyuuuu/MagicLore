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
 let note=document.getElementById('plateRuleNote');if(!note){note=document.createElement('details');note.id='plateRuleNote';chart.closest('.chart-wrap').after(note)}
 note.innerHTML='<summary>命盘查法</summary><p>星运以日干查各支，自坐以各柱天干查坐支，空亡为各柱旬空。神煞已实现：天乙、太极、驿马、桃花、华盖、将星、亡神、劫煞、禄神、金舆；未实现的神煞不代表不存在。天乙、太极、金舆按年干与日干，三合类按年支与日支，禄神按日干；不合并昼夜贵人和其他流派异法。参考：<a href="https://zh.wikisource.org/zh/三命通會/卷三" target="_blank" rel="noopener">三命通会·卷三</a>、<a href="https://6tail.cn/calendar/lunar.bazi.html" target="_blank" rel="noopener">lunar 八字文档</a>。</p>';
};
