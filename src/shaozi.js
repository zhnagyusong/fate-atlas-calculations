// User-requested Shaozi workflow. This is a versioned, unverified rules draft.
import {calculateBazi} from './bazi.js';
export const SHAOZI_VERSION='shaozi-selected-rules-v2';
export const SHAOZI_PROFILE=Object.freeze({id:'shaozi-shenshu',title:'邵子神数',version:SHAOZI_VERSION,source:'user-selected-rules-2026-10-14',userSpecified:true,sourceVerified:false,branchConvention:'both-group-values-per-branch',calendar:'bazi-details-v1',personalChartComplete:false,liveAi:false,paidReading:false});
export const SHAOZI_STEMS=Object.freeze({甲:6,乙:2,丙:8,丁:7,戊:1,己:9,庚:3,辛:4,壬:6,癸:2});
export const SHAOZI_BRANCHES={子:[1,6],丑:[5,10],寅:[3,8],卯:[3,8],辰:[5,10],巳:[2,7],午:[2,7],未:[5,10],申:[4,9],酉:[4,9],戌:[5,10],亥:[1,6]};
for(const values of Object.values(SHAOZI_BRANCHES))Object.freeze(values);Object.freeze(SHAOZI_BRANCHES);
const stems=Object.keys(SHAOZI_STEMS),branches=Object.keys(SHAOZI_BRANCHES),labels=['年柱','月柱','日柱','时柱'];
export const SHAOZI_TRIGRAMS=Object.freeze(['乾','兑','离','震','巽','坎','艮','坤']);
// Six lines are bottom-to-top: lower trigram first, then upper trigram.
const trigramNumbers={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兑',8:'艮',9:'离'};
const trigramLines={乾:[1,1,1],兑:[1,1,0],离:[1,0,1],震:[1,0,0],巽:[0,1,1],坎:[0,1,0],艮:[0,0,1],坤:[0,0,0]};
const images={乾:'天',兑:'泽',离:'火',震:'雷',巽:'风',坎:'水',艮:'山',坤:'地'};
const hexagramNames=[['乾','履','同人','无妄','姤','讼','遁','否'],['夬','兑','革','随','大过','困','咸','萃'],['大有','睽','离','噬嗑','鼎','未济','旅','晋'],['大壮','归妹','丰','震','恒','解','小过','豫'],['小畜','中孚','家人','益','巽','涣','渐','观'],['需','节','既济','屯','井','坎','蹇','比'],['大畜','损','贲','颐','蛊','蒙','艮','剥'],['泰','临','明夷','复','升','师','谦','坤']];
export function reduceShaoziNumber(total,group){
 if(!Number.isInteger(total)||total<0||!['heaven','earth'].includes(group))throw new Error('Invalid Shaozi total or group.');
 const limit=group==='heaven'?25:30;
 // The user's literal rule: one subtraction, no repeated modulo or extra digit reduction.
 const reduced=total>limit?total-limit:group==='heaven'&&total<limit?total%10:total;
 return {total,limit,reduced,operation:total>limit?'subtract-once':group==='heaven'&&total<limit?'units-digit':'retain'};
}
export function resolveShaoziTrigram(number,{year,heavenAbove}={}){
 if(number!==5)return {number,trigram:trigramNumbers[number]??null,epoch:null,reason:trigramNumbers[number]?null:'number-not-defined'};
 if(typeof heavenAbove!=='boolean')return {number,trigram:null,epoch:null,reason:'gender-required'};
 let epoch=null;
 if(Number.isInteger(year)){if(year>=1864&&year<=1923)epoch='upper';else if(year>=1924&&year<=1983)epoch='middle';else if(year>=1984&&year<=2043)epoch='lower';}
 return {number,trigram:epoch?(epoch==='lower'?(heavenAbove?'离':'兑'):(heavenAbove?'艮':'坤')):null,epoch,reason:epoch?null:'epoch-year-required-or-outside-table'};
}
export function calculateShaoziKe(time){
 const match=/^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(time));
 if(!match)throw new Error('刻分时间须为有效的时分。');
 const [hour,minute,second]=match.slice(1).map(n=>Number(n||0));
 if(hour>23||minute>59||second>59)throw new Error('刻分时间须为有效的时分。');
 const seconds=hour*3600+minute*60+second;
 const index=Math.floor(((seconds+3600)%86400)/7200);
 const startHour=index===0?23:index*2-1;
 const elapsedSeconds=(seconds-startHour*3600+86400)%86400;
 return {branch:branches[index],startHour,ordinal:Math.floor(elapsedSeconds/900)+1,elapsedMinutes:elapsedSeconds/60,minutesIntoKe:(elapsedSeconds%900)/60,minutesPerKe:15,kePerBranch:8};
}
export function createShaoziDraft({birth,pillars,gender,year,time,sourceEdition='用户选定规则（2026-10-14）',reduction}={}){
 if(reduction!==undefined&&reduction!=='once')throw new Error('本版本仅使用用户选定的字面折减规则。');
 if((birth!=null)===(pillars!=null))throw new Error('请选择出生资料或已有四柱其中一种输入。');
 let calendar=null;let values=pillars;
 if(birth!=null){const basis=calculateBazi(birth);values=basis.pillars.map(p=>p.ganzhi);calendar={engine:basis.engine,version:basis.version,rules:basis.rules,normalized:basis.normalized};gender=basis.normalized.gender;year=Number(basis.normalized.date.slice(0,4));time=basis.normalized.time;}
 if(gender!==undefined&&!['男','女'].includes(gender))throw new Error('请提供有效的排盘性别参数。');
 if(year!==undefined&&year!==''&&!Number.isInteger(year))throw new Error('寄宫年份须为公历整数年。');
 if(!Array.isArray(values)||values.length!==4)throw new Error('请提供年、月、日、时四柱。');
 const terms=[],trace=values.map((input,i)=>{const value=typeof input==='string'?input.trim():'';const gan=value[0],zhi=value[1];if(value.length!==2||!Object.hasOwn(SHAOZI_STEMS,gan)||!Object.hasOwn(SHAOZI_BRANCHES,zhi)||stems.indexOf(gan)%2!==branches.indexOf(zhi)%2)throw new Error('四柱须为有效的六十甲子干支。');const numbers=[SHAOZI_STEMS[gan],...SHAOZI_BRANCHES[zhi]];numbers.forEach((number,j)=>terms.push({pillar:i,kind:j===0?'stem':'branch',symbol:j===0?gan:zhi,number,group:number%2?'heaven':'earth'}));return{label:labels[i],ganzhi:value,stemNumber:numbers[0],branchNumbers:[...SHAOZI_BRANCHES[zhi]]};});
 const heaven=reduceShaoziNumber(terms.filter(t=>t.group==='heaven').reduce((sum,t)=>sum+t.number,0),'heaven');
 const earth=reduceShaoziNumber(terms.filter(t=>t.group==='earth').reduce((sum,t)=>sum+t.number,0),'earth');
 const yangYear='甲丙戊庚壬'.includes(trace[0].ganzhi[0]);
 const heavenAbove=gender===undefined?null:(yangYear&&gender==='男')||(!yangYear&&gender==='女');
 const context={year,heavenAbove};heaven.mapping=resolveShaoziTrigram(heaven.reduced,context);earth.mapping=resolveShaoziTrigram(earth.reduced,context);
 let priorHexagram=null;
 if(heavenAbove!==null&&heaven.mapping.trigram&&earth.mapping.trigram){const upper=(heavenAbove?heaven:earth).mapping.trigram,lower=(heavenAbove?earth:heaven).mapping.trigram;const name=hexagramNames[SHAOZI_TRIGRAMS.indexOf(upper)][SHAOZI_TRIGRAMS.indexOf(lower)];priorHexagram={name:upper===lower?upper+'为'+images[upper]:images[upper]+images[lower]+name,shortName:name,upper,lower,lines:[...trigramLines[lower],...trigramLines[upper]],lineOrder:'bottom-to-top',kind:'user-rule-natal'};}
 const unresolved=['元堂、后天卦、爻变与流年完整规则','考刻定分参数、正本条文编号与对应文本'];
 if(heavenAbove===null)unresolved.push('上下卦需要排盘性别参数');
 for(const [label,value] of [['天数',heaven],['地数',earth]]){if(value.mapping.reason==='number-not-defined')unresolved.push(label+'化得 '+value.reduced+'：源规则未定义此数的化卦方法');else if(value.mapping.reason==='epoch-year-required-or-outside-table')unresolved.push(label+'化得5：需要1864—2043范围内的公历出生年，范围外寄宫规则待定');}
 const ke=time?calculateShaoziKe(time):null;
 if(ke&&ke.branch!==trace[3].ganzhi[1])unresolved.push('刻分时间所属地支与输入时柱不一致，请核对真太阳时');
 return {schemaVersion:'fate-shaozi-draft-v2',method:'shaozi-shenshu',version:SHAOZI_VERSION,profile:{...SHAOZI_PROFILE,sourceEdition:String(sourceEdition).trim().slice(0,200),reduction:'literal-selected-v2',epochYearBasis:'normalized-solar-calendar-year'},calendar,pillars:trace,terms,heaven,earth,polarity:{yearStem:trace[0].ganzhi[0],yangYear,gender:gender??null,heavenAbove,gregorianBirthYear:Number.isInteger(year)?year:null},ke,status:priorHexagram?'natal-hexagram-draft':'numbers-only-draft',completePersonalChart:false,priorHexagram,laterHexagram:null,traditionalArticleCode:null,article:null,unresolved,authority:'draft-only',entitlement:'not-granted'};
}
// Internal, reversible address only. NOT an authenticated traditional article code.
export function buildShaoziAddress({branch,trigrams}={}){
 const b=branches.indexOf(branch);if(b<0||!Array.isArray(trigrams)||trigrams.length!==3||trigrams.some(t=>!SHAOZI_TRIGRAMS.includes(t)))throw new Error('请指定一个地支部集和三个先天八卦名。');
 const digits=trigrams.map(t=>SHAOZI_TRIGRAMS.indexOf(t));return{schemaVersion:'shaozi-internal-address-v1',branch,branchIndex:b+1,trigrams:[...trigrams],trigramIndices:digits.map(n=>n+1),ordinal:b*512+digits[0]*64+digits[1]*8+digits[2]+1,capacity:6144,label:branch+'·'+digits.map(n=>n+1).join(''),traditionalArticleCode:null,status:'internal-index-not-traditional-code'};
}
