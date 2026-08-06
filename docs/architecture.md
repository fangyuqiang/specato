<div align="right">
  <strong>English</strong> | <a href="architecture.zh-CN.md">简体中文</a>
</div>

# Architecture

## Positioning

QA Workbench is an AI-native, Git-based, SDD-driven workspace for API and UI automation testing. Humans define specifications, acceptance intent, and policy boundaries. Interchangeable AI coding assistants generate TestCases, API/UI automation, adapter changes, and execution plans from that source of truth. Established runners execute the plans, while the visual Workbench UI lets people observe and review the resulting state.

The project is not an embedded autonomous agent and does not replace Git, OpenAPI, Arazzo, Playwright, Allure, or an AI coding assistant. See the [AI-native SDD operating model](ai-native-sdd.md) for the role boundaries.

## Architectural principles

- **Git is the control plane.** Specifications, manifests, TestCases, plans, and reviewed changes remain versioned and portable.
- **Specifications drive behavior.** Runtime work traces back to explicit, testable artifacts.
- **AI clients are replaceable drivers.** Codex, Claude Code, and other tools use the same repository contracts.
- **Existing tools do the execution.** Adapters integrate mature runners and report systems instead of reimplementing them.
- **QA Workbench is AI-facing.** Repository contracts and tools are the primary work surface for AI-driven generation and execution.
- **Workbench UI is an observation plane.** The visual UI presents catalogs, configuration state, evidence, and reports to humans; it is not the primary orchestration surface.
- **Project knowledge stays project-side.** The public core does not learn private product concepts.

## Planes and layers

```text
Control plane (Git)
  Specifications · TestCases · ProjectManifest · reviewed changes
                              │
                              ▼
Process drivers
  Codex · Claude Code · other AI clients
  generate TestCases · automation · adapters · execution plans
                              │
                              ▼
Core contracts and validation
  CatalogProvider · EnvironmentProvider · ExecutionPlan · events
                              │
                              ▼
Integration and execution
  RunnerAdapter · existing API/UI runners · report generators
                              │
                              ▼
Evidence plane
  redacted structured results · native reports · traceable references
                              │
                              ▼
Human observation plane
  Workbench UI · review views · diagnostics · approvals
```

The current preview implements the catalog, environment, repository-file, report-indexing, and observation portions. The execution-plan and runner-adapter portions remain roadmap work.

## Core contracts

### `ProjectManifest`

Declares the project ID, specification sources, providers, supported runners, allowed workspaces, and report policy. A TestCase source explicitly declares `files`, `module`, and `capability`; the core must not infer a private domain model from directory names.

### `CatalogProvider`

Normalizes TestCase, OpenAPI, Arazzo, or other specification sources into queryable catalog entries and diagnostics. It discovers contracts but does not execute tests.

### `EnvironmentProvider`

Resolves environment names, base URLs, inheritance, and secret references into validated runtime configuration. UI and AI clients may inspect readiness but never secret values.

### `ExecutionPlan` and execution events

The target execution contract describes selected tests, runner capabilities, validated environment references, timeouts, cancellation, and evidence policy. Versioned events and results will let AI clients, CLI, CI, and Workbench share one execution path. This contract is not yet implemented.

### `RunnerAdapter`

Translates a validated execution plan into an invocation of an established runner. An adapter declares capabilities, input schema, preflight checks, cancellation behavior, and structured output. It must not interpolate shell commands or elevate project-specific authentication into the core.

### `ReportDefinition`

Defines how structured results are indexed, redacted, aggregated, and presented. Reports consume execution output; they do not become the source of truth for specifications.

The current preview indexes API/UI Allure 2 JSON results and Playwright HTML reports. Historical XML or product-specific formats are not compatibility contracts.

## Reference data flow

1. A human defines or approves a specification, acceptance intent, and operating boundary in Git.
2. An AI client reads repository instructions and generates or updates TestCases, API/UI automation, and required adapter code.
3. `ProjectManifest` and providers build a normalized catalog from the reviewed assets.
4. The AI client prepares an execution plan; the core validates selection, environment references, paths, and runner capabilities.
5. A runner adapter invokes an established API/UI tool.
6. Evidence is redacted before persistence and linked to the source specification and TestCase.
7. The Workbench UI presents catalog state, diagnostics, and reports for human review.
8. Approved specifications and generated assets update the Git source of truth.

The default failure mode is fail-closed: invalid schemas, unregistered runners, missing configuration, path escape, unsupported commands, or unverified redaction stop the operation.

## Repository and deployment decisions

- Keep the `qa/` workspace until stable package boundaries emerge from real integrations.
- Use only synthetic projects in default examples and verification.
- Treat the Workbench UI as a local observation tool and bind it to loopback by default.
- Apply manifest allowlists, normalized paths, and realpath containment to repository files.
- Apply fixed roots and realpath containment to dynamic reports.
- Keep real-project manifests, adapters, credentials, and evidence in project-side repositories or ignored local paths.
- Expose repository-neutral generation, validation, execution, and evidence contracts so multiple AI tools can drive the same flow.

## Extension test

Before adding a concept, answer:

1. Can the difference be represented by the project manifest?
2. If not, is it a catalog, environment, execution, runner, evidence, or report concern?
3. Can two independent synthetic scenarios validate the proposed semantics?
4. Does it integrate an existing tool, or unnecessarily reimplement one?
5. Would it make the core depend on a vendor-specific AI client, private product term, or secret?

Only reusable semantics belong in the core. Tool-specific transport belongs in an adapter; product-specific behavior belongs project-side.

## Evolution direction

After independent installation and security gates remain stable, the architecture may add:

- versioned execution and evidence contracts;
- API and Playwright runner adapters over existing tools;
- AI-readable CLI or tool interfaces shared across Codex, Claude Code, and other clients;
- core/adapter compatibility matrices;
- package boundaries based on demonstrated reuse;
- remote observation only after authentication and authorization receive independent review.

These are roadmap directions, not claims about the current preview.
