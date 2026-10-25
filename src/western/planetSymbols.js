// Font-independent astronomical symbols; presentation only, 24-unit artwork.
const artwork={
 Sun:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
 Moon:'<path d="M16 2.5a10 10 0 1 0 0 19 10.5 10.5 0 0 1 0-19Z"/>',
 Mercury:'<path d="M6.5 1.5C6.5 7 17.5 7 17.5 1.5M12 16v7M7.5 20h9"/><circle cx="12" cy="11" r="5"/>',
 Venus:'<circle cx="12" cy="7.5" r="6"/><path d="M12 13.5V23M6.5 18h11"/>',
 Mars:'<circle cx="9" cy="15" r="6.5"/><path d="m13.5 10.5 8-8M15 2.5h6.5V9"/>',
 Jupiter:'<path d="M4.5 5C9-1 15.5 5 10 10.5L5.5 15H21M16 2v21"/>',
 Saturn:'<path d="M9 1v21M4.5 6h10M9 13c5-7 13-2 9 5l-2 3 3 2"/>',
 Uranus:'<path d="M5 3v12M19 3v12M5 9h14M12 3v15"/><circle cx="12" cy="21" r="2.5"/>',
 Neptune:'<path d="M5 3v5a7 7 0 0 0 14 0V3M12 1.5v21M7.5 19h9M2 5l3-3 3 3M16 5l3-3 3 3"/>',
 Pluto:'<circle cx="12" cy="8" r="3"/><path d="M5 9C5 18 19 18 19 9M12 15.75V24M6 19h12"/>'
};
// Fixed symbolic palette; independent of sign placement and aspect colors.
const tones={Sun:'#a17e2b',Moon:'#8b929f',Mercury:'#777d87',Venus:'#62866c',Mars:'#af646b',Jupiter:'#5c80ae',Saturn:'#555b65',Uranus:'#568f99',Neptune:'#7876ac',Pluto:'#705b87'};
const labels={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
export function planetSymbol(name,point){if(!artwork[name])return '';const [x,y]=point;return `<g class="western-planet-symbol" data-planet="${name}" role="img" aria-label="${labels[name]}" transform="translate(${x-15} ${y-15}) scale(1.25)" fill="none" stroke="currentColor" style="color:${tones[name]};stroke-width:1.65" stroke-linecap="round" stroke-linejoin="round"><title>${labels[name]}</title>${artwork[name]}</g>`;}
