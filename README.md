<div align="right">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</div>

# Specato

> **AI-native, Git-based spec-to-test automation.**

AI has made it dramatically easier to generate TestCases and automation code. Generation alone, however, does not create a reliable testing system. The harder problem is keeping AI output constrained by intent, understandable as a whole, reviewable over time, executable without manual hand-offs, and traceable back to evidence.

Specato is our answer: an **AI-native, Git-based, SDD-driven solution for API and UI automation testing**. It is less another testing framework than an open solution architecture and reference implementation that connects specifications, Git, AI coding assistants, command-line runners, evidence, and reports into one continuous lifecycle.

## The problem is not generation alone

Three breaks prevent AI-generated tests from becoming a maintainable engineering system:

- **Prompt-only generation loses intent.** Without a durable contract, generated TestCases and automation drift as prompts, models, and context change.
- **Database-centered management is opaque to AI by default.** Traditional test-management products store cases and metadata behind a database and product UI. An integration may retrieve fragments, but AI does not naturally receive the repository-wide structure, history, relationships, and diffs that it gets from source code.
- **GUI-only execution stops the workflow at generation.** If a test runner can only be operated manually, AI can write automation but cannot reliably validate, execute, and interpret it through the same engineering path.

## Three design choices

### 1. Spec-constrained generation

Human-approved specifications and acceptance boundaries are the source of truth. AI does not generate from an ephemeral prompt alone: every TestCase, API/UI automation change, execution plan, and result reference should be derived from and traceable to a versioned specification.

The specification is therefore an active engineering contract—not background documentation. It gives different AI clients the same intent, constrains what they may change, and makes generated work explainable and reviewable.

### 2. Git-based management

Durable test assets live as AI-readable files in Git rather than only as records in an opaque application database. An AI coding assistant can read the complete project structure, follow references, compare history, propose a diff, and work through the same review boundary as a human contributor.

Git becomes the shared memory and control plane for specifications, TestCases, automation, manifests, and execution references. Branches, commits, and reviews provide the audit trail instead of relying on hidden agent memory or one vendor's platform state.

### 3. CLI-first execution

To participate in the core workflow, every execution tool and adapter must be invocable non-interactively from the command line, with explicit inputs, outputs, exit status, and failure behavior. The same command path should be usable by an AI coding assistant, a developer, and CI.

CLI-first does not mean UI-free. The Workbench UI is the human observation and review surface; the command line is the stable automation boundary that lets AI move from generation to validation, execution, and result interpretation.

Together, **Spec + Git + CLI** turn AI from a test-code generator into a participant across the complete spec-to-evidence lifecycle.

## From specification to evidence

