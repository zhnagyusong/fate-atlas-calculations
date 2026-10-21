# Third-party software and reference data

- **Astronomy Engine 2.1.19**, Don Cross and contributors, MIT. The original JavaScript module and copyright header are retained in `src/vendor/astronomy-engine-2.1.19.mjs`; license text is also in `src/vendor/ASTRONOMY-ENGINE-LICENSE.txt`. [Upstream](https://github.com/cosinekitty/astronomy).
- **lunar-typescript 1.8.6**, 6tail, MIT. The website's bundled ESM calendar adapter is retained as `src/vendor/lunar-1.8.6.mjs`; full upstream license is in `src/vendor/UPSTREAM-LICENSES.txt`. [Upstream](https://github.com/6tail/lunar-typescript).
- **Numerical reference vectors** in `tests/fixtures/vedic-reference.json` were generated with pyswisseph 2.10.3.2, Moshier ephemeris, SIDM_LAHIRI, apparent geocentric positions, mean nodes and whole-sign houses. Only synthetic numerical outputs are included. Swiss Ephemeris and pyswisseph code and ephemeris files are not included or runtime dependencies. [Reference documentation](https://www.astro.com/swisseph/swephprg.htm).

Our MIT license does not replace upstream copyright notices. Classical-cultural interpretations are not astronomical or scientific validation. Shaozi rules are a named experimental configuration, not a verified complete historical lineage.

- **iztro 2.6.1**, SylarLong, MIT. The Node-compatible adapter `src/vendor/iztro-2.6.1.cjs` is the existing site Node CJS adapter (UMD global `self` replaced by `globalThis`). Full license in `src/vendor/IZTRO-LICENSE.txt`. Northern school summaries and original uploaded lecture files are not covered by this MIT software license.
