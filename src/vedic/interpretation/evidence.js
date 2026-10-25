export function createEvidence(items,chain,rule){return {items,chain,rule};}

export function houseOneEvidence(context){return createEvidence([
  {label:'第一宫',value:context.house.rashi},
  {label:'第一宫主',value:context.house.lord},
  {label:`${context.house.lord} 所在`,value:`第${context.house.lordHouse}宫`}
],[`1H · ${context.house.rashi}`,`${context.house.lord} · 1st Lord`,`${context.house.lordHouse}H`],'宫主落宫用于连接宫主所掌管的宫与它实际所在的宫。');}

export function occupantEvidence(context,planet){return createEvidence([
  {label:'Graha',value:planet},
  {label:'所在宫位',value:'第1宫'},
  {label:'第一宫主题',value:'自我 · 身体 · 身份感 · 生命方向'}
],[planet,'occupies','1H'],'直接位于某宫的 Graha 会参与该宫所代表的领域。');}
