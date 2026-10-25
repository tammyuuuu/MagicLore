export const GRAHA_DRISHTI={
  Sun:[7],Moon:[7],Mars:[4,7,8],Mercury:[7],Jupiter:[5,7,9],Venus:[7],Saturn:[3,7,10],Rahu:null,Ketu:null
};

export const drishtiRule=(planet,aspectNumber)=>{
  if(aspectNumber===7)return 'All seven traditional Grahas have the 7th aspect';
  return `${planet} special ${aspectNumber}${aspectNumber===3?'rd':'th'} aspect`;
};
