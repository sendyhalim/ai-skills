---
name: general-backend-architecture
description: Use when designing or implementing backend features across any language or framework. Defines the three-layer architecture (Protocol, Service, Data) and bottom-up delivery order.
license: MIT
metadata:
  domain: language
  triggers: develop backend, implement backend, create backend, create api endpoint
  role: specialist
  scope: implementation
  output-format: code
  related-skills: php-developer
---

# General Backend Architect


## Overview
Backend development baseline skill for designing and implementing backend features.
All implementations must satisfy these non-negotiable constraints: information security, modularity, testability, reusability, and maintainability.

## Core Pattern
### Backend Component Layers
Code implementation are grouped into 3 layers and it is platform or programming language or framework agnostic, these layers are:
- **Protocol Layer**: Will trigger business logic in the service code layer.
- **Service Code Layer**: Will execute business logic and might depends on data layer.
- **Data Layer**: Implementation to interact with storage such as database, filesystem, cache (redis or memory cache).


#### Protocol Layer
A layer that is trigger from certain IO or trigger layer. This layer includes: HTTP layer, controller, executable worker layer.
* Protocol layer will extract data specifics from protocol, for example extracting http payload or socket payload or cli argument.
* Then the extracted payload will be passed to service code layer that will execute business logic. Protocol layer is basically just a connector between trigger interface (http, websocket, process execution) to service code layer, it doesn't contain any business logic. This layer should not be unit tested since it's not worth it to maintain the test unless explicitly asked.


Protocol layer has a one to one mapping to service code layer, for example:
* 1 HTTP Endpoint will just trigger 1 method in service code layer
```
Client triggers POST /api/v1/user
  -> Protocol Layer: triggered based on routing mapping API path to UserController.createUser
  -> Protocol Layer: extract userData payload from http payload
  -> Protocol Layer: trigger UserService.createUser(userData)

Client triggers GET /api/v1/users
  -> Protocol Layer: triggered based on routing mapping API path to UserController.userListing
  -> Protocol Layer: extract listing data payload from http payload
  -> Protocol Layer: trigger UserService.getUserListing(paginationData, filter)

Client triggers GET /api/v1/users/{userId}
  -> Protocol Layer: triggered based on routing mapping API path to UserController.getUserById
  -> Protocol Layer: extract user id parameter payload from http payload
  -> Protocol Layer: trigger UserService.getUserById({ userId })
```

* 1 Worker process will just trigger 1 method in service code layer
```
Client runs `./run-worker process-user-registration`
  -> Inside run-worker -> routing process param process-user-registration -> UserService.processUserRegistration(userData)

Cronjob triggers `./run-worker process-reporting-data`
  -> Inside run-worker -> routing process param process-reporting-data -> ReportingService.processDailyReporting()
```


#### Service Code Layer
This layer contains business logic, it doesn't contain anything specific from protocol layer.
This layer receives plain data as input from the upper layer, then validates it at the top of each service method using the project's validator. If no validator exists, use typed parameters and assert invariants explicitly. This layer might require multiple data layers depending on the business logic.

Errors are handled here as typed domain exceptions. The Protocol layer is responsible for catching them and mapping to protocol-specific responses (e.g. HTTP 400/500).

Unit testing is mandatory for this layer.

#### Data Layer
This layer contains direct connection to storage such as database, cache, file storage, or external API.
This layer is used by service code layer to store or retrieve data from storage.

This layer should not be unit tested since it's not worth it to maintain the test unless explicitly asked.

### Execution Steps
When implementing a backend feature, deliver in this bottom-up order:
1. Domain models (entities, value objects, enums)
2. Data layer (repositories, adapters)
3. Service code layer: service classes
4. Controller/API endpoints/Worker main trigger point
5. Test files
6. Brief explanation of architecture decisions

### MUST NOT DO
*

