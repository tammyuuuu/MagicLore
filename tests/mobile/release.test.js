import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('发布清单中的全部资源存在且哈希一致，每个专业模块依赖均已收录',()=>{const manifest=JSON.parse(readFileSync(new URL('asset-manifest.json',root),'utf8'));for(const [file,expected] of Object.entries(manifest.files))assert.equal(hash(readFileSync(new URL(file,root))),expected,file);for(const dependencies of Object.values(manifest.modules))for(const file of dependencies)assert.ok(manifest.files[file],file);});
test('静态发布的天文浏览器库与原有锁定依赖逐字节一致',()=>{assert.equal(hash(readFileSync(new URL('vendor/astronomy-engine.min.js',root))),hash(readFileSync(new URL('node_modules/astronomy-engine/astronomy.browser.min.js',root))));});
