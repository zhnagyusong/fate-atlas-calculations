# API and input conventions

All functions are exported from `src/index.js`; modules are also directly importable. Node.js 22+ supports the bundled ESM dependencies and IANA time-zone conversion. No remote API exists in this repository.

## Huangji time scale

```js
import {calculateHuangjiCycles, calculateHuangjiEpoch, composeHuangjiCycles} from '../src/index.js';
const result = calculateHuangjiCycles(69043);
console.log(composeHuangjiCycles(result)); // 69043
const mapped = calculateHuangjiEpoch({
  year: 2026, epochYear: 1924, epochAccumulatedYear: 68941,
  source: 'Synthetic example epoch; not an asserted historical tradition'
});
```

One-based safe integers only. `year`, `epochYear` use astronomical numbering: 0 = 1 BCE. The function does annual arithmetic and does not decide whether the year begins at Li Chun or the winter solstice. `personalChart` is false.

## Shaozi

Use **either** four pillars **or** a birth object, never both:

```js
calculateShaoziWorkflow({
  pillars: ['庚辰','甲申','丙午','庚寅'], gender:'女', year:2000,
  time:'04:20', movingLine:1
});
calculateShaoziWorkflow({
  birth:{date:'2000-08-16',time:'04:20',gender:'女',mode:'solar'},
  uncertaintyMinutes:2
});
```

`mode:'solar'` means the caller already supplied true solar time and it is not corrected again. `mode:'civil'` also requires `place`, `longitude`, the actual historical `utcOffset` in hours and `offsetConfirmed:true`. The calendar adapter applies a NOAA equation-of-time approximation; it does not look up historical offsets. This is separate from Vedic's IANA conversion.

`gender` is the traditional algorithm parameter `'男'` or `'女'`; it is not a personality inference. `year` selects the experimental five-number lodging table when needed. `movingLine` is optional 1—6, bottom to top. `uncertaintyMinutes` is an integer 0—30 and requires birth data. The result exposes `terms`, `heaven`, `earth`, `priorHexagram`, `ke`, `derivation`, `stages`, `unresolved`, and `completePersonalChart:false`.

## Vedic geometry

Required: `date` (`YYYY-MM-DD`), `time` (civil `HH:mm[:ss]`), `latitude` (−89…89), `longitude` (−180…180), `consent:true`. Years 1900—2100. Positive latitude = north; positive longitude = east.

Time conversion needs an IANA `timeZone`, or `utcOffset` (actual hours including historical DST) plus `offsetConfirmed:true`. If both are supplied they must agree. An ambiguous local time needs an explicit matching offset. A nonexistent local time is rejected. Runtime ICU/IANA data versions can differ across environments; input provenance is returned.

Optional:

| Field | Values |
|---|---|
| `ayanamsa` | `lahiri-j2000-iau2006-approx` (default), or `custom` |
| `customAyanamsa` | With custom mode: true ayanamsa in degrees **for the input date**, 0…60 |
| `uncertaintyMinutes` | Integer 0…120; compare interval endpoints only |

Vedic uses civil time; do not supply pre-corrected true solar time. Results include `normalized`, `profile`, `ayanamsa`, `ascendant`, nine `planets`, `moon`, twelve `houses`, `navamsa`, `lunarDay`, `warnings` and `privacy`. Planet `longitude` is sidereal; `tropicalLongitude` is also retained. `signIndex` starts at 0, while `house` and `pada` start at 1. Compute classifications before rounding displayed angles.

The library does not save input. Your own application must obtain its own consent and handle any storage or transmission it adds. Returned charts are not website entitlements or scientifically validated predictions.

## Northern Heluo Zi Wei

```js
import iztro from "../src/vendor/iztro-2.6.1.cjs";
import {calculateZiwei} from "../src/index.js";
const result = calculateZiwei(iztro, {date:"2000-08-16",time:"04:20",gender:"女",mode:"solar"});
console.log(result.north.version, result.north.laiyin, result.north.flights);
```

Placement still uses the supplied fixed engine; `north` is a separate structural relation layer. For a precomputed chart, call `buildNorthZiwei(chart,{yearStem})`; a supplied year stem must agree with the engine `chineseDate` when that field is present. Complete palace stems, branches and uniquely placed transformation stars are required. `filterNorthRelations(rows,group)` accepts all, 禄忌, 权科 or one of 禄/权/科/忌. This does not implement automatic interpretation or every Northern lineage. See[the source summary](sources/north-ziwei.md).
