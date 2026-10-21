import {Solar,LunarUtil} from './vendor/lunar-1.8.6.mjs';
import {normalizeBirth} from './time.js';

export const BAZI_VERSION='bazi-details-v1';
export const BAZI_SAMPLE={date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'};
const LABELS=['年柱','月柱','日柱','时柱'];
function relation(dayMaster,ganzhi){
 const hidden=LunarUtil.ZHI_HIDE_GAN[ganzhi[1]]||[];
 return {ganzhi,stemTenGod:LunarUtil.SHI_SHEN[dayMaster+ganzhi[0]],hiddenStems:hidden.map(stem=>({stem,element:LunarUtil.WU_XING_GAN[stem],tenGod:LunarUtil.SHI_SHEN[dayMaster+stem]}))};
}
// The installed, versioned library supplies all calendar data. Ages are its
// year-based nominal ages, not completed birthdays or exact period boundaries.
export function calculateBazi(birth){
 const normalized=normalizeBirth(birth);
 const [y,m,d]=normalized.date.split('-').map(Number);
 const [h,mi,se]=normalized.time.split(':').map(Number);
 const lunar=Solar.fromYmdHms(y,m,d,h,mi,se).getLunar();
 const eight=lunar.getEightChar();eight.setSect(2);
 const dayMaster=eight.getDayGan();
 const pillars=['Year','Month','Day','Time'].map((key,index)=>{
  const hidden=eight['get'+key+'HideGan'](),ten=eight['get'+key+'ShiShenZhi']();
  return {label:LABELS[index],ganzhi:eight['get'+key](),elements:eight['get'+key+'WuXing'](),nayin:eight['get'+key+'NaYin'](),stemTenGod:eight['get'+key+'ShiShenGan'](),hiddenStems:hidden.map((stem,i)=>({stem,element:LunarUtil.WU_XING_GAN[stem],tenGod:ten[i]})),lifeStage:eight['get'+key+'DiShi'](),voidBranches:eight['get'+key+'XunKong']()};
 });
 const counts={木:0,火:0,土:0,金:0,水:0};
 pillars.forEach(p=>[...p.elements].forEach(element=>{counts[element]++;}));
 const yun=eight.getYun(normalized.gender==='男'?1:0,2);
 const periods=yun.getDaYun(9);
 const annual=entry=>({ganzhi:entry.getGanZhi(),stemTenGod:LunarUtil.SHI_SHEN[dayMaster+entry.getGanZhi()[0]],year:entry.getYear(),nominalAge:entry.getAge()});
 const prePeriod=periods[0];
 return {
  version:BAZI_VERSION,normalized,lunarDate:lunar.toString(),engine:'lunar-typescript@1.8.6',pillars,dayMaster:{stem:dayMaster,element:LunarUtil.WU_XING_GAN[dayMaster]},surfaceElements:counts,
  rules:{daySect:2,yunSect:2,ageBasis:'library-year-based-nominal',yearBoundary:'lichun',monthBoundary:'jie',lateZiRule:'same-day',source:'https://6tail.cn/calendar/lunar.bazi.html'},
  luck:{forward:yun.isForward(),startDate:yun.getStartSolar().toYmdHms(),offset:{years:yun.getStartYear(),months:yun.getStartMonth(),days:yun.getStartDay(),hours:yun.getStartHour()},beforeStart:{startYear:prePeriod.getStartYear(),endYear:prePeriod.getEndYear(),years:prePeriod.getLiuNian().map(annual)},periods:periods.slice(1).map(period=>({...relation(dayMaster,period.getGanZhi()),index:period.getIndex(),startYear:period.getStartYear(),endYear:period.getEndYear(),startAge:period.getStartAge(),endAge:period.getEndAge(),years:period.getLiuNian().map(annual)}))},
  notice:'四柱、藏干、十神、十二长生、大运与流年来自固定历法规则；未计算藏干权重、身强身弱或喜用神，不据此预测未来事件。'
 };
}

// Enrich old account results in the response only: retain the saved birth,
// identity, timestamp and quota marker, and never restore deleted content.
export function supplementBaziResult(result){
 if(!result||result.method!=='bazi'||!result.birth||result.basis?.version===BAZI_VERSION)return result;
 try{return {...result,basis:calculateBazi(result.birth),detailsAdded:true};}catch{return result;}
}
