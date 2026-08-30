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
