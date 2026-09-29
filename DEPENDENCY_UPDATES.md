# Dependency maintenance for @stackline/pg 1.0.2

Reviewed 2026-09-28. Direct dependency aliases retain the original import names and pin the verified Stackline maintenance releases. The public API and declared runtime compatibility remain unchanged.

| Import / install key | Previous requirement | Maintained requirement | Verified release |
| --- | --- | --- | --- |
| `pg-copy-streams` | `7.0.0` | `npm:@stackline/pg-copy-streams@1.0.0` | [@stackline/pg-copy-streams](https://github.com/alexandroit/stackline-pg-copy-streams/releases/tag/stackline-v1.0.0) |

Each linked release was published through GitHub Actions and checked against its exact CI tarball, npm provenance and signatures, direct/aliased installations, and immutable release assets before adoption. Original upstream attribution and license texts remain in the dependency packages. Test-only upstream comparison packages remain independent oracles. Only the original parent projects’ direct/runtime/dev dependencies are in this audit scope; transitive dependencies are not recursively forked.
