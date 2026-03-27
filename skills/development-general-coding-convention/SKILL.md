---
name: development-general-coding-convention
description: Use for all development related work, including backend, frontend, database, and devops. Enforces consistent naming conventions across the codebase for improved readability and maintainability.
---

# Overview
Development general coding convention, the convention written here is used as baseline for any kind
of software development task, all the conventions can be overridden by specific convention or instruction in the AI skill for specific language, framework, or library.

For example conventions defined in `java-development` skill will override any **overlapping** convention written in the `development-general-coding-convention` skill.

Code examples and snippets syntax in `development-general-coding-convention` are in Java but the principles are aplicable for all programming languages.

### Whitespaces
For line with more than 100 characters: long statements or function/method calls with long multiple parameters must be splitted by newlines. When splitting by new lines, make sure closing brace or bracket is on a new line and the indentation of the closing brace matches the starting statement indentation level.

Goal: To reduce horizontal scrolling and improve readability.

#### Bad Example
```
// BAD: Too long for a single line
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(parameter1, parameter2, parameter3);

// BAD: opening parenthesis does not match the current
// statement starting indentation level.
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(
  parameter1,
  parameter2,
  parameter3);
```

#### Good Example
```
// GOOD
// * Line containing method call with many arguments is splitted into multiple lines
// * Closing parenthesis indentation level matches the starting statement indentation level.
ResultFromExternalLibrary result = this.someExternalLibrary.doSomethingWithParameter(
  parameter1,
  parameter2,
  parameter3
);
```

### Builder pattern
Create DTO pattern for method or function with more than >= 2 parameters.
* For Java you must use lombok plugin to automatically create builder for you,
* For Javascript can use plain javascript object
* for other language without lombok equivalent can just use `new` instance syntax.

#### Bad Example
```j
// :')
AnnuityCalculator.calculate(100000, 0.1, 3);


// It's arguable that 2-parameter method to use Builder pattern,
// but consider this method, which one is the discount? first one or 2nd one?
// by convention it should be 120000 and amount should be named purchaseAmount,
// but it doesn't prevent engineer to do this kind of mistake.
DiscountCalculator.subtractDiscount(amount, 120000)
```

#### Good Example
```
// Yes it's longer, but it's easier to understand what are the parameters and it fixes
// the possibility of bug because of wrong parameter ordering
// e.g. AnnuityCalculator.calculate(3, 0.1, 100000);
AnnuityCalculator.calculate(
  FooBarInput
    .builder()
    .principal(100000)
    .interestRate(0.1)
    .tenure(3)
    .build()
);
```

### Guard Pattern
Only a few language like swift has `guard` statement for control flow, in other language you could emulate the same with `if` statement language at the start of the flow to check whether we need to do early return or preventing something to happen. The goal is to reduce nested if statements that makes it harder to follow the logic.


#### Bad Example
```
// BAD: The business logic is inside 2 levels of if statement
if (data is valid) {
  if (discount != 0) {
      // Business Logic here
      return bla bla;
  } else {
      // Another business logic logic
      return bla bla;
  }
} else {
  // Throw error
}
```

#### Good Example

```
// GOOD: The business logic is not in nested if statement, it's easier to follow the flow of the logic
if (!valid) { // Guard here
  // Throw error
}

if (discount != 0) {
  // Logic here
  return bla bla;
}

// Main logic here
return bla bla;
```

### Naming convention for iterable `Array`, `List`, `Set`
Use plural noun

#### Bad Example
```
Array<Post> post
List<User> user
```

#### Good Example
```
Array<Post> posts
List<User> user
Set<String> names
```


### Naming convention for `Map` or `Dictionary` type
Use `{value}By{Key}` format for `Map` / `Dictionary` type

#### Bad Example
```
Map<String, User> users
Map<String, List<User>> users
```

#### Good Example
```
Map<String, User> userByEmail // If we supply email as key, we will get a user
Map<String, List<User>> usersByCity // If we supply city as key, we will get a list of users

```

### Comments
* Always use capital letter to start a new sentence
* Add one space between comment marker and the comment itself

#### Bad Example
```
//This is a comment
// this is a comment
```

#### Good Example
```
// This is a comment.
// Another comment.
```
