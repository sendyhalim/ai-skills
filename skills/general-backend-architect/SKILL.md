---
name: general-backend-architect
description: Use to building any backend functionality
license: MIT
metadata:
  domain: language
  triggers: develop backend, implement backend, create backend, create api endpoint
  role: specialist
  scope: implementation
  output-format: code
---


# General Backend Architect
Senior backend architect with deep expertise in backend development. Implementation heavily
prioritize information security, modularity, reusability and maintanability.

## Backend Code Patterns
Code implenentation are grouped into 3 layers and it is platform or programming language or framework agnostic, these layers are:
- **Protocol Layer**
- **Service Code Layer**:
- **Data Layer**

### Protocol Layer
A layer that contains certain IO or trigger layer. This layer includes: HTTP layer, controller, executable worker layer. Protocol layer will trigger service code layer to execute business logic. This layer just a connector between interface trigger (http, worker execution) with service code layer, it doesn't contain any business logic. This layer should not be unit tested since it's not worth it to maintain the test unless explicitly asked.


Protocol layer has a one to one mapping to service code layer, for example:
* 1 HTTP Endpoint will just trigger 1 method in service code layer
```
Client triggers POST /api/v1/user
  -> http routing UserController.createUser
  -> UserService.createUser(userData)

Client triggers GET /api/v1/users
  -> http routing UserController.userListing
  -> UserService.getUserListing(paginationData, filter)

Client triggers GET /api/v1/users/{userId}
  -> http routing UserController.getUserById
  -> UserService.getUserById({ userId })
```

* 1 Worker process will just trigger 1 method in service code layer
```
Client runs `./run-worker process-user-registration`
  -> Inside run-worker -> routing process param process-user-registration -> UserService.processUserRegistration(userData)

Cronjob triggers `./run-worker process-reporting-data`
  -> Inside run-worker -> routing process param process-reporting-data -> ReportingService.processDailyReporting()

```


### Service Code Layer
This layer contains business logic, it doesn't contain anything specific from protocol layer.
This layer receives plain data as input from the upper layer, then validates the data using a validator defined in each project before processing the data into the business logic. This layer might require multiple data layers depending on the business logic.

Unit testing is mandatory for this layer.

### Data Layer
This layer contains direct connection to storage such as database, cache, file storage, or external API.
This layer is used by service code layer to store or retrieve data from storage.

This layer should not be unit tested since it's not worth it to maintain the test unless explicitly asked.

## Output Templates
When implementing a backend feature, deliver in this bottom-up order:
1. Data layer: Domain models (entities, value objects, enums)
2. Service code layer: service classes
3. Controller/API endpoints/Worker main trigger point
4. Test files
5. Brief explanation of architecture decisions
