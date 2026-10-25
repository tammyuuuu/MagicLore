import {calculateDasamsa} from './dasamsa.js';
import {getRashiMetadata} from './metadata/rashis.js';
import {GRAHA_METADATA} from './metadata/grahas.js';
const field=['主动判断与个人担当','资源、报酬与能力积累','表达、技能练习与信息交流','工作基础、环境与稳定支持','创造、规划与独立判断','日常任务、服务与竞争','客户、合作与协商','研究、共享资源与变化处理','学习、指导与专业原则','职责、职业位置与成果呈现','团队、支持网络与成果回收','幕后准备、独立研究与精力恢复'];
const action=['明确自己能决定和承担的部分','让工作成果与报酬条件有清楚的对应','积累能展示的作品、文档与沟通能力','建立可以持续工作的环境与支持','将想法整理为能执行的方案','改善任务流程，兼顾质量与投入','说清客户期待、合作分工与交付标准','为复杂任务保留研究与核对的时间','通过学习与指导形成稳定的专业判断','明确职责、评价标准和成果归属','经营可信的合作网络，追踪实际成果','为准备、复盘和休息留出时间'];
const subtitles=['让主动担当形成专业位置','让能力与现实回报相接','靠表达与技能打开工作路径','先建立稳定的工作基础','把创意落实为可执行的方案','在任务与服务中积累能力','通过合作与客户关系落实事业','用深度研究应对复杂变化','让学习与专业原则支撑方向','把职责做成看得见的成果','让团队支持形成实际收获','幕后准备也是专业的一部分'];
export function dasamsaNarrative(chart){
 const d=calculateDasamsa(chart),by=Object.fromEntries(d.grahas.map(p=>[p.name,p])),old=Object.fromEntries(chart.grahas.map(p=>[p.name,p]));
 const name=p=>GRAHA_METADATA[p.name].chineseName,sign=p=>getRashiMetadata(p.sign).chineseName;
 const lord=h=>by[getRashiMetadata(d.houses[h-1].sign).ruler],career=lord(10),self=lord(1),natalCareer=by[getRashiMetadata(chart.houses[9].sign).ruler];
 const evidence=p=>`${name(p)}：D1${sign(old[p.name])}第${old[p.name].bhava}宫 → D10${sign(p)}第${p.bhava}宫`;
 const same=p=>old[p.name].sign===p.sign?`${name(p)}在D1与D10都落${sign(p)}，${getRashiMetadata(p.sign).keywords.join('、')}的表达保持连续，可以成为职业发展的稳定线索。`:'';
 const occupants=d.grahas.filter(p=>p.bhava===10),daily=lord(6),gains=lord(11);
 const cards=[
 {house:10,stars:5,importance:12,title:'事业主线 · '+subtitles[career.bhava-1],evidence:'D10第10宫主星'+evidence(career),paragraphs:[
 `**第10宫关联职业职责与社会成果**。在这张D10里，它的宫主星${name(career)}落第${career.bhava}宫，把事业的落实连接到**${field[career.bhava-1]}**。${name(career)}代表${GRAHA_METADATA[career.name].basicMeaning}，这份能力需要通过具体工作被看见。`,
 `D1第10宫的宫主星是**${name(natalCareer)}**，它在D1落第${old[natalCareer.name].bhava}宫，在D10落第${natalCareer.bhava}宫。原先与${field[old[natalCareer.name].bhava-1]}有关的职业线索，在专业活动中进一步联系到**${field[natalCareer.bhava-1]}**。${career.name===natalCareer.name?'两盘第10宫由同一颗星掌管，职业方向和实际职责有明确的共同连接。':'D1与D10的第10宫由不同主星掌管，选择方向与实际承担工作时，需要同时照顾这两层需要。'}`,
 occupants.length?`D10第10宫有${occupants.map(p=>`**${name(p)}**`).join('、')}。${occupants.map(p=>`${name(p)}带来${GRAHA_METADATA[p.name].basicMeaning}`).join('；')}。这些需要容易进入职责和成果呈现，值得在岗位分工中明确各自的作用。`:`D10第10宫没有九曜直接落入，事业仍可通过宫主星的联系展开。当前更值得着手的是**${action[career.bhava-1]}**。`]},
 {house:1,stars:4,importance:9,title:'专业能力 · '+subtitles[self.bhava-1],evidence:'D10命主星'+evidence(self),paragraphs:[
 `你怎样参与工作，可以从**D10命主星${name(self)}**看起。它落第${self.bhava}宫，意味着个人投入与${field[self.bhava-1]}联系较近。${career.name===self.name?'它也掌管D10第10宫，个人担当与职业职责因此由同一颗星连接；这里补充的是怎样发挥能力，而不是另一条事业方向。':''}`,
 `本命${name(self)}在D1第${old[self.name].bhava}宫，原本参与${field[old[self.name].bhava-1]}；到D10第${self.bhava}宫，这些能力可以用于${field[self.bhava-1]}中的专业任务。${same(self)}`,
 `培养这份能力时，可以**${action[self.bhava-1]}**。让经验沉淀为作品、流程或可靠的交付，比只依赖一次表现更能支持持续发展。`]},
 {house:6,stars:4,importance:8,title:'工作方式 · 把日常任务做得可以持续',evidence:'D10第6宫主星'+evidence(daily)+' · 土星第'+by.Saturn.bhava+'宫',paragraphs:[
 `职业方向最终要进入日常任务。D10第6宫主星**${name(daily)}落第${daily.bhava}宫**，使任务、服务与竞争连接到${field[daily.bhava-1]}。工作中可以留意：时间花在哪里，哪些环节需要持续练习，以及遇到阻力时怎样调整方法。`,
 `土星代表持续承担与边界，在D10落**第${by.Saturn.bhava}宫**，让${field[by.Saturn.bhava-1]}成为需要长期经营的一部分。水星落第${by.Mercury.bhava}宫，则把沟通、分析与信息处理带到${field[by.Mercury.bhava-1]}。责任是否清楚、信息是否一致，会影响实际执行。`,
 `可以先**${action[daily.bhava-1]}**，再核对投入是否能够长期维持。可靠的工作方式需要质量、节奏与边界一起配合。`]},
 {house:11,stars:3,importance:7,title:'成果与回报 · 让付出形成可确认的收获',evidence:'D10第11宫主星'+evidence(gains),paragraphs:[
 `D10第11宫关联职业成果与支持网络，它的宫主星**${name(gains)}落第${gains.bhava}宫**，把收获连接到${field[gains.bhava-1]}。这里的收获可以是项目完成、认可、合作机会或报酬，需要和实际工作条件一起看。`,
 `第2宫主星${name(lord(2))}落D10第${lord(2).bhava}宫，补充资源与报酬的联系；第7宫主星${name(lord(7))}落第${lord(7).bhava}宫，补充客户与合作的联系。${lord(2).name===gains.name?'资源与成果由同一颗星连接，工作的价值怎样转成现实回报值得谈清。':'能力形成、成果被认可与报酬落实，是相关但需要分别确认的环节。'}`,
 `值得**${action[gains.bhava-1]}**，并说清评价标准、交付内容和回报条件。D10不单独确定职位、收入金额或升职日期；具体阶段仍需要结合D1、大运与现实机会。`]}
 ];
 return {overview:[`这张D10的事业主线连接着**${field[career.bhava-1]}**，个人能力的投入则连接着**${field[self.bhava-1]}**。下方从职业方向、专业能力、工作方式与成果回报展开，并对照D1中的相关主星。`,'D10由出生时刻计算，重点关注职业活动与社会成果。星级表示阅读顺序；大运日期沿用原来的出生月亮周期。'],cards};
}
