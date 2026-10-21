# Fate Atlas Calculations

Auditable **Northern Heluo Zi Wei structural relations**, **Huangji time cycles**, an **experimental Shaozi numerology workflow**, and **Vedic astrology geometry** in JavaScript. Pure local calculations with traceable rules, explicit limits and synthetic regression cases.

[中文说明](README.zh-CN.md) · [Website](https://fateatlas.net) · [Huangji online](https://fateatlas.net/huangji?utm_source=github&utm_medium=referral&utm_campaign=calculations) · [Vedic online](https://fateatlas.net/vedic?utm_source=github&utm_medium=referral&utm_campaign=calculations)

This is the independent calculation library behind selected features of **观星集 / Fate Atlas**. It supports cultural study and software verification. It does not validate fortune-telling, predict life events, verify personality types, or provide medical, legal or financial advice.

## Run locally

Node.js 22+; **no package installation, API keys or network calls are required** after downloading the repository.

```sh
git clone https://github.com/zhnagyusong/fate-atlas-calculations.git
cd fate-atlas-calculations
npm run verify
npm test
npm run example
```

No npm package has been published. Import the local modules directly; do not assume `npm install fate-atlas-calculations` exists.

## What is implemented?

| Module | Implemented | Deliberately unresolved / excluded |
|---|---|---|
| Northern Zi Wei | Natal transformations; Laiyin excluding Zi/Chou; palace-stem flights; inward/outward self-transformations; group filters | Placement remains iztro 2.6.1; no automatic event interpretation or claim to cover every Northern school |
| Huangji | One-based yuan/hui/yun/shi cycles; explicit epoch mapping; exact integer decomposition and inverse | No assumed historical epoch or personal life hexagram |
| Shaozi | Versioned stem/branch mapping; draft natal hexagram; ke; mutual/opposite/reversed hexagrams; a user-selected changing line; minute sampling | Unverified source rules; no automatic Yuan-tang, later-heaven life chart or authenticated article lookup |
| Vedic | Seven classical planets; mean Rahu/Ketu; sidereal ascendant; whole-sign D1; 27 nakshatras and padas; D9 positions; retrograde; tithi | Approximate Lahiri reference model; no dasha, prediction, yoga interpretation or compatibility scoring |
| Calendar adapter | Four pillars via lunar-typescript 1.8.6, with explicit input-time conventions | No claim that all cultural schools use this convention |

## Examples

```js
import {calculateHuangjiCycles, calculateShaoziWorkflow, calculateVedic} from './src/index.js';

const time = calculateHuangjiCycles(69043);
// yuan=1, hui=7, yun=12, shi=10, yearInShi=13

const draft = calculateShaoziWorkflow({
  pillars: ['庚辰', '甲申', '丙午', '庚寅'],
  gender: '女', year: 2000, movingLine: 1
});
// 山泽损 → 山水蒙. This changed hexagram is NOT a later-heaven life chart.

const chart = calculateVedic({
  date: '1990-08-18', time: '12:00',
  latitude: 31.23, longitude: 121.47,
  timeZone: 'Asia/Shanghai', utcOffset: 9,
  offsetConfirmed: true, consent: true
});
// Synthetic sample: Shanghai observed summer time on this date.
// UTC instant = 1990-08-18T03:00:00.000Z
```

The functions accept plain objects and return structured results. Vedic accepts **civil clock time**, not pre-corrected true solar time. Read the [API and time conventions](docs/api.md) before adapting inputs. The example's date and coordinates are synthetic test data, not a real customer record.

## Sources, accuracy and limitations

The default ayanamsa is named `lahiri-j2000-iau2006-approx`: a published J2000 Lahiri reference plus IAU 2006 precession and longitude nutation. It is **not the exact Swiss Ephemeris Lahiri implementation**. A custom true ayanamsa for the input date can be supplied. [Details](docs/vedic-model.md).

Nine independent Moshier/Lahiri reference vectors cover historical dates, hemispheres, retrograde planets and a high-latitude case. Tests allow 0.03° for planetary longitude and 0.002° for the ascendant on these vectors. **These samples do not establish an accuracy guarantee for all dates or near classification boundaries.** [Validation](docs/validation.md).

Original references:

- [Astronomy Engine coordinates](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md)
- [Lahiri reference values and whole-sign houses](https://www.astro.com/swisseph/swisseph.htm)
- [USNO Circular 179 / IAU precession](https://aa.usno.navy.mil/downloads/Circular_179_bw.pdf)
- [Mean lunar node polynomial](https://pymeeus.readthedocs.io/en/latest/_modules/pymeeus/Moon.html)
- [Huangji classical text](https://zh.wikisource.org/zh-hant/皇極經世書_(四庫全書本)) — context for time scales, **not proof of the complete personal Shaozi algorithm**.

## Northern Zi Wei sources

The reading method is anchored to the uploaded Northern Heluo / Liangyi Xiangshu sources, with a separately versioned relationship layer `ziwei-north-heluo-v1`. The original placement engine remains explicit. [Rule summary and bibliography](docs/sources/north-ziwei.md) · [Source index](docs/sources/north-ziwei-index.json) · [Online sources](https://fateatlas.net/sources/north-ziwei.html).

Eleven source documents are catalogued by title, file hash and reviewed scope. Only original summaries, factual rule parameters and our independent code are distributed. Original PDFs, Word lectures, scan images, OCR transcripts, personal chart cases and advertising contacts are excluded; the MIT license does not license those documents. The source review is targeted, not a claim to have collated every page.

`calculateZiwei(engine, birth)` takes an explicitly supplied iztro-compatible engine; the Node example uses the bundled MIT iztro 2.6.1 CJS adapter. `buildNorthZiwei(chart)` can also analyze a complete supplied chart without running a placement engine.

## Technical notes

- [Huangji and Shaozi rules: why a changed hexagram is not a life chart](docs/huangji-shaozi.md)
- [Historical daylight saving time and natal calculations](docs/time-zones.md)
- [How nakshatra, pada and D9 positions are calculated](docs/vedic-model.md)
- [FAQ](docs/faq.md)

## Privacy and project boundaries

The library has no account database, payments, analytics, AI integration, remote birth-data upload or persistence. The website is a separate product and has its own terms and privacy notice. Importing this code does not grant paid website access.

The repository was exported using an explicit source-file allowlist. Website environment files, account and billing handlers, credentials, customer data and private Git history are excluded. `source-manifest.json` records hashes of the exported calculation modules.

## Contributing and license

Please report reproducible issues with a **synthetic** input, expected output, rule version and a primary reference. Avoid real names, precise personal birth records, API keys or credentials in public issues. See [CONTRIBUTING](CONTRIBUTING.md) and [SECURITY](SECURITY.md).

MIT for original code; retained upstream notices apply to the bundled dependencies. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md). **Fate Atlas** identifies the website; the software license is not a trademark license or endorsement.
