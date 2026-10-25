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
 const verdict=weak?'日主偏弱（初判）':strong?'日主偏强（初判）':balanced?'日主接近平衡（初判）':leaningWeak?'接近平衡，略偏弱（初判）':'接近平衡，略偏强（初判）';
 const favorable=balanced?[]:leaningWeak?[print,same]:[out,money,officer],avoid=balanced?[]:leaningWeak?[out,money,officer]:[print,same];
 return {verdict,favorable,avoid,uncertain,balanced,leaningWeak,roots,ratio,clash,evidence,same,print,out,money,officer};
};
window.renderBaziJudgment=function(r,host){
 const j=window.judgeBazi(r),p=r.calculatedResult;host.replaceChildren();
 function heading(t){const h=document.createElement('h2');h.textContent=t;host.append(h)}function para(t,cls){const a=document.createElement('p');a.textContent=t;if(cls)a.className=cls;host.append(a)}
 heading('命 盘 重 点');para(`${p.day.stem}${j.same}日主 · ${j.verdict}`,'judgment-lead');
 heading('喜 忌 初 判');
 if(j.favorable.length){
  para(`喜：${j.favorable.join('、')}　｜　忌：${j.avoid.join('、')}`,'judgment-lead');
  para(`取法：按普通格局扶抑。${j.leaningWeak?'生扶一侧较弱，取印比生扶日主，财官食伤先列忌。':'生扶一侧较强，取食伤泄、财耗、官杀制，印比先列忌。'}本项是当前规则的明确初判，尚不能确定最终用神及喜用顺序。`);
  if(j.uncertain)para('可信度低：'+(j.ratio<.15||j.ratio>.85?'生扶比例极端，需先排查从格；若为从格，以上喜忌可能反转。':'月令受冲，需核对根气是否仍有效，以上先按未改变格局计算。'),'reading-evidence');
  else if(!j.favorable.length||j.ratio>=.42&&j.ratio<=.58)para('可信度低：接近平衡，微小权重变化就可能改变喜忌方向。','reading-evidence');
 }else para('扶抑喜忌：暂不能唯一确定。当前生扶与泄耗制恰好平衡；若核定偏弱则喜'+j.print+'、'+j.same+'，若核定偏强则喜'+j.out+'、'+j.money+'、'+j.officer+'。需结合调候与合化裁定。');
 const winter='亥子丑'.includes(p.month.branch),summer='巳午未'.includes(p.month.branch);
 para(`调候重点：${winter?'冬令先核对火的温暖作用':summer?'夏令先核对水的润泽作用':'春秋需按日干与节气细分'}。${winter&&j.avoid.includes('火')||summer&&j.avoid.includes('水')?'与上述扶抑初判存在分歧，不能直接合并成最终喜忌。':'此项不直接覆盖上述扶抑初判。'}`);
 heading('大 运 重 点');
 const list=document.createElement('div');list.className='judgment-luck';(r.luckCycles?.cycles||[]).forEach(c=>{const e=['木','木','火','火','土','土','金','金','水','水']['甲乙丙丁戊己庚辛壬癸'.indexOf(c.pillar[0])];const line=document.createElement('p');line.textContent=`${c.startYear}—${c.endYear}　${c.pillar}　${j.favorable.includes(e)?'运干为喜':j.avoid.includes(e)?'运干为忌，需看制化':'运干喜忌未定'}（${c.stemTenGod}）`;list.append(line)});host.append(list);
 heading('生活主题');para(`事业：观察${j.officer}官杀的职责与${j.out}食伤的输出如何配合。财富：${j.money}为财星范围，${j.favorable.includes(j.money)?'在本次扶抑初判中列为喜，仍需看是否有效':'需先核对承财条件，不能以财星多少直接断收入'}。婚姻：日支${p.day.branch}${j.clash.some(x=>x.includes(p.day.branch))?'在原局见冲，值得进一步检查相处与变化主题':'作为配偶宫继续核对合冲关系'}，不据此直接断离合。`);
 const details=document.createElement('details'),s=document.createElement('summary');s.textContent='查看判断依据与适用范围';const text=document.createElement('p');text.textContent=`月支${p.month.branch}；同五行根气：${j.roots.join('、')||'未见'}；透干：${j.evidence.join('；')}。原局六冲：${j.clash.join('、')||'未见'}。

自动初判采用本项目实验性扶抑权重：月支藏干总权重3，其余支1；藏干按本气/中气/余气1/.3/.2归一化；非日干各1。生扶比例低于42%判偏弱，高于58%判偏强，42%—58%为接近平衡，按50%分生扶强弱方向；恰好50%不强行分喜忌。15%以下或85%以上及月令逢六冲标记低可信度，仍显示普通格局的扶抑基准。当前比例 ${(j.ratio*100).toFixed(0)}%。这些数值是软件启发式，不是旺衰派公认标准。

暂未处理合化、从格、节气深浅与刑害破对根气的影响，因此只作低置信度初判；大运只比较运干，尚未综合运支与流年，不代表十年实际吉凶。排盘结果与喜忌均需核验。`;details.append(s,text);host.append(details);
 para('传统命理解读 · 实验性初判，非现实结果预测。','reading-evidence');
};
