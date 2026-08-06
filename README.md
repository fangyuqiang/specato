<div align="right">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</div>

# QA Workbench

QA Workbench is an **AI-native, Git-based, SDD-driven workbench for API and UI automation testing**. Humans define and approve specifications, boundaries, and acceptance intent in Git. Codex, Claude Code, and other repository-capable AI coding assistants turn those specifications into TestCases, API/UI automation, runner integrations, execution plans, and traceable reports.

QA Workbench is the AI-facing workspace and contract system for that flow. Its visual UI is the human observation and review window—not the primary place where people manually orchestrate tests. The project integrates mature tools such as OpenAPI, Arazzo, Playwright, and Allure instead of replacing them.

> **Status:** `0.1` early source preview. The repository is public under Apache-2.0, but stable APIs, remote deployment, package distribution, and executable runner adapters are not yet promised.

## Operating model

```text
Humans define specifications and acceptance boundaries in Git
                              │
                              ▼
Codex / Claude Code / other AI coding assistants
generate TestCases, API/UI automation, and integration changes
                              │
                              ▼
QA Workbench validates contracts and coordinates existing runners
                              │
                              ▼
Playwright / API tools / other execution engines
                              │
                              ▼
Structured evidence + Allure and native reports
                              │
                              ▼
Humans observe, review, and approve changes
```

The AI client is replaceable; the durable interface is the Git repository. QA Workbench is not a single embedded agent or a new test framework. See the [AI-native SDD operating model](docs/ai-native-sdd.md).

## Why QA Workbench

- Keep specifications, TestCases, and review history in Git.
- Normalize modules, API operations, workflows, and scenarios into one searchable catalog.
- Isolate project-specific behavior behind manifests, providers, and runner adapters.
- Keep execution evidence and reports traceable to their originating specifications and TestCases.
- Give AI coding assistants a stable workspace for generation and execution while giving people a consistent view of specifications, plans, evidence, and reports.

## Current capabilities

- Manifest-driven OpenAPI, Arazzo, and TestCase discovery through `qa/project.yaml`.
- Stable TestCase IDs that do not depend on a fixed capability or directory naming convention.
- Arbitrarily named servers, environment inheritance, and secret references without returning secret values.
- A loopback-only local Workbench with manifest-allowlisted repository file access.
- Report indexing constrained by fixed output roots, normalized paths, and realpath boundaries.
- API/UI Allure 2 result indexing and Playwright HTML report discovery.
- Fully synthetic specifications, TestCases, and offline unit tests.

AI-generated automation, shared runner-adapter invocation, end-to-end execution orchestration, remote authentication, package publication, and real-project integrations remain roadmap work. They are not part of the currently delivered preview.

## Security and publication boundary

The public core must not depend on any single product repository, domain, authentication role, request header, database, test account, or private infrastructure convention. Project differences belong in a project manifest, provider, or runner adapter.

This repository accepts only reproducible source code, public documentation, and synthetic examples. Do not commit:

- SQL dumps or real, reversible, or insufficiently anonymized business data;
- real-project OpenAPI, Arazzo, TestCase, acceptance, or defect artifacts;
- screenshot baselines, traces, HAR files, browser state, or branded assets;
- credentials, tokens, cookies, environment identities, internal endpoints, or personal paths;
- generated reports, runtime output, vendored dependencies, or build artifacts.

Executable examples must use fictional names, synthetic data, and loopback or mock services. See the [publication boundary](docs/publication-boundary.md) for the complete policy.

## Repository layout

```text
qa-workbench/
├─ qa/                    # Project manifest, core modules, and Workbench
├─ examples/              # Synthetic OAS, Arazzo, and TestCase fixtures
├─ docs/                  # Architecture, security, and project governance
└─ scripts/               # Repository-level verification utilities
```

The current workspace intentionally remains under `qa/`. The repository must be installable without adjacent repositories, personal workspaces, or private infrastructure.

## Quick start

### Prerequisites

- Node.js `>=20.19`
- Corepack
- pnpm `10.34.5` as pinned by `packageManager`

### Install and run

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The development command starts the local Workbench UI for observing catalogs, configuration, source references, and reports. Keep it on loopback; non-loopback binding is an explicit high-risk opt-in and is not a supported deployment recommendation before authentication and authorization are implemented.

### Verify a checkout

```powershell
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

Default verification must not require Docker, a database, real credentials, a private environment, or a neighboring repository.

## Documentation

English is the default documentation language. Every maintained project document has a Simplified Chinese counterpart with a language switch at the top.

| Document | Purpose |
| --- | --- |
| [Documentation index](docs/README.md) | Navigation and language policy |
| [AI-native SDD operating model](docs/ai-native-sdd.md) | Human/AI roles and the specification-to-automation workflow |
| [Architecture](docs/architecture.md) | Components, contracts, data flow, and extension rules |
| [Publication boundary](docs/publication-boundary.md) | Allowed content, prohibited assets, and release checks |
| [Open-source readiness](docs/open-source-readiness.md) | Current maturity and remaining release gaps |
| [Open-source roadmap](docs/open-source-roadmap.md) | Phases, gates, and exit criteria |
| [Contributing](CONTRIBUTING.md) | Development workflow and contribution requirements |
| [Security policy](SECURITY.md) | Vulnerability reporting and security boundaries |
| [Third-party notices](THIRD_PARTY_NOTICES.md) | Third-party source distributed in this repository |

## Contributing

QA Workbench favors small, reviewable changes that strengthen reusable contracts. Before contributing, read the [architecture](docs/architecture.md), [publication boundary](docs/publication-boundary.md), and [contribution guide](CONTRIBUTING.md).

Do not disclose security issues in public issues. Follow [SECURITY.md](SECURITY.md).

## License and distribution

QA Workbench source code is licensed under the [Apache License 2.0](LICENSE). Third-party components remain subject to the licenses and copyrights of their locked versions. Source copied or generated into this repository is documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The project currently distributes source only. It does not publish `node_modules`, third-party binaries, containers, offline dependency bundles, or npm packages. The root package remains `private: true` to prevent accidental publication. If the distribution model changes, notices and license obligations must be recalculated against the actual shipped artifact.
