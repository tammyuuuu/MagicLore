import { makeJudgmentFacts, JUDGMENT_VERSION } from './judgmentFacts.js';
import { analyzeInteractions } from './interactions.js';
import { analyzeStrength, classifySpecial, effectiveTokens,refineStrengthByPattern } from './strength.js';
import { analyzeClimate } from './climate.js';
import { analyzeMonthPatterns } from './patterns.js';
import { reconcilePreferences } from './preferences.js';

export function analyzeBaziJudgment(input,periods=[]){
 const facts=makeJudgmentFacts(input,periods);
 if(!facts)return {version:JUDGMENT_VERSION,status:'unavailable',reason:'四柱或阶段干支不完整',facts:null};
 const interactions=analyzeInteractions(facts);let strength=analyzeStrength(facts,interactions,{finalize:false});
 let special=classifySpecial(facts,interactions,strength);
 if(periods.length){
  const original=analyzeBaziJudgment(input);
  if(original.special?.status==='established'){
   const extra=effectiveTokens(facts,interactions).filter(t=>facts.periods.some(n=>n.id===t.id));
   const contrary=extra.filter(t=>original.special.avoid.includes(t.element)&&(t.visible&&!t.bound||t.role==='main'));
   const disputed=interactions.unresolved.length>0||original.interactions.transformed.some(old=>
     !interactions.transformed.some(current=>current.kind===old.kind&&current.layer===old.layer&&old.ids.every(id=>current.ids.includes(id))));
   if(!contrary.length&&!disputed)special={...original.special,phase:'preserved'};
   else special={...original.special,status:'uncertain',phase:'disturbed',blockers:[...contrary.map(t=>`${t.id}引入逆势${t.element}`),...(disputed?['阶段争合或冲合主次未定']:[])]};
  }
  else if(special.status==='established')special={...special,status:'uncertain',phase:'temporary',blockers:['岁运暂时形成的气势不能直接认证为原局特殊格局']};
 }
 const climate=analyzeClimate(facts,interactions);
 let patternAnalysis=analyzeMonthPatterns(input,{facts,interactions,strength});
 if(special.status==='ordinary'){
  const refined=refineStrengthByPattern(strength,patternAnalysis,facts);
  if(refined!==strength){
   const checked=analyzeMonthPatterns(input,{facts,interactions,strength:refined});
   if(['established','rescued'].includes(checked.status)){strength=refined;patternAnalysis=checked;}
  }
 }
 if(strength.uncertain){
  strength=analyzeStrength(facts,interactions);
  patternAnalysis=analyzeMonthPatterns(input,{facts,interactions,strength});
 }
 if(special.status==='established')patternAnalysis={...patternAnalysis,status:'established',structureGod:null,assistantGods:[],
  patterns:[{name:special.name,status:'established',combinations:[],explanation:'以主导气势为重，按对应结构判断顺逆。'}],candidates:[]};
 if(special.status==='uncertain')patternAnalysis={...patternAnalysis,status:'uncertain',patterns:[],structureGod:null,assistantGods:[]};
 const preferences=reconcilePreferences(strength,special,climate,patternAnalysis);
 if(preferences.deferredClimate.length)climate.explanation='顺应主导气势，调候不逆格增减';
 return {version:JUDGMENT_VERSION,status:preferences.ready?'resolved':'partial',facts,interactions,strength,special,climate,patternAnalysis,preferences,
  level:special.level==='化气'?null:special.level||strength.level,dayMaster:facts.day,element:facts.dayElement};
}
