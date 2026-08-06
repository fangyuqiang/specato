<div align="right">
  <strong>English</strong> | <a href="AGENTS.zh-CN.md">简体中文</a>
</div>

# AI Coding Assistant Instructions

This repository is the independent, general-purpose Specato project. It does not depend on a source business repository, an adjacent checkout, or private infrastructure.

## Product model

- Specato is an AI-native, Git-based, SDD-driven workspace for API and UI automation testing.
- Humans define and approve specifications, acceptance intent, policy, and risk boundaries.
- Codex, Claude Code, and other interchangeable AI coding assistants generate and maintain TestCases, API/UI automation, runner adapters, execution plans, and report integration from those specifications.
- Repository contracts are the durable interface. Do not make a prompt, one model, hidden agent state, or the visual UI the source of truth.
- The visual Workbench UI is for human observation and review; it is not the primary manual orchestration interface.
- Integrate established standards and tools such as OpenAPI, Arazzo, Playwright, and Allure. Do not reimplement their core behavior without a demonstrated integration gap.

## Working boundaries

- Make the smallest safe and verifiable change that satisfies the request.
- Do not introduce real business assets as substitutes for synthetic fixtures.
- Never commit SQL, real OAS/Arazzo/TestCases, screenshot baselines, traces, HAR files, reports, accounts, tokens, cookies, private domains, personal paths, or environment identities.
- Treat AI-generated content like human-authored content: verify specification fidelity, confidentiality, provenance, licenses, and public suitability before commit.
- Third-party source copied or generated into the repository must retain its license and be recorded in `THIRD_PARTY_NOTICES.md` with scope and upstream source. Record the exact revision for new synchronization; mark an unknown historical snapshot as `unknown` rather than guessing.
- `qa/config/environments.yaml` is local-only and must remain untracked. Secret values come from environment variables only.
- Workbench file reads must pass manifest allowlists, path normalization, and realpath containment.
- Non-loopback binding is high risk. It requires explicit opt-in and must not be recommended before authentication and authorization are implemented.

## Documentation

- English is the default language for maintained project documentation.
- Every maintained `*.md` document must have a synchronized `*.zh-CN.md` mirror and a language switch at the top of both files.
- `README.md` is the default entry point and links to `README.zh-CN.md`.
- Legal license texts remain in their official language; explanatory documents may be bilingual.
- Executable Markdown fixtures under `examples/` are test inputs and do not require translated duplicates.
- Clearly separate delivered behavior, active work, and roadmap intent.

## Verification

Before committing, run at least:

```powershell
pnpm install --frozen-lockfile
pnpm run verify
pnpm audit --prod --audit-level moderate
pnpm run audit:repository
```

Also run private-residue, secret, dependency-license, Git-history, documentation-link, bilingual-coverage, and large-file scans. If a check was skipped or blocked, report that fact; never claim it passed.
