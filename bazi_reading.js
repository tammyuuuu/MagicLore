/* 结构解读小样：只解释已计算的干支关系，不以数量判定喜忌。 */
window.renderBaziReading=function(r){
 // The mobile reference tab owns the full report. Keep only its latest input
 // during basic-chart rendering; calculating eight decades is user initiated.
 if(document.body.classList.contains('ml-module')){window.pendingBaziReading=r;window.dispatchEvent(new Event('bazi-reading-updated'));return;}
 return window.renderBaziReadingNow(r);
};
window.renderBaziReadingNow=function(r){
 const chart=document.getElementById('chart'),order=['year','month','day','hour'],labels=['年柱','月柱','日柱','时柱'],p=r.calculatedResult,dm=p.day.stemAttributes;
 let host=document.getElementById('baziReading');if(!host){host=document.createElement('section');host.id='baziReading';host.className='bazi-reading';(chart.closest('.bazi-overview')||chart.closest('.chart-wrap')).after(host);}
 if(window.renderBaziJudgment){window.renderBaziJudgment(r,host);return;}
 host.replaceChildren();
 const title=document.createElement('h2');title.textContent='命 盘 解 读';host.append(title);
 const note=document.createElement('p');note.className='reading-note';note.textContent='结构解读 · 按当前排盘生成。以下为传统命理的象征性解释，可作自我观察；不据此断定现实结果。';host.append(note);
 function section(name,text,evidence,open=false){const d=document.createElement('details');d.open=open;const s=document.createElement('summary');s.textContent=name;const para=document.createElement('p');para.textContent=text;const e=document.createElement('p');e.className='reading-evidence';e.textContent='依据：'+evidence;d.append(s,para,e);host.append(d);}
 const stems=order.map(k=>p[k].stemAttributes.element),counts=Object.fromEntries(['木','火','土','金','水'].map(e=>[e,stems.filter(x=>x===e).length]));
 section('一 · 命盘概览',`日主是${p.day.stem}，属${dm.polarity}${dm.element}；日主是十神关系的参照点，不等于已经判断性格或强弱。月支为${p.month.branch}，季节背景要结合月令及具体节气观察。`,order.map((k,i)=>labels[i]+' '+p[k].name).join(' · '),true);
 const roots=order.flatMap((k,i)=>p[k].hiddenStems.filter(h=>h.element===dm.element).map(h=>labels[i]+p[k].branch+'藏'+h.stem+'（'+h.role+'）'));
 section('二 · 五行与根气',`四个天干的五行分布：${Object.entries(counts).map(([e,n])=>e+' '+n).join('、')}。${roots.length?'地支藏干中可见与日主同五行的根气。':'地支藏干中未见与日主同五行的藏干。'}这只是结构观察，数量与有无根气都不能单独判定身旺身弱，更不能把缺少的五行直接当作喜用。`,roots.length?roots.join('；'):'日主 '+dm.element+'；逐柱核对藏干：'+order.map(k=>p[k].branch+'藏'+p[k].hiddenStems.map(h=>h.stem).join('、')).join('；'));
 const explain={'比肩':['自主与同伴','象征独立、同伴与平等合作。可观察自己如何在自主行动与协作之间取得平衡。'],'劫财':['协作与竞争','象征同伴参与、竞争及共同资源。可观察合作时的责任和资源边界。'],'食神':['表达与积累','象征稳定输出、表达和日常积累。可观察哪些技能适合长期练习。'],'伤官':['表达与改进','象征表达、质疑与改进。可观察提出新想法时如何兼顾沟通方式。'],'正财':['资源与经营','象征资源经营和日常责任。可观察预算、时间分配及持续投入。'],'偏财':['资源与机会','象征灵活资源与机会。可观察如何评估机会、成本和承受范围。'],'正官':['规则与责任','象征规则、职责和秩序。可观察明确流程如何帮助自己完成事情。'],'七杀':['挑战与应对','象征压力、挑战与行动。可观察面对紧迫任务时需要哪些支持。'],'正印':['学习与支持','象征学习、照顾和支持。可观察哪些学习方式与支持关系适合自己。'],'偏印':['探索与专长','象征独特视角、专门知识与探索。可观察如何把兴趣转成可检验的成果。']};
 const visible=order.filter(k=>k!=='day');
 section('三 · 透干十神',visible.map((k,i)=>`${labels[order.indexOf(k)]}${p[k].stem}为${p[k].tenGod}：${explain[p[k].tenGod]?.[1]||'按日主与该天干的生克阴阳关系命名。'}`).join('\n\n'),visible.map(k=>p.day.stem+'对'+p[k].stem+' → '+p[k].tenGod).join('；'));
 section('四 · 生活中的观察',visible.map(k=>explain[p[k].tenGod]?.[0]).filter((x,i,a)=>x&&a.indexOf(x)===i).join('、')+'是本盘透干可以提示的观察主题。可以从工作安排、资源使用和相处边界各记一件具体经历，再对照这些解释是否贴合。十神不构成职业、财富或婚姻结果的预测。','仅采用年、月、时干已显示的十神；藏干不与透干等权计数。');
 section('五 · 判断范围与验盘状态','当前小样不自动定旺衰、格局与喜用神，也不作流年吉凶判断。这些需要结合月令、通根、透干、合冲及具体取法进一步核验。','本页排盘仍处于人工验盘阶段；'+(r.differences?.length?'参考排盘存在差异，请先核对四柱。':'当前四柱与内置参考结果一致。'));
 if(window.renderBaziMethods)window.renderBaziMethods(r,host);
};
