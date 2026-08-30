# Publishing

1. Run the full monorepo build and upstream pool suite with PostgreSQL.
2. Run `npm run verify` from `packages/pg-pool`.
3. Commit the frozen source and create the annotated package tag.
4. Run `npm run artifact:prepare` from a clean worktree.
5. Publish the exact generated tarball to Verdaccio and repeat every consumer
   gate against the registry artifact.
6. Publish the same bytes once to official npm and verify registry integrity,
   signatures, direct install, alias install, tree, and audits.
7. Create an immutable GitHub release with the tarball, SBOM, provenance,
   inventory, license manifest, and checksums.
8. Update the catalog, public docs, and project memory only from verified
   registry data.

Never rebuild between registries and never republish while npm metadata is
still propagating.
