---
name: explain-code
description: Use when explaining how code works, teaching about a codebas, or when the user asks "how does this work?"
---

When explaining code, your output will be in markdown format containing:
* **Diagram flow**
* **ERD Database**

## Diagram flow
* Diagram flow uses mermaidjs swimlane diagram for visual representation of the code's flow and interactions between actors/role/participants.
* Each actor is basically a different process such as mobile app, browser, backend services, database, external services or APIs.
* The diagram will show actions done by each actor at high level, at the most minimum each I/O interaction must be described, each service or helper call must be in the diagram.

## ERD Database
Use mermaidjs entity relationship diagram for visual representation of the database structure and relationships between tables.
