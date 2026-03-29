---
name: engineering-feature-execution-plan
description: Use when decomposing a feature request, user story, or task into a structured plan with subtasks. Applies when the user describes work that needs breaking down into actionable steps — especially cross-cutting work spanning backend and frontend. Produces an ordered task checklist with dependencies, impacted files, ownership (backend/frontend), and agent delegation. Also use when the user asks to create a task list, plan a feature, break down work, or organize implementation steps. Trigger whenever the user mentions planning, task breakdown, decomposition, or wants to persist a checklist to a file.
license: MIT
metadata:
  domain: planning
  triggers: task planning, break down, decompose, plan feature, task list, checklist, implementation plan, subtasks, work breakdown
  role: coordinator
  scope: planning
  output-format: markdown
  related-skills: general-backend-architecture, general-frontend-development
---

# Task Planning

## Overview

A structured approach to decomposing feature requests and user stories into actionable, ordered subtasks. This skill turns ambiguous requirements into a concrete checklist where each task has a clear owner, scope, and set of impacted files — ready for delegation to the right engineer or agent.

## When to Use This

- A user describes a feature, story, or change that needs breaking down before implementation
- Work spans multiple layers (backend, frontend, or both) and needs coordination
- The user wants a persistent, trackable task list they can reference during implementation
- The scope is unclear and needs decomposition before anyone writes code

## Core Workflow

### 1. Understand the Request

Before decomposing, clarify what the user actually wants:

- **User-facing outcome**: What should the user be able to do when this is done?
- **Scope boundaries**: What's included vs explicitly excluded?
- **Implicit requirements**: Auth, validation, error states, loading states, empty states — things the user didn't mention but will expect

If the request is ambiguous, ask clarifying questions first. A well-scoped task is already half-solved.

### 2. Analyze the Existing Codebase

Scan the project to understand:

- What already exists that can be reused or extended
- The project's language, framework, and conventions
- Where new code should live based on existing structure
- Existing patterns for similar features

This prevents planning work that conflicts with how the project is actually built.

### 3. Decompose into Subtasks

Break work into concrete subtasks using this mental model:

```
User Request
  +-- Data & API (Backend)
  |   +-- Domain models / schema changes
  |   +-- Data layer (repositories)
  |   +-- Service layer (business logic)
  |   +-- API endpoints (protocol layer)
  |
  +-- UI & Interaction (Frontend)
  |   +-- Data types / API response interfaces
  |   +-- Presentational components
  |   +-- Container components / hooks (state, API integration)
  |   +-- Page / route integration
  |
  +-- Cross-cutting
      +-- Auth / permissions (if applicable)
      +-- Validation rules (shared between client and server)
      +-- Error handling contract
```

Each subtask should be:
- **Single-responsibility**: One clear deliverable
- **Assignable**: Clearly belongs to backend, frontend, or cross-cutting
- **Independently testable**: Can be verified without other tasks being complete
- **Ordered by dependency**: Tasks that block others come first

### 4. Define the API Contract (if full-stack)

For features spanning both backend and frontend, define the API contract early because both sides depend on it:

- Endpoint path and HTTP method
- Request payload shape
- Response payload shape (success and error cases)
- Authentication requirements
- Pagination format (if applicable)

### 5. Establish Task Order and Dependencies

Typical dependency flow:

1. **Schema / domain models** (backend) — everything else depends on data shape
2. **API endpoints** (backend) — frontend needs something to call
3. **API integration hooks** (frontend) — connects UI to backend
4. **UI components** (frontend) — can start in parallel with step 2 using mocked data
5. **Integration testing** — after both sides are done

Parallel opportunities:
- Presentational components can be built with stub data while the backend API is being implemented
- Backend tests and frontend tests are independent

### 6. Build the Task Checklist

Structure each task with these fields:

