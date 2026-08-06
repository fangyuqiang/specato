<div align="right">
  <strong>English</strong> | <a href="ai-native-sdd.zh-CN.md">简体中文</a>
</div>

# AI-Native SDD Operating Model

## Product thesis

QA Workbench is an AI-native, Git-based, specification-driven development (SDD) workspace for API and UI automation testing. Its primary user is an AI coding assistant working from human-authored specifications.

It is **not** a single autonomous agent, an agent framework, or a proprietary replacement for established testing tools. Codex, Claude Code, and other repository-capable AI coding assistants drive the engineering workflow by reading versioned contracts, generating test assets and integration code, and invoking explicit tools. The visual Workbench UI gives people a consistent place to observe, review, and trace what happened.

The design goal is to connect mature standards and tools—such as OpenAPI, Arazzo, Markdown TestCases, Playwright, and Allure—through stable repository contracts instead of reimplementing their capabilities.

## System roles

| Role | Responsibility | Not responsible for |
| --- | --- | --- |
| Git repository | Versioned control plane, review history, change boundary, and audit trail | Storing runtime secrets or generated evidence |
| SDD artifacts | Intent, specifications, acceptance scenarios, TestCases, and execution references | Hidden project conventions |
| Humans | Define specifications, acceptance intent, policy, and approval boundaries | Manually authoring or coordinating every test artifact |
| AI coding assistants | Generate TestCases, API/UI automation, adapter changes, and execution plans; invoke supported tools; interpret results | Acting outside repository policy or becoming a hidden source of truth |
| QA Workbench contracts and tools | Give AI clients a stable workspace for discovery, validation, generation, execution, and evidence linkage | Embedding or locking the workflow to one AI vendor |
| Core contracts | Normalize catalogs, environments, execution plans, events, and report references | Encoding one product's business language |
| Existing runners and adapters | Execute API/UI automation through explicit capabilities | Owning product intent or governance |
| Evidence and report tools | Persist redacted, structured outcomes and native reports | Becoming the source of truth for specifications |
| Workbench UI | Human-facing observation, navigation, review, and traceability | Serving as the primary manual orchestration surface |

## Reference workflow

```text
Human-authored specification and acceptance boundary
              │
              ▼
Versioned SDD source of truth in Git
              │
              ▼
Codex / Claude Code / another AI coding assistant
generates TestCases, API/UI automation, adapters, and a plan
              │
              ▼
Core validation + explicit runner adapter
              │
              ▼
Existing API/UI runner (for example Playwright)
              │
              ▼
Redacted evidence + native reports (for example Allure)
              │
              ▼
Workbench observation and human review
              │
              └──────────► reviewed Git change
```

The AI tool is replaceable. The durable interface is the repository: specifications, manifests, schemas, commands, evidence references, and reviewable changes. People define what must be true; AI performs most of the translation from that intent into executable test engineering assets.

## What “AI-native” means here

- Repository structure and contracts are designed to be read and modified safely by AI coding assistants.
- AI coding assistants are expected to generate and maintain TestCases, API/UI automation, runner adapters, and report integration from reviewed specifications.
- Operations expose explicit inputs, outputs, preconditions, and failure states instead of relying on tribal knowledge.
- AI tools may prepare plans and invoke adapters, but the repository defines allowed behavior.
- Human review is centered on intent, specification changes, evidence, and risk—not on replaying every command manually.
- No single vendor, model, prompt, or embedded agent owns the workflow.

AI-native does not mean “AI is trusted by default.” Untrusted specifications, path boundaries, command allowlists, secret isolation, and fail-closed evidence handling still apply.

## What “SDD-driven” means here

The specification is an active execution contract rather than passive prose:

1. A change begins with explicit intent and expected behavior.
2. OpenAPI, Arazzo, TestCases, or other versioned artifacts define the testable contract.
3. The project manifest connects those artifacts to providers, environments, and supported runners.
4. An AI client generates or updates the required test assets and invokes a validated execution plan.
5. Results link back to the originating specification and TestCase.
6. Review updates the Git source of truth, not an opaque platform database.

## Integration over reinvention

QA Workbench should add an integration only when it contributes one of these missing cross-tool capabilities:

- a stable repository contract;
- safe discovery and normalization;
- an explicit execution boundary;
- traceability from specification to evidence;
- a human observation surface.

It should not replace OpenAPI modeling, Arazzo workflow semantics, Playwright browser automation, Allure reporting, Git review, or the AI coding assistant itself. Its responsibility is to make these components legible and composable for AI-driven SDD.

## Current implementation and target model

Currently delivered:

- project manifest and synthetic specification discovery;
- OpenAPI, Arazzo, and TestCase catalogs;
- environment and secret-reference resolution;
- a local Workbench for catalog, configuration, source, and report observation;
- constrained Allure and Playwright report discovery.

Still to be implemented:

- versioned `ExecutionPlan`, `ExecutionEvent`, and `ExecutionResult` contracts;
- AI-facing generation contracts for TestCases, API automation, UI automation, and adapter changes;
- runner adapter invocation shared by AI clients, CLI, CI, and Workbench;
- a complete redaction and evidence-retention pipeline;
- end-to-end synthetic API and UI execution flows;
- documented tool interfaces for multiple AI coding assistants.

Until those items exist, the repository demonstrates the SDD control foundation and human observation UI, not the complete AI-driven automation lifecycle.
