import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../../'+name,import.meta.url),'utf8');
test('全部入口在旧 Web 脚本执行前设置首帧保护，覆盖动态插入的导航',()=>{
 for(const name of ['index.html','western_web.html','vedic_web.html','bazi_web.html','destiny_book_web.html']){
  const html=read(name);
  assert.ok(html.indexOf('id="ml-startup-style"')<html.indexOf('<script'));
  assert.ok(html.includes('body:not([data-ml-ready])>:not(.ml-startup):not(script){visibility:hidden!important}'));
  assert.ok(html.includes('class="ml-startup"'));
 }
 assert.ok(!read('index.html').includes('<header class="ml-header">'));
});
test('初始化失败不显示未经整理的旧版页面',()=>{
 const module=read('module-mobile.js');
 assert.ok(module.includes("await originalPrepare();document.body.dataset.mlReady='true'"));
 assert.ok(!module.includes("finally{document.body.dataset.mlReady"));
 assert.ok(!read('entry-loader.js').includes("document.body.dataset.mlReady='true'"));
 assert.ok(read('pwa.js').includes("updateViaCache:'none'"));
});

test('档案样式由 HTML 在应用入口前加载，挂载过程不异步注入 CSS',()=>{
 const html=read('index.html'),style=html.indexOf('id="profilesStyle"');assert.ok(style>0);assert.ok(style<html.indexOf('src="entry-loader.js"'));assert.ok(style<html.indexOf('href="typography.css"'));assert.ok(!read('profiles-ui.js').includes("document.createElement('link')"));
});
