# Verification

## Required Before Release

- Fresh source install with no npm warning or deprecation notice.
- Valid `npm ls --all` source tree.
- Zero full source-workspace audit findings.
- Complete upstream unit suite.
- Complete pure-JavaScript integration suite against PostgreSQL.
- Stackline CommonJS, ESM, exports, Pool, Client, and optional-native contracts.
- Fresh scoped and legacy-name installs of the exact packed tarball.
- Valid complete production trees and zero production audit findings.
- Dry-run inventory and strict package lint.
- CycloneDX SBOM, source provenance, dependency review, license review, and
  SHA-1, SHA-256, SHA-512, and integrity evidence.

Registry URLs, immutable release identity, artifact digests, CI runs, and
publication timestamps are recorded after release.
