<div align="right">
  <strong>English</strong> | <a href="SECURITY.zh-CN.md">简体中文</a>
</div>

# Security Policy

## Supported versions

Specato is a `0.x` early source preview. Security fixes are maintained on the latest `main` branch only; there is no fixed support window for older commits or unpublished packages.

Issues that could expose credentials, bypass path or execution boundaries, enable arbitrary command execution, or contaminate evidence are treated as high priority even during the preview phase.

## Reporting a vulnerability

Use the hosting platform's private vulnerability reporting feature for this repository when it is available. If no private channel is enabled, open a public issue only to request a secure contact method. Do not include vulnerability details, credentials, private endpoints, or a working exploit in a public issue.

A useful report includes:

- the affected commit or version;
- minimal reproduction steps using synthetic data;
- the expected security impact;
- whether a real secret, private dataset, or external system may be involved;
- temporary containment already applied.

If a secret has been exposed, revoke or rotate it before discussing code remediation. Do not attach real credentials or production evidence to the report.

## Security boundaries

### Local Workbench

- The default bind address is loopback (`127.0.0.1` / `::1`).
- Network reachability is not authentication. Remote listening requires a separate design for authentication, authorization, CSRF protection, and audit logging.
- Browser-visible configuration APIs must not return environment variable values or secret values.

### Configuration and credentials

- The repository may store `.env.example`, environment variable names, or secret references only.
- `.env` files, private keys, private certificates, tokens, cookies, database dumps, and test-account material must not be committed.
- Missing required configuration must fail before a network request or test process starts.
- Subprocesses must use argument arrays and allowlists instead of interpolated shell strings.

### Runners and external input

- TestCase, OpenAPI, Arazzo, and project manifests are untrusted input.
- Paths must be normalized, allowlisted, and contained by realpath checks.
- Runner adapters may execute only explicitly supported commands and arguments.
- Automation from external contributors must not receive organization secrets or access real test environments.

### Logs, evidence, and reports

- Redact Authorization, Cookie, token, password, signature, personal-data, and internal-address fields before persistence or display.
- Reports must not retain complete request/response bodies or browser storage state by default.
- Runtime output belongs in ignored directories with an explicit retention policy.
- If redaction or containment cannot be proven, fail closed and do not write the artifact.

## Source publication gates

A release must be blocked if SQL, real specifications, real TestCases, screenshot baselines, traces, HAR files, credentials, environment identities, private infrastructure identifiers, or business assets enter the candidate tree or its publishable history.

At minimum, maintainers must run:

- secret scanning on the candidate tree and publishable Git history;
- private-identifier, forbidden-file, and large-file audits;
- dependency vulnerability and license audits;
- frozen installation, tests, and production build from an isolated checkout;
- license and third-party source notice review.

See the [publication boundary](docs/publication-boundary.md) for the complete checklist.
