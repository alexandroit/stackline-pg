# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| Earlier or upstream versions | No |

## Reporting

Do not disclose suspected vulnerabilities in a public issue. Use GitHub's
private vulnerability reporting for `alexandroit/stackline-pg` and include the
affected version, runtime, minimal reproduction, observed impact, and any
known workaround.

Maintainers will acknowledge complete reports, investigate privately, and
coordinate disclosure with a fixed release when appropriate.

## Release Policy

A release is blocked when its packed default production closure contains an
unreviewed, deprecated, abandoned, vulnerable, or invalid package. The review
is recursive and starts at the deepest failing dependency. Clean install,
tree, audit, API, integration, artifact, and license evidence are mandatory.

## Connection Security

TLS is off when neither `ssl` nor `PGSSLMODE` enables it. For connections to
remote databases, use `ssl: true` with a certificate trusted by Node.js, or
provide the server's trusted CA through `ssl.ca`. Leave certificate validation
enabled. `PGSSLMODE=no-verify`, `ssl: 'no-verify'`, and
`rejectUnauthorized: false` explicitly disable peer authentication and permit
an active network attacker to impersonate the database.

SSL parameters in a connection string can replace an `ssl` options object.
Keep the connection string and deployment environment under trusted control,
and avoid conflicting SSL settings. See the upstream
[SSL configuration guide](https://node-postgres.com/features/ssl).

The client retains PostgreSQL's legacy MD5 challenge-response calculation for
protocol compatibility. The server selects the authentication method; changing
the digest in the client does not upgrade that protocol. Prefer
SCRAM-SHA-256 by migrating the server's stored passwords and authentication
rules as described in the
[PostgreSQL password authentication documentation](https://www.postgresql.org/docs/18/auth-password.html).

Dependency audit results do not validate a deployed database's TLS or
authentication configuration.
