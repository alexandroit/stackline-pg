# Project Memory

## Identity

- Package: `@stackline/pg`
- Compatibility baseline: `pg@8.23.0`
- Upstream commit: `c9e57617bc92c2ded23a75345f50eadc527bd131`
- Repository: `alexandroit/stackline-pg`
- Public documentation: `https://alexandro.net/docs/vanilla/pg/`

## Immutable Rules

- Preserve the `pg` public API and both module systems.
- Review the entire installed production closure recursively, deepest leaf
  first; never approve only the target package.
- Do not ship deprecated, abandoned, vulnerable, invalid, or warning-producing
  default dependencies.
- Require clean scoped and legacy-name consumer installs, complete valid trees,
  and zero audit findings.
- Preserve upstream license, attribution, runtime history, and notices.
- Publish one exact verified tarball to every registry and GitHub release.
- Update GitHub, Alexandro.Net, the dynamic catalog, and Google Drive after
  every accepted release.

## Current Dependency Chain

`@stackline/pg-types@1.0.0` and `@stackline/pg-pool@1.0.0` are leaf-first
repairs. The next consumer is `@stackline/pg`, followed by
`@stackline/ai-rag-postgres`.
