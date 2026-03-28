---
name: general-backend-architecture
description: Use when designing or implementing backend features across any language or framework. Defines the three-layer architecture (Protocol, Service, Data) and bottom-up delivery order. Use this for any backend implementation, API endpoint creation, service design, worker/queue setup, or when deciding how to structure server-side code.
license: MIT
metadata:
  domain: language
  triggers: develop backend, implement backend, create backend, create api endpoint, backend architecture, service layer, repository pattern
  role: specialist
  scope: implementation
  output-format: code
  related-skills: php-development, java-development, javascript-development
---

# General Backend Architecture

## Overview
Backend development baseline skill for designing and implementing backend features.
All implementations must satisfy these non-negotiable constraints: information security, modularity, testability, reusability, and maintainability.

## Core Pattern

### Backend Component Layers
Code implementations are grouped into 3 layers. This is platform, language, and framework agnostic:
- **Protocol Layer**: Connector between the external trigger (HTTP, WebSocket, CLI, queue) and the service layer. Contains no business logic.
- **Service Code Layer**: Executes business logic. Depends on data layer abstractions, never on protocol-specific details.
- **Data Layer**: Interacts with storage (database, filesystem, cache, external APIs) behind interfaces that the service layer consumes.

### Layer Dependency Rule
Dependencies flow downward only: Protocol -> Service -> Data. The service layer depends on data layer **interfaces**, not concrete implementations. This is the key to testability — you can mock the data layer interface in service tests without needing a real database.

```
Protocol Layer (controllers, workers, CLI handlers)
    |
    v  (passes plain data, no protocol-specific objects)
Service Code Layer (business logic, domain exceptions)
    |
    v  (calls interface methods, not concrete storage)
Data Layer (repositories, cache adapters, API clients)
```

---

## Protocol Layer

The entry point triggered by external I/O. This layer includes: HTTP controllers, WebSocket handlers, CLI command handlers, and queue/worker consumers.

Responsibilities:
* Extract data from the protocol (HTTP body, query params, socket payload, CLI arguments)
* Pass extracted plain data to the service layer — never pass request/response objects or protocol-specific types into the service layer
* Catch domain exceptions from the service layer and map them to protocol-specific responses
* Validate request **shape** (required fields present, correct types, format constraints like email format or string length)

This layer should not be unit tested since the cost of maintaining those tests outweighs the value, unless explicitly asked.

Protocol layer has a one-to-one mapping to service code layer methods:

**HTTP endpoint examples:**
```
Client triggers POST /api/v1/user
  -> UserController.createUser: extract userData from HTTP body
  -> validate shape (name required, email format valid)
  -> call UserService.createUser(userData)
  -> catch UserAlreadyExistsException -> return HTTP 409
  -> return HTTP 201 with created user

Client triggers GET /api/v1/users
  -> UserController.userListing: extract pagination and filter from query params
  -> call UserService.getUserListing(paginationData, filter)
  -> return HTTP 200 with list

Client triggers GET /api/v1/users/{userId}
  -> UserController.getUserById: extract userId from path param
  -> call UserService.getUserById(userId)
  -> catch UserNotFoundException -> return HTTP 404
  -> return HTTP 200 with user
```

**Worker/CLI examples:**
```
Client runs `./run-worker process-user-registration`
  -> route to UserService.processUserRegistration(userData)

Cronjob triggers `./run-worker process-reporting-data`
  -> route to ReportingService.processDailyReporting()
```

---

## Service Code Layer

This layer contains all business logic. It receives plain data as input from the protocol layer — no HTTP requests, no socket objects, no CLI argument parsers.

Responsibilities:
* Validate **business rules** at the top of each method (e.g., user has permission, email is unique, account balance is sufficient). Use the project's validator if one exists; otherwise use typed parameters and assert invariants explicitly.
* Orchestrate data layer calls to fulfill the business operation
* Throw typed domain exceptions when business rules are violated

This layer may depend on multiple data layer interfaces depending on the business logic (e.g., a `TransferService` might need both `AccountRepository` and `TransactionRepository`).

