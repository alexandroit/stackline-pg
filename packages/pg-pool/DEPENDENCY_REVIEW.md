# Production Dependency Review

Reviewed: 2026-08-30

## Result

The default production closure of `@stackline/pg-pool@1.0.0` is empty.

`pg-pool@3.14.0` has no ordinary dependencies, but it declares the mandatory
peer `pg >=8.0`. npm 7 and newer auto-install missing mandatory peers. A clean
installation of that package therefore installed `pg@8.23.0` and its complete
14-package closure, including `pg-types@2.2.0`, `postgres-interval@1.2.0`, and
archived `xtend@4.0.2`.

The fork keeps the same peer range and marks it optional. This removes the
implicit edge without changing the pool implementation or preventing users
from supplying `pg` explicitly.

The upstream workspace also depended on Mocha, `expect.js`, `co`, Bluebird,
and Lodash. A fresh development install produced a deprecated-package warning
and three audit findings. The pool test suite now uses an in-repository harness
built on `node:test`, and the package declares no development dependencies.
A fresh source install therefore audits one package with zero findings.

## Release Gates

The exact packed artifact is installed in fresh projects under both names:

- `@stackline/pg-pool`
- `pg-pool` through an npm alias

For each installation the gate requires:

- no npm warning or deprecation output;
- `npm ls --all --omit=dev` with no problems;
- no installed runtime child packages;
- `npm audit --omit=dev` with zero findings;
- a working injected Client constructor.

Missing evidence blocks release.