| Field | Description |
|---|---|
| **Task title** | Short, imperative description of the deliverable |
| **Task description** | What to build, acceptance criteria, and context for why this task exists |
| **Impacted files** | List of files to create or modify (based on codebase analysis) |
| **Side** | Which part of the project is impacted: `backend`, `frontend`, or `cross-cutting` |
| **Delegate to** | Which agent should handle this: `senior-backend-engineer`, `senior-frontend-engineer`, or `engineering-manager` |

### 7. Persist the Plan File

After building the task checklist, always save it as a markdown file. **This is MANADATORY — every plan must be persisted so the team has a trackable reference during implementation.**

**File location**: `ai-engineering/feature-execution-plan/` in the project root. Create the directory if it doesn't exist, ask user permission first.

**Filename format**: `{YYYY-MM-DD} {feature name}.md` — use the current date and a short, descriptive feature name in kebab-case.

Examples:
- `ai-engineering/feature-execution-plan/2025-03-29 user-authentication.md`
- `ai-engineering/feature-execution-plan/2025-03-29 order-export-csv.md`
- `ai-engineering/feature-execution-plan/2025-03-29 dashboard-analytics.md`

**Use this template** for the plan file:

```markdown
# [Feature Name] — Task Plan

> Generated: [YYYY-MM-DD]
> Status: In Progress

## API Contract

[If applicable, include the agreed endpoint definitions here]

## Tasks

### 1. [Task Title]
- **Description**: [What to build and why]
- **Impacted files**: [list of file paths]
- **Side**: [backend | frontend | cross-cutting]
- **Delegate to**: [agent name]
- **Status**: [ ] Not started

### 2. [Task Title]
- **Description**: [What to build and why]
- **Impacted files**: [list of file paths]
- **Side**: [backend | frontend | cross-cutting]
- **Delegate to**: [agent name]
- **Depends on**: Task 1
- **Status**: [ ] Not started

[...repeat for each task]

## Open Questions

- [Any unresolved questions or assumptions]

## Notes

- [Any architectural decisions or context worth preserving]
```

The status field uses a checkbox so the user (or agents) can track progress:
- `[ ] Not started`
- `[x] Completed`

### 8. Present the Plan

Before execution, present the breakdown to the user. Keep it scannable — bullet points and short descriptions, not paragraphs. Include:

- The list of subtasks in execution order
- Which agent handles each task
- Dependencies between tasks (what blocks what)
- Any assumptions made
- Any open questions that need answers before starting
- The path to the persisted plan file

### 9. Delegate to Specialists

When delegating, provide each agent with:

- **What to build**: The specific deliverable
- **Context**: Why this task exists and how it fits the bigger picture
- **Dependencies**: What must be done first, and what this task unblocks
- **Acceptance criteria**: How to know it's done
- **API contract** (if applicable): The agreed interface between backend and frontend

Delegate to **senior-backend-engineer** for:
- Database schema changes, migrations
- API endpoints, services, repositories
- Authentication/authorization logic
- Queue workers, background jobs
- Server-side validation and business rules

Delegate to **senior-frontend-engineer** for:
- UI components, pages, layouts
- State management (Redux slices, hooks)
- Form handling and client-side validation
- API integration and data fetching
- Routing and navigation
- Accessibility and responsive design

## Edge Cases

**Backend-only tasks**: Skip decomposition, delegate directly to senior-backend-engineer.

**Frontend-only tasks**: Skip decomposition, delegate directly to senior-frontend-engineer.

**Unclear scope**: Investigate the codebase first — check what files are involved, what layers are affected, then decide.

**Conflicting requirements**: Surface the conflict and ask for clarification rather than guessing.

## MUST NOT DO

- Skip codebase analysis — planning without understanding the existing code leads to rework
- Over-decompose simple tasks — if it's clearly a single-engineer job, delegate directly
- Create tasks without impacted files — vague tasks are not actionable
- Assume the API contract — define it explicitly when both backend and frontend are involved
- Skip persisting the plan file — every plan must be saved to `ai-engineering/feature-execution-plan/`