### Error Handling Pattern

Use typed domain exceptions to represent business rule violations. This makes error handling explicit and testable:

```
Service: UserService.createUser(userData)
  -> calls UserRepository.findByEmail(email)
  -> email already exists -> throws UserAlreadyExistsException
  -> Protocol Layer catches UserAlreadyExistsException -> HTTP 409 Conflict

Service: OrderService.placeOrder(orderData)
  -> calls InventoryRepository.checkStock(itemId)
  -> insufficient stock -> throws InsufficientStockException
  -> Protocol Layer catches InsufficientStockException -> HTTP 422 Unprocessable

Service: UserService.getUserById(userId)
  -> calls UserRepository.findById(userId)
  -> not found -> throws UserNotFoundException
  -> Protocol Layer catches UserNotFoundException -> HTTP 404 Not Found

Any unexpected exception (database down, null pointer, etc.)
  -> Protocol Layer catches generic Exception -> HTTP 500 Internal Server Error
  -> Log the full error with stack trace server-side
  -> Return generic error message to client (never expose internals)
```

Unit testing is mandatory for this layer.

---

## Data Layer

This layer handles direct interaction with storage: database, cache (Redis, Memcached, in-memory), file storage, or external APIs.

Responsibilities:
* Implement the interface/contract that the service layer depends on
* Encapsulate all storage-specific logic (SQL queries, ORM calls, API client calls)
* Return domain objects or primitives — never return raw database rows or HTTP responses to the service layer

The service layer should always depend on a data layer **interface** (e.g., `UserRepositoryInterface`), not a concrete implementation (e.g., `MysqlUserRepository`). This allows swapping storage implementations and mocking in tests.

This layer should not be unit tested since the cost of maintaining those tests outweighs the value, unless explicitly asked. Integration tests covering the full stack are more valuable here.

---

## Cross-Cutting Concerns

Some concerns don't fit neatly into a single layer. Handle them as middleware or interceptors that wrap the protocol layer:

- **Authentication**: Middleware that runs before the protocol handler. Verifies identity (JWT, session, API key) and attaches the authenticated user to the request context. Reject unauthenticated requests before they reach the controller.
- **Authorization**: Can be middleware (role-based route guards) or service-layer logic (resource-level permission checks like "can this user edit this document?"). Use middleware for coarse-grained checks, service layer for fine-grained business rules.
- **Logging**: Log at protocol layer boundaries (request in, response out) and at service layer for business events. Never log secrets, tokens, passwords, or PII.
- **Transaction management**: Typically managed at the service layer or via middleware/decorators that wrap service methods. A single service method call should map to a single transaction boundary.

---

## Validation: Two Layers

Validation happens in two places for different reasons:

| Layer | What it validates | Examples |
|---|---|---|
| **Protocol Layer** | Request shape — data is present and well-formed | Required fields, type coercion, email format, string length, date format |
| **Service Layer** | Business rules — data is valid in context | Email uniqueness, sufficient balance, user has permission, resource exists |

Shape validation rejects malformed input early (cheap, no database calls). Business validation enforces domain rules (may require data layer lookups).

---

## Execution Steps

When implementing a backend feature, deliver in this bottom-up order:
1. Domain models (entities, value objects, enums)
2. Data layer interfaces and implementations (repositories, adapters)
3. Service code layer (service classes with business logic)
4. Protocol layer (controller/API endpoints/worker trigger points)
5. Test files (mandatory for service layer, optional for others unless requested)
6. Brief explanation of architecture decisions

## MUST NOT DO
- Put business logic in the protocol layer — controllers are connectors, not decision makers
- Pass protocol-specific objects (HTTP request, socket, CLI args) into the service layer
- Let the service layer know about HTTP status codes, response formats, or transport details
- Skip input validation at system boundaries
- Catch and silently swallow exceptions — either handle them meaningfully or let them propagate
- Depend on concrete data layer implementations from the service layer — always use interfaces
- Hardcode configuration values (database credentials, API keys, feature flags) — externalize to environment variables or config files
