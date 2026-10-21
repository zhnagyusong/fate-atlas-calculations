import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createShaoziDraft,buildShaoziAddress,SHAOZI_TRIGRAMS,SHAOZI_PROFILE,reduceShaoziNumber,resolveShaoziTrigram,calculateShaoziKe} from '../src/shaozi.js';
const pillars=['庚辰','甲申','丙午','庚寅'];
test('user mapping remains an unverified Shaozi draft with explicit paired branch convention',()=>{const d=createShaoziDraft({pillars});assert.equal(d.method,'shaozi-shenshu');assert.equal(d.terms.length,12);assert.equal(d.heaven.total,30);assert.equal(d.earth.total,38);assert.equal(d.heaven.reduced,5);assert.equal(d.earth.reduced,8);assert.equal(d.profile.sourceVerified,false);assert.equal(d.completePersonalChart,false);assert.equal(d.priorHexagram,null);assert.equal(d.traditionalArticleCode,null);assert.equal(d.article,null);assert.equal(d.entitlement,'not-granted');});
test('birth conversion uses the existing fixed calendar without silently adopting a late-Zi change',()=>{const d=createShaoziDraft({birth:{date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'}});assert.deepEqual(d.pillars.map(p=>p.ganzhi),pillars);assert.equal(d.calendar.rules.monthBoundary,'jie');assert.equal(d.calendar.rules.lateZiRule,'same-day');assert.deepEqual([d.heaven.total,d.earth.total],[30,38]);});
test('literal reduction preserves unspecified edges rather than inventing repeated modulo',()=>{
 assert.deepEqual([reduceShaoziNumber(24,'heaven').reduced,reduceShaoziNumber(25,'heaven').reduced,reduceShaoziNumber(26,'heaven').reduced,reduceShaoziNumber(64,'heaven').reduced],[4,25,1,39]);
 assert.deepEqual([reduceShaoziNumber(30,'earth').reduced,reduceShaoziNumber(40,'earth').reduced,reduceShaoziNumber(62,'earth').reduced],[30,10,32]);
 const d=createShaoziDraft({pillars:['己巳','己巳','己巳','己巳'],gender:'男',year:2000});assert.equal(d.heaven.reduced,39);assert.equal(d.priorHexagram,null);assert.match(d.unresolved.join(' '),/39/);assert.throws(()=>createShaoziDraft({pillars,reduction:'cycle'}));
 for(const n of [0,10,20,25,30,39])assert.equal(resolveShaoziTrigram(n).trigram,null);
});
test('epoch endpoints use only the provided table and gender/year-stem polarity',()=>{
 for(const [year,epoch] of [[1864,'upper'],[1923,'upper'],[1924,'middle'],[1983,'middle'],[1984,'lower'],[2043,'lower']])for(const heavenAbove of [true,false]){
 const d=resolveShaoziTrigram(5,{year,heavenAbove});assert.equal(d.epoch,epoch);assert.equal(d.trigram,epoch==='lower'?(heavenAbove?'离':'兑'):(heavenAbove?'艮':'坤'));
 }
 for(const year of [1863,2044,undefined])assert.equal(resolveShaoziTrigram(5,{year,heavenAbove:true}).trigram,null);
 const male=createShaoziDraft({pillars,gender:'男',year:2000}),female=createShaoziDraft({pillars,gender:'女',year:2000});
 assert.equal(male.priorHexagram.name,'火山旅');assert.equal(female.priorHexagram.name,'山泽损');assert.deepEqual(female.priorHexagram.lines,[1,1,0,0,0,1]);
 assert.equal(createShaoziDraft({pillars,gender:'男'}).priorHexagram,null);
 const yin=['乙丑','甲申','丙午','庚寅'];assert.equal(createShaoziDraft({pillars:yin,gender:'女',year:2000}).polarity.heavenAbove,true);assert.equal(createShaoziDraft({pillars:yin,gender:'男',year:2000}).polarity.heavenAbove,false);
});
test('15-minute ke boundaries are one-based, including Zi across midnight and corrected 20:20',()=>{
 for(const [time,branch,ordinal,offset] of [['19:00','戌',1,0],['19:14:59','戌',1,14+59/60],['19:15','戌',2,0],['20:20','戌',6,5],['20:59','戌',8,14],['21:00','亥',1,0],['23:00','子',1,0],['00:00','子',5,0],['00:59','子',8,14],['01:00','丑',1,0]]){
 const d=calculateShaoziKe(time);assert.equal(d.branch,branch);assert.equal(d.ordinal,ordinal);assert.equal(d.minutesIntoKe,offset);
 }
 for(const time of ['24:00','20:60','12:00:60','bad'])assert.throws(()=>calculateShaoziKe(time));
 const birth=createShaoziDraft({birth:{date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'}});assert.equal(birth.ke.branch,'寅');assert.equal(birth.priorHexagram.name,'山泽损');
});
test('invalid Jiazi, incomplete or ambiguous input and unconfirmed civil time fail',()=>{for(const p of [['甲丑',...pillars.slice(1)],['<x>',...pillars.slice(1)],pillars.slice(1),['constructor',...pillars.slice(1)]])assert.throws(()=>createShaoziDraft({pillars:p}));assert.throws(()=>createShaoziDraft({pillars,birth:{}}));assert.throws(()=>createShaoziDraft({pillars,reduction:'guess'}));assert.throws(()=>createShaoziDraft({birth:{date:'2000-08-16',time:'04:20',gender:'女',mode:'civil',place:'x',longitude:120,utcOffset:8}}));});
test('manual input has no assumed calendar, parent information, secret adjustments or AI content',()=>{const d=createShaoziDraft({pillars,name:'private',parentSigns:'secret',adjustment:7130});assert.equal(d.calendar,null);assert.equal(d.laterHexagram,null);assert.doesNotMatch(JSON.stringify(d),/private|secret|7130|7600/);assert.equal(SHAOZI_PROFILE.liveAi,false);assert.equal(SHAOZI_PROFILE.paidReading,false);});
test('12 by 8 by 8 by 8 internal addresses are bijective without squeezing branch 10 into a digit',()=>{const seen=new Set();for(const branch of ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'])for(const a of SHAOZI_TRIGRAMS)for(const b of SHAOZI_TRIGRAMS)for(const c of SHAOZI_TRIGRAMS){const address=buildShaoziAddress({branch,trigrams:[a,b,c]});assert.equal(address.traditionalArticleCode,null);seen.add(address.ordinal);}assert.equal(seen.size,6144);assert.equal(Math.min(...seen),1);assert.equal(Math.max(...seen),6144);assert.equal(buildShaoziAddress({branch:'酉',trigrams:['坤','坤','坤']}).label,'酉·888');assert.throws(()=>buildShaoziAddress({branch:'子',trigrams:['5','乾','乾']}));});
