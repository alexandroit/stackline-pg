# PostgreSQL authentication and TLS review

Reviewed on 2026-09-28 for the 1.0.2 dependency-maintenance release. Runtime authentication and TLS code is unchanged from the preceding release. The maintainer approved the specific dispositions below; this document does not claim that disabling certificate validation or MD5 authentication is secure.

## Alerts 4 and 5: explicitly disabled certificate validation

`lib/connection-parameters.js` constructs `{rejectUnauthorized: false}` only after the application supplies `ssl: 'no-verify'`, a connection-string equivalent, or the deployment environment supplies `PGSSLMODE=no-verify`. These are explicit insecure compatibility settings. The parsed options pass through `Connection.upgradeToSSL` into `stream.getSecureStream`, which calls Node's `tls.connect`.

With `ssl: true`, a normal SSL options object, or environment modes `prefer`, `require`, `verify-ca`, and `verify-full`, these branches do not turn validation off. Node's `rejectUnauthorized` default remains true. TLS itself is off when no setting enables it; this client does not claim encrypted connections by default. Untrusted connection strings or environment configuration must not be accepted as application input.

Approved classification: **accepted, explicit insecure compatibility option (won't fix)**. The warning describes a real risk if the option is selected, so neither “used in tests” nor a blanket “false positive” would describe these runtime branches accurately. Removing the option would break the retained pg API. `SECURITY.md` already explains the impersonation risk and recommends a trusted CA with certificate verification enabled.

- [Node TLS verification defaults](https://nodejs.org/api/tls.html#tlsconnectoptions-callback)
- [node-postgres SSL configuration and connection-string precedence](https://node-postgres.com/features/ssl)

## Alert 6: PostgreSQL MD5 challenge response

`Client._handleAuthMD5Password` runs in response to the server's `authenticationMD5Password` message. It calls `postgresMd5PasswordHash(user, password, salt)` and sends the result using `connection.password`. This is the legacy PostgreSQL wire-protocol response, not a password-storage KDF. The calculation is dictated by the server challenge and cannot be replaced unilaterally by a slower digest or another algorithm. The SASL/SCRAM path is separate.

Approved classification: **false positive for insufficient password-storage hashing**. This does not dismiss the limitations of the legacy protocol: PostgreSQL deprecates MD5 authentication and recommends migration to SCRAM-SHA-256. The client retains interoperable legacy behavior while `SECURITY.md` recommends server-side migration. No password database is created by this helper.

- [PostgreSQL AuthenticationMD5Password wire contract](https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-START-UP)
- [PostgreSQL password authentication and migration](https://www.postgresql.org/docs/18/auth-password.html)

## Verification

`npm run test:security-contract` checks the actual option path into the TLS stream factory for normal and explicit no-verify configurations, environment/config precedence, hostname forwarding, and an independent fixed MD5 challenge vector. These tests do not make a live database TLS connection; the supported PostgreSQL/Node integration matrix and existing upstream SSL/authentication tests run separately in CI. The test restores all process environment and stream hooks. Source and runtime files remain in CodeQL analysis; no rule/path exclusions, hidden warnings, or runtime rewrites were introduced to silence the scanner.
