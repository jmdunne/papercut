# Authentication Testing Guide

This guide provides instructions for testing the authentication flow in the Papercut extension.

## Overview

The Papercut extension includes comprehensive testing utilities for verifying the authentication flow. These utilities can help identify issues with session persistence, refresh, and user retrieval.

## Testing Methods

There are three main ways to test the authentication flow:

1. **UI Testing**: Using the built-in test buttons in the extension popup
2. **Command-Line Testing**: Using the provided test scripts
3. **Programmatic Testing**: Importing the test utilities in your code

## UI Testing

The extension popup includes several test buttons for verifying the authentication flow:

### For Unauthenticated Users

1. Open the extension popup
2. You'll see the following test options:
   - **Test Supabase Connection**: Tests basic connectivity to Supabase
   - **Run Auth Test Suite**: Runs a comprehensive test suite
   - **Run Auth Stress Test**: Tests the robustness of the auth flow (requires credentials)

### For Authenticated Users

1. Sign in to the extension
2. Click on the "Authentication Testing" section
3. You'll see the following test options:
   - **Test Auth Flow**: Tests the basic auth flow
   - **Run Auth Test Suite**: Runs a comprehensive test suite
   - **Run Auth Stress Test**: Tests the robustness of the auth flow (requires credentials)

### Interpreting UI Test Results

The test results are displayed directly in the popup with color-coded indicators:

- ✓ Green: Test passed
- ✗ Red: Test failed

Detailed information is provided for each test, including:

- Timing information
- Error messages
- Success/failure status

## Command-Line Testing

You can run the authentication tests from the command line using the provided npm scripts:

```bash
# Run the basic auth test
npm run test:auth:basic

# Run the comprehensive test suite
npm run test:auth:suite --email=user@example.com --password=password

# Run the stress test
npm run test:auth:stress --email=user@example.com --password=password --iterations=3
```

### Custom Command-Line Options

You can also run the tests with custom options:

```bash
# Run with custom timeout
npm run test:auth:suite -- --timeoutMs=15000

# Run with specific credentials
npm run test:auth:stress -- --email=user@example.com --password=password --iterations=5 --delayBetweenMs=2000
```

## Programmatic Testing

You can import the test utilities in your code and run them programmatically:

```typescript
import { testAuthFlow } from "../utils/auth-test"
import { runAuthStressTest, runAuthTestSuite } from "../utils/auth-test-suite"

// Run the basic auth test
const basicResults = await testAuthFlow()

// Run the comprehensive test suite
const suiteResults = await runAuthTestSuite({
  credentials: { email: "user@example.com", password: "password" },
  runSignInTests: true,
  timeoutMs: 10000
})

// Run the stress test
const stressResults = await runAuthStressTest({
  credentials: { email: "user@example.com", password: "password" },
  iterations: 3,
  delayBetweenMs: 1000
})
```

## Test Types

### Basic Auth Test

Tests the basic authentication flow, focusing on:

- Session persistence
- Session validity
- Session refresh
- User retrieval

### Comprehensive Test Suite

Provides a more comprehensive test suite with multiple tests:

- Supabase initialization
- Connectivity
- Session persistence
- Session refresh
- User retrieval
- Complete auth flow
- Sign out (if credentials provided)
- Sign in (if credentials provided)

### Stress Test

Tests the robustness of the authentication system by repeatedly signing in and out.

## Troubleshooting

### Common Issues

1. **Timeout Errors**

   - Increase the timeout value using the `timeoutMs` option
   - Check network connectivity
   - Verify Supabase is accessible

2. **Authentication Failures**

   - Verify credentials are correct
   - Check if the user exists in Supabase
   - Verify the user has the necessary permissions

3. **Session Persistence Issues**
   - Check browser storage permissions
   - Clear browser cache and try again
   - Verify the session is being properly stored

### Debugging

The test utilities include extensive logging. To view the logs:

1. Open the browser developer tools (F12)
2. Go to the Console tab
3. Filter for "[DEBUG]", "[TEST]", or "[PERF]" to see relevant logs

## Best Practices

1. **Regular Testing**: Run the auth tests regularly to catch issues early
2. **Comprehensive Testing**: Use all three test types for thorough verification
3. **Stress Testing**: Run stress tests before releases to ensure robustness
4. **Monitoring**: Keep an eye on performance metrics to identify bottlenecks

## Additional Resources

- [Authentication Utilities README](../src/utils/README.md)
- [Supabase Authentication Documentation](https://supabase.io/docs/guides/auth)
- [Chrome Extension Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
