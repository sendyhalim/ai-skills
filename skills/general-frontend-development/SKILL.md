---
name: general-frontend-development
description: Use when designing or implementing frontend features. Enforces component architecture, state management patterns, and clean code. Works with React, Redux, and Inertia.js. First analyzes project structure and conventions before implementation.
license: MIT
metadata:
  version: "1.3.0"
  domain: language
  triggers: frontend, React, Redux, Inertia, component, UI, page, view, JSX
  role: specialist
  scope: implementation
  output-format: code
  related-skills: general-backend-architecture, php-development
---

# General Frontend Development

## Overview
Frontend development baseline skill for designing and implementing frontend features.
All implementations must satisfy these non-negotiable constraints: accessibility, modularity, testability, reusability, and maintainability.

**CRITICAL**: Frontend project structures vary significantly across codebases. Always analyze the existing project before writing any code.

## Core Workflow

1. **Analyze project structure** — Before any implementation, inspect the project to determine:
   - File and folder conventions (e.g. `resources/js/Pages/`, `src/components/`, `app/frontend/`)
   - Framework integration (standalone React SPA, Laravel + Inertia.js, Next.js, etc.)
   - State management approach (Redux store structure, slices, Context, or local state)
   - Styling approach (Tailwind, CSS Modules, styled-components, SCSS)
   - Existing component patterns (naming, prop definitions, file co-location)
   - Language usage (JavaScript or TypeScript — match whatever the project uses)
   - Test setup (Vitest, Jest, React Testing Library)
2. **Follow existing conventions** — Match the discovered patterns exactly; do not introduce new patterns unless explicitly asked
3. **Design components** — Create components, hooks, and state slices
4. **Implement** — Write clean code following the project's established patterns
5. **Verify** — Run the project's lint and test commands; fix all errors before proceeding

## Reference Guide
Load Inertia.js guidance `references/inertia-patterns.md` when the project uses `@inertiajs/react`.
Load standalone SPA guidance `references/spa-patterns.md` for standalone React applications (React Router, Redux for all state).

## Constraints
### MUST DO
- Analyze project structure and conventions before writing any code
- Use PropTypes for prop validation when the project uses JavaScript (match project convention)
- Use 2 spaces per indentation level, no tabs
- Use functional components with hooks (no class components)
- Use `const` by default; `let` only when reassignment is necessary
- Colocate component tests next to their source files or follow the project's test directory pattern
- Use React Testing Library for component tests (test behavior, not implementation)
- Validate all user input with controlled components and form validation
- Use semantic HTML elements for accessibility (`button`, `nav`, `main`, `section`)

### MUST NOT DO
- Store sensitive data in client-side state (tokens, passwords)
- Write inline styles unless the project convention uses them
- Mix data fetching logic into presentational components
- Hardcode API URLs (use environment variables or Inertia routes)
- Deploy without running lint and tests
- Use `console.log` in production code
- Introduce new state management patterns without explicit instruction

## Code Patterns (Shared)
These patterns apply to all frontend projects regardless of framework integration.

### Component

```jsx
import PropTypes from 'prop-types';

const UserList = ({ users }) => {
  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default UserList;
```

### Component Test (React Testing Library)

```jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserList from './UserList';

describe('UserList', () => {
  it('renders user names and emails', () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];

    render(<UserList users={users} />);

    expect(screen.getByText('Alice — alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob — bob@example.com')).toBeInTheDocument();
  });

  it('renders empty message when no users', () => {
    render(<UserList users={[]} />);

    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });
});
```
