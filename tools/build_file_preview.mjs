// Compatibility outputs share the exact sources and algorithms of the HTTP entries.
import {build} from 'esbuild';
for(const entry of ['app','module-mobile'])await build({entryPoints:[`${entry}.js`],outfile:`${entry}.file.js`,bundle:true,format:'iife',platform:'browser',target:'safari15.4',minify:true,legalComments:'eof',external:['./civil-offset.js','./profile-calendar.js']});
await build({entryPoints:['src/civil-offset.js'],outfile:'civil-offset.file.js',bundle:true,format:'iife',globalName:'MagicLoreCivilOffset',platform:'browser',target:'safari15.4',minify:true,legalComments:'eof'});

for(const format of ['esm','iife'])await build({entryPoints:['src/profile-calendar.js'],outfile:format==='esm'?'profile-calendar.js':'profile-calendar.file.js',bundle:true,format,...(format==='iife'?{globalName:'MagicLoreProfileCalendar'}:{}),platform:'browser',target:'safari15.4',minify:true,legalComments:'eof'});
