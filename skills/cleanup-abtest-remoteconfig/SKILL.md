---
name: cleanup-abtest-remoteconfig
description: Use when the user wants to clean up, retire, remove, delete, or sunset A/B test experiments, feature flags, or remote config entries that are no longer needed. The user provides a list of experiment or config names, and this skill audits the codebase for every usage, proposes a safe removal plan, applies the edits, and ensures unit tests still guard the surviving behavior. Trigger on phrases like "clean up abtest", "remove feature flag", "retire experiment", "delete remote config", "sunset ab test", "remove unused flags" — even when only one name is mentioned or the user asks whether an experiment is still used.
metadata:
  domain: maintenance
  triggers: abtest, a/b test, ab-test, experiment, feature flag, remote config, feature toggle, retire flag, sunset experiment, cleanup flag, dead flag, unused config
  role: specialist
  scope: refactoring
  output-format: markdown + code edits + tests
  related-skills: engineering-feature-execution-plan, development-general-coding-convention
---

# Cleanup A/B Test & Remote Config

## Overview

Retiring an experiment or remote config is risky in exactly the ways that are invisible from a single file: a flag name can be referenced as a hashed key, hidden behind a wrapper, inlined into a config file, or checked only in a test fixture. Removing code blindly — or removing only "the obvious call site" — causes silent regressions.

This skill turns cleanup into an auditable, test-guarded workflow:

1. **Audit** every reference to each experiment or feature flag or remote config name the user provides
2. **Report** findings and ask the user which variant (if any) survives
3. **Apply** edits that delete the losing branch, inline the surviving branch, and remove the flag definition
4. **Guard** the surviving behavior with unit tests so the pre-cleanup contract is preserved
5. **Persist** a plan file so the cleanup is reviewable and reproducible

## When to Use This

- The user provides a list of A/B test, experiment, or remote config names to retire
- The user asks whether an experiment is still in use
- The user wants to sunset a feature flag and keep the winning variant
- The user suspects a config entry is dead and wants it verified before removal

## Inputs the User Must Provide

DO NOT Continue if the user does not provide this:
- **Names** — the list of experiment / remote config / feature flag identifiers to retire
- **Platform hint (optional)** — e.g. Firebase Remote Config, LaunchDarkly, in-house `FeatureFlag` enum, YAML file, env var.

If the user only says "clean up our old experiments" without naming them, ask for the explicit list. Do not guess names from the codebase and delete things without confirmation — an experiment can be named anywhere and accidentally deleting a live one is costly.

## Core Workflow

### 1. Capture Inputs and Prepare the Plan File

- Confirm the list of names with the user (echo them back once).
- Create the plan file at `ai-engineering/cleanup-abtest-remoteconfig/{YYYY-MM-DD} {short-label}.md`. Ask permission before creating the directory if it does not exist. Use the template in the **Plan File Template** section below.
- For each name, record an empty analysis block — you will fill it in as you investigate.

### 2. Discover the Access Pattern

Scan the codebase once to learn *how* this project reads flags. Without this step, you will miss indirect references.

Look for:

- **Wrapper/accessor functions** — e.g. `isFeatureEnabled(...)`, `remoteConfig.get(...)`, `experiments.variant(...)`, `FeatureFlag.XYZ`, a `@FeatureToggle` annotation, a `config('flags.xyz')` helper
- **Central flag registries** — enums, constants files, schema/YAML/JSON files defining the universe of flags
- **Test fixtures** — helpers like `withFeatureFlag("xyz", true)` that stub the flag in tests

Write what you found into the plan file under **Access Pattern**. This shapes every subsequent search.

### 3. Audit Each Name

For **each** name the user provided, find every reference. Do this thoroughly — a missed reference is how regressions ship.

Search strategies (run all that apply for the project):

- **Exact literal match** — `grep -rn '"<name>"'` and `grep -rn "'<name>'"` across source, tests, and configs
- **Through the wrapper** — if the access pattern is `isFeatureEnabled("xyz")`, also grep for the wrapper with the name
- **Constant/enum references** — if the name lives in an enum (e.g. `FeatureFlag.NEW_CHECKOUT`), grep for the enum member

For each name, record in the plan file:

| Field | What goes here |
|---|---|
| **Definition site** | Where the flag is declared (enum entry, config key, dashboard-only, etc.) |
| **Read sites** | Every file:line where the flag is checked at runtime |
| **Branches found** | The distinct code paths keyed on this flag (e.g. `variant=A → old checkout`, `variant=B → new checkout`) |
| **Tests referencing it** | Test files that check or stub the flag |
| **Dependencies** | Other flags, config, or code that will become dead once this flag is removed |

### 4. Present Findings and Ask the User Per Experiment

Before making any edits, present the audit to the user and ask the per-experiment decision. Always ask — never assume which variant won, even if one branch is obviously "newer" or "more complete."

For each `branched` or `boolean-gate` flag, ask:

- Which variant should survive? (List the variants you found by name, with file:line of each branch.)
- Or should the entire feature be removed (both branches deleted)?

For `unused` flags, state that clearly and ask for confirmation to remove the definition.

Do not proceed to edits until the user has decided for every name.

### 5. Propose and Apply Edits

Once the user has decided, apply edits in this order. Each edit should be small enough to review:

