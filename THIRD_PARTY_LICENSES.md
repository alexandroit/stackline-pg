# Third-Party Notices

The runtime implementation is derived from `pg@8.23.0`, part of
`brianc/node-postgres`, under the MIT license preserved in `LICENSE`.

The default production closure includes the following independently licensed
packages:

| Package | Version | License |
| --- | ---: | --- |
| `pg-connection-string` | `2.14.0` | MIT |
| `@stackline/pg-pool` | `1.0.0` | MIT |
| `pg-protocol` | `1.16.0` | MIT |
| `@stackline/pg-types` | `1.0.0` | MIT |
| `pgpass` | `1.0.6` | MIT |
| `pg-cloudflare` | `1.4.0` | MIT |

No third-party runtime source is bundled into the published tarball. npm
installs each dependency as a separate package under its own license.
