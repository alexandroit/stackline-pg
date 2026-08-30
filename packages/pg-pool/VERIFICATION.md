# Verification

## Required Before Release

- Monorepo TypeScript build.
- Full upstream `pg-pool` suite against PostgreSQL.
- Stackline metadata and constructor contract tests.
- Scoped and legacy-alias packed consumer installs.
- No npm install warnings or deprecations.
- Valid `npm ls --all --omit=dev` trees.
- Empty installed production closure for the standalone pool.
- Zero `npm audit --omit=dev` findings.
- Dry-run inventory review.
- License and notice review.

Registry URLs, artifact digests, CI runs, release identity, and publication
timestamps are recorded after each release rather than predicted here.
