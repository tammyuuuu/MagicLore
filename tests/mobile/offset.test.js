import test from 'node:test';
import assert from 'node:assert/strict';
import {birthOffset} from '../../src/civil-offset.js';
test('共用出生档案接入占星时保留历史 IANA 偏移与夏令时',()=>{assert.equal(birthOffset({date:'1995-08-12',time:'14:30',timezoneId:'Asia/Shanghai'}),'+08:00');assert.equal(birthOffset({date:'1990-06-15',time:'12:00',timezoneId:'America/New_York'}),'-04:00');assert.equal(birthOffset({date:'1990-01-15',time:'12:00',timezoneId:'America/New_York'}),'-05:00');assert.equal(birthOffset({date:'1988-07-01',time:'12:00',timezoneId:'Asia/Shanghai'}),'+09:00');});
