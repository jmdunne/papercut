# Testing Documentation

This directory contains all the unit and integration tests for the Papercut web application.

## Directory Structure

- `components/`: Tests for React components
- `hooks/`: Tests for custom React hooks
- `contexts/`: Tests for React contexts
- `integration/`: Tests for multiple components working together

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- path/to/file.test.tsx

# Run tests matching a pattern
npm run test -- -t "pattern"
```

## Writing Unit Tests

### Component Test Template

```tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { YourComponent } from "@/components/your-component";

// Mock any dependencies if needed
jest.mock("@/contexts/some-context", () => ({
  useSomeContext: jest.fn(),
}));

describe("YourComponent", () => {
  // Setup mocks before each test if needed
  beforeEach(() => {
    // Setup mocks
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with default props", () => {
    render(<YourComponent />);

    // Assertions based on expected rendered output
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  test("handles user interactions correctly", () => {
    const handleClick = jest.fn();
    render(<YourComponent onClick={handleClick} />);

    // Simulate user interaction
    fireEvent.click(screen.getByRole("button"));

    // Assertions based on expected behavior
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies different styling based on props", () => {
    const { rerender } = render(<YourComponent variant="primary" />);

    // Assertions for primary variant
    expect(screen.getByTestId("component")).toHaveClass("primary");

    // Rerender with different props
    rerender(<YourComponent variant="secondary" />);

    // Assertions for secondary variant
    expect(screen.getByTestId("component")).toHaveClass("secondary");
  });

  // Add more test cases as needed
});
```

### Hook Test Template

```tsx
import { renderHook, act } from "@testing-library/react-hooks";
import { useYourHook } from "@/hooks/your-hook";

describe("useYourHook", () => {
  test("initializes with correct initial state", () => {
    const { result } = renderHook(() => useYourHook(initialValue));

    expect(result.current.state).toEqual(expectedInitialState);
  });

  test("updates state correctly when action is called", () => {
    const { result } = renderHook(() => useYourHook(initialValue));

    act(() => {
      result.current.action(newValue);
    });

    expect(result.current.state).toEqual(expectedNewState);
  });

  // Add more test cases as needed
});
```

## Testing Best Practices

### Do's

1. **Write Tests First**: Follow TDD principles when possible.
2. **Test Component Behavior, Not Implementation**: Focus on what the component does, not how it does it.
3. **Use Appropriate Queries**: Prefer queries that reflect how users interact with your UI:
   - `getByRole` (most preferred)
   - `getByLabelText` (for form fields)
   - `getByText` (for non-interactive elements)
   - `getByTestId` (as a last resort)
4. **Test Edge Cases**: Empty states, error conditions, boundary values.
5. **Keep Tests Isolated**: Each test should be independent and not rely on the state from previous tests.
6. **Use Descriptive Test Names**: Make it clear what's being tested and the expected outcome.

### Don'ts

1. **Don't Test Implementation Details**: Avoid testing internal component state or methods directly.
2. **Don't Over-Mock**: Only mock what's necessary; prefer testing real behavior when possible.
3. **Don't Write Brittle Tests**: Tests should not break when making unrelated changes to the component.
4. **Don't Duplicate Component Logic in Tests**: If you find yourself duplicating component logic in tests, your tests may be too focused on implementation.
5. **Don't Ignore Test Failures**: A failing test indicates a regression or an outdated test; never ignore it.

## Mocking

### External Dependencies

Use Jest's mocking system to mock external dependencies:

```tsx
// Mocking a context
jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { id: "123", name: "Test User" },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mocking API requests
jest.mock("@/lib/api", () => ({
  fetchData: jest.fn().mockResolvedValue({ success: true, data: [] }),
}));
```

### Time-Based Testing

For testing time-dependent code:

```tsx
// Mock timers
jest.useFakeTimers();

test("should update after delay", () => {
  render(<DelayedComponent />);

  // Fast-forward time
  jest.advanceTimersByTime(1000);

  // Assert on the changed state
  expect(screen.getByText("Updated")).toBeInTheDocument();
});

// Reset timers after test
jest.useRealTimers();
```

## Continuous Integration

Tests are automatically run as part of our CI/CD pipeline on every pull request and push to the main branch. All tests must pass before code can be merged.

See the GitHub Actions workflow configuration in `.github/workflows/ci.yml` for more details.
