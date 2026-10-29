import {groupForElement,roleWeight,PHASE_WEIGHT,generates,controls} from './judgmentFacts.js';
import {flowActors} from './balancedFlow.js';

const distance=r=>r<.42?.42-r:r>.58?r-.58:0;
const bounds=s=>{
 const [a,b]=s.interval;
 return [a<=.58&&b>=.42?0:Math.min(distance(a),distance(b)),Math.max(distance(a),distance(b))];
};
const close=(a,b)=>(a.id!==b.id||a.layer!==b.layer)&&(a.node.source!=='natal'||b.node.source!=='natal'||Math.abs(a.node.index-b.node.index)<=1);
const anchors={career:['authority','output'],wealth:['wealth','output']};
const nouns={career:'工作任务',wealth:'经营与产出',relationship:'关系中的责任'};

// Capacity is shared by practical activities, but participation is witnessed by
// actual natal ten-god anchors. It is not a replacement for structure, climate,
// spouse/palace or money-flow rules, and is never a "no other rule" fallback.
export function periodCapacityEffects(baseline,state,onUncertain=()=>{}){
 if(baseline.special.status!=='ordinary'||state.special.status!=='ordinary')return [];
 const result=[],old=bounds(baseline.strength),next=bounds(state.strength);
 const low=(old[0]-next[1])/.2,high=(old[1]-next[0])/.2;
 // Only the guaranteed direction/magnitude survives an interval. A range that
 // crosses zero cannot create a fixed contribution from its midpoint.
 const change=low>0?Math.min(1,low):high<0?Math.max(-1,high):0;
 const actors=flowActors(state);
 for(const theme of ['career','wealth','relationship']){
  const groups=anchors[theme]||[baseline.facts.gender==='male'?'wealth':'authority'];
  const witnesses=baseline.facts.natal.flatMap(n=>[
   ...(n.id==='day'?[]:[{id:n.id,layer:'stem',element:n.element,weight:1}]),
   ...n.hidden.map(h=>({id:n.id,layer:'branch',element:h.element,weight:roleWeight(h.role)}))
  ]).filter(a=>groups.includes(groupForElement(baseline.element,a.element)));
  const load=witnesses.reduce((s,a)=>s+a.weight,0);
  if(!load)continue;
  const participation=load/(1+load);
  if(!change&&(low<0||high>0))onUncertain(theme,{
   id:'capacity-change',low:Math.max(-1,low)*participation,high:Math.min(1,high)*participation,
   text:'生扶消耗作用区间重叠，专题承载改善方向不能独立确定'
  });
  if(change)result.push({theme,id:'capacity-change',direction:Math.sign(change),weight:Math.abs(change)*participation,
   text:change>0?`生扶与消耗更协调，承接${nouns[theme]}的压力减轻。`:`生扶与消耗的偏向加大，承接${nouns[theme]}更吃力。`,
   evidence:{axis:'strength-distance',baseline:baseline.strength.interval,period:state.strength.interval,guaranteedChange:change,anchors:witnesses,
    periods:state.facts.periods.map(n=>({id:n.id,stem:n.stem,branch:n.branch,phase:PHASE_WEIGHT[n.source]}))}});
  // 印 -> 身 -> 实际财/官/食伤: all three actors must exist. Ordinary
  // balanced charts need a contextual route, not an unconditional 喜印 label.
  if(baseline.strength.kind!=='balanced'||!['weak','balanced'].includes(state.strength.kind))continue;
  const sign=e=>baseline.preferences.evaluations.find(p=>p.element===e)?.sign;
  for(const source of actors.filter(a=>a.node.source!=='natal'&&a.group==='resource'&&sign(a.element)!==null&&sign(a.element)!==-1))
   for(const self of actors.filter(a=>a.node.source==='natal'&&a.group==='peer'&&close(source,a)))
    for(const loadActor of actors.filter(a=>a.node.source==='natal'&&groups.includes(a.group)&&close(self,a))){
     if(!generates(source.element,self.element)||!generates(self.element,loadActor.element)&&!controls(self.element,loadActor.element)&&!controls(loadActor.element,self.element))continue;
     if(sign(self.element)===null||sign(self.element)===-1||sign(loadActor.element)===null)continue;
     result.push({theme,id:'resource-capacity',direction:1,weight:Math.min(source.weight,self.weight,loadActor.weight),
      text:`学习与支持补充自身力量，更容易承接${nouns[theme]}。`,
      evidence:{axis:'resource-self-load',actors:[source,self,loadActor].map(a=>({id:a.id,layer:a.layer,element:a.element,group:a.group,rootType:a.rootType,sources:a.sources||[]}))}});
    }
 }
 return result;
}
