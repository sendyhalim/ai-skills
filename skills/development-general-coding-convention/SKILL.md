---
name: development-general-coding-convention
description: "Use for all development work including backend, frontend, database, and devops. Enforces naming conventions (variables, functions, classes, files, booleans, iterables, maps), whitespace rules, guard clauses, builder patterns, and comment style. Apply this skill whenever writing or reviewing code in any language. Language-specific skills (java-development, php-development, etc.) override overlapping rules from this skill."
---

# Development General Coding Convention

Baseline coding conventions for any software development task. These conventions are language and framework agnostic — apply them everywhere unless a language-specific skill (e.g., `java-development`, `php-development`) provides a conflicting rule then prioritize rule in the language-specific skill for that specific convention.

## Precedence Rule

When a language-specific skill defines a convention that conflicts with one here, the language-specific skill wins for that specific convention. All non-overlapping conventions from this skill still apply. For example, if `java-development` specifies 2-space indentation, that overrides any indentation rule here — but naming conventions from this skill still apply unless `java-development` also defines naming rules.

Code examples below use Java-like syntax for illustration, but the principles apply to all languages.

---

## Naming Conventions

Good naming eliminates the need for comments and prevents bugs caused by misunderstanding what a variable holds or what a function does.

### Classes and Types
Use PascalCase. Name should be a noun or noun phrase that describes what the thing *is*.

```
// Good
UserService, PaymentGateway, OrderStatus, CreateUserRequest

// Bad
Manage, DoStuff, Helper (too vague — helper for what?)
```

### Functions and Methods
Use camelCase (or snake_case depending on language convention). Name should start with a verb that describes what the function *does*.

```
// Good
calculateDiscount(), findUserByEmail(), processPayment(), validateInput()

// Bad
discount(), user(), data() — these read like nouns, not actions
```

### Boolean Variables and Methods
Prefix with `is`, `has`, `should`, `can`, or `was` so the variable reads as a true/false question. This eliminates ambiguity about what the value represents.

```
// Good
isActive, hasPermission, shouldRetry, canEdit, wasProcessed

// Bad
active    // Is this a boolean? A status string? An active record?
retry     // Is this a count? A boolean? A function?
```

### Constants
Use UPPER_SNAKE_CASE to visually distinguish constants from mutable variables.

```
// Good
MAX_RETRY_COUNT, DEFAULT_TIMEOUT_MS, API_BASE_URL

// Bad
maxRetryCount  // Looks like a regular variable, easy to accidentally reassign
```

### Iterable Collections (Array, List, Set)
Use plural nouns. The plural form signals "this holds multiple items" without needing to check the type.

```
// Good
Array<Post> posts
List<User> users
Set<String> names

// Bad
Array<Post> post     // Reads like a single item
List<User> userList  // The type already says it's a list — redundant suffix
```

### Maps and Dictionaries
Use `{value}By{Key}` format. This makes the lookup semantics obvious: "if I supply X as the key, I get Y."

```
// Good
Map<String, User> userByEmail          // Supply email, get a user
Map<String, List<User>> usersByCity    // Supply city, get a list of users

// Bad
Map<String, User> users               // What's the key? ID? Email? Name?
Map<String, List<User>> userMap       // "Map" suffix adds nothing — the type says it
```

### Files and Directories
Follow the dominant convention of the project. When starting fresh:
- **Class files**: Match the class name and casing (e.g., `UserService.java`, `user_service.py`)
- **Directories/packages**: Use lowercase with hyphens or underscores depending on language norm (`user-management/` for JS/TS, `user_management/` for Python, `usermanagement/` for Java packages)
- **Config and non-code files**: Use lowercase with hyphens (`docker-compose.yml`, `api-spec.json`)

---

## Whitespace and Line Length

Lines longer than 100 characters are hard to read and create horizontal scrolling in code review tools. When a line exceeds 100 characters, split it across multiple lines with the closing brace or bracket on its own line, aligned with the starting statement's indentation level.

**Bad:**
```
// Too long for a single line
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(parameter1, parameter2, parameter3);

// Closing parenthesis doesn't match starting indentation level — looks misaligned
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(
  parameter1,
  parameter2,
  parameter3);
```

**Good:**
```
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(
  parameter1,
  parameter2,
  parameter3
);
```

---

## Builder / DTO Pattern for Multi-Parameter Functions

When a function takes 2 or more parameters, use a named DTO or builder pattern instead of positional arguments. Positional arguments are a common source of bugs — the compiler won't catch it if you swap two parameters of the same type, and the call site doesn't communicate what each value means.

**Bad:**
```
// What do these numbers mean? Which is which?
AnnuityCalculator.calculate(100000, 0.1, 3);

// Which one is the discount — the first or second argument?
// A wrong guess causes a silent bug.
DiscountCalculator.subtractDiscount(amount, 120000);
```

**Good:**
```
// Every parameter is named — impossible to mix up, easy to read
AnnuityCalculator.calculate(
  AnnuityInput
    .builder()
    .principal(100000)
    .interestRate(0.1)
    .tenure(3)
    .build()
);
```

How to implement varies by language:
- **Java**: Use Lombok `@Builder` or records for immutable DTOs
- **JavaScript/TypeScript**: Use a plain object `{ principal: 100000, interestRate: 0.1, tenure: 3 }`
- **PHP**: Use a readonly DTO class
- **Python**: Use a dataclass or TypedDict
- **Other languages**: Use the idiomatic equivalent — a struct, named tuple, or constructor with named parameters

---

## Guard Clauses (Early Return)

Use guard clauses to handle invalid or edge-case conditions at the top of a function, then proceed with the main logic un-nested. Deeply nested if/else blocks force the reader to mentally track multiple branches to understand what the function does. Guard clauses flatten the logic so the happy path reads top-to-bottom.

**Bad:**
```
// Business logic buried inside 2 levels of nesting
if (data is valid) {
  if (discount != 0) {
    // Business logic here
    return result;
  } else {
    // Other logic
    return otherResult;
  }
} else {
  // Throw error
}
```

**Good:**
```
// Guard: reject invalid input immediately
if (!valid) {
  throw error;
}

// Guard: handle special case
if (discount != 0) {
  return discountedResult;
}

// Main logic — no nesting, reads clearly
return standardResult;
```

---

## Comments

Comments should explain *why*, not *what*. If you need a comment to explain what the code does, consider renaming variables or extracting a well-named function instead.

When writing comments:
- Start with a capital letter
- Add one space between the comment marker and the text

**Bad:**
```
//This is a comment
// this is a comment
// increment i by 1   (describes what the code does — the code already says this)
```

**Good:**
```
// Retry limit is 3 because the payment gateway has intermittent 502s during peak hours.
// Another comment.
```
