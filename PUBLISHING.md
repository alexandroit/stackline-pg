# Publishing

Releases are prepared from a clean, reviewed `main` commit.

1. Run `npm ci --ignore-scripts`, `npm ls --all`, and `npm audit`.
2. Run `npm run verify` with the documented PostgreSQL test environment.
3. Review `npm run pack:check` and strict package lint output.
4. Commit and push the exact source; require green protected CI.
5. Create and push `stackline-v<version>` at the green commit.
6. Run `npm run artifact:prepare` once. Do not rebuild the tarball afterward.
7. Publish the exact artifact to Verdaccio, verify it, then publish the same
   bytes to the official npm registry.
8. Create an immutable GitHub release with the tarball, SBOM, manifests,
   checksums, provenance, license evidence, and release notes.
9. Verify registry signatures, dist hashes, aliases, documentation, catalog,
   and production endpoints.

Never overwrite an existing version or recreate an artifact after any
registry has accepted it.
