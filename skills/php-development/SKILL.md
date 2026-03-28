---
name: php-development
description: Use when developing with PHP. Enforces strict typing, PHPStan level 9, and PSR-12. Creates controllers, middleware, migrations, PHPUnit/Pest tests, typed DTOs, value objects, and dependency injection. Use when working with Laravel, Eloquent, Composer, Psalm, or any PHP API development.
license: MIT
metadata:
  version: "1.1.0"
  domain: language
  triggers: PHP, Laravel, Composer, PHPStan, PSR, PHP API, Eloquent
  role: specialist
  scope: implementation
  output-format: code
  related-skills: general-backend-architecture
---

## Core Workflow

1. **Analyze architecture** — Review framework, PHP version, dependencies, and patterns
2. **Design models** — Create typed domain models, value objects, DTOs
3. **Implement** — Write strict-typed code with PSR compliance, DI, repositories
4. **Secure** — Add validation, authentication, XSS/SQL injection protection
5. **Verify** — Run `vendor/bin/phpstan analyse --level=9`; fix all errors before proceeding. Run `vendor/bin/phpunit` or `vendor/bin/pest`; enforce 80%+ coverage. Only deliver when both pass clean.

## Reference Guide
Load laravel guidance `references/laravel-patterns.md` when implementing Laravel features.

## Constraints
### MUST DO
- Declare strict types (`declare(strict_types=1)`)
- Use type hints for all properties, parameters, returns
- Follow PSR-12 coding standard unless stated otherwise for a specific convention
- Use 2 spaces per indentation level, no tabs
- Run PHPStan level 9 before delivery
- Use readonly for all properties set only in the constructor and never mutated
- Write PHPDoc blocks for complex logic
- Validate all user input with typed requests
- Use dependency injection over global state

### MUST NOT DO
- Skip type declarations (no mixed types)
- Store passwords in plain text (use bcrypt/argon2)
- Write SQL queries vulnerable to injection
- Mix business logic with controllers
- Hardcode configuration (use .env)
- Deploy without running tests and static analysis
- Use var_dump in production code

## Code Patterns
Every implementation that involve a typed entity/DTO, a service class, and a test can use below example as the baseline structure.


### Service Code Layer

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\DTO\CreateUserDTO;
use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

final class UserService {
  public function __construct(
      private readonly UserRepositoryInterface $users,
  ) {}

  public function create(CreateUserDTO $dto): User {
    return $this->users->create($dto);
  }
}
```

### PHPUnit Test Structure

```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\DTO\CreateUserDTO;
use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use App\Services\UserService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

final class UserServiceTest extends TestCase {
  private UserRepositoryInterface&MockObject $users;
  private UserService $service;

  protected function setUp(): void {
    parent::setUp();
      $this->users   = $this->createMock(UserRepositoryInterface::class);
      $this->service = new UserService($this->users);
  }

  public function testCreateReturnsUser(): void {
    $dto  = new CreateUserDTO('Alice', 'alice@example.com', 'secret');
    $user = new User(['name' => 'Alice', 'email' => 'alice@example.com']);

    $this->users
      ->expects($this->once())
      ->method('create')
      ->willReturn($user);

    $result = $this->service->create($dto);

    $this->assertSame('Alice', $result->name);
  }
}
```

### DTO Structure

```php
<?php

declare(strict_types=1);

namespace App\DTO;

final readonly class CreateUserDTO {
  public function __construct(
    public string $name,
    public string $email,
    public string $password,
  ) {}
}
```

### Enum

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum UserStatus: string {
  case Active   = 'active';
  case Inactive = 'inactive';
  case Banned   = 'banned';

  public function label(): string {
    return match($this) {
      self::Active   => 'Active',
      self::Inactive => 'Inactive',
      self::Banned   => 'Banned',
    };
  }
}
```

## Output Templates

When implementing a feature, deliver in this order:
1. Domain models (model entities, value objects, enums)
2. Data layer (repositories, adapters)
3. Service code layer
4. Controller/API endpoints/Process Trigger Interface (main function)
5. Test files (PHPUnit/Pest)
6. Brief explanation of architecture decisions
