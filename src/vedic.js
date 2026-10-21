// Independent, local-only geometry. Ayanamsa is an explicitly named approximation,
// not the Swiss Ephemeris Lahiri implementation. Sources and limits accompany output.
import {Body,MakeTime,GeoVector,Ecliptic,SiderealTime,e_tilt} from './vendor/astronomy-engine-2.1.19.mjs';

export const VEDIC_VERSION='vedic-geometry-v1';
export const VEDIC_PROFILE=Object.freeze({version:VEDIC_VERSION,engine:'astronomy-engine@2.1.19',zodiac:'sidereal',houseSystem:'whole-sign',nodeMode:'mean',defaultAyanamsa:'lahiri-j2000-iau2006-approx',yearMin:1900,yearMax:2100,liveAi:false,paidReading:false});
export const VEDIC_SIGNS=Object.freeze(['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼']);
export const NAKSHATRAS=Object.freeze(['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati']);
export const VEDIC_SOURCES=Object.freeze([
 {title:'Astronomy Engine · astronomical coordinates',url:'https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md'},
 {title:'Astrodienst · Lahiri reference value, whole-sign houses',url:'https://www.astro.com/swisseph/swisseph.htm'},
 {title:'IAU / USNO Circular 179 · precession',url:'https://aa.usno.navy.mil/downloads/Circular_179_bw.pdf'},
 {title:'Mean lunar node · Meeus polynomial reference',url:'https://pymeeus.readthedocs.io/en/latest/_modules/pymeeus/Moon.html'}
]);
const DAY=86400000,RAD=Math.PI/180;
const BODIES=[['Sun','太阳'],['Moon','月亮'],['Mercury','水星'],['Venus','金星'],['Mars','火星'],['Jupiter','木星'],['Saturn','土星']];
// Avoid adding 360 to an already-positive angle: cancellation can move an exact
// 13⅓° nakshatra boundary to the preceding mansion.
export const normalizeDegrees=x=>{const n=x%360;return n<0?n+360:n===0?0:n;};
const delta=(a,b)=>normalizeDegrees(a-b+180)-180;
function number(v,label,min,max){if(v===undefined||v===null||v===''||typeof v==='boolean'||!Number.isFinite(Number(v)))throw Error('请填写'+label);const n=Number(v);if(n<min||n>max)throw Error(label+'超出范围');return n;}
function civilMilliseconds(date,time){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||typeof time!=='string'||!/^\d{2}:\d{2}(:\d{2})?$/.test(time))throw Error('请填写公历日期与准确钟表时间。');
 const [y,m,d]=date.split('-').map(Number),[h,mi,s=0]=time.split(':').map(Number),ms=Date.UTC(y,m-1,d,h,mi,s),p=new Date(ms);
 if(y<1900||y>2100||p.getUTCFullYear()!==y||p.getUTCMonth()!==m-1||p.getUTCDate()!==d||h>23||mi>59||s>59)throw Error('日期或时间无效；支持1900—2100年。');
 return ms;
}
function zonedMilliseconds(ms,zone){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms));
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
}
// Enumerate offsets around the civil date so DST gaps/folds cannot silently choose
// an instant. An explicit actual offset resolves a fold, never a nonexistent time.
export function resolveVedicTime({date,time,timeZone='',utcOffset,offsetConfirmed}={}){
 const civil=civilMilliseconds(date,time),zone=String(timeZone||'').trim();let selected;
 if(utcOffset!==undefined&&utcOffset!==null&&utcOffset!=='')selected=number(utcOffset,'出生当时UTC偏移',-12,14)*60;
 if(selected!==undefined&&Math.abs(selected-Math.round(selected))>1e-7)throw Error('UTC偏移须能表示为整数分钟。');
 let candidates=[];
 if(zone){
  const offsets=new Set();try{for(let h=-36;h<=36;h+=3){const t=civil+h*3600000;offsets.add((zonedMilliseconds(t,zone)-t)/60000);}}catch{throw Error('历史时区名称无效，请使用 IANA 名称，例如 Asia/Shanghai。');}
  for(const o of offsets){const t=civil-o*60000;if(zonedMilliseconds(t,zone)===civil)candidates.push({utc:t,offsetMinutes:o});}
  candidates.sort((a,b)=>a.utc-b.utc);
  if(!candidates.length)throw Error('这个当地时间落在夏令时跳过区间，不存在。请核实出生记录。');
  if(candidates.length>1&&selected===undefined)throw Error('这个当地时间重复出现，请填写出生当时实际UTC偏移以区分早晚两次。');
  if(selected!==undefined)candidates=candidates.filter(x=>Math.abs(x.offsetMinutes-selected)<1e-7);
  if(!candidates.length)throw Error('UTC偏移与所选历史时区不一致，请核实夏令时与出生时间。');
 }else{
  if(selected===undefined||offsetConfirmed!==true)throw Error('请填写并确认出生当时实际UTC偏移，或选择历史时区。');
  candidates=[{utc:civil-selected*60000,offsetMinutes:selected}];
 }
 const chosen=candidates[0];return{utc:new Date(chosen.utc).toISOString(),offsetMinutes:chosen.offsetMinutes,timeZone:zone||null,source:zone?'runtime-IANA-tzdb':'user-confirmed-offset',civilDate:date,civilTime:time.length===5?time+':00':time,solarTimeApplied:false};
}
// General precession in longitude p_A (IAU 2006), anchored to the published
// J2000 TT Lahiri mean reference 23°51′25.5324″. This is a model, not exact SE.
export function vedicAyanamsa(time,mode='lahiri-j2000-iau2006-approx',customDegrees){
 const t=MakeTime(time),T=t.tt/36525,tilt=e_tilt(t);
 if(mode==='custom')return{mode,meanDegrees:null,trueDegrees:number(customDegrees,'自定义当日岁差值',0,60),nutationDegrees:null,approximate:false,source:'user-supplied-true-ayanamsa-at-birth'};
 if(mode!=='lahiri-j2000-iau2006-approx')throw Error('不支持的岁差版本。');
 const p=(5028.796195+T*(1.1054348+T*(0.00007964+T*(-0.000023857-0.0000000383*T))))*T;
 const mean=23+51/60+25.5324/3600+p/3600,nutation=tilt.dpsi/3600;
 return{mode,meanDegrees:mean,trueDegrees:mean+nutation,nutationDegrees:nutation,approximate:true,source:'Lahiri J2000 mean reference + IAU2006 p_A + Astronomy Engine nutation'};
}
export function meanLunarNode(time){const T=MakeTime(time).tt/36525;return normalizeDegrees(125.0445479-1934.1362891*T+0.0020754*T*T+T*T*T/476441-T*T*T*T/60616000);}
export function splitVedicLongitude(longitude){
 if(!Number.isFinite(longitude))throw Error('黄经必须是有限数值。');
 const value=normalizeDegrees(longitude),signIndex=Math.floor(value/30),nakIndex=Math.floor(value*3/40),padaIndex=Math.floor(value*3/10);
 return{longitude:value,signIndex,sign:VEDIC_SIGNS[signIndex],degreesInSign:value-signIndex*30,nakshatraIndex:nakIndex,nakshatra:NAKSHATRAS[nakIndex],pada:padaIndex%4+1,navamsaSignIndex:Math.floor(normalizeDegrees(value*9)/30),navamsaSign:VEDIC_SIGNS[Math.floor(normalizeDegrees(value*9)/30)]};
}
export function tropicalAscendant(time,latitude,longitude){
 const phi=number(latitude,'纬度',-89,89)*RAD,theta=normalizeDegrees(SiderealTime(time)*15+number(longitude,'经度',-180,180))*RAD,eps=e_tilt(MakeTime(time)).tobl*RAD;
 const cp=Math.cos(phi),sp=Math.sin(phi),st=Math.sin(theta),ct=Math.cos(theta),ce=Math.cos(eps),se=Math.sin(eps);
 let x=-se*sp-ce*cp*st,y=ce*cp*ct,z=se*cp*ct;
 if(Math.hypot(x,y,z)<1e-10)throw Error('该时刻的地平线与黄道交线退化，无法稳定计算上升点。');
 if(-x*st+y*ct<0){x=-x;y=-y;z=-z;}
 return normalizeDegrees(Math.atan2(y*ce+z*se,x)/RAD);
}
function tropicalPosition(id,time){return Ecliptic(GeoVector(Body[id],time,true));}
function chartAt(input,time,normalized){
 const ayanamsa=vedicAyanamsa(time,input.ayanamsa||VEDIC_PROFILE.defaultAyanamsa,input.customAyanamsa),ascT=tropicalAscendant(time,input.latitude,input.longitude),ascendant={...splitVedicLongitude(ascT-ayanamsa.trueDegrees),tropicalLongitude:ascT};
 const ascSign=ascendant.signIndex,span=21600000;
 const planets=BODIES.map(([id,name])=>{
  const p=tropicalPosition(id,time),before=new Date(time.getTime()-span),after=new Date(time.getTime()+span);
  const speed=delta(tropicalPosition(id,after).elon-vedicAyanamsa(after,input.ayanamsa||VEDIC_PROFILE.defaultAyanamsa,input.customAyanamsa).trueDegrees,tropicalPosition(id,before).elon-vedicAyanamsa(before,input.ayanamsa||VEDIC_PROFILE.defaultAyanamsa,input.customAyanamsa).trueDegrees)/0.5;
  const s=splitVedicLongitude(p.elon-ayanamsa.trueDegrees);return{id,name,...s,tropicalLongitude:p.elon,eclipticLatitude:p.elat,distanceAU:Math.hypot(p.vec.x,p.vec.y,p.vec.z),house:(s.signIndex-ascSign+12)%12+1,speedDegreesPerDay:speed,motion:Math.abs(speed)<0.001?'stationary':speed<0?'retrograde':'direct',node:false};
 });
 // Mean node is in the mean ecliptic frame: use mean ayanamsa. Custom values
 // are explicitly true-of-date, so add dpsi to the node before subtracting.
 const nodeMean=meanLunarNode(time),nodeTrue=nodeMean+e_tilt(MakeTime(time)).dpsi/3600;
 for(const [id,name,off] of [['Rahu','罗睺',0],['Ketu','计都',180]]){const s=splitVedicLongitude(nodeTrue+off-ayanamsa.trueDegrees);planets.push({id,name,...s,tropicalLongitude:normalizeDegrees(nodeTrue+off),eclipticLatitude:0,distanceAU:null,house:(s.signIndex-ascSign+12)%12+1,speedDegreesPerDay:null,motion:'retrograde',node:true,nodeMode:'mean'});}
 const houses=Array.from({length:12},(_,i)=>({number:i+1,signIndex:(ascSign+i)%12,sign:VEDIC_SIGNS[(ascSign+i)%12],startLongitude:((ascSign+i)%12)*30,planets:planets.filter(p=>p.house===i+1).map(p=>p.id)}));
 const sun=planets[0],moon=planets[1],elongation=normalizeDegrees(moon.tropicalLongitude-sun.tropicalLongitude);
 return{version:VEDIC_VERSION,profile:{...VEDIC_PROFILE,ayanamsa:ayanamsa.mode},normalized,ayanamsa,ascendant,planets,houses,moon:{nakshatra:moon.nakshatra,pada:moon.pada,sign:moon.sign},lunarDay:{number:Math.floor(elongation/12)+1,half:elongation<180?'waxing':'waning',elongation},navamsa:{ascendant:ascendant.navamsaSign,planets:planets.map(p=>({id:p.id,sign:p.navamsaSign,house:(p.navamsaSignIndex-ascendant.navamsaSignIndex+12)%12+1}))}};
}
export function calculateVedic(input={}){
 if(input.consent!==true)throw Error('请同意在浏览器内计算本次出生资料。');
 if(input.timeBasis&&input.timeBasis!=='civil')throw Error('吠陀使用钟表时间与历史时区换算UTC，请勿输入已校正真太阳时。');
 const normalized=resolveVedicTime(input),latitude=number(input.latitude,'出生地纬度',-89,89),longitude=number(input.longitude,'出生地经度',-180,180),uncertainty=number(input.uncertaintyMinutes??0,'时间误差分钟',0,120);
 const time=new Date(normalized.utc),clean={latitude,longitude,ayanamsa:input.ayanamsa,customAyanamsa:input.customAyanamsa},result=chartAt(clean,time,{...normalized,latitude,longitude,uncertaintyMinutes:uncertainty});
 const warnings=[];
 if(result.ayanamsa.approximate)warnings.push('本版采用 Lahiri J2000 基准的岁差近似模型，并非 Swiss Ephemeris 的精确 Lahiri 实现；靠近分界时请复核。');
 if(Math.abs(latitude)>66)warnings.push('高纬度上升点变化可能很快，请特别核实时间；本版仅用整宫制。');
 const near=(x,step)=>Math.min(normalizeDegrees(x)%step,step-normalizeDegrees(x)%step)<0.03;
 for(const p of [result.ascendant,...result.planets])if(near(p.longitude,30)||near(p.longitude,40/3)||near(p.longitude,10/3))warnings.push((p.name||'上升点')+'靠近星座、月宿或分足边界，近似误差可能改变分类。');
 let timeSensitivity=null;
 if(uncertainty>0){
  const signature=r=>[r.ascendant.signIndex,r.moon.nakshatra,r.moon.pada,...r.planets.map(p=>p.house)].join('|');
  const endpoints=[-uncertainty,uncertainty].map(minutes=>{const r=chartAt(clean,new Date(time.getTime()+minutes*60000),normalized);return{minutes,utc:new Date(time.getTime()+minutes*60000).toISOString(),ascendant:r.ascendant.sign,moon:r.moon,signature:signature(r)};});
  timeSensitivity={method:'endpoint-comparison-not-exhaustive',minutes:uncertainty,classificationChanged:endpoints.some(e=>e.signature!==signature(result)),samples:endpoints.map(({signature,...e})=>e)};
  if(timeSensitivity.classificationChanged)warnings.push('在所填时间误差两端，上升星座、宫位或月宿分类发生变化，请先核实出生时间。');
 }
 return{...result,timeSensitivity,warnings:[...new Set(warnings)],sources:VEDIC_SOURCES,privacy:{calculation:'browser-local',stored:false,accountWritten:false},unavailable:['Vimshottari dasha','yoga interpretation','compatibility','predictions'],notice:'这是按所选星历、岁差与整宫制计算的文化研究结果，不是未来事件或人格判断。'};
}
