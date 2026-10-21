import {normalizeBirth} from './time.js';
import {buildNorthZiwei} from './north-ziwei.js';
// The placement engine stays explicit; northern structural analysis does not
// replace calendar conventions or silently move stars.
export function calculateZiwei(engine,birth){
 const n=normalizeBirth(birth),r=engine.astro.bySolar(n.date,n.timeIndex,n.gender,true,'zh-CN');
 const star=s=>({name:s.name,brightness:s.brightness||'',mutagen:s.mutagen||''});
 const chart={solarDate:r.solarDate,lunarDate:r.lunarDate,zodiac:r.zodiac,chineseDate:r.chineseDate,time:r.time,timeRange:r.timeRange,soul:r.soul,body:r.body,fiveElementsClass:r.fiveElementsClass,palaces:r.palaces.map(p=>({name:p.name,isBodyPalace:p.isBodyPalace,heavenlyStem:p.heavenlyStem,earthlyBranch:p.earthlyBranch,majorStars:p.majorStars.map(star),minorStars:p.minorStars.map(star)})),normalized:n,engine:'iztro@2.6.1',placementRuleVersion:'ziwei-default-v1'};
 return{...chart,north:buildNorthZiwei(chart)};
}
