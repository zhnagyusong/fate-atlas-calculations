import iztro from '../src/vendor/iztro-2.6.1.cjs';
import {calculateZiwei} from '../src/ziwei-chart.js';
import {calculateHuangjiCycles, calculateShaoziWorkflow, calculateVedic} from '../src/index.js';
// Synthetic examples, not customer data. Nothing is uploaded or stored.
const cycles=calculateHuangjiCycles(69043);
console.log('Huangji [yuan,hui,yun,shi,year]:', [cycles.yuan,cycles.hui,cycles.yun,cycles.shi,cycles.yearInShi]);
const shaozi=calculateShaoziWorkflow({pillars:['庚辰','甲申','丙午','庚寅'],gender:'女',year:2000,movingLine:1});
console.log('Shaozi draft:', shaozi.priorHexagram.name, '→', shaozi.derivation.changed.name);
console.log('Complete personal chart:', shaozi.completePersonalChart);
const vedic=calculateVedic({date:'1990-08-18',time:'12:00',latitude:31.23,longitude:121.47,timeZone:'Asia/Shanghai',utcOffset:9,offsetConfirmed:true,consent:true});
console.log('Vedic UTC:',vedic.normalized.utc);
console.log('Ascendant:',vedic.ascendant.sign,vedic.ascendant.degreesInSign);
console.log('Moon:',vedic.moon.nakshatra,'pada',vedic.moon.pada);
console.log('Ayanamsa:',vedic.ayanamsa.model||vedic.profile.defaultAyanamsa,'(approximate)');

const north=calculateZiwei(iztro,{date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'}).north;
console.log('Northern Zi Wei:',north.version,'Laiyin:',north.laiyin.name,'flights:',north.flights.length);
