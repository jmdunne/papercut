# Authentication Testing Utilities

This directory contains utilities for testing the authentication flow in the extension.

## Overview

The authentication testing utilities provide a comprehensive way to test the authentication flow, including session persistence, refresh, and user retrieval. They also include stress testing capabilities to verify the robustness of the authentication system.

## Available Utilities

### 1. Basic Auth Test (`auth-test.ts`)

Tests the basic authentication flow, focusing on session persistence and refresh.

```typescript
import { testAuthFlow } from "./auth-test"

// Run the test
const results = await testAuthFlow()
```

Results include:

- `hasStoredSession`: Whether a session is stored
- `sessionValid`: Whether the session is valid
- `refreshSuccessful`: Whether session refresh was successful
- `userRetrieved`: Whether the user was retrieved
- `timings`: Performance metrics for each operation
- `errors`: Any errors encountered during testing

### 2. Comprehensive Test Suite (`auth-test-suite.ts`)

Provides a more comprehensive test suite with multiple tests and detailed reporting.

```typescript
import { runAuthTestSuite } from "./auth-test-suite"

// Run the test suite
const results = await runAuthTestSuite({
  // Optional: Provide credentials to enable sign-in/out tests
  credentials: { email: "user@example.com", password: "password" },
  runSignInTests: true,
  timeoutMs: 10000
})
```

The test suite includes:

- Supabase initialization test
- Connectivity test
- Session persistence test
- Session refresh test
- User retrieval test
- Complete auth flow test
- Sign out test (if credentials provided)
- Sign in test (if credentials provided)

### 3. Stress Testing (`auth-test-suite.ts`)

Tests the robustness of the authentication system by repeatedly signing in and out.

```typescript
import { runAuthStressTest } from "./auth-test-suite"

// Run the stress test
const results = await runAuthStressTest({
  credentials: { email: "user@example.com", password: "password" },
  iterations: 5,
  delayBetweenMs: 1000
})
```

Stress test results include:

- Overall success status
- Number of iterations completed
- Failures with details
- Average duration of each iteration

## Integration with UI

These testing utilities are integrated into the popup UI, allowing users to run tests directly from the extension interface. The UI provides:

- Test buttons for each type of test
- Detailed results display
- Credential input for sign-in/out tests
- Visual indicators for test success/failure

## Performance Monitoring

All tests include performance monitoring to help identify slow operations and bottlenecks. The `measureAsyncPerformance` utility from `performance.ts` is used to track the execution time of asynchronous operations.

## Timeout Handling

All network requests use the `withTimeout` utility from `supabase.ts` to prevent hanging operations. This ensures that tests will fail gracefully if operations take too long.

## Usage

1. **Basic Testing**: Use `testAuthFlow()` for quick verification of the authentication flow.
2. **Comprehensive Testing**: Use `runAuthTestSuite()` for detailed testing of all authentication components.
3. **Stress Testing**: Use `runAuthStressTest()` to verify the robustness of the authentication system.

## Example

```typescript
// Import the testing utilities
import { testAuthFlow } from "./auth-test"
import { runAuthStressTest, runAuthTestSuite } from "./auth-test-suite"

// Run a basic test
const basicResults = await testAuthFlow()
console.log("Basic test results:", basicResults)

// Run the comprehensive test suite
const suiteResults = await runAuthTestSuite()
console.log("Test suite results:", suiteResults)

// Run a stress test (requires credentials)
const stressResults = await runAuthStressTest({
  credentials: { email: "user@example.com", password: "password" },
  iterations: 3
})
console.log("Stress test results:", stressResults)
```
