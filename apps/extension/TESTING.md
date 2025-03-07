# Testing Guide for Papercut Extension

This document provides instructions on how to run and write tests for the Papercut extension.

## Running Tests

The Papercut extension uses Jest for testing. The following npm scripts are available for running tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test, following this structure:

- `src/utils/__tests__/` - Tests for utility functions
- `src/hooks/__tests__/` - Tests for React hooks
- `src/components/**/__tests__/` - Tests for React components

## Writing Tests

### Utility Tests

For utility functions, focus on testing the logic with different inputs and edge cases:

```typescript
// Example test for a utility function
import { myUtility } from "../myUtility"

describe("myUtility", () => {
  it("should handle normal input", () => {
    expect(myUtility("normal input")).toBe("expected output")
  })

  it("should handle edge cases", () => {
    expect(myUtility("")).toBe("default output")
  })
})
```

### Hook Tests

For testing hooks, use the `@testing-library/react-hooks` package:

```typescript
// Example test for a custom hook
import { act, renderHook } from "@testing-library/react"

import { useMyHook } from "../useMyHook"

describe("useMyHook", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(initialValue)
  })

  it("should update state when action is called", async () => {
    const { result } = renderHook(() => useMyHook())

    await act(async () => {
      await result.current.updateValue("new value")
    })

    expect(result.current.value).toBe("new value")
  })
})
```

### Component Tests

For testing components, use `@testing-library/react`:

```typescript
// Example test for a component
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });

  it('should handle button click', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Mocking Dependencies

### Mocking Modules

Use Jest's mocking capabilities to mock dependencies:

```typescript
// Mock a module
jest.mock("../myDependency", () => ({
  myFunction: jest.fn()
}))

// Mock a hook
jest.mock("../useMyHook", () => ({
  useMyHook: jest.fn()
}))
```

### Mocking Browser APIs

The `setupTests.ts` file includes mocks for common browser APIs like `localStorage` and the Chrome extension API. If you need to mock additional APIs, add them to this file.

## Test Coverage

We aim for at least 70% test coverage across the codebase. You can check the current coverage by running:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory.

## Continuous Integration

Tests are automatically run in CI when you push to the repository. Make sure all tests pass before submitting a pull request.

## Troubleshooting

If you encounter issues with tests:

1. Make sure all dependencies are installed
2. Check that you're mocking all external dependencies
3. Verify that your component is rendering as expected
4. Use `console.log` in tests to debug (these are suppressed in the test output)

For more help, consult the [Jest documentation](https://jestjs.io/docs/getting-started) and [Testing Library documentation](https://testing-library.com/docs/).
