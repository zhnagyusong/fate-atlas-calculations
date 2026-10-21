import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import iztro from '../src/vendor/iztro-2.6.1.cjs';
import {calculateZiwei} from '../src/ziwei-chart.js';
import {buildNorthZiwei,filterNorthRelations,NORTH_MUTAGENS,NORTH_SYMBOLS,NORTH_NUMBERS} from '../src/north-ziwei.js';
const birth={date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'};
const chart=()=>calculateZiwei(iztro,birth);
test('synthetic natal vector has source-derived laiyin and separate directional relations',()=>{
 const a=chart().north;assert.equal(a.version,'ziwei-north-heluo-v1');assert.deepEqual([a.laiyin.name,a.laiyin.stem,a.laiyin.branch],['夫妻','庚','辰']);
 assert.deepEqual(a.natal.map(n=>[n.star,n.symbol,n.target.name]),[['太阳','禄','子女'],['武曲','权','财帛'],['太阴','科','仆役'],['天同','忌','疾厄']]);
 assert.ok(a.outward.some(n=>n.source.name==='命宫'&&n.star==='紫微'&&n.symbol==='权'));
 assert.ok(a.inward.some(n=>n.source.name==='福德'&&n.target.name==='财帛'&&n.star==='武曲'&&n.symbol==='科'));
 assert.equal(a.flights.length,48);assert.equal(a.outward.length,6);assert.equal(a.inward.length,4);assert.equal(a.validation.natalMarkersVerified,true);
});
test('all ten stem mappings agree with fixed iztro 2.6.1 natal mutagens and preserve placement',()=>{
 for(let year=1984;year<2044;year++)for(const date of ['01-20','08-16']){
  const b={...birth,date:year+'-'+date},c=calculateZiwei(iztro,b),original=iztro.astro.bySolar(c.normalized.date,c.normalized.timeIndex,b.gender,true,'zh-CN'),a=c.north;
  assert.deepEqual(c.palaces.map(p=>[p.name,p.heavenlyStem,p.earthlyBranch,p.majorStars.map(s=>s.name)]),original.palaces.map(p=>[p.name,p.heavenlyStem,p.earthlyBranch,p.majorStars.map(s=>s.name)]));
  const marker=original.palaces.flatMap(p=>[...p.majorStars,...p.minorStars]).filter(s=>s.mutagen);assert.equal(marker.length,4);
  assert.deepEqual(NORTH_SYMBOLS.map(symbol=>marker.find(s=>s.mutagen===symbol).name),NORTH_MUTAGENS[a.yearStem]);
  assert.ok(!['子','丑'].includes(a.laiyin.branch));assert.equal(a.laiyin.stem,a.yearStem);
  for(const e of a.flights){assert.equal(e.kind==='outward',e.source.index===e.target.index);const opposite=(('子丑寅卯辰巳午未申酉戌亥'.indexOf(e.source.branch)+6)%12);assert.equal(e.kind==='inward','子丑寅卯辰巳午未申酉戌亥'[opposite]===e.target.branch);}
 }
});
test('relationship geometry is invariant under reordering the twelve palace array',()=>{
 const c=chart(),a=buildNorthZiwei(c),b=buildNorthZiwei({...c,palaces:[...c.palaces].reverse()});
 const key=x=>[x.kind,x.source?.name,x.target.name,x.symbol,x.star].join('|');
 assert.deepEqual(a.flights.map(key).sort(),b.flights.map(key).sort());assert.equal(a.laiyin.name,b.laiyin.name);
});
test('incoming from a non-opposite palace stays a flying relation, never centripetal',()=>{
 const a=chart().north;assert.ok(a.flights.some(n=>n.kind==='flying'));for(const r of a.relations)for(const n of r.inward)assert.equal(n.source.name,r.opposite);
 const before=JSON.stringify(a);for(const group of ['all','禄忌','权科','禄','权','科','忌']){const rows=filterNorthRelations(a.flights,group);if(group!=='all')assert.ok(rows.every(x=>group.includes(x.symbol)));}assert.equal(JSON.stringify(a),before);assert.throws(()=>filterNorthRelations(a.flights,'unknown'));
});
test('missing coordinates, duplicate stars, year conflicts and mutagen version conflicts fail clearly',()=>{
 const c=chart();const copy=()=>JSON.parse(JSON.stringify(c));let x=copy();delete x.palaces[0].heavenlyStem;assert.throws(()=>buildNorthZiwei(x),/宫干/);
 x=copy();x.palaces[1].earthlyBranch=x.palaces[0].earthlyBranch;assert.throws(()=>buildNorthZiwei(x),/地支/);
 x=copy();x.palaces[0].minorStars.push({name:'太阳'});assert.throws(()=>buildNorthZiwei(x),/重复/);
 x=copy();delete x.chineseDate;assert.throws(()=>buildNorthZiwei(x),/生年干/);assert.throws(()=>buildNorthZiwei(c,{yearStem:'甲'}),/不一致/);
 x=copy();x.palaces.flatMap(p=>[...p.majorStars,...p.minorStars]).find(s=>s.mutagen==='禄').mutagen='忌';assert.throws(()=>buildNorthZiwei(x),/四化表不一致/);
});
test('Heluo number contexts stay separate and analysis never invents event predictions',()=>{
 assert.deepEqual(NORTH_SYMBOLS.map(s=>NORTH_NUMBERS[s].body),[4,2,3,1]);assert.deepEqual(NORTH_SYMBOLS.map(s=>NORTH_NUMBERS[s].use),[9,7,8,6]);
 const a=chart().north;assert.equal(a.profile.automaticInterpretation,false);assert.equal(a.profile.liveAi,false);assert.equal(a.profile.completeSchoolImplementation,false);assert.ok(a.natal.every(x=>x.numberContext==='生年生数'));assert.ok([...a.outward,...a.inward].every(x=>x.numberContext==='自化成数'));assert.ok(a.flights.filter(x=>x.kind==='flying').every(x=>x.number===undefined));
});
test('public source index references eleven documents without publishing books or case data',()=>{
 const index=JSON.parse(readFileSync('docs/sources/north-ziwei-index.json','utf8'));assert.equal(index.originalFilesPublished,false);assert.equal(index.sources.filter(x=>x.fileName).length,11);assert.ok(index.sources.filter(x=>x.fileName).every(x=>/^[a-f0-9]{64}$/.test(x.sha256)&&x.originalPublished===false));
 assert.ok(readdirSync('docs/sources').every(x=>! /\.(docx?|pdf|png|txt)$/i.test(x)));
 const html=readFileSync('docs/sources/north-ziwei.md','utf8');for(let i=1;i<=7;i++)assert.ok(html.includes('NZW-R0'+i));assert.doesNotMatch(html,/微信：|微信:|原案出生资料：/);
});
