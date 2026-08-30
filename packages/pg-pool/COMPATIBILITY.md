# Compatibility

`@stackline/pg-pool@1.0.0` targets behavioral compatibility with
`pg-pool@3.14.0`.

The supported runtime is Node.js 16 or newer, matching `pg@8.23.0`.

## Preserved

- CommonJS constructor export.
- ESM default export.
- Promise and callback APIs.
- Pool options, events, lifecycle hooks, timeout behavior, counters, and
  Client injection.
- Legacy imports when installed through npm alias:
  `pg-pool@npm:@stackline/pg-pool`.

## Intentional Packaging Difference

The historical `pg >=8.0` peer remains declared but is optional. Modern npm
therefore does not auto-install `pg` when the pool is installed by itself.
Applications that instantiate the standalone pool without injecting a Client
must install `pg`, use the legacy alias, or use `@stackline/pg`.

This matches the peer-dependency installation behavior that consumers had
before npm 7 while preventing an implicit legacy dependency graph.