```text
Humans define specifications and acceptance boundaries in Git
                              │
                              ▼
Codex / Claude Code / other AI coding assistants
generate TestCases, API/UI automation, and integration changes
                              │
                              ▼
Specato validates contracts and coordinates existing runners
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

The AI client is replaceable; the durable interfaces are versioned repository contracts and explicit commands. The loop remains inspectable because generated assets, execution references, and reviewed changes all point back to the specification.

## What this approach provides

- **Traceable generation:** every generated asset has a reviewable source of intent.
- **Repository-wide AI context:** specifications, TestCases, automation, and history are globally readable together.
- **Model and tool independence:** Codex, Claude Code, or another repository-capable AI client can use the same contracts.
- **One path from local work to CI:** AI, developers, and pipelines invoke the same CLI-capable runners.
- **Integration over reinvention:** OpenAPI, Arazzo, Markdown TestCases, Playwright, Allure, and other mature tools retain their responsibilities.
- **Human control at the right level:** people define intent, policy, and approval boundaries, then observe specifications, changes, evidence, and reports.

Specato is not a single embedded agent, a database-first test-management platform, or a proprietary replacement for existing runners. The open-source repository is the reference implementation of this integration model: stable contracts for AI, established tools for execution, and a Workbench for human observation. See the [AI-native SDD operating model](docs/ai-native-sdd.md).

The name combines **SPEC**ification with **A**utomation, **T**esting, and **O**rchestration.

> **Status:** `0.1` early source preview. The current repository implements the SDD control foundation and observation layer. Complete AI generation contracts, shared executable runner adapters, and the end-to-end automation lifecycle remain roadmap work.

## Recommended adoption: embed Specato in the product monorepo

The public Specato repository is a standalone, synthetic reference implementation. For a real project, the recommended model is to place the Specato workspace, project manifest, specifications, TestCases, and generated automation in the **same monorepo as the product source**.

This is an architectural choice, not just a convenient directory layout. A feature branch can change product code and its specification together; the AI coding assistant can then generate or update the TestCase and API/UI automation in the same change. Review, validation, execution, and evidence all refer to the exact same Git commit, avoiding synchronization between a source repository and a separate database-backed test platform.

An illustrative layout is:

```text
your-product/
├─ apps/ or services/             # Product source
├─ packages/                      # Shared product packages
├─ openspec/ or specs/            # SDD change and acceptance specifications
├─ tests/
│  ├─ testcases/                  # Versioned Markdown TestCases
│  ├─ api/                        # Generated API automation
│  └─ ui/                         # Generated UI automation
├─ qa/
│  ├─ project.yaml                # Specato ProjectManifest
│  ├─ config/                     # Environment templates; local secrets stay ignored
│  ├─ core/                       # Catalog and validation contracts
│  └─ workbench/                  # Human observation UI and local service
├─ package.json
└─ pnpm-workspace.yaml            # Includes the Specato workspace
```

The exact product directories are not fixed. The current `qa/project.yaml` schema declares specification, TestCase, environment, and Workbench-readable paths; automation, runner, and report mappings will join the manifest as their execution contracts are implemented. Workbench access remains manifest-allowlisted, and private environment values remain outside Git. During the source-preview phase, adoption means integrating or vendoring the workspace into the product monorepo; future package distribution may change the installation mechanism, not the same-repository operating model.

The intended branch workflow is:

```text
change specification + product code
                 │
                 ▼
AI updates TestCases + API automation + UI automation
                 │
                 ▼
contract validation + CLI execution in the same checkout
                 │
                 ▼
evidence and reports linked to the same spec, TestCase, and commit
```

## System architecture

```text
Product monorepo / Git control plane
  product source · SDD specs · OAS · Arazzo · TestCases · automation
                              │
                              ▼
AI process drivers
  Codex · Claude Code · other repository-capable AI clients
  read the whole repository and generate reviewable changes
                              │
                              ▼
Specato core contracts
  ProjectManifest · catalogs · environment validation · execution policy
                              │
                              ▼
CLI execution boundary
  ExecutionPlan · RunnerAdapter · preflight · explicit exit status
                              │
                              ▼
Established execution tools
  API runner · Playwright or another UI runner · report generators
                              │
                              ▼
Evidence and report plane
  structured results · Allure · native HTML reports · traceable references
                              │
                              ▼
Human observation plane
  Workbench UI · source/config views · diagnostics · review
