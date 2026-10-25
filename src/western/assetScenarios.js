export function wealthLevel(value){if(value<0)return '负债';if(value===0)return '收支后的净资产为零';return [[1e8,'亿元级'],[1e7,'千万元级'],[1e6,'百万元级'],[1e5,'十万元级'],[1e4,'万元级'],[1e3,'千元级'],[100,'百元级']].find(([limit])=>value>=limit)?.[1]||'百元以下';}
export function assetScenarios(input){
 for(const key of ['assets','debt','income','expense','expenseGrowth','assetReturn','debtRate'])if(!Number.isFinite(Number(input[key])))throw new Error('请填写完整财务数字。');
 for(const key of ['assets','debt','income','expense'])if(input[key]<0)throw new Error('资产、负债、收入与支出不能为负数。');
 for(const key of ['expenseGrowth','assetReturn','debtRate'])if(input[key]<=-100||input[key]>100)throw new Error('年率需大于-100%且不超过100%。');
 return [['收入不增长',0],['收入每年增长2%',2],['收入每年增长4%',4]].map(([name,growth])=>{
  let assets=Number(input.assets),debt=Number(input.debt);const rows=[{year:0,assets,debt,net:assets-debt}];
  for(let month=1;month<=120;month++){
   assets*=Math.pow(1+input.assetReturn/100,1/12);debt*=Math.pow(1+input.debtRate/100,1/12);
   let balance=input.income*Math.pow(1+growth/100,(month-1)/12)-input.expense*Math.pow(1+input.expenseGrowth/100,(month-1)/12);
   if(balance>=0){const paid=Math.min(balance,debt);debt-=paid;assets+=balance-paid;}else{const spent=Math.min(-balance,assets);assets-=spent;debt+=-balance-spent;}
   if(month%12===0)rows.push({year:month/12,assets,debt,net:assets-debt});
  }
  return {name,growth,rows};
 });
}
