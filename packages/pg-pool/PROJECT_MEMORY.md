# Project Memory

## Identity

- Package: `@stackline/pg-pool`
- Compatibility baseline: `pg-pool@3.14.0`
- Repository: `alexandroit/stackline-pg`, directory `packages/pg-pool`
- License: MIT, with upstream attribution preserved

## Permanent Decisions

- Preserve the upstream runtime implementation and API.
- Keep the historical `pg >=8.0` peer optional.
- Never add an ordinary production dependency without recursively reviewing
  its complete installed closure.
- Test both direct scoped and legacy npm-alias installation paths.
- A clean consumer install, valid recursive tree, and zero production audit
  are release blockers.

## 2026-08-30

The mandatory upstream peer was proven to auto-install `pg@8.23.0` and its
14-package closure. Version 1.0.0 removes that implicit edge at package metadata
level without changing the pool source.
