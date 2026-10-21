# Validation / 核对记录

Initial standalone suite: **28 tests passed**, 2026-10-21. Run `npm test` to reproduce on your environment. `npm run verify` checks eight exported modules against the initial website-export hashes; `npm run example` exercises all three calculation paths without a network connection.

## Vedic reference vectors

Nine synthetic vectors were generated independently using pyswisseph 2.10.3.2 / Swiss Ephemeris 2.10.03, Moshier, SIDM_LAHIRI, apparent geocentric positions, mean lunar node and whole-sign houses. Cases include J2000, Shanghai historical summer time, Delhi, London, Sydney, Buenos Aires, 1901, 2099 and a latitude of80°.

Observed maximum difference in this small fixture: approximately0.019171° planetary longitude and0.000388° ascendant. Regression thresholds are0.03°,0.002° and0.0001° for planet longitude, ascendant and true ayanamsa respectively. **These samples are not an all-date accuracy guarantee** and do not validate astrological interpretations. The reference fixture is committed for audit; reference-library code is not bundled.

Other checks cover DST gaps/folds, conflicting offsets, dates, coordinates, explicit zero custom ayanamsa, nakshatra/pada/D9 boundaries, same-instant invariance and absence of persistence/network code.

## Huangji and Shaozi

Tests cover each time-scale boundary, maximum-safe-integer arithmetic and inverse composition, explicit epoch provenance and BCE numbering. Shaozi tests cover all64 hexagrams, double line-flip inversion, paired branch mapping, unresolved values, supplied lodging-table endpoints, manual time/pillar conflicts, ke boundaries across midnight and minute uncertainty sampling.

The test count differs from the full website suite: this repository contains calculation tests only, not website accounts, commerce, SSR or UI tests. Passing tests prove agreement with the specified vectors and conventions; they do not establish the historical authenticity of an incomplete Shaozi rule configuration.

## 0.2.0 Northern Zi Wei validation

The standalone suite now has35 passing tests. Northern checks use60 years with January and August synthetic dates, compare all ten stems against the fixed iztro2.6.1 engine, preserve star positions, test Laiyin exclusion of Zi/Chou, self/opposite geometry, palace-array reordering, invalid/conflicting inputs and the public-source distribution boundary. Eleven exported source-module hashes match the website modules and adapter.
