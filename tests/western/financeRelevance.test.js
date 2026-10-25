import test from 'node:test';import assert from 'node:assert/strict';
import {financeRelevance} from '../../src/western/financeWindows.js';
test('money rulers outrank indirect career and auxiliary value themes',()=>{
 assert.equal(financeRelevance({topicHouse:2,natalHouse:8}).stars,5);
 assert.equal(financeRelevance({topicHouse:8,natalHouse:1}).stars,4);
 assert.equal(financeRelevance({target:'MC',topicHouse:10,natalHouse:2}).stars,3);
 assert.equal(financeRelevance({target:'Venus',topicHouse:0,natalHouse:9}).stars,2);
 assert.equal(financeRelevance({target:'MC',topicHouse:10,natalHouse:9}).stars,1);
});
test('stars indicate relevance equally for supportive and pressure aspects',()=>{
 const row={topicHouse:2,natalHouse:2};assert.deepEqual(financeRelevance({...row,category:'income',angle:120}),financeRelevance({...row,category:'pressure',angle:90}));
});
