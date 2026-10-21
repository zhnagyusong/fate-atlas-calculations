// Independently implemented Shao Yong time-scale arithmetic. No personal divination.
export const HUANGJI_VERSION='shaoyong-counts-v1';
export const HUANGJI_SCHOOL='shaoyong-kangjie';
export const HUANGJI_SCALES=Object.freeze({yearsPerShi:30,shiPerYun:12,yunPerHui:30,huiPerYuan:12,yearsPerYun:360,yearsPerHui:10800,yearsPerYuan:129600});
// Positive, one-based accumulated-year positions. No implicit historical epoch.
export function calculateHuangjiCycles(accumulatedYear){
 if(!Number.isSafeInteger(accumulatedYear)||accumulatedYear<1)throw new Error('积年须为大于零的安全整数。');
 const zero=BigInt(accumulatedYear)-1n,yearInYuan=zero%129600n,yearInHui=yearInYuan%10800n,yearInYun=yearInHui%360n;
 return Object.freeze({schemaVersion:'fate-huangji-cycles-v1',version:HUANGJI_VERSION,school:HUANGJI_SCHOOL,accumulatedYear,yuan:Number(zero/129600n)+1,hui:Number(yearInYuan/10800n)+1,yun:Number(yearInHui/360n)+1,shi:Number(yearInYun/30n)+1,yearInShi:Number(yearInYun%30n)+1,yearInYuan:Number(yearInYuan)+1,epoch:'user-supplied-accumulated-year',status:'time-scale-only',personalChart:false});
}
// Explicit mapping convention for research adapters; callers must document provenance.
// Astronomical year numbering is mandatory here (0 means 1 BCE).
export function mapYearToAccumulation({year,epochYear,epochAccumulatedYear}={}){
 for(const n of [year,epochYear,epochAccumulatedYear])if(!Number.isSafeInteger(n))throw new Error('Year and epoch values must be safe integers.');
 const exact=BigInt(year)-BigInt(epochYear)+BigInt(epochAccumulatedYear);
 if(exact<1n||exact>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('纪元映射后的积年超出安全范围。');
 const value=Number(exact);
 calculateHuangjiCycles(value);return value;
}

export function composeHuangjiCycles({yuan,hui,yun,shi,yearInShi}={}){
 const values=[yuan,hui,yun,shi,yearInShi],limits=[Number.MAX_SAFE_INTEGER,12,30,12,30];
 values.forEach((n,i)=>{if(!Number.isSafeInteger(n)||n<1||n>limits[i])throw new Error('元会运世的序号无效，请使用各层范围内的正整数。');});
 const value=(BigInt(yuan)-1n)*129600n+BigInt(hui-1)*10800n+BigInt(yun-1)*360n+BigInt(shi-1)*30n+BigInt(yearInShi);
 if(value>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('合成积年超出安全整数范围。');
 return Number(value);
}

export function calculateHuangjiEpoch({year,epochYear,epochAccumulatedYear,source}={}){
 if(typeof source!=='string'||!source.trim())throw new Error('请注明纪元映射的版本或来源。');
 const accumulatedYear=mapYearToAccumulation({year,epochYear,epochAccumulatedYear}),result=calculateHuangjiCycles(accumulatedYear);
 return{...result,epoch:'explicit-user-epoch',mapping:{year,epochYear,epochAccumulatedYear,source:source.trim().slice(0,200),yearNumbering:'astronomical-zero-is-1-BCE',formula:'year - epochYear + epochAccumulatedYear'},roundTripVerified:composeHuangjiCycles(result)===accumulatedYear};
}

// Traditional hexagram identifiers, sorted; no reference-app cycle is adopted.
const HEXAGRAM_NAMES=new Set(["中孚", "丰", "临", "乾", "井", "兑", "剥", "升", "同人", "否", "咸", "噬嗑", "困", "坎", "坤", "复", "大壮", "大有", "大畜", "大过", "夬", "姤", "家人", "小畜", "小过", "履", "屯", "巽", "师", "归妹", "恒", "损", "旅", "无妄", "既济", "明夷", "晋", "未济", "比", "泰", "涣", "渐", "益", "睽", "离", "艮", "节", "萃", "蒙", "蛊", "观", "解", "讼", "谦", "豫", "贲", "蹇", "遁", "随", "需", "震", "革", "颐", "鼎"]);
export const HUANGJI_BODY_USE_VERSION='shaoyong-body-use-study-v1';
export const HUANGJI_BODY_USE=Object.freeze({bodyHexagrams:64,useHexagrams:60,linesPerHexagram:6,bodyLines:384,useLines:360,excluded:Object.freeze(['乾','坤','坎','离']),status:'text-supported-study-framework',personalChart:false});
// Applies the explicitly selected four-exclusion study convention to a caller's order.
// The transcription supports counts/exclusions, not a fully verified circular layout.
export function deriveHuangjiUseSequence(bodySequence){
 if(!Array.isArray(bodySequence)||bodySequence.length!==64||new Set(bodySequence).size!==64||bodySequence.some(name=>!HEXAGRAM_NAMES.has(name)))throw new Error('Provide all 64 distinct canonical simplified-Chinese hexagram names.');
 const entries=bodySequence.filter(name=>!HUANGJI_BODY_USE.excluded.includes(name)).map((name,i)=>Object.freeze({position:i+1,name,bodyPosition:bodySequence.indexOf(name)+1}));
 return Object.freeze({version:HUANGJI_BODY_USE_VERSION,kind:'use60',entries:Object.freeze(entries),excluded:HUANGJI_BODY_USE.excluded,count:entries.length,lineCount:entries.length*6,bodyOrderVerified:false,status:'caller-order-study-projection',personalChart:false});
}
