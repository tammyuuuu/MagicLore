// Label positions only: true ecliptic longitudes remain untouched.
export function placePlanetSymbols(planets,point){
 const placed=[];
 for(const planet of [...planets].sort((a,b)=>a.longitude-b.longitude)){
  const candidates=[];for(const radius of [200,182,214])for(const shift of [0,...Array.from({length:45},(_,i)=>[-4*(i+1),4*(i+1)]).flat()]){const position=point(planet.longitude+shift,radius);candidates.push({position,cost:Math.abs(radius-200)+Math.abs(shift)*4});}
  candidates.sort((a,b)=>a.cost-b.cost);const distance=c=>placed.length?Math.min(...placed.map(p=>Math.hypot(c.position[0]-p.position[0],c.position[1]-p.position[1]))):Infinity;
  const chosen=candidates.find(c=>distance(c)>=38)||candidates.reduce((a,b)=>distance(a)>distance(b)?a:b);
  placed.push({planet,position:chosen.position});
 }
 return placed;
}
