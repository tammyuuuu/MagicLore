import {calculateHora} from './hora.js';
import {GRAHA_METADATA} from './metadata/grahas.js';
import {getRashiMetadata} from './metadata/rashis.js';
const contexts=['个人选择与主动担当','收入、资源与价值积累','技能、交流与持续练习','家庭、居住与生活基础','创造、兴趣与教育投入','工作任务、服务与习惯','合作、客户与共同约定','共享资金、风险与共同承担','学习、专业判断与长期原则','事业职责与成果呈现','团队、支持网络与收益','幕后投入、支出与精力恢复'];
const paths=[
 ['主动担当形成回报','收入与个人判断、主动推动和独立承担联系较近。能够亲自负责一项任务、建立个人专业信誉，可能比只等待外部安排更符合这条线索。'],
 ['在已有资源上持续积累','收入主星回到资源领域，能力定价、资源保存与重复产出容易成为重点。财富经营更需要看已经掌握的条件怎样持续产生价值。'],
 ['通过技能与表达建立收入','第3宫强调练习、表达、传播与主动尝试。收入连接这里时，技能需要经过反复使用，并通过作品、交流或服务让别人了解，才有机会形成回报。'],
 ['生活基础参与资源积累','家庭支持、居住环境与稳定基础可能参与资源安排。这里需要区分来自生活条件的支持，与自己能够持续经营的收入能力。'],
 ['创造与判断参与价值形成','创造、规划、教育与兴趣投入可能参与收入路径。重点在于创意能否形成作品或方法；这一配置本身不意味着投机必然获利。'],
 ['通过任务与服务积累回报','收入更容易与具体任务、服务质量和解决实际问题联系起来。持续交付、专业熟练度与执行效率，是比单次灵感更直接的积累条件。'],
 ['合作与客户关系连接收入','收入路径与一对一合作、客户需要和共同约定有关。专业能力怎样被客户理解、合作中怎样分工，会影响价值能否形成现实回报。'],
 ['共同资源需要深度经营','收入连接共享资源、复杂变化与深层研究。可能涉及共同资金、研究或处理复杂问题，但收益与责任交织，需要辨明哪些资源属于自己、哪些需要共同承担。'],
 ['知识与专业判断形成价值','学习、指导与专业原则参与收入路径。知识需要形成别人可以理解和使用的判断，教育、专业服务或长期学习成果可能成为价值的载体。'],
 ['职责与职业成果连接回报','收入与职业位置、职责和成果呈现联系较强。承担什么工作、形成什么成果，以及成果怎样被评价，会共同影响能力能否获得回报。'],
 ['通过支持网络扩大成果','收入连接团队、共同目标与支持网络。可信的协作和持续的成果，可以让个人能力进入更大的交换范围；连接数量本身并不等于收益。'],
 ['幕后能力需要找到现实出口','收入连接幕后准备、独处研究和支出安排。深度准备可能形成能力，但若长期停留在内部投入，回报也容易难以看见；需要找到让成果进入现实服务或作品的出口。']
];
const skills={Sun:'负责方向、组织推进与承担核心职责',Moon:'理解需要、照顾与回应变化',Mars:'执行、技术实践与主动解决问题',Mercury:'写作、分析、信息整理与沟通',Jupiter:'教学、写作、咨询或知识服务',Venus:'设计、审美、协调与关系服务',Saturn:'长期训练、流程建设与稳定交付'};
export function horaNarrative(chart){
 const d=calculateHora(chart),by=Object.fromEntries(d.grahas.map(p=>[p.name,p])),old=Object.fromEntries(chart.grahas.map(p=>[p.name,p]));
 const name=p=>GRAHA_METADATA[p.name].chineseName,hora=p=>p.sign==='Leo'?'太阳时分':'月亮时分';
 const second=by[getRashiMetadata(chart.houses[1].sign).ruler],eleventh=by[getRashiMetadata(chart.houses[10].sign).ruler],source=old[second.name];
 const companions=chart.grahas.filter(p=>p.bhava===source.bhava&&p.name!==source.name),sameLord=second.name===eleventh.name;
 const saturnTogether=companions.some(p=>p.name==='Saturn'),jupiterTogether=source.name==='Jupiter'||companions.some(p=>p.name==='Jupiter');
 const expense=old[getRashiMetadata(chart.houses[11].sign).ruler],gain=old[eleventh.name];
 const evidence=p=>`${name(p)}：D1${getRashiMetadata(old[p.name].sign).chineseName}第${old[p.name].bhava}宫 · D2${hora(p)}`;
 const earning=[
 `**第2宫代表可支配资源，第11宫代表收益与成果**。${sameLord?`两者都由${name(second)}掌管，而它落在本命**第${source.bhava}宫**，收入与收益因此连接到同一条路径：**${contexts[source.bhava-1]}**。`:`第2宫主星${name(second)}落本命**第${source.bhava}宫**，收入连接到**${contexts[source.bhava-1]}**；第11宫主星${name(eleventh)}落第${gain.bhava}宫，收益进一步联系到${contexts[gain.bhava-1]}。`}`,
 `${paths[source.bhava-1][1]}${name(second)}代表${GRAHA_METADATA[second.name].basicMeaning}，因此可以把这条路径进一步落实到**${skills[second.name]}**这类能力。它们是能够探索的表达方向，需要结合已有经验，而不是唯一的职业答案。`,
 sameLord?`因为收入与收益由同一颗星连接，**怎样形成价值与怎样扩大成果是同一条链条**。${source.bhava===3?'一项技能经过练习，整理成作品或方法，再通过表达与传播被别人使用，才可能从个人能力变成持续回报。':`在${contexts[source.bhava-1]}中形成的能力，需要能被持续使用；收益扩大也依赖这份能力是否具有可靠的实际用途。`}`:`收益主星${name(eleventh)}落第${gain.bhava}宫，说明能力形成以后，还要通过**${contexts[gain.bhava-1]}**让成果得到支持或回收。收入路径与回收路径是否衔接，是这两颗主星共同提出的问题。`
 ];
 const accumulation=[
 companions.length?`收入主星${name(second)}并非单独运作：**${companions.map(name).join('、')}与它同在第${source.bhava}宫**。${companions.map(p=>`${name(p)}带来${GRAHA_METADATA[p.name].basicMeaning}`).join('；')}，使${contexts[source.bhava-1]}同时承载不同的需要。`:`本命收入主星${name(second)}所在的第${source.bhava}宫没有其他九曜同宫。其星座为**${getRashiMetadata(source.sign).chineseName}**，${getRashiMetadata(source.sign).keywords.join('、')}的表达影响这份能力怎样被使用。`,
 saturnTogether&&jupiterTogether?'**木星希望拓展，土星要求训练、结构与持续承担**。两者同宫时，增长需要有可以反复使用的方法作为支撑；学习和尝试若能逐渐整理成专业流程，才更容易积累。拉扯在于：想同时开展更多事情，却也要承担打磨和维持每项工作的成本。':source.name==='Saturn'||saturnTogether?'这里有土星参与，积累更需要时间、训练与稳定交付。责任可以帮助形成专业能力，也可能占满投入；值得分清哪些承担能沉淀经验，哪些只是重复消耗。':`**${getRashiMetadata(source.sign).chineseName}**强调${getRashiMetadata(source.sign).basicQualities.join('、')}。这使收入能力带有自己的节奏：${getRashiMetadata(source.sign).element==='Fire'?'主动尝试能够打开路径，但尝试之后也需要完成和复盘。':getRashiMetadata(source.sign).element==='Earth'?'重复练习与可使用的成果有助于积累，条件改变时也需要调整原有方式。':getRashiMetadata(source.sign).element==='Air'?'信息交换与理解他人需要能促进价值形成，但想法还需要有具体交付。':'感受与回应需要能参与价值形成，也需要安排自己的精力与边界。'}`,
 `第12宫与支出、幕后投入有关，其宫主星**${name(expense)}落本命第${expense.bhava}宫**，把成本连接到${contexts[expense.bhava-1]}。${expense.bhava===source.bhava?'它与收入主星落在同一宫，意味着同一领域既可能形成回报，也会要求投入；收入增加和资源留下来并不总是同步。':'因此，收入投入与资源消耗来自不同联系，二者需要分别理解。'}`
 ];
 return {overview:[`这张盘的财富主线是**${paths[source.bhava-1][0]}**。${sameLord?`收入与收益由同一颗${name(second)}连接，下面将它们合并展开。`:`收入主星${name(second)}与收益主星${name(eleventh)}分别连接能力形成和成果回收。`}`, '本页D2采用太阳—月亮时分法，星体只归入狮子座或巨蟹座。下面先用D1的财富主星解释实际路径，再以D2归属补充；时分数量不作为贫富评分。'],cards:[
 {house:2,importance:10,stars:5,title:'财富路径 · '+paths[source.bhava-1][0],evidence:'D1第2宫主星'+evidence(second)+(sameLord?' · 同时掌管第11宫':' · 第11宫主星'+evidence(eleventh)),paragraphs:earning},
 {house:source.bhava,importance:8,stars:4,title:'积累条件 · '+(saturnTogether&&jupiterTogether?'拓展需要长期训练作支撑':source.name==='Saturn'||saturnTogether?'持续承担怎样沉淀为能力':'让投入形成可以重复使用的成果'),evidence:`D1第${source.bhava}宫：${[source,...companions].map(name).join('、')} · 第12宫主星${name(expense)}第${expense.bhava}宫`,paragraphs:accumulation},
 {house:1,importance:6,stars:3,title:'D2补充 · '+(second.sign===by.Saturn.sign?'资源的形成与保存需要同向配合':'主动建设与资源保存需要兼顾'),evidence:[second,by.Saturn,by.Venus].filter((p,i,ps)=>ps.findIndex(q=>q.name===p.name)===i).map(evidence).join(' · '),paragraphs:[
 `${name(second)}在D2归入**${hora(second)}**。${second.sign==='Leo'?'太阳时分象征主动承担与价值表达，可以补充前面所说的收入路径：自己的能力需要有清楚的表达和实际行动。':'月亮时分象征支持与资源保存，可以补充前面所说的收入路径：能力投入也需要得到稳定条件的支持。'}`,
 `土星归入**${hora(by.Saturn)}**，金星归入**${hora(by.Venus)}**。${second.sign!==by.Saturn.sign?'收入主星与土星的归属不同，可以把它理解为主动拓展与维持稳定之间需要协调；这种协调仍要回到本命同宫、落宫和现实投入去核对。':'收入主星与土星归属相同，但回报形成与持续承担仍是不同需要，不能仅凭相同归属判断结果。'}金星补充满足与价值偏好，资源增长以后怎样使用，也会影响积累是否留下来。`,
 '这套D2归属能补充资源表达，却不能单独确定收入来源、财富金额或发财日期。前两项中的宫主联系与同宫关系，才是这里具体财富路径的主要依据。']}
 ]};
}
