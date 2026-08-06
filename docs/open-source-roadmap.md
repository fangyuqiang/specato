<div align="right">
  <strong>English</strong> | <a href="open-source-roadmap.zh-CN.md">简体中文</a>
</div>

# Open-Source Roadmap

## Product direction

QA Workbench aims to become an AI-native, Git-based, SDD-driven API and UI automation testing solution.

Humans define specifications, acceptance intent, and policy boundaries. Codex, Claude Code, and other interchangeable AI coding assistants translate that source of truth into TestCases, API/UI automation, runner integrations, execution plans, and report integration. The visual Workbench UI lets people observe, review, and approve the resulting state.

The project integrates established standards and tools instead of rebuilding them:

- OpenAPI for API contracts;
- Arazzo for multi-step API workflows;
- repository TestCases for acceptance intent;
- Playwright and other existing runners for execution;
- Allure and native runner reports for result exploration;
- Git for review, history, and portability;
- multiple AI coding assistants for generation and orchestration.

## Delivery principles

- Stabilize repository contracts before adding many adapters.
- Keep AI clients replaceable; no single embedded agent owns the workflow.
- Generate and execute through explicit schemas, commands, allowlists, and preflight checks.
- Integrate mature tools when they already solve execution or reporting.
- Keep real-project knowledge in project-side manifests and adapters.
- Bind the visual UI to loopback until remote authentication and authorization are independently reviewed.
- Redact evidence before persistence and fail closed when safety cannot be established.
- Distinguish delivered behavior, active work, and roadmap intent in every document.

## Release gates

| Gate | Required outcome |
| --- | --- |
| G0 Public content | No real specifications, TestCases, accounts, environment identities, private infrastructure, business assets, or generated evidence |
| G1 Reproducibility | Frozen install, test, build, and synthetic demo from an isolated candidate checkout |
| G2 Security | Clean secret scan; enforced path, command, secret, redaction, and remote-access boundaries |
| G3 AI workflow | A reviewed specification can drive AI-generated TestCases and API/UI automation through traceable execution |
| G4 Integration | Existing runners and Allure/native reports are connected through stable adapters without duplicating their core behavior |
| G5 Licensing | Source license, locked dependency audit, and complete notices for shipped third-party source or binaries |
| G6 Governance | Versioning, contribution, security response, maintenance, compatibility, and release processes are operational |

## Phase 0 — Public source foundation

**Status: delivered for the current source preview.**

Scope:

- standalone workspace and clean public history;
- manifest-driven OpenAPI, Arazzo, TestCase, environment, and report catalogs;
- loopback Workbench UI with allowlisted and realpath-contained file access;
- constrained Allure and Playwright report discovery;
- synthetic fixtures, repository audit, dependency audit, license notices, and secret scanning;
- bilingual English-default documentation and local CodeGraph initialization.

Exit evidence: G0 and G1 met for the current source snapshot; source-only portions of G2 and G5 verified.

Phase 0 does not provide AI-generated automation or runner orchestration.

## Phase 1 — AI-readable SDD and generation contracts

**Goal:** make human-authored intent unambiguous and safe for multiple AI coding assistants to transform.

Scope:

- define versioned schemas for specification intent, TestCase generation, automation generation, and change provenance;
- define repository instructions and tool-neutral operations usable by Codex, Claude Code, and other clients;
- generate synthetic TestCases from reviewed specifications;
- generate API automation skeletons from OpenAPI/Arazzo and UI automation skeletons from reviewed UI specifications;
- attach each generated asset to its source specification, rationale, and review state;
- validate that generated content stays within the public-content and project boundaries.

Exit criteria:

- two different AI clients can produce equivalent repository artifacts from the same synthetic specification;
- generated assets pass schema, provenance, publication, and review checks;
- no vendor-specific prompt or hidden state is required as the source of truth.

## Phase 2 — Shared execution core and runner integration

**Goal:** execute generated automation through existing tools without building a new testing framework.

Scope:

- version `ExecutionPlan`, `RunnerCapability`, `ExecutionEvent`, and `ExecutionResult`;
- define `RunnerAdapter` preflight, input validation, cancellation, timeout, and structured output;
- integrate an API runner for synthetic loopback services;
- integrate Playwright for synthetic local UI flows;
- expose the same execution contract to AI clients, CLI, CI, and the Workbench UI;
- enforce command allowlists, environment readiness, and workspace containment.

Exit criteria:

- G3 passes for one synthetic API flow and one synthetic UI flow;
- missing configuration, unsupported commands, path escape, cancellation, and timeout have tested failure behavior;
- runner-specific behavior remains in adapters.

## Phase 3 — Evidence, Allure, and human review

**Goal:** make AI-driven execution explainable and reviewable without replacing native report systems.

Scope:

- implement redaction for Authorization, cookies, tokens, passwords, signatures, query parameters, and configured fields;
- link execution results to the originating specification, TestCase, generated asset, and Git revision;
- integrate Allure generation and retain native runner reports where useful;
- present specifications, plans, diagnostics, evidence summaries, and reports in the Workbench UI;
- define retention, cleanup, corrupted-output, and fail-closed behavior.

Exit criteria:

- every displayed result is traceable to reviewed intent and an execution revision;
- redaction and path containment have adversarial tests;
- the visual UI remains an observation/review surface rather than a separate manual orchestration system.

## Phase 4 — Project-side adapter validation and tagged preview

**Goal:** prove that the public core supports real integrations without importing private assets.

Scope:

- maintain real-project adapters in project-side or separate repositories;
- validate at least one API integration and one UI integration;
- establish a core/adapter compatibility matrix;
- verify Windows/Linux and minimum Node.js/current LTS combinations;
- publish platform-neutral automation recipes using repository scripts;
- add threat modeling, migration notes, changelog generation, issue templates, and maintainer rules;
- produce checksums, SBOM, and traceable release metadata for a tagged prerelease.

Exit criteria: G0-G6 pass for an immutable release candidate, followed by one external synthetic integration cycle.

## Phase 5 — Stable 1.0

**Goal:** make compatibility, upgrade, and security-response commitments for the core contracts.

Scope:

- freeze schema compatibility rules and deprecation windows;
- publish supported AI-client/tool and runner/adapter compatibility matrices;
- document migration tooling and breaking-change policy;
- define security response, maintenance branches, and end-of-support rules;
- consider remote Workbench access only after independent authentication and authorization review.

Exit criteria: contract upgrades, security response, release maintenance, and adapter migration have all been exercised in practice.

## Next implementation order

1. Specify the human-authored SDD input and AI-generated TestCase provenance model.
2. Add synthetic contract tests for generation outputs and repository boundaries.
3. Define the shared execution and event schemas.
4. Integrate an existing API runner, then Playwright, behind the same adapter contract.
5. Implement redaction and Allure/evidence linkage.
6. Validate with project-side adapters without importing private assets.
7. Run the full tagged-preview release gates.

This roadmap defines evidence-based exit criteria, not delivery dates. A phase changes status only when its required artifacts and verification are present in the public repository.
