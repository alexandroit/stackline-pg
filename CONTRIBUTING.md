# Contributing

Changes must preserve the compatibility contract and include focused tests.
Run a local PostgreSQL instance, set the standard `PGHOST`, `PGPORT`, `PGUSER`,
`PGPASSWORD`, and `PGDATABASE` variables, then run:

```sh
npm ci --ignore-scripts
npm ls --all
npm audit
npm run verify
```

Dependency changes require a recursive production-closure review, exact
versions, license evidence, clean packed consumer installs, and zero audit
findings. Security reports must use private vulnerability reporting rather
than public issues.
