# Production Dependency Review

Reviewed: 2026-08-30

## Result

The complete default production closure is pinned, installable, and audited
recursively. The archived `xtend@4.0.2` leaf is absent.

| Installed edge | Version | Role |
| --- | ---: | --- |
| `pg-connection-string` | `2.14.0` | Connection URL parser |
| `pg-pool` | `npm:@stackline/pg-pool@1.0.0` | Dependency-free pool fork |
| `pg-protocol` | `1.16.0` | Wire protocol parser and serializer |
| `pg-types` | `npm:@stackline/pg-types@1.0.0` | Dependency-free type parser fork |
| `pgpass` | `1.0.6` | Password file support without the old `split2` edge |
| `pg-cloudflare` | `1.4.0` | Optional Cloudflare socket adapter |

All versions are exact. `@stackline/pg-pool` and `@stackline/pg-types` have no
production children. The remaining packages also expose no production child
dependency in this closure.

## Cause Removed

Upstream `pg@8.23.0` pinned `pg-types@2.2.0`. That package installed
`postgres-array`, `postgres-bytea`, `postgres-date`, and
`postgres-interval@1.2.0`; `postgres-interval` installed archived
`xtend@4.0.2`. Updating only the target package would have preserved the
abandoned leaf.

The repair was therefore performed leaf first:

1. publish dependency-free `@stackline/pg-types`;
2. publish dependency-free `@stackline/pg-pool` without an auto-installed
   driver peer;
3. route `@stackline/pg` to both exact forks;
4. update consumers only after this closure passes.

## Release Gates

The exact tarball is installed in fresh projects as `@stackline/pg` and as
the legacy name `pg`. Each project must produce no warning, a valid complete
tree, zero production audit findings, and working CommonJS and ESM imports.
The source workspace must also report zero audit findings.
