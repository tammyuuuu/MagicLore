export function createDetailReaderState(){
  let state={open:false,history:[],savedScrollY:0,contextVersion:null};
  const snapshot=()=>({...state,history:state.history.map(item=>({...item}))});
  return {
    snapshot,
    open(entry,scrollY,contextVersion){state={open:true,history:[{...entry}],savedScrollY:scrollY,contextVersion};return snapshot();},
    navigate(entry){if(!state.open)return snapshot();const current=state.history.at(-1);if(current.type!==entry.type||current.id!==entry.id)state={...state,history:[...state.history,{...entry}]};return snapshot();},
    back(){if(state.history.length>1)state={...state,history:state.history.slice(0,-1)};return snapshot();},
    close(){const savedScrollY=state.savedScrollY;state={...state,open:false,history:[]};return {state:snapshot(),savedScrollY};},
    refreshContext(contextVersion){state={...state,contextVersion};return snapshot();}
  };
}

export const previousHouse=house=>house===1?12:house-1;
export const nextHouse=house=>house===12?1:house+1;
