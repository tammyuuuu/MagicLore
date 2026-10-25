import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('全部八字计算、时间、节气、规则与基础数据和审计前逐字节一致',()=>{const root=new URL('../../',import.meta.url),rows=JSON.parse(readFileSync(new URL('maintenance/algorithm-core-hashes.json',root),'utf8'));for(const row of rows){const hash=createHash('sha256').update(readFileSync(new URL(row.path,root))).digest('hex');assert.equal(hash,row.sha256,row.path);}});
