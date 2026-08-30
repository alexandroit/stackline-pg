# @stackline/pg

A maintained, dependency-reviewed PostgreSQL client compatible with the
public API of `pg@8.23.0`.

This package preserves node-postgres behavior while replacing the archived
`pg-types -> postgres-interval -> xtend` branch with reviewed Stackline forks.
It is an independent fork of the MIT-licensed
[`brianc/node-postgres`](https://github.com/brianc/node-postgres) project and is
not affiliated with or endorsed by its maintainers.

## Install

Use the scoped name in new code:

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

## Quick Start

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

## Compatibility

- API baseline: `pg@8.23.0`.
- Node.js: 16 and newer.
- CommonJS, ESM, callbacks, promises, pools, notifications, COPY extensions,
  custom type parsers, SSL, SCRAM, and deep `pg/lib/*` exports are preserved.
- `pg-native` remains available through the historical lazy `pg.native` API
  when the application installs it explicitly. It is not auto-installed.

The original package documentation is retained in
[UPSTREAM_README.md](UPSTREAM_README.md). See [COMPATIBILITY.md](COMPATIBILITY.md)
and [MIGRATION.md](MIGRATION.md) for the exact contract.

## Dependency Integrity

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
[DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md). Security reports belong in
GitHub private vulnerability reporting; see [SECURITY.md](SECURITY.md).

## License

MIT. The original copyright and license are preserved in [LICENSE](LICENSE),
with attribution in [NOTICE](NOTICE) and dependency notices in
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
