# Changelog

## 1.0.0 - 2026-08-30

- Forked the `pg-pool@3.14.0` runtime and public API.
- Prevented npm from auto-installing the historical `pg` dependency chain by
  declaring the existing `pg` peer optional.
- Added direct and legacy-alias packed-install regression gates.
- Replaced the vulnerable legacy test-tool chain with a dependency-free
  `node:test` compatibility harness while preserving all upstream cases.
- Added dependency, compatibility, migration, security, provenance, and
  verification documentation.

The pooling implementation is unchanged from the reviewed upstream baseline.