1. **Inline the surviving branch** — replace the `if (isFeatureEnabled("xyz")) { A } else { B }` with the chosen branch body. Preserve the exact behavior of the surviving path; do not refactor while you cleanup.
2. **Delete the losing branch's code** — functions, classes, templates, assets that only the losing path used. Verify they have no other callers before deleting.
3. **Remove the flag definition** — enum entry, config key, YAML/JSON entry, dashboard note. Leave a one-line note in the plan file for any platform-side (e.g. LaunchDarkly dashboard) cleanup the user must do manually.
4. **Remove dead dependencies** — code, imports, or config that only existed to serve the losing branch.

Do not bundle unrelated refactors. If you notice adjacent cleanup opportunities, list them in the plan file's **Follow-ups** section instead of doing them now.

### 6. Guard With Unit Tests (Mandatory)

Tests are not optional. The cleanup is only safe if the surviving behavior is pinned by a test that existed (or now exists) before the flag code was deleted.

For each flag touched, do all of the following:

1. **Find tests that stubbed the flag** and classify each:
   - Test that stubs flag to the **surviving** variant → keep; remove the stub call since the flag is gone, and ensure the assertion still reflects the expected behavior
   - Test that stubs flag to the **removed** variant → delete the test (or the relevant case); record deleted test names in the plan file
   - Test that parameterizes over variants (e.g., runs twice) → collapse to the surviving case
2. **Verify the surviving behavior has at least one unit test** that asserts what the code does now. If the only tests were flag-variant tests and you deleted them, **write a replacement unit test** for the surviving path before finishing. A cleanup that leaves the kept branch untested is not done.
3. **Run the test suite** (use the project's standard command — `mvn test`, `./gradlew test`, `pytest`, `phpunit`, `npm test`, etc.). If you cannot run tests in this environment, say so explicitly; do not claim the cleanup is verified.
4. **Fix, do not bypass.** If a test breaks, investigate the root cause — do not disable tests, add `@Ignore`, or bypass hooks to get green.

Record in the plan file: tests kept, tests deleted, tests added, and the result of the test run.

### 7. Finalize the Plan File

After edits land and tests pass, update the plan file's status from `In Progress` to `Complete`. Include:

- The final decision for each flag (variant kept, or removed entirely)
- A summary diff of impacted files (you can list file paths; no need to paste full diffs)
- Any manual follow-ups the user must do outside the repo (e.g. archive the experiment in the LaunchDarkly UI, delete the Firebase Remote Config key, notify the analytics team)

## Plan File Template

```markdown
# Cleanup: [short label] — [YYYY-MM-DD]

> Status: In Progress
> Names: [list of experiment / remote config names]
> Requested by: [user / ticket / context]

## Access Pattern

[How this project reads flags — wrapper function, enum, config file, etc.
File paths of the accessor and registry. Written in Step 2.]

## Audit

### `<name-1>`
- **Definition site**: [file:line]
- **Read sites**:
  - [file:line] — [short note on what it gates]
  - [file:line] — [short note]
- **Branches found**:
  - Variant A: [what this branch does]
  - Variant B: [what this branch does]
- **Tests referencing it**: [file:line, ...]
- **Dependencies**: [other code that goes dead if this is removed]

### `<name-2>`
[...]

## Decisions (filled in Step 4)

| Name | Decision | Rationale |
|---|---|---|
| `<name-1>` | Keep variant B | [user said] |
| `<name-2>` | Remove entirely | [unused] |

## Edits Applied (filled in Step 5)

- [file] — [one-line summary of change]
- [file] — [one-line summary of change]

## Tests (filled in Step 6)

- **Kept**: [test name] — [file:line]
- **Deleted**: [test name] — [file:line] (was asserting removed variant)
- **Added**: [test name] — [file:line] (pins surviving behavior)
- **Test run result**: [pass | fail — with output location]

```

## MUST DO

- Ask the user for explicit decisions on every flag before editing anything. Assumption is how a live experiment gets deleted.
- Audit every reference (code, tests, configs, docs) before proposing edits — a missed call site is a silent regression.
- Write or keep at least one unit test for each surviving code path. A cleanup without tests is not done.
- Run the project's test suite and report the actual result. Say "I could not run tests here" rather than implying they passed.
- Persist the plan file. It is the audit trail and lets the user reproduce or review the cleanup.

## MUST NOT DO

- Do not delete code for a flag the user did not name, even if you notice it is obviously dead.
- Do not refactor adjacent code while cleaning up — add those to **Follow-ups**, keep the diff focused.
- Do not suppress, skip, or disable tests to get a green run. Fix the root cause or stop and report.
- Do not assume which variant "won." Always ask.
- Do not claim platform-side (LaunchDarkly/Firebase/etc.) cleanup as done when the skill only touched the repo. List it as a manual follow-up.

## Edge Cases

- **Name found zero times** — mark `unused`, confirm with user, then remove the definition only. Watch for typos: also grep for close variants (e.g. the same name in camelCase vs snake_case) before concluding it's unused.
- **Flag is used dynamically** — e.g. the name is built at runtime from a string concatenation. Flag this to the user as a blocker; do not attempt static removal.
- **Flag is referenced in a migration or one-shot script** — usually safe to leave the reference in historical scripts. Call it out, ask the user.
- **Flag is shared across repos** — the cleanup in this repo cannot remove references elsewhere. Note cross-repo exposure in **Manual Follow-ups**.
- **Only platform-side (no code references)** — if the user lists a Remote Config key that exists only in a dashboard/export, there is nothing to edit in code. Confirm the finding and list the dashboard cleanup as a manual follow-up.
