// Original structural implementation. No source-book text, private chart examples,
// automatic divination, AI calls or persistence. See /sources/north-ziwei.md.
export const NORTH_ZIWEI_VERSION='ziwei-north-heluo-v1';
export const NORTH_ZIWEI_PROFILE=Object.freeze({version:NORTH_ZIWEI_VERSION,school:'northern-heluo-liangyi',baseEngine:'iztro@2.6.1',baseRuleVersion:'ziwei-default-v1',scope:'natal-structural-relations',completeSchoolImplementation:false,automaticInterpretation:false,liveAi:false,sourceIndex:'/sources/north-ziwei-index.json'});
export const NORTH_PALACES=Object.freeze(['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母']);
export const NORTH_SYMBOLS=Object.freeze(['禄','权','科','忌']);
export const NORTH_MUTAGENS=Object.freeze(Object.fromEntries(Object.entries({甲:['廉贞','破军','武曲','太阳'],乙:['天机','天梁','紫微','太阴'],丙:['天同','天机','文昌','廉贞'],丁:['太阴','天同','天机','巨门'],戊:['贪狼','太阴','右弼','天机'],己:['武曲','贪狼','天梁','文曲'],庚:['太阳','武曲','太阴','天同'],辛:['巨门','太阳','文曲','文昌'],壬:['天梁','紫微','左辅','武曲'],癸:['破军','巨门','太阴','贪狼']}).map(([k,v])=>[k,Object.freeze(v)])));
export const NORTH_NUMBERS=Object.freeze({禄:Object.freeze({body:4,use:9}),权:Object.freeze({body:2,use:7}),科:Object.freeze({body:3,use:8}),忌:Object.freeze({body:1,use:6})});
export const NORTH_RULES=Object.freeze([
 {id:'NZW-R01',title:'四化表',sources:['UP01'],locator:'固定版本十干四化；与本批讲义中的庚、辛、壬、癸等示例交叉核对'},
 {id:'NZW-R02',title:'来因宫',sources:['N02','N03'],locator:'N03 PDF第109—110页；N02 PDF第116页（书内115页）'},
 {id:'NZW-R03',title:'离心自化',sources:['N03'],locator:'PDF第149页，图062及图后说明'},
 {id:'NZW-R04',title:'向心自化',sources:['N03'],locator:'PDF第149页，图062及图后说明'},
 {id:'NZW-R05',title:'生年与自化分层',sources:['N03','N07'],locator:'N03 PDF第150—151页；N07第1讲2中体用段落'},
 {id:'NZW-R06',title:'河洛四化数',sources:['N01','N03'],locator:'N01 PDF第8页；N03 PDF第123页'},
 {id:'NZW-R07',title:'分象阅读',sources:['N09'],locator:'20181117第3讲1中分象、单独显示自化、按组整理的段落'}
].map(Object.freeze));
const branches='子丑寅卯辰巳午未申酉戌亥';
const aliases={陰:'阴',陽:'阳',貪:'贪',機:'机',門:'门',貞:'贞',輔:'辅',祿:'禄',權:'权',遷:'迁',僕:'仆',厄:'厄',財:'财'};
const simple=s=>String(s??'').replace(/[陰陽貪機門貞輔祿權遷僕財]/g,c=>aliases[c]);
const palaceName=s=>{const n=simple(s).replace(/宮/g,'宫').replace(/宫$/,'');return n==='命'?'命宫':n==='交友'||n==='奴仆'||n==='奴僕'?'仆役':n;};
const mark=s=>simple(s).replace(/^化/,'');
function checkedPalaces(chart){
 if(!Array.isArray(chart?.palaces)||chart.palaces.length!==12)throw Error('北派结构核对需要完整十二宫。');
 const result=chart.palaces.map((p,index)=>({index,name:palaceName(p.name),stem:simple(p.heavenlyStem),branch:simple(p.earthlyBranch),stars:[...(p.majorStars||[]),...(p.minorStars||[])].map(s=>({name:simple(s.name),mutagen:mark(s.mutagen)}))}));
 if(new Set(result.map(p=>p.name)).size!==12||result.some(p=>!NORTH_PALACES.includes(p.name)))throw Error('十二宫宫名缺失或重复。');
 if(new Set(result.map(p=>p.branch)).size!==12||result.some(p=>p.branch.length!==1||!branches.includes(p.branch)||!Object.hasOwn(NORTH_MUTAGENS,p.stem)))throw Error('北派结构核对需要有效且不重复的十二地支和宫干。');
 return result;
}
export function buildNorthZiwei(chart,{yearStem}={}){
 const palaces=checkedPalaces(chart),engineStem=String(chart.chineseDate||'').match(/^[甲乙丙丁戊己庚辛壬癸]/)?.[0],stem=yearStem||engineStem;
 if(!Object.hasOwn(NORTH_MUTAGENS,stem))throw Error('缺少排盘引擎采用的生年干；请重新排盘，不从公历年份猜测。');
 if(yearStem&&engineStem&&yearStem!==engineStem)throw Error('指定生年干与安盘引擎的年界结果不一致。');
 const stars=new Map();for(const p of palaces)for(const s of p.stars){if(!stars.has(s.name))stars.set(s.name,[]);stars.get(s.name).push({palace:p,star:s});}
 const wanted=new Set(Object.values(NORTH_MUTAGENS).flat());for(const name of wanted)if(stars.get(name)?.length!==1)throw Error('四化星曜缺失或重复：'+name+'。');
 const locator=name=>{const p=stars.get(name)[0].palace;return{index:p.index,name:p.name,branch:p.branch,stem:p.stem};};
 const natal=NORTH_MUTAGENS[stem].map((star,i)=>({id:'natal-'+i,kind:'natal',stem,symbol:NORTH_SYMBOLS[i],star,target:locator(star),number:NORTH_NUMBERS[NORTH_SYMBOLS[i]].body,numberContext:'生年生数',ruleIds:['NZW-R01','NZW-R05','NZW-R06']}));
 const supplied=palaces.flatMap(p=>p.stars.filter(s=>s.mutagen).map(s=>({symbol:s.mutagen,star:s.name,target:p.name}))),expected=new Map(natal.map(n=>[n.star,n.symbol]));
 const conflicts=supplied.filter(x=>!NORTH_SYMBOLS.includes(x.symbol)||expected.get(x.star)!==x.symbol);
 if(conflicts.length)throw Error('原盘生年四化与本版四化表不一致，请先核对版本。');
 const all=palaces.flatMap(p=>NORTH_MUTAGENS[p.stem].map((star,i)=>{
  const target=locator(star),diff=(branches.indexOf(target.branch)-branches.indexOf(p.branch)+12)%12,kind=diff===0?'outward':diff===6?'inward':'flying',symbol=NORTH_SYMBOLS[i];
  return{id:'palace-'+p.branch+'-'+i,kind,symbol,star,source:{index:p.index,name:p.name,branch:p.branch,stem:p.stem},target,focalPalace:target.name,ruleIds:['NZW-R01',...(kind==='outward'?['NZW-R03']:kind==='inward'?['NZW-R04']:[])],...(kind!=='flying'?{number:NORTH_NUMBERS[symbol].use,numberContext:'自化成数'}:{})};
 }));
 const candidates=palaces.filter(p=>p.stem===stem&&!['子','丑'].includes(p.branch));
 if(candidates.length!==1)throw Error('来因宫不能唯一定位，请核对十二宫宫干。');
 const laiyin={...candidates[0],stars:undefined,excludedBranches:['子','丑'],ruleIds:['NZW-R02']};
 const outward=all.filter(x=>x.kind==='outward'),inward=all.filter(x=>x.kind==='inward');
 const relations=palaces.map(p=>{const relative=d=>palaces.find(q=>(branches.indexOf(q.branch)-branches.indexOf(p.branch)+12)%12===d);return{palace:p.name,opposite:relative(6).name,trines:[relative(4).name,relative(8).name],outgoing:all.filter(x=>x.source.index===p.index),incoming:all.filter(x=>x.target.index===p.index),outward:outward.filter(x=>x.target.index===p.index),inward:inward.filter(x=>x.target.index===p.index)};});
 return{version:NORTH_ZIWEI_VERSION,profile:NORTH_ZIWEI_PROFILE,yearStem:stem,palaces:palaces.map(({stars,...p})=>p),laiyin,natal,flights:all,outward,inward,relations,validation:{natalMarkersPresent:supplied.length,natalMarkersVerified:supplied.length===4,allStarsUniquelyLocated:true,placementUnchanged:true},rules:NORTH_RULES,limits:['只核对本命盘四化结构，不作疾病、婚姻、财富或吉凶结论。','大限流年、自化串并联的事件取用、用神择取与河洛加减平衡尚未自动化。','本版为北派河洛·两仪象数的有限实现，不代表北派全部传承。'],sourceUrl:'/sources/north-ziwei.html'};
}
export function filterNorthRelations(rows,group='all'){
 const groups={all:NORTH_SYMBOLS,'禄忌':['禄','忌'],'权科':['权','科'],禄:['禄'],权:['权'],科:['科'],忌:['忌']};if(!Object.hasOwn(groups,group))throw Error('未定义的四化分象组。');return rows.filter(x=>groups[group].includes(x.symbol));
}
