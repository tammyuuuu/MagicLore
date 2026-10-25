import {calculateNavamsa} from './navamsa.js';
import {GRAHA_METADATA} from './metadata/grahas.js';
import {getRashiMetadata} from './metadata/rashis.js';
const context=['自主选择与边界','收入、安全感与资源积累','表达、学习与日常交流','家庭、居住与情绪归属','创造、兴趣与教育投入','日常分工、服务与习惯','一对一沟通与共同承诺','共享资金、信任与共同承担','信念、学习与未来方向','现实责任、工作安排与社会角色','朋友、共同目标与支持网络','独处、休息与幕后付出'];
const practice=['保留个人空间，讲清彼此的边界','谈清收入、支出与安全感需要','及时沟通细节，避免靠猜维持默契','商量居住安排、家庭分工与照顾方式','给共同兴趣、创造和教育留出投入','把日常分工与休息安排成可以持续的习惯','定期确认承诺与预期，给彼此回应的机会','说清共同资金与责任，逐步建立信任','讨论彼此的信念与未来方向','协调工作、时间与责任，而不是只说会照顾对方','保留朋友感与共同目标，也尊重各自的社交连接','允许独处与恢复，并让幕后付出被看见'];
const heading=['关系需要保留自主空间','安全感需要共同建设','沟通细节影响相处','归属感要落到共同生活','共同兴趣让关系有生命力','稳定来自日常分工','承诺需要持续沟通','信任需要明确共同承担','共同方向比一时默契更重要','喜欢需要落实为责任','朋友感支撑长期连接','亲近也需要独处空间'];
export function navamsaNarrative(chart){
 const d9=calculateNavamsa(chart),by=Object.fromEntries(d9.grahas.map(p=>[p.name,p])),birth=Object.fromEntries(chart.grahas.map(p=>[p.name,p]));
 const name=p=>GRAHA_METADATA[p.name].chineseName,sign=p=>getRashiMetadata(p.sign).chineseName;
 const ascLord=by[getRashiMetadata(d9.lagna.sign).ruler],ruler=by[getRashiMetadata(d9.houses[6].sign).ruler],venus=by.Venus,jupiter=by.Jupiter;
 const positions=p=>`${name(p)}：D1${sign(birth[p.name])}第${birth[p.name].bhava}宫 → D9${sign(p)}第${p.bhava}宫`;
 const bridge=p=>{const a=birth[p.name];return a.bhava===p.bhava?`**${name(p)}在两盘都落第${p.bhava}宫**，${context[p.bhava-1]}这条线索被重复强调。进入长期关系后，这份需要仍然值得被双方理解，并落实为共同的安排。`:`D1里的${name(p)}落**第${a.bhava}宫**，原先的表达背景是${context[a.bhava-1]}；D9中它来到**第${p.bhava}宫**，长期相处更需要面对**${context[p.bhava-1]}**。原本用于个人生活的能力，也需要参与双方的协商与共同承担。`;};
 const same=p=>p.sign===birth[p.name].sign?`${name(p)}在两盘都落**${sign(p)}**，${getRashiMetadata(p.sign).keywords.join('、')}的表达保持一致。两盘同星座称为同分；这里意味着上述表达具有连续性。`:'';
 const occupants=d9.grahas.filter(p=>p.bhava===7);
 const real=[venus,by.Mercury,by.Saturn].filter(p=>[2,4,10].includes(p.bhava));
 const realLead=real[0]||venus;
 const anchors=[ruler,venus,jupiter,ascLord].filter((p,i,ps)=>ps.findIndex(q=>q.name===p.name)===i);
 const echoes=anchors.filter(p=>p.sign===birth[p.name].sign||p.bhava===birth[p.name].bhava);
 const cards=[
 {house:7,importance:10,stars:5,title:'长期关系 · '+heading[ruler.bhava-1],evidence:`D9第7宫${getRashiMetadata(d9.houses[6].sign).chineseName} · 宫主星${positions(ruler)}`,paragraphs:[
 `**第7宫与长期伴侣、共同承诺有关**，其宫主星${name(ruler)}连接着关系怎样落实。${ruler.bhava===7?`宫主星又回到第7宫，让一对一相处本身成为关系的核心。${ruler.name==='Mercury'?'水星代表思考与交流，双方怎样说清需要、讨论分工、修正预期，会直接参与关系的经营。':'双方怎样表达需要与回应承诺，是值得持续观察的重点。'}`:`宫主星落第${ruler.bhava}宫，提示承诺的落实需要经过${context[ruler.bhava-1]}。关系能否走稳，可以从双方怎样共同处理这些实际需要来理解。`}`,
 bridge(ruler),
 occupants.length?`D9第7宫有${occupants.map(p=>`**${name(p)}**`).join('、')}参与。${occupants.map(p=>`${name(p)}带来${GRAHA_METADATA[p.name].basicMeaning}`).join('；')}。双方在表达这些需要时，既要让自己被理解，也需要给对方回应的空间。`: `第7宫没有九曜直接落入，宫主星仍把关系连接到具体生活。承诺的经营，可以从双方怎样回应这些生活需要开始。`,
 `日常相处中，值得**${practice[ruler.bhava-1]}**。${same(ruler)}`]},
 {house:realLead.bhava,importance:8,stars:4,title:'关系中的现实生活 · '+(['亲近与个人空间怎样兼顾','把共同开支和安全感说清','让日常交流成为习惯','共同生活需要安心的归属','给共同兴趣留出时间','日常分工需要可持续','把彼此的期待落实为安排','共同资金与信任需要透明','未来计划需要共同确认','工作与关系都需要时间','朋友和伴侣之间保留连接','让休息与幕后付出被看见'][venus.bhava-1]),evidence:[venus,...real.filter(p=>p.name!=='Venus')].map(positions).join(' · '),paragraphs:[
 ruler.name==='Venus'?`**金星同时是D9第7宫主星**，关系的承诺与亲近感因而连接到同一颗星。它落第${venus.bhava}宫，意味着共同生活里也要照顾${context[venus.bhava-1]}。这份需要怎样落实，可以从日常安排看出来。`:`**金星代表吸引、亲近与价值选择**，也关系到双方怎样感到被珍惜。${bridge(venus)}关系中的满足感，需要在共同生活中得到具体回应。`,
 ['亲近不必要求双方时时同步。例如独自做决定的范围、需要陪伴的时刻、各自保留的兴趣，都可以提前谈清。**个人空间得到尊重，才更容易主动靠近对方。**','共同生活会让收入、消费习惯和安全感变得具体。哪些开支共同承担，哪些资源各自保留，遇到变化时怎样商量，都值得建立清楚的约定。','很多误解来自消息不完整或默认对方知道。时间安排、临时变化和没有说出口的不舒服，都可以及时交流，让沟通成为日常而非冲突后的补救。','居住环境、与家人的距离、照顾彼此的方式，会影响双方是否感到安心。共同生活的基础，是让各自的归属需要都有位置。','共同生活也需要乐趣。兴趣、创作、一起学习或教育投入，可以成为持续连接的来源；喜欢的事情值得在忙碌之外保留时间。','家务、任务、休息和身体状态，是关系每天都要面对的内容。将分工安排得可以持续，并允许双方根据状态调整，比默默承担更容易保持平衡。','约定怎样相处、怎样处理分歧、哪些决定需要一起做，可以减少彼此猜测。承诺需要在这些具体安排里被反复确认。','共享资金、隐私和脆弱感都需要信任。承担多少、哪些信息必须透明、遇到困难怎样回应，可以逐步谈清，而不必一次交出所有边界。','学习、远行与未来计划可能成为共同生活的重要部分。双方是否愿意支持彼此的发展，以及方向不同时怎样协商，值得认真讨论。','工作时间、职业变动和共同责任可能影响相处。彼此是否可靠，会体现在答应的事情能否做到，以及忙碌时是否仍为关系留出时间。','朋友圈、共同目标与支持网络，可以给关系带来连接。经营共同兴趣时，也需要尊重各自的社交生活，让朋友感延续到长期相处。','独处、恢复精力和没有被看见的付出，也会影响亲近感。需要休息时可以明说，承担幕后事务时也值得被理解与回应。'][venus.bhava-1],
 real.filter(p=>p.name!=='Venus').length?`还有${real.filter(p=>p.name!=='Venus').map(p=>`**${name(p)}在D9第${p.bhava}宫**`).join('、')}参与共同资源、家庭或责任安排。${real.filter(p=>p.name!=='Venus').map(p=>p.name==='Saturn'?'土星提示责任和界限需要持续执行':'水星提示计划与分工需要说清并及时调整').join('；')}。`: `落实这些安排时，双方可以确认**哪些需要共同承担，哪些仍由个人决定**。当生活条件变化时，约定也可以重新商量。`
 ]},
 {house:jupiter.bhava,importance:7,stars:4,title:'成熟后的价值选择 · '+(['让自主判断进入承诺','让成长形成可以共享的资源','把理解变成能说清的话','让信念支持家庭归属','把积累投入创造与兴趣','让原则经得起日常实践','在关系中协商共同原则','用信任承接共同资源','寻找愿意共同走的方向','把价值落实为持续承担','把个人成长连接到共同目标','给反思与恢复留下位置'][jupiter.bhava-1]),evidence:positions(jupiter)+(ascLord.name!=='Jupiter'?' · D9命主星'+positions(ascLord):''),paragraphs:[
 `**木星代表成长、判断与价值原则**，它关系到你愿意为什么持续投入。${bridge(jupiter)}${birth.Jupiter.bhava===2&&jupiter.bhava===5?'这份积累可以进一步投入到**创造、兴趣和教育**之中；有子女时，也可能表现为对子女成长的投入。资源的意义，不只是拥有多少，还包括它能支持什么样的生活。':`你积累的理解和能力，可以进一步用于${context[jupiter.bhava-1]}中的具体选择，让认可的原则有实际的落点。`}`,
 ascLord.name==='Jupiter'?`木星也是D9的命主星，因此这条价值线索同时连接着你怎样参与长期承诺。${same(jupiter)}`:`D9命主星是**${name(ascLord)}**，落第${ascLord.bhava}宫，进一步把个人参与连接到${context[ascLord.bhava-1]}。当你认为某件事值得坚持时，也需要在这一方面留出时间与行动，使认可的价值和实际投入相配。${same(jupiter)}`,
 `金星关系到彼此相处是否满足，木星关系到双方认为什么值得坚持。金星在这张D9中连接着**${context[venus.bhava-1]}**；木星则连接着**${context[jupiter.bhava-1]}**。长期关系既需要舒服的相处，也需要共同认可的方向。讨论具体安排时，可以同时照顾当下的需要和未来愿意承担的责任。`]},
 {house:9,importance:6,stars:3,title:'D1与D9的呼应 · 把重点连起来看',evidence:echoes.length?echoes.map(p=>`${name(p)}${p.sign===birth[p.name].sign?'同星座':''}${p.bhava===birth[p.name].bhava?'同宫位':''}`).join(' · '):'第7宫主星、金星、木星与D9命主星的联系',paragraphs:[
 echoes.length?`在关系与价值相关的主星中，${echoes.map(p=>`**${name(p)}**`).join('、')}出现了同星座或同宫位的重复。${echoes.map(p=>p.bhava===birth[p.name].bhava?`${name(p)}重复强调${context[p.bhava-1]}`:`${name(p)}保持${sign(p)}的${getRashiMetadata(p.sign).keywords.join('、')}表达`).join('；')}。这些持续的需要进入关系后，仍需要明确表达，也需要在共同生活中得到位置。`:'上述主星在两盘中的星座与宫位没有直接重复。个人生活和长期关系中的需要因此呈现不同背景，双方需要协商怎样让这些需要互相配合。',
 `把前面连起来，关系的经营首先涉及**${context[ruler.bhava-1]}**，金星让彼此的满足感进入**${context[venus.bhava-1]}**，木星则把长期价值连接到**${context[jupiter.bhava-1]}**。稳定的连接，需要让这些需要落实为能共同商量、持续执行的安排。`,
 '共同生活中，可以留意三件事：承诺是否说清、付出是否被理解、未来方向是否一致。遇到分歧时，先把各自的需要说明白，再讨论怎样调整安排。']}
 ];
 return {overview:['长期关系中，**怎样回应承诺、安排共同生活，以及为哪些价值持续投入**，是这张D9的重点。第7宫主星、金星与木星分别连接着相处、满足感与长期方向。','D1与D9中的实际配置共同展开这些主题。星级表示阅读重点；两盘对照不对应某个固定年龄的转折。'],cards};
}
