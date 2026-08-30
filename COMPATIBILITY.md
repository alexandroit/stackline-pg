# Compatibility

## Baseline

`@stackline/pg@1.0.0` tracks the public runtime contract of `pg@8.23.0` from
upstream source commit `c9e57617bc92c2ded23a75345f50eadc527bd131`.

The `lib` and `esm` runtime implementation is unchanged. Stackline changes
are limited to dependency routing, package metadata, tests, documentation,
and release controls.

## Preserved Contracts

- `Client`, `Pool`, `Connection`, `Query`, `Result`, `DatabaseError`,
  `TypeOverrides`, `types`, `defaults`, and escaping helpers.
- CommonJS default usage and named ESM exports.
- Callback, Promise, and async/await APIs.
- Existing `require('pg')` and `import ... from 'pg'` through an npm alias.
- Deep `pg/lib/*` exports declared by the upstream package.
- Lazy `pg.native` detection when `pg-native` is installed by the application.
- Cloudflare socket adapter behavior through the optional `pg-cloudflare`
  dependency.

## Runtime Support

Node.js 16 and newer are release-gated. PostgreSQL integration tests run
against PostgreSQL 18. Applications may use older supported PostgreSQL server
versions according to the upstream protocol compatibility contract.

No TypeScript declarations were exposed by `pg@8.23.0`, so this fork does not
invent a competing declaration surface. Existing applications can continue
using the community `@types/pg` package.
