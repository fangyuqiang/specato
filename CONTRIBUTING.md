<div align="right">
  <strong>English</strong> | <a href="CONTRIBUTING.zh-CN.md">简体中文</a>
</div>

# Contributing to Specato

Specato is an early source preview. Contributions should keep the repository independently installable, verifiable, and free of private project assets. Reusable contracts are more valuable than fast accumulation of project-specific features.

## Before you start

1. Read the [architecture](docs/architecture.md), [publication boundary](docs/publication-boundary.md), and [security policy](SECURITY.md).
2. Confirm that the change does not depend on an adjacent repository, personal workstation path, private runtime, or organization-specific convention.
3. Update the relevant specification and verifiable scenario before changing a public contract or observable behavior.
4. Do not disclose a vulnerability in a public issue. Follow [SECURITY.md](SECURITY.md).

For a substantial contract change, open a focused discussion or proposal that explains the use case, alternatives, compatibility impact, and synthetic verification plan before implementation.

## Development setup

Prerequisites:

- Node.js `>=20.19`
- Corepack
- pnpm `10.34.5` as pinned by the root `packageManager`

Install and verify:

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm run verify
```

Use the scripts in the root `package.json` as the source of truth. Never add a personal path, proxy, test identity, or secret to a script merely to make verification pass.

## Design constraints

- Keep the core limited to reusable concepts; project-specific behavior belongs in a manifest, provider, or adapter.
- Extend an existing contract when its semantics fit. Do not create a parallel flow for one integration.
- Make default behavior verifiable with repository-owned synthetic fixtures.
- Store only environment variable names or secret references, never secret values.
- Fail with actionable diagnostics without echoing credentials or sensitive input.
- Explain the purpose, maintenance status, and license effect of every new dependency.
- Record the exact upstream revision for newly copied or generated third-party source.

## Tests and evidence

Match verification to the risk of the change:

| Change | Minimum evidence |
| --- | --- |
| Pure function or contract | Unit tests for success and failure paths |
| Provider or adapter | Synthetic fixture and preflight/failure tests |
| Workbench interaction | Relevant component or end-to-end flow |
| Report format or evidence | Structure and redaction assertions |
| Path, package, or release rule | Verification from an isolated checkout |

Fixtures must be authored from scratch or have a demonstrably public source. Renaming or partially redacting a real asset is not sufficient. When provenance is uncertain, create a minimal synthetic fixture instead.

## Documentation policy

English is the default language for maintained project documentation. When changing a document, update its Simplified Chinese counterpart in the same change and keep the language switch at the top of both files.

- Default file: `name.md`
- Simplified Chinese mirror: `name.zh-CN.md`
- `README.md` links to `README.zh-CN.md`; the Chinese README links back.
- Legal license texts remain in their official language and must not be rewritten as a translation.
- Executable Markdown fixtures under `examples/` are test inputs, not translated documentation.

## Submitting a change

Keep each change focused. Do not mix repository-wide formatting, generated files, or unrelated refactoring into the same submission.

The description should include:

- what changed and why;
- affected public contracts or compatibility expectations;
- security, data, network, secret, and license effects;
- tests and audits that were run, including any skipped checks;
- documentation pairs that were updated.

Before submission, run:

```powershell
pnpm install --frozen-lockfile
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

Maintainers must additionally run proprietary-residue, secret, dependency-license, Git-history, and large-file scans before publishing a source release.

## Distribution boundary

The current project distributes source only. Do not commit `node_modules`, bundles, containers, generated reports, runtime caches, or unregistered vendored dependencies. If a change adds a shipped binary, bundle, generated source snapshot, or offline dependency, reassess notices and license obligations against the actual artifact.
