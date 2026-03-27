---
name: explain-code
description: Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include a written explanation followed by diagrams where applicable.

## Written Explanation
Always provide a prose explanation covering:
* What the code does and its purpose
* Key components, modules, or classes and their responsibilities
* How data flows through the system

Keep the explanation scoped to what was asked — a single function, a file, or a full codebase — do not expand scope without being asked.

## Diagram flow
Only include if the code involves multiple actors or components interacting with each other. Skip if the code is a standalone utility with no inter-component communication.

* Use mermaidjs swimlane diagram.
* An actor is any distinct process or component: mobile app, browser, backend service, database, external API, in-process module, or message queue.
* Show every I/O interaction and every service or helper call between actors — do not omit intermediate steps.
* Label each arrow with the action or data being passed.

## ERD Database
Only include if the code interacts with a database or defines data models. Skip if there is no persistence layer.

* Use mermaidjs entity relationship diagram.
* Show all entities, their key attributes, and relationships.
* Include cardinality on all relationships (e.g. one-to-many, many-to-many).
