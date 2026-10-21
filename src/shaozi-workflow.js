// Extends the selected v2 rules without inventing missing Yuan-tang, later-heaven
// or article rules. Generic six-line algebra is kept distinct from a personal chart.
import {createShaoziDraft,SHAOZI_TRIGRAMS} from './shaozi.js';
export const SHAOZI_WORKFLOW_VERSION='shaozi-workflow-v3';
const lines={乾:[1,1,1],兑:[1,1,0],离:[1,0,1],震:[1,0,0],巽:[0,1,1],坎:[0,1,0],艮:[0,0,1],坤:[0,0,0]};
const images={乾:'天',兑:'泽',离:'火',震:'雷',巽:'风',坎:'水',艮:'山',坤:'地'};
const names=[['乾','履','同人','无妄','姤','讼','遁','否'],['夬','兑','革','随','大过','困','咸','萃'],['大有','睽','离','噬嗑','鼎','未济','旅','晋'],['大壮','归妹','丰','震','恒','解','小过','豫'],['小畜','中孚','家人','益','巽','涣','渐','观'],['需','节','既济','屯','井','坎','蹇','比'],['大畜','损','贲','颐','蛊','蒙','艮','剥'],['泰','临','明夷','复','升','师','谦','坤']];
export function hexagramFromLines(input){
 if(!Array.isArray(input)||input.length!==6||input.some(n=>n!==0&&n!==1))throw Error('六爻须为自下而上的六个0或1。');
 const get=a=>SHAOZI_TRIGRAMS.find(n=>lines[n].every((b,i)=>b===a[i])),lower=get(input.slice(0,3)),upper=get(input.slice(3)),shortName=names[SHAOZI_TRIGRAMS.indexOf(upper)][SHAOZI_TRIGRAMS.indexOf(lower)];
 return{name:upper===lower?upper+'为'+images[upper]:images[upper]+images[lower]+shortName,shortName,upper,lower,lines:[...input],lineOrder:'bottom-to-top'};
}
export function deriveShaoziHexagrams(natalLines,movingLine){
 const natal=hexagramFromLines(natalLines),mutual=hexagramFromLines([natalLines[1],natalLines[2],natalLines[3],natalLines[2],natalLines[3],natalLines[4]]),opposite=hexagramFromLines(natalLines.map(n=>1-n)),reversed=hexagramFromLines([...natalLines].reverse());
 let changed=null;
 if(movingLine!==undefined&&movingLine!==null&&movingLine!==''){
  if(typeof movingLine==='boolean'||!Number.isInteger(Number(movingLine))||Number(movingLine)<1||Number(movingLine)>6)throw Error('动爻须为1—6，自下往上编号。');
  const values=[...natalLines];values[Number(movingLine)-1]=1-values[Number(movingLine)-1];changed=hexagramFromLines(values);
 }
 return{natal,mutual,opposite,reversed,changed,movingLine:changed?Number(movingLine):null,movingLineSource:changed?'user-selected-not-derived-yuantang':null,kind:'generic-hexagram-algebra',laterHeavenCalculated:false,notice:'互卦、错卦、综卦与用户指定动爻所得变卦，只是卦象演算，不等于邵子元堂或后天命卦。'};
}
function stages(d,derivation){return[
 {id:'calendar',complete:!!d.calendar,status:d.calendar?'calculated':'manual-four-pillars',version:d.calendar?.version||null},
 {id:'numbers',complete:true,status:'calculated',ruleVersion:d.version},
 {id:'natal',complete:!!d.priorHexagram,status:d.priorHexagram?'draft':'unresolved'},
 {id:'hexagram-algebra',complete:!!derivation,status:derivation?'calculated-not-personal-later-heaven':'unresolved'},
 {id:'yuantang',complete:false,status:'missing-versioned-rule'},
 {id:'later-heaven',complete:false,status:'missing-versioned-rule'},
 {id:'articles',complete:false,status:'missing-authenticated-table'}
];}
export function calculateShaoziWorkflow(input={}){
 if(input.movingLine!==undefined&&input.movingLine!==null&&input.movingLine!==''&&(typeof input.movingLine==='boolean'||!Number.isInteger(Number(input.movingLine))||Number(input.movingLine)<1||Number(input.movingLine)>6))throw Error('动爻须为1—6，自下往上编号。');
 const d=createShaoziDraft(input);
 if(d.ke&&d.ke.branch!==d.pillars[3].ganzhi[1])throw Error('刻分时间与时柱地支不一致，请先核实四柱或校正时间。');
 const derivation=d.priorHexagram?deriveShaoziHexagrams(d.priorHexagram.lines,input.movingLine):null;
 const uncertainty=input.uncertaintyMinutes===undefined||input.uncertaintyMinutes===''?0:Number(input.uncertaintyMinutes);
 if(!Number.isInteger(uncertainty)||uncertainty<0||uncertainty>30)throw Error('皇极时间误差须为0—30的整数分钟。');
 if(uncertainty&&!input.birth)throw Error('时间误差核对需要出生日期与时间，不能从手动四柱补造。');
 let timeSensitivity=null;
 if(uncertainty){
  const {birth}=input,base=Date.parse(birth.date+'T'+birth.time+':00Z');
  if(!Number.isFinite(base))throw Error('时间误差核对需要有效的出生钟点。');
  const groups=new Map();
  for(let minute=-uncertainty;minute<=uncertainty;minute++){
   const x=new Date(base+minute*60000),b={...birth,date:x.toISOString().slice(0,10),time:x.toISOString().slice(11,16)},other=createShaoziDraft({...input,birth:b});
   const signature=other.pillars.map(p=>p.ganzhi).join(' ')+(other.priorHexagram?.name||'unresolved'),existing=groups.get(signature);
   if(existing){existing.to=minute;existing.samples++;}else groups.set(signature,{from:minute,to:minute,samples:1,pillars:other.pillars.map(p=>p.ganzhi),natal:other.priorHexagram?.name||null,heaven:other.heaven.reduced,earth:other.earth.reduced});
  }
  timeSensitivity={method:'each-whole-minute-sample',uncertaintyMinutes:uncertainty,sampleCount:uncertainty*2+1,classificationChanged:groups.size>1,variants:[...groups.values()],limits:'按原输入方式逐分钟采样；不证明秒级稳定，不自动更改历史UTC偏移。'};
 }
 return{...d,calculationVersion:SHAOZI_WORKFLOW_VERSION,derivation,timeSensitivity,stages:stages(d,derivation),validation:{timePillarConsistent:true,inputKind:input.birth?'birth':'manual-pillars',completePersonalChart:false},completePersonalChart:false};
}