```

Git owns intent and history; AI drives the engineering process; Specato normalizes and validates contracts; established tools execute; reports preserve evidence; people review the resulting state. The Workbench does not become a second source of truth or a separate orchestration database.

The current preview implements project discovery, catalogs, environment validation, constrained repository access, report discovery, and the observation UI. Versioned `ExecutionPlan`, execution events/results, shared `RunnerAdapter` invocation, and complete AI generation interfaces are the next architectural layer. See [Architecture](docs/architecture.md) for the detailed contract boundaries.

## Standards and contracts across the lifecycle

Not every lifecycle artifact needs a new public standard. Specato reuses established standards where they fit and introduces small, versioned repository contracts only where a cross-tool boundary is missing.

| Stage | Recommended standard or contract | Role in the lifecycle | Current status |
| --- | --- | --- | --- |
| Change intent and acceptance | A Git-native SDD format such as OpenSpec, or equivalent versioned Markdown specifications | Defines the human-approved requirement, scenarios, acceptance boundaries, and allowed change | Recommended adoption convention; the core remains SDD-format neutral |
| Project topology | Specato `ProjectManifest` in `qa/project.yaml` | Maps modules, specification sources, TestCase paths, environments, readable roots, runners, and reports without hard-coding a business domain | Partially implemented; catalog, environment, and readable-file fields are active |
| API contract | OpenAPI Specification (OAS) | Defines operations, parameters, request/response schemas, authentication requirements, and stable `operationId` references | Catalog discovery implemented; generation and execution adapters remain roadmap work |
| Multi-step API behavior | Arazzo Specification | Links OAS operations into workflows with step inputs, outputs, dependencies, and success criteria | Catalog discovery implemented; executable workflow adapters remain roadmap work |
| Human-readable test intent | Specato Markdown TestCase contract | Gives each case a stable ID and links Requirement → Scenario → Priority → Preconditions → Steps → Expected results | Parsing, validation, cataloging, filtering, and display implemented |
| Environment selection | Versioned YAML environment template plus environment-variable secret references | Defines named servers, inheritance, transport policy, and secret names without committing secret values | Implemented for validated configuration and readiness display |
| Generated automation | Runner-native source code with stable TestCase IDs and OAS/Arazzo references | Turns test intent into executable API/UI code while preserving traceability to the originating contract | Target AI-generation convention; shared generation interface is not yet implemented |
| Execution | CLI plus versioned `ExecutionPlan` and `RunnerAdapter` contracts | Selects cases, validates environment and runner capability, invokes tools non-interactively, and exposes deterministic failure behavior | CLI-first architecture defined; shared contracts and invocation remain roadmap work |
| Evidence and reporting | Structured execution events/results, Allure results, and runner-native reports such as Playwright HTML | Records redacted outcomes and links failures, artifacts, and reports back to specifications and TestCases | Allure and Playwright report discovery implemented; unified event/result contract remains roadmap work |
| Change control | Git commits, branches, review, and CI | Keeps specifications, generated assets, code, and validation history reviewable as one change | Provided by the host product repository |

OAS describes individual API contracts; Arazzo describes how API operations compose into workflows; Markdown TestCases express human-verifiable intent; runner-native code performs the actual automation. These artifacts complement rather than replace one another.

## Technology stack and selection rationale

| Layer | Choice in the reference implementation | Why |
| --- | --- | --- |
| Workspace | pnpm workspace / monorepo | Makes the QA workspace easy to embed beside product packages and gives AI and CI one dependency graph and command surface |
| Runtime and CLI | Node.js with ECMAScript modules | Portable across developer machines and CI, well suited to repository tooling, and easy to invoke non-interactively |
| Repository contracts | YAML and Markdown | Human-readable, AI-readable, diffable, reviewable, and independent from an application database |
| Discovery and normalization | Small Node.js modules, `fast-glob`, and YAML parsing | Keeps catalog construction deterministic and avoids a database dependency |
| Local service | Express | Provides a thin loopback-only API for catalogs, configuration state, files, and reports without turning the Workbench into a deployment platform |
| Observation UI | React, Vite, Tailwind CSS, and Radix UI primitives | Supports a modular local interface while keeping orchestration state in repository contracts and CLI tools |
| API and source views | Scalar API Reference and Monaco Editor | Reuses mature viewers for OAS and repository files instead of building editors and renderers from scratch |
| Reporting | Allure plus runner-native reports such as Playwright HTML | Preserves established reporting ecosystems and detailed runner diagnostics |
| Verification | Node.js test runner and fully synthetic fixtures | Keeps default validation fast, offline, reproducible, and free of private environments or credentials |

Specato intentionally does not require one API runner or one AI vendor. A runner is suitable when it exposes a non-interactive CLI, explicit configuration, deterministic exit status, and machine-readable results that a safe adapter can normalize. Playwright is the recommended UI automation foundation; API execution can use an OAS/Arazzo-capable CLI selected by the project.

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
specato/
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

Specato favors small, reviewable changes that strengthen reusable contracts. Before contributing, read the [architecture](docs/architecture.md), [publication boundary](docs/publication-boundary.md), and [contribution guide](CONTRIBUTING.md).

Do not disclose security issues in public issues. Follow [SECURITY.md](SECURITY.md).

## License and distribution

Specato source code is licensed under the [Apache License 2.0](LICENSE). Third-party components remain subject to the licenses and copyrights of their locked versions. Source copied or generated into this repository is documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The project currently distributes source only. It does not publish `node_modules`, third-party binaries, containers, offline dependency bundles, or npm packages. The root package remains `private: true` to prevent accidental publication. If the distribution model changes, notices and license obligations must be recalculated against the actual shipped artifact.
