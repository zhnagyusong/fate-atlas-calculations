import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {calculateVedic,resolveVedicTime,splitVedicLongitude,vedicAyanamsa,tropicalAscendant,meanLunarNode} from '../src/vedic.js';
const sample={date:'1990-08-18',time:'12:00',latitude:31.23,longitude:121.47,timeZone:'Asia/Shanghai',utcOffset:9,consent:true,offsetConfirmed:true};
const difference=(a,b)=>Math.abs(((a-b+540)%360)-180);
test('nine independent Moshier/Lahiri vectors cover dates, hemispheres, retrograde planets and polar ascendants',()=>{
 const refs=JSON.parse(readFileSync('tests/fixtures/vedic-reference.json','utf8'));assert.equal(refs.cases.length,9);
 for(const r of refs.cases){
  const a=calculateVedic({date:r.utc.slice(0,10),time:r.utc.slice(11,19),latitude:r.latitude,longitude:r.longitude,utcOffset:0,offsetConfirmed:true,consent:true});
  assert.ok(difference(a.ascendant.longitude,r.ascendant)<0.002,r.id+' ascendant');
  assert.ok(difference(a.ayanamsa.trueDegrees,r.ayanamsa)<0.0001,r.id+' ayanamsa');
  for(const p of a.planets.filter(p=>r.planets[p.id])){assert.ok(difference(p.longitude,r.planets[p.id].longitude)<0.03,r.id+' '+p.id);if(Math.abs(r.planets[p.id].speed)>0.01)assert.equal(p.motion,r.planets[p.id].speed<0?'retrograde':'direct',r.id+' '+p.id);}
 }
});
test('historical Shanghai DST is UTC+9, input offsets are not corrected a second time',()=>{
 assert.equal(resolveVedicTime({date:'1990-08-18',time:'12:00',timeZone:'Asia/Shanghai'}).utc,'1990-08-18T03:00:00.000Z');
 assert.equal(resolveVedicTime({date:'1990-08-18',time:'12:00',utcOffset:8,offsetConfirmed:true}).utc,'1990-08-18T04:00:00.000Z');
 assert.throws(()=>calculateVedic({...sample,utcOffset:8}),/不一致/);
 assert.equal(resolveVedicTime({date:'2000-01-01',time:'00:10',utcOffset:14,offsetConfirmed:true}).utc,'1999-12-31T10:10:00.000Z');
 assert.equal(resolveVedicTime({date:'2000-01-01',time:'12:00',timeZone:'Asia/Kolkata'}).offsetMinutes,330);
});
test('DST nonexistent times are rejected and repeated times require an explicit matching offset',()=>{
 assert.throws(()=>resolveVedicTime({date:'2024-03-10',time:'02:30',timeZone:'America/New_York'}),/不存在/);
 const fold={date:'2024-11-03',time:'01:30',timeZone:'America/New_York'};
 assert.throws(()=>resolveVedicTime(fold),/重复出现/);
 const early=resolveVedicTime({...fold,utcOffset:-4}),late=resolveVedicTime({...fold,utcOffset:-5});
 assert.equal(Date.parse(late.utc)-Date.parse(early.utc),3600000);
 assert.throws(()=>resolveVedicTime({...fold,utcOffset:-6}),/不一致/);
});
test('missing consent, unknown solar basis, invalid dates, zones and missing locations cannot silently generate a chart',()=>{
 for(const x of [{consent:false},{timeBasis:'solar'},{date:'2024-02-30'},{time:'24:00'},{latitude:''},{longitude:''},{latitude:90},{timeZone:'Invalid/Private'},{utcOffset:100},{utcOffset:8.001},{ayanamsa:'invented'},{ayanamsa:'custom',customAyanamsa:''},{uncertaintyMinutes:121}])assert.throws(()=>calculateVedic({...sample,...x}),JSON.stringify(x));
 assert.throws(()=>resolveVedicTime({date:'2000-01-01',time:'12:00'}));
});
test('sign, nakshatra, pada and D9 boundaries are calculated before any display rounding',()=>{
 for(const [x,sign] of [[0,0],[29.999999,0],[30,1],[359.999999,11],[360,0],[-1,11]])assert.equal(splitVedicLongitude(x).signIndex,sign);
 assert.equal(splitVedicLongitude(0).nakshatra,'Ashwini');assert.equal(splitVedicLongitude(40/3).nakshatra,'Bharani');
 assert.equal(splitVedicLongitude(10/3).pada,2);assert.equal(splitVedicLongitude(40/3-1e-6).pada,4);
 assert.equal(splitVedicLongitude(30).navamsaSign,'摩羯');assert.equal(splitVedicLongitude(60).navamsaSign,'天秤');assert.throws(()=>splitVedicLongitude(NaN));
});
test('same UTC instant and longitude give the same planet positions; latitude only changes the horizon and houses',()=>{
 const a=calculateVedic(sample),b=calculateVedic({...sample,date:'1990-08-18',time:'03:00',timeZone:'UTC',utcOffset:0}),c=calculateVedic({...sample,latitude:-33});
 assert.deepEqual(a.planets,b.planets);assert.equal(a.ascendant.longitude,b.ascendant.longitude);
 for(const p of a.planets)assert.equal(p.longitude,c.planets.find(x=>x.id===p.id).longitude);
 assert.notEqual(a.ascendant.longitude,c.ascendant.longitude);assert.equal(a.planets.length,9);assert.equal(a.houses.length,12);
 const rahu=a.planets.find(p=>p.id==='Rahu'),ketu=a.planets.find(p=>p.id==='Ketu');assert.equal(difference(rahu.longitude,ketu.longitude),180);assert.equal(rahu.nodeMode,'mean');assert.equal(ketu.distanceAU,null);
 assert.deepEqual(a.houses.flatMap(h=>h.planets).sort(),a.planets.map(p=>p.id).sort());
});
test('ayanamsa model is named and an explicit zero-degree custom correction is honored',()=>{
 const a=calculateVedic({...sample,ayanamsa:'custom',customAyanamsa:0});assert.equal(a.ayanamsa.trueDegrees,0);
 for(const p of a.planets)assert.ok(difference(p.longitude,p.tropicalLongitude)<1e-10);
 const t=new Date('2000-01-01T12:00:00Z');assert.equal(vedicAyanamsa(t).approximate,true);assert.ok(Math.abs(vedicAyanamsa(t).meanDegrees-(23+51/60+25.5324/3600))<0.000001);
 assert.ok(meanLunarNode(t)>=0&&meanLunarNode(t)<360);assert.throws(()=>tropicalAscendant(t,90,0));
});
test('time uncertainty compares endpoints honestly and warnings expose classification and model limits',()=>{
 const a=calculateVedic({...sample,uncertaintyMinutes:120});assert.equal(a.timeSensitivity.samples.length,2);assert.equal(a.timeSensitivity.method,'endpoint-comparison-not-exhaustive');assert.equal(a.timeSensitivity.classificationChanged,true);
 assert.match(a.warnings.join(' '),/近似模型/);assert.match(a.warnings.join(' '),/时间误差/);assert.equal(a.normalized.solarTimeApplied,false);
});
test('local calculation and exports exclude unrelated personal data and cannot grant AI, payment or account rights',()=>{
 const a=calculateVedic({...sample,name:'private-name',email:'private-email',apiKey:'private-secret',gender:'private-gender'}),text=JSON.stringify(a);
 assert.doesNotMatch(text,/private-name|private-email|private-secret|private-gender/);assert.deepEqual(a.privacy,{calculation:'browser-local',stored:false,accountWritten:false});assert.equal(a.profile.liveAi,false);assert.equal(a.profile.paidReading,false);
 const source=readFileSync('src/vedic.js','utf8');assert.doesNotMatch(source,/\bfetch\s*\(|localStorage|sessionStorage|OPENAI_API_KEY/);
 const provenance=JSON.parse(readFileSync('src/vendor/astronomy-engine.provenance.json'));assert.equal(createHash('sha256').update(readFileSync('src/vendor/astronomy-engine-2.1.19.mjs')).digest('hex'),provenance.sha256);
});
