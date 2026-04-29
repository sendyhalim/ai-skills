# Implementation Example: Java (Spring Boot)

The reference here is in Java Spring Boot, but the patterns are applicable to other languages as well.
Use case: user registration with email and password.

---

## Domain Model

```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String name;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected User() {}

  public User(String email, String name, String passwordHash) {
    this.email        = email;
    this.name         = name;
    this.passwordHash = passwordHash;
    this.createdAt    = Instant.now();
  }

  public Long    getId()           { return id; }
  public String  getEmail()        { return email; }
  public String  getName()         { return name; }
  public String  getPasswordHash() { return passwordHash; }
  public Instant getCreatedAt()    { return createdAt; }
}
```

---

## Data Layer

### Interface

```java
public interface UserRepository {
  boolean existsByEmail(String email);
  User save(User user);
}
```

### Concrete Implementation

```java
// Spring Data JPA backing interface — framework generates SQL
public interface JpaUserRepository extends JpaRepository<User, Long> {
  boolean existsByEmail(String email);
}

// Adapter that satisfies UserRepository contract using JPA
@Repository
public class PostgresUserRepository implements UserRepository {
  private final JpaUserRepository jpa;

  public PostgresUserRepository(JpaUserRepository jpa) {
    this.jpa = jpa;
  }

  @Override
  public boolean existsByEmail(String email) {
    return jpa.existsByEmail(email);
  }

  @Override
  public User save(User user) {
    return jpa.save(user);
  }
}
```

---

## Service Layer

```java
@Service
public class UserRegistrationService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserRegistrationService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository  = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public User register(UserRegistrationData data) {
    if (userRepository.existsByEmail(data.email())) {
      throw new EmailAlreadyRegisteredException(data.email());
    }

    String passwordHash = passwordEncoder.encode(data.password());
    User newUser = new User(data.email(), data.name(), passwordHash);
    return userRepository.save(newUser);
  }
}
```

### Plain Data Object (passed from Protocol → Service)

```java
// Record carries only primitives/strings — no HTTP or framework types leak into service layer
public record UserRegistrationData(String email, String name, String password) {}
```

### Domain Exceptions

```java
public class EmailAlreadyRegisteredException extends RuntimeException {
  public EmailAlreadyRegisteredException(String email) {
    super("Email is already registered: " + email);
  }
}
```

---

## Protocol Layer

```java
@RestController
@RequestMapping("/users")
public class UserRegistrationController {
  private final UserRegistrationService userRegistrationService;

  public UserRegistrationController(UserRegistrationService userRegistrationService) {
    this.userRegistrationService = userRegistrationService;
  }

  @PostMapping("/register")
  public ResponseEntity<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
    UserRegistrationData data = new UserRegistrationData(
      request.email(),
      request.name(),
      request.password()
    );

    User user = userRegistrationService.register(data);
    return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponse(user.getId(), user.getEmail(), user.getName()));
  }
}
```

### Request / Response DTOs

```java
// Validation annotations live here — not in the service layer
public record RegisterRequest(
  @NotBlank @Email String email,
  @NotBlank        String name,
  @NotBlank @Size(min = 8) String password
) {}

public record UserResponse(Long id, String email, String name) {}
```

### Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(EmailAlreadyRegisteredException.class)
  public ResponseEntity<ErrorResponse> handleEmailConflict(EmailAlreadyRegisteredException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
      .body(new ErrorResponse(ex.getMessage()));
  }
}

public record ErrorResponse(String message) {}
```

---

## Unit Test (Service Layer)

```java
@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceTest {

  @Mock UserRepository userRepository;
  @Mock PasswordEncoder passwordEncoder;

  @InjectMocks UserRegistrationService userRegistrationService;

  private static final UserRegistrationData DATA =
    new UserRegistrationData("alice@example.com", "Alice", "s3cr3tpassword");

  @Test
  void register_savesUser_whenEmailIsNew() {
    when(userRepository.existsByEmail(DATA.email())).thenReturn(false);
    when(passwordEncoder.encode(DATA.password())).thenReturn("hashed");

    User saved = new User(DATA.email(), DATA.name(), "hashed");
    when(userRepository.save(any(User.class))).thenReturn(saved);

    User result = userRegistrationService.register(DATA);

    assertThat(result.getEmail()).isEqualTo(DATA.email());
    verify(userRepository).save(any(User.class));
  }

  @Test
  void register_throwsEmailAlreadyRegistered_whenEmailExists() {
    when(userRepository.existsByEmail(DATA.email())).thenReturn(true);

    assertThatThrownBy(() -> userRegistrationService.register(DATA))
      .isInstanceOf(EmailAlreadyRegisteredException.class)
      .hasMessageContaining(DATA.email());

    verify(userRepository, never()).save(any());
  }
}
```

---

## Notes

- `PasswordEncoder` should be BCrypt (Spring Security's `BCryptPasswordEncoder`) — never store plain-text passwords.
- Validation annotations (`@NotBlank`, `@Email`, `@Size`) belong in the request DTO, not in the service layer.
- The controller maps HTTP concerns; the service maps business concerns — keep them separate.
- `UserRegistrationData` record ensures no HTTP or framework types bleed into the service layer.
