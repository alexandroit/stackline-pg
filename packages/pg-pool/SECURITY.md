# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| Earlier or upstream versions | No |

## Reporting

Do not disclose a suspected vulnerability in a public issue. Use GitHub's
private vulnerability reporting for `alexandroit/stackline-pg`.

Include the affected version, runtime, a minimal reproduction, expected and
observed behavior, and the security impact. Maintainers will acknowledge a
complete report, investigate it privately, and coordinate disclosure with a
fixed release when appropriate.

## Release Policy

A release is blocked when its packed default production closure has an
unreviewed, deprecated, abandoned, vulnerable, or invalid node. Review is
recursive and proceeds from the deepest failing dependency toward the target
package.
