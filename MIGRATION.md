# Migration

## No Source Changes

Replace the dependency with an npm alias:

```sh
npm install pg@npm:@stackline/pg
```

Existing imports remain unchanged:

```js
const { Pool } = require('pg')
```

```js
import { Pool } from 'pg'
```

## Scoped Imports

New applications may install and import the scoped package directly:

```sh
npm install @stackline/pg
```

```js
import { Pool } from '@stackline/pg'
```

## Optional Native Adapter

The default package is pure JavaScript. Applications that deliberately use
`pg.native` must install a compatible `pg-native` themselves. This keeps the
native adapter and its separate dependency graph outside the default install.
