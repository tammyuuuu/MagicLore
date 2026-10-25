import test from 'node:test';import assert from 'node:assert/strict';
import {assetScenarios,wealthLevel} from '../../src/western/assetScenarios.js';
const input={assets:10000,debt:0,income:6000,expense:4000,expenseGrowth:0,assetReturn:0,debtRate:0};
test('zero rate cashflow adds exactly monthly savings for ten years',()=>{const result=assetScenarios(input);assert.equal(result[0].rows.at(-1).net,250000);assert.equal(result[0].rows.length,11);assert.ok(result[2].rows.at(-1).net>result[1].rows.at(-1).net);});
test('deficits consume assets and then create debt',()=>{const row=assetScenarios({...input,assets:200,debt:1000,income:0,expense:100})[0].rows.at(-1);assert.equal(row.assets,0);assert.equal(row.net,-12800);assert.equal(wealthLevel(row.net),'负债');});
test('surplus pays debt before increasing assets',()=>{const row=assetScenarios({...input,assets:0,debt:1000,income:200,expense:0})[0].rows[1];assert.equal(row.debt,0);assert.equal(row.assets,1400);});
test('effective annual rate compounds correctly without contributions',()=>{const row=assetScenarios({...input,income:0,expense:0,assetReturn:10})[0].rows[1];assert.ok(Math.abs(row.net-11000)<1e-6);assert.throws(()=>assetScenarios({...input,assetReturn:-100}));});
test('wealth tiers use signed net assets',()=>{assert.equal(wealthLevel(100),'百元级');assert.equal(wealthLevel(10000),'万元级');assert.equal(wealthLevel(10000000),'千万元级');assert.equal(wealthLevel(100000000),'亿元级');});
