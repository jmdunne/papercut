---
name: Bug report
about: Create a report to help us improve
title: "[BUG] "
labels: bug, needs-triage
assignees: ""
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Current Behavior

A clear and concise description of what actually happens.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Test Case

Please provide a minimal test case that reproduces the issue. This will help us fix the bug faster and ensure we have proper test coverage to prevent regression.

```tsx
// Example test case that shows the issue
test("reproduction of bug", () => {
  render(<Component prop="value" />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("expected text")).toBeInTheDocument(); // This fails
});
```

## Environment

- Device: [e.g. Desktop, iPhone 12]
- OS: [e.g. macOS, Windows, iOS]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 22]
- React/Next.js version: [e.g. Next.js 14.0.4]

## Additional Context

Add any other context about the problem here.

## Impact

- [ ] Critical (application crash, data loss, security vulnerability)
- [ ] Major (functionality broken, no workaround)
- [ ] Moderate (functionality broken but has workaround)
- [ ] Minor (cosmetic issue, doesn't affect core functionality)
