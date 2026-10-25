(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RelationshipContent=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
const dimensions={
1:{need:'自主决定与主动开始',pole:'自主',keywords:['自主','方向']},2:{need:'连接、回应与合作',pole:'连接',keywords:['连接','感受']},3:{need:'表达、创造与交流',pole:'表达',keywords:['表达','交流']},4:{need:'结构、稳定与逐步落实',pole:'稳定',keywords:['结构','落实']},5:{need:'变化、自由与亲自体验',pole:'变化',keywords:['变化','弹性']},6:{need:'关系中的照顾、责任与长期维护',pole:'承担',keywords:['关系','责任']},7:{need:'空间、观察与独立理解',pole:'空间',keywords:['观察','空间']},8:{need:'成果、边界与资源掌控',pole:'成果',keywords:['成果','边界']},9:{need:'意义、整体视角与关怀',pole:'意义',keywords:['意义','整体']},11:{need:'敏锐感受、灵感与现实确认',pole:'感受',keywords:['直觉','敏锐']},22:{need:'把较大愿景变成可运行的结构',pole:'建设',keywords:['愿景','结构']},33:{need:'让关怀真正有效，同时保留双方边界',pole:'有边界的支持',keywords:['关怀','边界']}
};
const themes={
responsibility_modes:{title:'都在意长期，只是责任落点不同',kind:['resonance','tension'],poles:['关系与照顾','结构与落实'],explain:'你更容易从关系、回应和照顾理解责任；对方更容易从结构、安排和可靠运行理解责任。双方都不轻视长期，只是一个先看人，一个先看事情怎样落地。',misread:'你可能觉得现实安排忽略了感受；对方可能觉得只有关心却没有明确做法。',imbalance:'失衡时，一方不断补位和照顾，另一方不断修正规则与进度，双方都觉得自己在承担。',coordinate:'讨论重要安排时，先分别说清“谁需要被回应”和“事情怎样才算落实”，不要让其中一种责任代替另一种。'},
closeness_space:{title:'亲近与空间的节奏',kind:['tension','complement'],poles:['靠近与回应','独处与理解'],explain:'一方更容易通过回应、参与和照顾确认关系，另一方更需要先退回自己的空间，理解清楚以后再回应。',misread:'需要靠近的一方可能把暂时退开理解成冷淡；需要空间的一方可能把持续追问理解成压力。',imbalance:'失衡时会形成越追越退的循环，真正的问题不是在意多少，而是处理信息的速度不同。',coordinate:'重要问题发生时，先确认彼此仍愿意处理，再约定一个回来继续谈的具体时间。'},
stability_change:{title:'稳定与变化怎样同时存在',kind:['complement','tension'],poles:['稳定与计划','变化与尝试'],explain:'一方希望事情可预测并逐步推进，另一方更容易通过变化和尝试找到方向。稳定建设时前者更有优势，环境变化时后者的弹性会帮助双方调整。',misread:'计划可能被看成限制，临时改变也可能被看成不可靠。',imbalance:'失衡时，一方越想把规则定死，另一方越想摆脱安排。',coordinate:'把不能轻易改变的底线与可以试验的部分分开，让稳定提供安全感，也给变化留下明确空间。'},
expression_reflection:{title:'表达与内在处理的速度',kind:['tension','complement'],poles:['说出来','想清楚'],explain:'一方通过表达整理想法，另一方往往先在心里观察和分析。两种方式都在处理问题，只是一个边说边形成答案，一个需要形成答案后再说。',misread:'即时表达可能被理解为没有想清楚，沉默思考也可能被理解为不愿交流。',imbalance:'失衡时，一方说得越来越多，另一方退得越来越深。',coordinate:'允许先说出未完成的想法，也允许对方稍后回应；关键是说明当前是在探索，还是已经作出决定。'},
care_meaning:{title:'都不容易把人与感受排除在外',kind:['resonance'],poles:['具体照顾','整体意义'],explain:'一方更容易注意具体关系中的责任与需要，另一方更容易从整体和意义出发。关注尺度不同，但双方都不太容易把人与感受完全排除在决定之外。',misread:'具体照顾可能觉得宏观理想不够落地，整体视角也可能觉得眼前责任遮住了更大的方向。',imbalance:'失衡时，双方都可能承担过多，只是一个困在具体关系，一个困在宏大责任。',coordinate:'把关心落到可执行的小事，同时确认这些投入仍然符合双方真正重视的方向。'},
autonomy_connection:{title:'自主与连接如何并存',kind:['complement','tension'],poles:['自己决定','共同回应'],explain:'一方先确认自己的方向，另一方更自然地考虑关系、气氛和配合。双方可能把不同的决策视角带进关系。',misread:'独立决定可能被理解为没有商量，等待共识也可能被理解为缺少立场。',imbalance:'失衡时，一方独自推进，另一方把自己的需要压到后面。',coordinate:'先说清哪些事项需要个人自主，哪些事项会真实影响双方并需要共同决定。'},
vision_grounding:{title:'愿景与落地互相校准',kind:['complement'],poles:['愿景与可能','步骤与现实'],explain:'一方更容易看见方向、意义或灵感，另一方更自然地考虑步骤、秩序和可持续性。',misread:'愿景可能被看成不切实际，现实检查也可能被看成泼冷水。',imbalance:'失衡时，一个不断提出更大目标，一个只剩下风险与限制。',coordinate:'先允许愿景完整出现，再一起拆成近期可以验证的一小步。'},
shared_number:{title:'共同数字带来的熟悉感',kind:['resonance'],poles:['共同倾向','不同浓度'],explain:'这个数字同时出现在双方的出生结构中，因此相关的处理方式对双方都不完全陌生。出现次数不同，仍会让使用频率和表现强度有所差别。',misread:'熟悉不等于完全相同，也不代表双方会用同一种方式表达。',imbalance:'双方可能一起过度使用这个数字，而忽略其他处理方式。',coordinate:'把共同倾向当作沟通入口，同时保留彼此在浓度和生活经验上的差异。'},
generic_difference:{title:'不同的关注顺序',kind:['complement'],poles:['你的起点','对方的起点'],explain:'双方首先注意的内容不同，这不自动构成冲突，也可能让关系拥有更完整的观察角度。',misread:'人容易把自己最自然的关注顺序，当成唯一合理的顺序。',imbalance:'失衡时，双方会反复证明自己的重点更重要。',coordinate:'先复述对方究竟在保护什么，再讨论这两种需要如何进入同一个安排。'}
};
const advice={
closeness_space:['给彼此不同的处理时间','需要交流的一方可以明确说出自己需要什么；需要空间的一方最好说明什么时候愿意回来继续谈。'],
responsibility_modes:['把关心与安排分开说清','先确认人的感受与需要，再明确负责人、时间和完成标准，避免双方都在承担却看不见彼此。'],
stability_change:['划分稳定区与试验区','保留少数稳定约定，同时为可以改变的安排设定试验期限，让变化不等于失约。'],
expression_reflection:['区分即时回应与最终答案','可以先回应“我听见了”，不强求立刻给结论；约定稍后再继续，避免沉默被误读。'],
care_meaning:['让共同价值落到具体行动','把“我们重视什么”转换成一件双方都能持续做到的小事，并定期检查投入是否过量。'],
generic_difference:['说明自己正在保护的需要','少用“你总是”，改为说明自己此刻更看重稳定、空间、回应或变化中的哪一项。']
};
function profileLine(r,who){const d=dimensions[r.lifePath.value];return`${who}的长期主题更围绕${d.need}展开。`}
function oriented(theme,n){const b=({11:2,22:4,33:6}[n]||n),left={closeness_space:[2,3,6],responsibility_modes:[6],stability_change:[4],expression_reflection:[3],care_meaning:[6],autonomy_connection:[1],vision_grounding:[9,11]}[theme];return left?left.includes(b)?0:1:null}
function pairText(item){const t=themes[item.theme]||themes.generic_difference,side=oriented(item.theme,item.numberA),poles=side===1?[t.poles[1],t.poles[0]]:[...t.poles];return{...t,poles,numberLabel:`${item.numberA} ↔ ${item.numberB}`}}
function missingBridge(n,from,to){return`${to}比较自然使用的数字${n}，可能把${dimensions[n].need}带进关系；这恰好不是${from}出生数字中被重复强化的模式。这不意味着${from}没有数字${n}的能力，也不意味着必须由${to}替${from}承担这一部分。`}
function sharedMissing(n){return`双方的出生日期里都没有数字${n}。${dimensions[n].need}不是你们出生结构中被反复强化的模式，因此可能需要通过共同经验主动练习。空缺不等于缺陷。`}
const reality={
responsibility_modes:['当你还在确认彼此有没有真正回应时，对方可能已经开始安排下一步、解决具体问题。','你可能觉得事情虽然处理了，感受却没有被接住；对方则可能困惑：事情明明已经在解决，为什么仍然不够。'],
closeness_space:['出现重要问题时，一方可能想马上靠近并获得回应，另一方则需要先安静下来想清楚。','如果没有说明各自节奏，靠近容易被感到是催促，暂时退开也容易被误读成冷淡。'],
stability_change:['面对共同安排时，一方可能先问计划能否持续，另一方则更想先试试看再决定。','稳定能让尝试不至于失控，变化也能提醒双方不要把旧安排当成唯一答案。'],
expression_reflection:['一方可能需要边说边整理，另一方则要在心里形成判断后才愿意开口。','沉默不一定是拒绝交流，即时表达也不一定代表结论已经确定。'],
care_meaning:['一方会先注意眼前谁需要被照顾，另一方则更在意这件事是否符合双方长期认同的方向。'],
vision_grounding:['一方先看到值得前往的方向，另一方会紧接着追问需要哪些步骤、资源和时间。'],
shared_number:['遇到相关议题时，双方可能很快理解彼此为何在意；但共同倾向也可能被一起放大。'],
generic_difference:['同一件事发生时，双方可能先注意不同部分，因此给出的第一反应并不相同。']
};
const headlines={responsibility_modes:'你在意“有没有回应”，对方更在意“事情有没有处理好”。',closeness_space:'一个人需要靠近确认，一个人需要空间想清楚。',stability_change:'一个人先确认能否稳定，一个人先寻找新的可能。',expression_reflection:'一个人通过说出来整理，一个人需要想清楚再回应。',care_meaning:'你们都在意人，只是一个看眼前关系，一个看更大的意义。',vision_grounding:'一个人先看方向，一个人先看怎样真正做到。',shared_number:'你们对同一种需要都不陌生。',generic_difference:'你们最先注意的事情不同。'};
const firstQuestions={1:'“这件事我想怎么决定，要不要现在开始？”',2:'“对方有没有听见我的感受，我们怎样才能配合？”',3:'“这件事怎样说出来，能不能换一种表达？”',4:'“下一步怎么安排，谁负责，什么时候落实？”',5:'“有没有别的选择，能不能先试一种新方法？”',6:'“双方有没有认真承担和维护这段关系？”',7:'“事实到底是什么，我需要多少时间想清楚？”',8:'“目标是什么，资源和决定权怎样分配？”',9:'“这件事是否有意义，会对彼此或其他人造成什么影响？”',11:'“我感受到的信号是什么，需要怎样确认？”',22:'“这个长期目标怎样拆成真正能运行的结构？”',33:'“这样的关怀真的帮助到对方了吗，也保留了彼此的边界吗？”'};
function firstQuestion(n){return firstQuestions[n]||firstQuestions[({11:2,22:4,33:6}[n]||n)]}
function sourceLabel(source,n,result,owner){const who=owner==='a'?'你的':'对方的',labels={lifePath:'生命路径',birthday:'生日数',attitude:'态度数',birthYear:'出生年数',personalYear:'个人流年',pinnacle:'当前高峰数',challenge:'当前挑战数'};if(source==='birthFrequency')return`${who}出生数字 ${n} ×${result.birthFrequency[n]||0}`;return`${who}${labels[source]||'数字'} ${n}`}
function relationSources(item,a,b){return{a:sourceLabel(item.sourceA,item.numberA,a,'a'),b:sourceLabel(item.sourceB,item.numberB,b,'b')}}
function overview(item){const t=pairText(item),a=dimensions[item.numberA],b=dimensions[item.numberB],baseA=({11:2,22:4,33:6}[item.numberA]||item.numberA),baseB=({11:2,22:4,33:6}[item.numberB]||item.numberB),scenes=item.theme==='generic_difference'?[`面对同一件事，你更可能先问：${firstQuestion(item.numberA)}；对方则更可能先问：${firstQuestion(item.numberB)}。`,`因此你会先保护“${a.pole}”，对方会先确认“${b.pole}”。分歧往往从进入问题的顺序开始，而不是谁更认真。`]:item.theme==='shared_number'?[`面对相关选择时，你们都可能先问：${firstQuestion(item.numberA)}`,`这种共同反应会让彼此很快知道对方为何在意；也要留意双方是否一起忽略了其他角度。`]:(reality[item.theme]||reality.generic_difference);if(item.theme==='responsibility_modes'){const relationIsA=baseA===6,relationNumber=relationIsA?item.numberA:item.numberB,structureOwner=relationIsA?'对方':'你',relationOwner=relationIsA?'你':'对方',question=firstQuestion(relationNumber),headline=relationNumber===33?`${relationOwner}更在意“关怀是否真正有帮助、有没有边界”，${structureOwner}更在意“事情能否稳定落实”。`:`${relationOwner}更在意“双方有没有认真承担这段关系”，${structureOwner}更在意“事情有没有处理好”。`,explain=relationNumber===33?`${relationOwner}会从关怀是否有效、给予是否越界来理解责任；${structureOwner}则更自然地通过计划、解决问题和建立稳定结构表达责任。33参考6的责任主题，但关注的不是单纯获得回应，而是支持是否真正有效。`:`${relationOwner}会通过照顾、承担和长期维护来表达认真；${structureOwner}则更自然地通过安排、解决问题和落实事情表达认真。`,specificScenes=[`${relationOwner}可能先问：${question}；${structureOwner}则更可能先问：${firstQuestion(4)}`,relationNumber===33?'如果支持没有产生实际帮助，33一方可能感到付出失去意义；如果关怀缺少边界，对方也可能感到压力。':'一方可能用持续照顾证明认真，另一方则用把事情处理妥当证明认真。'];return{headline,explain,scenes:specificScenes}}return{headline:headlines[item.theme]||headlines.generic_difference,explain:t.explain,scenes}}
function stageText(n,challenge,who){const d=dimensions[n]||dimensions[({11:2,22:4,33:6}[n]||n)],c=challenge===0?'这一阶段的成长课题较综合，需要根据实际处境判断重点。':`这一阶段也需要留意数字${challenge}相关的课题：${dimensions[challenge]?.need||'在经验中建立新的处理方式'}。`;return`${who}当前阶段更容易围绕${d.need}展开。${c}`}
function stageTogether(a,b){const da=dimensions[a.pinnacle],db=dimensions[b.pinnacle];return`你当前更想发展${da.need}，对方当前则更集中在${db.need}。这些阶段同时发生时，一方可能更快走向体验与行动，另一方需要先辨认感受、形成自己的方向，因此双方近期对“下一步”的理解速度可能不同。比较有帮助的是先说清各自正在推进什么，而不是要求步调始终一致。`}
function pairThemeForStage(a,b){const x=[({11:2,22:4,33:6}[a]||a),({11:2,22:4,33:6}[b]||b)].sort((m,n)=>m-n).join('-');return{'4-5':'stability_change','6-7':'closeness_space','3-7':'expression_reflection','4-9':'vision_grounding'}[x]||'generic_difference'}
function yearText(a,b){const da=dimensions[a],db=dimensions[b],special=[a,b].sort((x,y)=>x-y).join('-')==='3-6'?`今年你可能更常思考“这段关系接下来怎样安排、怎样更稳定”；对方则更容易思考“我还想表达、尝试或创造什么”。因此可能出现一种节奏差：一个人在确认关系，一个人在扩展体验。`:`今年你更容易把注意力放在${da.need}上，对方更容易关注${db.need}。放进关系里，双方可能会用不同的问题判断什么最值得优先处理。`;return{focusA:`今年更容易关注：${da.keywords.join('、')}。`,focusB:`今年更容易关注：${db.keywords.join('、')}。`,together:special,watch:'这不预告关系结果，只是在说明双方这一年的自然关注点。'} }
return{dimensions,themes,advice,reality,headlines,firstQuestion,profileLine,pairText,missingBridge,sharedMissing,sourceLabel,relationSources,overview,stageText,stageTogether,yearText};
});
