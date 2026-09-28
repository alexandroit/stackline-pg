# @stackline/pg

> Maintained, dependency-reviewed PostgreSQL client compatible with pg 8.23.0

[![npm version](https://img.shields.io/npm/v/@stackline/pg.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/pg)
[![license](https://img.shields.io/npm/l/@stackline/pg.svg?style=flat-square)](https://github.com/alexandroit/stackline-pg/blob/main/LICENSE)
[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-pg)

**[Documentation](https://alexandro.net/docs/vanilla/pg/)** |
**[npm](https://www.npmjs.com/package/@stackline/pg)** |
**[Issues](https://github.com/alexandroit/stackline-pg/issues)** |
**[Repository](https://github.com/alexandroit/stackline-pg)**

**Package version:** `1.0.1`

## Why this package?

A maintained, dependency-reviewed PostgreSQL client compatible with the
public API of `pg@8.23.0`.

This package preserves node-postgres behavior while replacing the archived
`pg-types -> postgres-interval -> xtend` branch with reviewed Stackline forks.
It is an independent fork of the MIT-licensed
[`brianc/node-postgres`](https://github.com/brianc/node-postgres) project and is
not affiliated with or endorsed by its maintainers.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/pg@1.0.1` |
| Node.js runtime | `>=16` |
| CommonJS / primary entry | `./lib` |

- API baseline: `pg@8.23.0`.
- Node.js: 16 and newer.
- CommonJS, ESM, callbacks, promises, pools, notifications, COPY extensions,
  custom type parsers, SSL, SCRAM, and deep `pg/lib/*` exports are preserved.
- `pg-native` remains available through the historical lazy `pg.native` API
  when the application installs it explicitly. It is not auto-installed.

The original package documentation is retained in
[UPSTREAM_README.md](https://github.com/alexandroit/stackline-pg/blob/main/UPSTREAM_README.md). See [COMPATIBILITY.md](https://github.com/alexandroit/stackline-pg/blob/main/COMPATIBILITY.md)
and [MIGRATION.md](https://github.com/alexandroit/stackline-pg/blob/main/MIGRATION.md) for the exact contract.

## Installation

<a id="install"></a>

### Install

Use the scoped name in new code:

## Usage

```sh
npm install @stackline/pg
```

```js
const { Client, Pool } = require('@stackline/pg')
```

Keep existing `pg` imports without source changes:

```sh
npm install pg@npm:@stackline/pg
```

```js
const { Client, Pool } = require('pg')
```

Both CommonJS and ESM are supported:

```js
import pg, { Client, Pool } from '@stackline/pg'
```

<a id="quick-start"></a>

### Quick Start

```js
const { Pool } = require('@stackline/pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const result = await pool.query('select $1::text as message', ['hello'])
console.log(result.rows[0].message)
await pool.end()
```

Transactions must use one checked-out client:

```js
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('insert into events(name) values($1)', ['created'])
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

## Security

Review inputs and the package-specific compatibility limits before processing untrusted data. Report suspected vulnerabilities as described in the [security policy](https://github.com/alexandroit/stackline-pg/blob/main/SECURITY.md).

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-pg.git
cd stackline-pg
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

<a id="dependency-integrity"></a>

### Dependency Integrity

Every runtime edge is pinned and reviewed recursively. Release gates install
the packed artifact in empty projects under the scoped and legacy names and
require:

- no npm warnings or deprecation notices;
- a valid `npm ls --all --omit=dev` tree;
- zero `npm audit --omit=dev` findings;
- zero source-workspace audit findings;
- working CommonJS and ESM imports;
- the complete upstream unit and PostgreSQL integration suites.

The current closure and review rationale are recorded in
[DEPENDENCY_REVIEW.md](https://github.com/alexandroit/stackline-pg/blob/main/DEPENDENCY_REVIEW.md). Security reports belong in
GitHub private vulnerability reporting; see [SECURITY.md](https://github.com/alexandroit/stackline-pg/blob/main/SECURITY.md).

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-pg/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## Community and Support

Report reproducible package issues in the [issue tracker](https://github.com/alexandroit/stackline-pg/issues). Use the [security policy](https://github.com/alexandroit/stackline-pg/blob/main/SECURITY.md) for vulnerability reports.

- [Stackline / Alexandro.Net](https://alexandro.net/)
- [GitHub](https://github.com/alexandroit)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)
- [Reddit community: r/Stackline](https://www.reddit.com/r/Stackline/)

## License

MIT. The original copyright and license are preserved in [LICENSE](https://github.com/alexandroit/stackline-pg/blob/main/LICENSE),
with attribution in [NOTICE](https://github.com/alexandroit/stackline-pg/blob/main/NOTICE) and dependency notices in
[THIRD_PARTY_LICENSES.md](https://github.com/alexandroit/stackline-pg/blob/main/THIRD_PARTY_LICENSES.md).
