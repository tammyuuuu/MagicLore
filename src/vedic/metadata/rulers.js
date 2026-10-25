export const RASHI_RULERS={Aries:'Mars',Taurus:'Venus',Gemini:'Mercury',Cancer:'Moon',Leo:'Sun',Virgo:'Mercury',Libra:'Venus',Scorpio:'Mars',Sagittarius:'Jupiter',Capricorn:'Saturn',Aquarius:'Saturn',Pisces:'Jupiter'};
export function houseLordStructure(chart,house){
  const houseData=chart.houses.find(item=>item.house===house),lord=RASHI_RULERS[houseData.sign],placement=chart.grahas.find(item=>item.name===lord);
  return {house,sign:houseData.sign,lord,locatedHouse:placement?.bhava??null,placement};
}

