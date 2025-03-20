# Testing Guidelines and CI/CD Process

This document outlines our testing philosophy, standards, and CI/CD process for the Papercut web application.

## Testing Philosophy

We prioritize thorough testing to ensure high-quality, reliable code that meets our functional requirements and maintains consistent behavior as the application evolves. Our testing approach follows these principles:

- **Test-Driven Development (TDD)**: Write tests before implementing features whenever possible
- **Comprehensive Coverage**: Aim for high test coverage across components, hooks, and utilities
- **Test Pyramid**: Balance unit, integration, and end-to-end tests appropriately
- **Realistic Testing**: Tests should reflect actual user interactions and real-world usage

## Test Types and Tools

### Unit Tests

Unit tests verify that individual functions, components, and modules work correctly in isolation.

- **Framework**: Jest + React Testing Library
- **Location**: `apps/web/__tests__/{components,hooks,contexts}`
- **Naming Convention**: `*.test.tsx` or `*.test.ts`
- **Running Unit Tests**: `cd apps/web && npm run test`

#### Key Guidelines for Unit Tests:

1. Test component rendering, props, state changes, and user interactions
2. Mock external dependencies, API calls, and contexts
3. Test edge cases and error handling
4. Keep tests focused and isolated

Example of a good component test:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  test("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  test("triggers onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies variant and size classes correctly", () => {
    const { rerender } = render(
      <Button variant="outline" size="sm">
        Button
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("variant-outline", "size-sm");

    rerender(
      <Button variant="destructive" size="lg">
        Button
      </Button>
    );
    expect(button).toHaveClass("variant-destructive", "size-lg");
  });
});
```

### Integration Tests

Integration tests verify that multiple units work correctly together.

- **Framework**: Jest + React Testing Library
- **Location**: `apps/web/__tests__/integration`
- **Running Integration Tests**: `cd apps/web && npm run test -- --testPathPattern=integration`

#### Key Guidelines for Integration Tests:

1. Test interactions between components
2. Test page-level functionality
3. Minimize mocking to test real interactions
4. Focus on user workflows and business logic

### End-to-End Tests

E2E tests verify that entire user workflows function correctly in a production-like environment.

- **Framework**: Playwright
- **Location**: `apps/web/e2e`
- **Running E2E Tests**: `cd apps/web && npx playwright test`

#### Key Guidelines for E2E Tests:

1. Focus on critical user journeys
2. Test across different browsers when necessary
3. Verify integration with external services
4. Include visual regression tests for UI components

## CI/CD Pipeline

Our GitHub Actions CI/CD pipeline ensures code quality by running the following jobs:

### 1. Lint

Checks code style and formatting issues:

- ESLint with Next.js configurations
- Automatically runs on every pull request and push to main

### 2. Type Check

Verifies TypeScript types across the codebase:

- Uses `tsc --noEmit` to check for type errors
- Fails if any type errors are found
- Helps catch potential bugs before runtime

### 3. Test

Runs all unit and integration tests:

- Executes against multiple Node.js versions (18.x, 20.x)
- Generates and uploads test coverage reports to Codecov
- Fails if tests don't pass or if coverage drops below threshold

### 4. Build

Ensures the application builds successfully:

- Runs Next.js build process
- Fails if there are any build errors
- Verifies that the app can be compiled for production

### 5. End-to-End Tests

Runs Playwright tests to verify end-to-end functionality:

- Tests critical user flows
- Uploads test reports as artifacts for review
- Only runs after a successful build

## Best Practices for Writing Tests

### Component Testing

1. Test that components render correctly
2. Test user interactions (clicks, inputs, etc.)
3. Test component states (loading, error, success)
4. Test accessibility where applicable

Example:

```tsx
// Testing a modal component
test("opens and closes the modal", () => {
  render(<Modal trigger={<button>Open</button>} />);

  // Modal should be closed initially
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  // Open the modal
  fireEvent.click(screen.getByRole("button", { name: /open/i }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  // Close the modal
  fireEvent.click(screen.getByRole("button", { name: /close/i }));
  await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
});
```

### Hook Testing

1. Test initialization with different parameters
2. Test state changes and transitions
3. Test error handling and edge cases

Example:

```tsx
// Testing a custom hook
import { renderHook, act } from "@testing-library/react-hooks";
import useCounter from "@/hooks/useCounter";

test("should increment and decrement counter", () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);

  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(0);
});
```

### Context Testing

1. Test provider initialization
2. Test context value updates
3. Test consumer behavior with different context values

Example:

```tsx
// Testing a context provider
test("updates theme value when toggleTheme is called", () => {
  const ThemeConsumer = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <div>
        <span data-testid="theme-value">{theme}</span>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  };

  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );

  expect(screen.getByTestId("theme-value")).toHaveTextContent("light");

  fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
  expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
});
```

## Test Coverage

We aim for high test coverage across our codebase:

- **Unit Tests**: Target 90% coverage
- **Integration Tests**: Target critical user flows
- **E2E Tests**: Target core user journeys

Coverage reports are generated during CI runs and can be viewed on Codecov.

## Pull Request Process

For every pull request:

1. Write tests for new features/changes
2. Ensure all existing tests pass
3. Maintain or improve code coverage
4. Address any linting or type issues

The PR cannot be merged until all CI checks pass.

## Troubleshooting Common Test Issues

### Tests Failing in CI but Passing Locally

- Check for environment differences
- Verify dependency versions
- Look for race conditions or timing issues

### Flaky Tests

- Avoid time-dependent tests
- Use `waitFor` and other RTL async utilities
- Mock timers for consistent behavior

### Slow Tests

- Minimize actual DOM rendering when possible
- Mock expensive operations
- Run tests in parallel
