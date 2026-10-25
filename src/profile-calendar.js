import lunar from 'lunar-javascript';
// The original calendar input is retained alongside this derived Gregorian date.
export function lunarToGregorian(value,isLeapMonth=false){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('农历日期请填写 YYYY-MM-DD。');
  const [y,m,d]=value.split('-').map(Number);if(y<1901||y>2100)throw Error('农历转换目前支持 1901–2100 年；超出范围请保留原始备注并核对公历日期。');
  const date=lunar.Lunar.fromYmd(y,isLeapMonth?-m:m,d),solar=date.getSolar(),back=solar.getLunar();
  if(back.getYear()!==y||back.getMonth()!==(isLeapMonth?-m:m)||back.getDay()!==d)throw Error('农历日期或闰月无效。');
  return {gregorian:solar.toYmd(),conversion:{library:'lunar-javascript',version:'1.7.7'}};
}
