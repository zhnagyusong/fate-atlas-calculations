# Contributing

Use Node.js 22+ and run `npm run verify`, `npm test`, and `npm run example`.

For a calculation change, include a failing synthetic vector, the exact rule version, primary source, before/after values and an explanation of the boundary involved. A cultural-rule change is not automatically a bug fix: propose a separately named profile rather than silently replacing an existing convention.

No real customer birth records, credentials, copied proprietary rule tables or unauthorised book transcriptions. Do not add AI, telemetry, remote APIs, payments or predictive claims to this calculation library. Keep dependencies and upstream copyright notices auditable.

`source-manifest.json` initially identifies the exact modules exported from the website. If an original module changes, update its hash and explain the divergence from the website in CHANGELOG.md. Do not edit upstream modules to make a test pass without documenting provenance.
