---
name: java-development
description: Use when developing with Java. Enforces strong typing, clean architecture, and Google Java Style. Creates controllers, middleware, migrations, JUnit/TestNG/Mockito tests, typed DTOs, value objects, and dependency injection. Use when working with Spring Boot, JPA, Maven, Gradle, or any Java API development.
license: MIT
metadata:
  version: "1.1.0"
  domain: language
  triggers: Java, Spring Boot, Maven, Gradle, JPA, Hibernate, Java API, JUnit/TestNG
  role: specialist
  scope: implementation
  output-format: code
  related-skills: general-backend-architecture
---

## Core Workflow

1. **Analyze architecture** — Review framework, Java version, dependencies, and patterns
2. **Design models** — Create typed domain models, value objects, DTOs
3. **Implement** — Write strict-typed code with Google Java Style compliance, DI, repositories
4. **Secure** — Add validation, authentication, XSS/SQL injection protection
5. **Verify** — Run `mvn verify` or `./gradlew check`; fix all errors before proceeding. Run `mvn test` or `./gradlew test`; enforce 80%+ coverage. Only deliver when both pass clean.

## Reference Guide
Load Spring Boot guidance `references/spring-boot-patterns.md` when implementing Spring Boot features.

## Constraints
### MUST DO
- Use Java 17+ features (records, sealed classes, pattern matching) where appropriate
- Use type hints for all parameters and returns (no raw types)
- Follow Google Java Style Guide unless stated otherwise for a specific convention
- Use 2 spaces per indentation level, no tabs
- Run tests and static analysis before delivery
- Use `final` for all fields set only in the constructor and never mutated
- Write Javadoc blocks for complex logic explaining high-level steps
- Validate all user input with Bean Validation (`@Valid`, `@NotNull`, `@Size`, etc.)
- Use dependency injection over global stated

### MUST NOT DO
- Skip type declarations (no raw generic types)
- Store passwords in plain text (use BCrypt/Argon2)
- Write SQL queries vulnerable to injection (use parameterized queries or JPA)
- Mix business logic with controllers
- Hardcode configuration (use `application.properties` / `application.yml` or environment variables)
- Deploy without running tests and static analysis
- Use `System.out.println` in production code (use a logger)

## Code Patterns
Every implementation that involves a typed entity/DTO, a service class, and a test can use the below example as the baseline structure.


### Service Code Layer

```java
package com.example.app.service;

import com.example.app.dto.CreateUserDto;
import com.example.app.model.User;
import com.example.app.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public final class UserService {

  private final UserRepository userRepository;

  public UserService(final UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User create(final CreateUserDto dto) {
    return userRepository.save(dto.toEntity());
  }
}
```

### JUnit Test Structure

```java
package com.example.app.service;

import com.example.app.dto.CreateUserDto;
import com.example.app.model.User;
import com.example.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
final class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  private UserService service;

  @BeforeEach
  void setUp() {
    service = new UserService(userRepository);
  }

  @Test
  void createReturnsUser() {
    var dto = new CreateUserDto("Alice", "alice@example.com", "secret");
    var user = new User("Alice", "alice@example.com");

    when(userRepository.save(any(User.class))).thenReturn(user);

    var result = service.create(dto);

    assertThat(result.getName()).isEqualTo("Alice");
    verify(userRepository).save(any(User.class));
  }
}
```

### DTO Structure (Record)

```java
package com.example.app.dto;

import com.example.app.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserDto(
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String password
) {

  public User toEntity() {
    return new User(name, email);
  }
}
```

### Enum

```java
package com.example.app.model;

public enum UserStatus {

  ACTIVE("Active"),
  INACTIVE("Inactive"),
  BANNED("Banned");

  private final String label;

  UserStatus(final String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
```

## Output Templates

When implementing a feature, deliver in this order:
1. Domain models (entities, value objects, enums)
2. Data layer (repositories, adapters)
3. Service code layer
4. Controller/API endpoints/Process Trigger Interface (main function)
5. Test files (JUnit/Mockito)
6. Brief explanation of architecture decisions
