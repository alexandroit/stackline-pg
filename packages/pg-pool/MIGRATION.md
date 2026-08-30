# Migration

## Direct Scoped Package

```sh
npm remove pg-pool
npm install @stackline/pg-pool
```

```js
const Pool = require('@stackline/pg-pool')
```

## No-Code Import Migration

```sh
npm install pg-pool@npm:@stackline/pg-pool
```

Existing imports remain unchanged:

```js
const Pool = require('pg-pool')
```

Standalone consumers must continue to provide a Client implementation. The
recommended complete driver is `@stackline/pg`, which injects its Client into
the pool automatically.
