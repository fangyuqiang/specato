<div align="right">
  <strong>English</strong> | <a href="open-source-readiness.zh-CN.md">简体中文</a>
</div>

# Open-Source Readiness

## Current assessment

QA Workbench is publicly available as a `0.1` early source preview. It is positioned as an AI-native, Git-based, SDD-driven workspace in which humans define specifications and boundaries while interchangeable AI coding assistants generate and maintain TestCases, API/UI automation, runner integrations, and execution plans.

The public repository is ready for source inspection, independent installation, and synthetic catalog/report exploration. It is **not** yet a tagged preview release, a stable API, a complete AI-driven automation lifecycle, a remote service, or a published npm package.

## Delivered and verified

- Standalone repository with no dependency on a source business repository, neighboring checkout, or private infrastructure.
- Clean public Git history created from an audited source tree.
- Manifest-driven OpenAPI, Arazzo, TestCase, environment, and report discovery.
- Stable TestCase IDs independent of fixed capability prefixes or private directory conventions.
- Local Workbench UI for observing catalogs, configuration readiness, approved source files, and reports.
- Manifest allowlists, normalized paths, realpath checks, and symlink-escape tests for repository and report files.
- Loopback-only default binding with an explicit opt-in for non-loopback use.
- Synthetic OAS, Arazzo, TestCase, and unit-test assets only.
- Frozen installation, 15 unit/integration tests, production build, dependency vulnerability audit, repository audit, and clean-history secret scan completed for the initial public source snapshot.
- Apache-2.0 source license and MIT notice for the shadcn/ui-generated source distributed in the repository.
- Production dependencies limited to permissive or dual-permissive license choices; no GPL, LGPL, AGPL, or SSPL dependency was found in the audited lockfile.
- English-default documentation with synchronized Simplified Chinese mirrors.
- CodeGraph initialized locally while its database remains excluded from Git.

## Gate status

| Gate | Status | Evidence or remaining gap |
| --- | --- | --- |
| G0 Public content | Met for current source | Synthetic assets, repository audit, clean public history, and publication policy |
| G1 Reproducibility | Met for current source | Frozen install, tests, and build from an isolated checkout |
| G2 Security | Partial | Current path, URL, loopback, and secret boundaries are tested; runner sandboxing and the complete redaction pipeline do not yet exist |
| G3 AI-driven execution | Not met | Generation contracts, `ExecutionPlan`, runner adapters, and synthetic API/UI end-to-end execution remain unimplemented |
| G4 Licensing | Met for source-only distribution | Apache-2.0, locked dependency audit, and vendored-source notice |
| G5 Governance | Partial | Contribution, security, publication, bilingual documentation, and roadmap policies exist; release process, compatibility matrix, and maintenance policy need operational proof |

## Remaining gaps before a tagged preview

1. Define AI-facing generation contracts for TestCases, API automation, UI automation, and adapter changes.
2. Implement versioned `ExecutionPlan`, `ExecutionEvent`, and `ExecutionResult` contracts.
3. Integrate an API runner and Playwright runner through the same explicit adapter boundary.
4. Implement and test evidence redaction, retention, cancellation, timeout, and failure handling.
5. Demonstrate the full synthetic flow: human specification → AI-generated assets → validated execution → Allure/native report → human review.
6. Publish a platform-neutral automation recipe using repository scripts; do not make the core depend on one hosting provider.
7. Verify the supported Windows/Linux and minimum Node.js/current LTS matrix.
8. Define release tags, changelog generation, compatibility promises, and maintenance responsibilities.
9. Establish upgrade checks and a bundle budget for critical `0.x` dependencies.

## Distribution assessment

The repository distributes source only. It does not ship `node_modules`, bundles, containers, offline dependencies, or third-party binaries. npm dependency notices are therefore not copied into the source tree, while each dependency remains governed by its locked version's license.

If the distribution model changes, regenerate third-party notices and an SBOM against the actual artifact. See the [roadmap](open-source-roadmap.md) for phases and the [publication boundary](publication-boundary.md) for release checks.
