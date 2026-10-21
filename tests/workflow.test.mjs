import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateShaoziWorkflow,deriveShaoziHexagrams,hexagramFromLines} from '../src/shaozi-workflow.js';
import {calculateHuangjiCycles,composeHuangjiCycles,calculateHuangjiEpoch,mapYearToAccumulation} from '../src/huangji.js';
const pillars=['庚辰','甲申','丙午','庚寅'];
test('selected rules preserve the existing birth vector while adding traceable stages and generic algebra',()=>{
 const d=calculateShaoziWorkflow({pillars,gender:'女',year:2000,movingLine:1});assert.equal(d.version,'shaozi-selected-rules-v2');assert.equal(d.calculationVersion,'shaozi-workflow-v3');assert.equal(d.priorHexagram.name,'山泽损');
 assert.equal(d.derivation.changed.name,'山水蒙');assert.equal(d.derivation.mutual.name,'地雷复');assert.equal(d.stages.find(s=>s.id==='yuantang').complete,false);assert.equal(d.laterHexagram,null);assert.equal(d.traditionalArticleCode,null);assert.equal(d.completePersonalChart,false);assert.equal(d.derivation.laterHeavenCalculated,false);
});
test('six-line algebra covers all 64 hexagrams and flipping a line twice restores the original',()=>{
 const seen=new Set();for(let n=0;n<64;n++){
  const bits=Array.from({length:6},(_,i)=>(n>>i)&1),a=deriveShaoziHexagrams(bits);seen.add(a.natal.name);
  assert.deepEqual(deriveShaoziHexagrams(a.opposite.lines).opposite.lines,bits);assert.deepEqual(deriveShaoziHexagrams(a.reversed.lines).reversed.lines,bits);
  for(let line=1;line<=6;line++){const b=deriveShaoziHexagrams(bits,line);assert.deepEqual(deriveShaoziHexagrams(b.changed.lines,line).changed.lines,bits);assert.equal(b.changed.lines.filter((v,i)=>v!==bits[i]).length,1);}
 }assert.equal(seen.size,64);
 assert.equal(hexagramFromLines([1,1,1,0,0,0]).name,'地天泰');assert.equal(hexagramFromLines([0,0,0,1,1,1]).name,'天地否');
 for(const bad of [[1],['1',0,0,0,0,0],[2,0,0,0,0,0]])assert.throws(()=>hexagramFromLines(bad));for(const bad of [0,7,-1,1.5,'x',true])assert.throws(()=>deriveShaoziHexagrams([1,1,1,1,1,1],bad));
});
test('an inconsistent manual time cannot produce a trusted-looking result and missing mapping stays unresolved',()=>{
 assert.throws(()=>calculateShaoziWorkflow({pillars,gender:'女',year:2000,time:'20:20'}),/不一致/);
 const d=calculateShaoziWorkflow({pillars:['己巳','己巳','己巳','己巳'],gender:'男',year:2000});assert.equal(d.priorHexagram,null);assert.equal(d.derivation,null);assert.equal(d.stages.find(s=>s.id==='natal').status,'unresolved');assert.throws(()=>calculateShaoziWorkflow({pillars:['己巳','己巳','己巳','己巳'],movingLine:7}),/动爻/);assert.match(d.unresolved.join(' '),/39/);
});
test('minute uncertainty samples both sides of midnight without fabricating unknown birth data',()=>{
 const d=calculateShaoziWorkflow({birth:{date:'2000-08-16',time:'23:59',mode:'solar',gender:'女'},uncertaintyMinutes:1});assert.equal(d.timeSensitivity.sampleCount,3);assert.equal(d.timeSensitivity.classificationChanged,true);assert.ok(d.timeSensitivity.variants.length>1);
 assert.throws(()=>calculateShaoziWorkflow({pillars,uncertaintyMinutes:1}),/出生日期/);assert.throws(()=>calculateShaoziWorkflow({pillars,uncertaintyMinutes:31}),/0—30/);
 const stable=calculateShaoziWorkflow({birth:{date:'2000-08-16',time:'04:20',mode:'solar',gender:'女'},uncertaintyMinutes:2});assert.equal(stable.timeSensitivity.sampleCount,5);assert.equal(stable.timeSensitivity.classificationChanged,false);
});
test('large accumulated-year boundaries use exact integer arithmetic and invert without rounding',()=>{
 const last=Number.MAX_SAFE_INTEGER,base=BigInt(last)-BigInt(last)%129600n;
 for(let offset=-3n;offset<=3n;offset++){
  const n=Number(base+offset);if(n>last)continue;const r=calculateHuangjiCycles(n);assert.equal(BigInt(r.yuan),((BigInt(n)-1n)/129600n)+1n);assert.equal(composeHuangjiCycles(r),n);
 }
 for(const n of [1,30,31,360,361,10800,10801,129600,129601,last])assert.equal(composeHuangjiCycles(calculateHuangjiCycles(n)),n);
 for(const bad of [{yuan:1,hui:13,yun:1,shi:1,yearInShi:1},{yuan:1,hui:1,yun:31,shi:1,yearInShi:1}])assert.throws(()=>composeHuangjiCycles(bad));
});
test('explicit epochs preserve provenance, astronomical BCE numbering and overflow checks',()=>{
 const r=calculateHuangjiEpoch({year:2026,epochYear:1924,epochAccumulatedYear:68941,source:'reference supplied by user'});assert.equal(r.accumulatedYear,69043);assert.equal(r.roundTripVerified,true);assert.equal(r.mapping.source,'reference supplied by user');assert.equal(r.personalChart,false);
 assert.equal(calculateHuangjiEpoch({year:0,epochYear:-1,epochAccumulatedYear:1,source:'test'}).accumulatedYear,2);
 assert.throws(()=>calculateHuangjiEpoch({year:2026,epochYear:1924,epochAccumulatedYear:68941}));assert.throws(()=>mapYearToAccumulation({year:Number.MAX_SAFE_INTEGER,epochYear:-Number.MAX_SAFE_INTEGER,epochAccumulatedYear:1}));
});
