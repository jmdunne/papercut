import { test, expect } from "@playwright/test";

/**
 * E2E test for the home page
 * Tests basic navigation and interaction with the hero section
 */
test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page has loaded by checking for critical elements
    await expect(
      page.getByRole("heading", {
        name: /design directly on your live website/i,
      })
    ).toBeVisible();
    await expect(page.getByText(/introducing papercut/i)).toBeVisible();
  });

  test("should activate design mode when clicking sandbox demo button", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click the "Try Sandbox Demo" button
    await page.getByRole("button", { name: /try sandbox demo/i }).click();

    // Verify design mode is activated (check for the appearance of design mode UI elements)
    // Note: This is a simplified example, you'll need to adjust this based on your actual UI
    await expect(page.getByTestId("design-mode-toolbar")).toBeVisible({
      timeout: 2000,
    });
  });

  test("should navigate to how it works section when clicking the link", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click the "See How It Works" button
    await page.getByRole("button", { name: /see how it works/i }).click();

    // Verify navigation to the how it works section
    // This assumes the button scrolls to a section with an ID or navigates to a new page
    // Adjust based on your actual implementation
    await expect(page).toHaveURL(/#how-it-works/);
    // Or check for visibility of the section
    await expect(page.getByTestId("how-it-works-section")).toBeVisible();
  });

  test("should be responsive across different screen sizes", async ({
    page,
  }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify mobile layout adjustments (this will depend on your responsive design)
    await expect(
      page.getByRole("heading", {
        name: /design directly on your live website/i,
      })
    ).toBeVisible();

    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Verify tablet layout adjustments
    await expect(
      page.getByRole("heading", {
        name: /design directly on your live website/i,
      })
    ).toBeVisible();

    // Test on desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Verify desktop layout adjustments
    await expect(
      page.getByRole("heading", {
        name: /design directly on your live website/i,
      })
    ).toBeVisible();
  });
});
