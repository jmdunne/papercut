# GitHub Actions Workflows

This document provides information about the GitHub Actions workflows configured for the Papercut browser extension project.

## Available Workflows

### 1. Test Workflow (`test.yml`)

Runs automatically on pushes to `main` branch and pull requests to `main` branch.

**Features:**

- Runs the test suite
- Performs linting and type checks
- Generates test coverage reports
- Uploads coverage to Codecov (if configured)

**Trigger:**

- Push to `main` branch
- Pull request to `main` branch

### 2. Build Workflow (`build.yml`)

Builds the extension for deployment. Runs automatically on pushes to `main` branch and on tags starting with `v` (e.g., `v1.0.0`).

**Features:**

- Builds the extension
- Packages the extension into zip files for Chrome and Firefox (if applicable)
- Uploads the build artifacts

**Trigger:**

- Push to `main` branch
- Tags starting with `v`
- Manual trigger via workflow_dispatch

### 3. Submit Workflow (`submit.yml`)

Submits the extension to browser extension stores using Plasmo's Browser Platform Publish action.

**Features:**

- Builds and packages the extension
- Publishes to browser extension stores (requires `SUBMIT_KEYS` secret)
- Updates GitHub release with artifacts (for release triggers)

**Trigger:**

- Manual trigger via workflow_dispatch
- GitHub release publication

### 4. Preview Workflow (`preview.yml`)

Generates preview builds for pull requests to facilitate easier testing and review.

**Features:**

- Builds and packages the extension
- Uploads preview build as an artifact
- Comments on the PR with instructions for testing the preview build

**Trigger:**

- Pull request to `main` branch

## Secrets Configuration

The following secrets need to be configured in the GitHub repository settings:

1. `PLASMO_PUBLIC_SUPABASE_URL`: Your Supabase project URL (from your .env file)
2. `PLASMO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (from your .env file)
3. `SUBMIT_KEYS`: JSON object containing browser store credentials (see details below)

### SUBMIT_KEYS Format

The `SUBMIT_KEYS` secret should be a JSON object with the following structure:

```json
{
  "$schema": "https://raw.githubusercontent.com/PlasmoHQ/bpp/v3/keys.schema.json",
  "chrome": {
    "clientId": "YOUR_CHROME_CLIENT_ID",
    "refreshToken": "YOUR_CHROME_REFRESH_TOKEN",
    "extId": "YOUR_CHROME_EXTENSION_ID",
    "clientSecret": "YOUR_CHROME_CLIENT_SECRET"
  },
  "firefox": {
    "apiKey": "YOUR_FIREFOX_API_KEY",
    "apiSecret": "YOUR_FIREFOX_API_SECRET",
    "extId": "YOUR_FIREFOX_EXTENSION_ID"
  },
  "edge": {
    "clientId": "YOUR_EDGE_CLIENT_ID",
    "clientSecret": "YOUR_EDGE_CLIENT_SECRET",
    "productId": "YOUR_EDGE_PRODUCT_ID",
    "accessTokenUrl": "https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token"
  }
}
```

Only include the browser stores that you intend to publish to.

## Usage

### Creating a Release

1. Create a new tag following semantic versioning (e.g., `v1.0.0`)
2. Create a GitHub release for that tag
3. The `submit.yml` workflow will automatically trigger, building and publishing the extension

### Manual Publish

If you need to publish the extension without creating a new release:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Submit to Web Store" workflow
3. Click "Run workflow"
4. Select the branch to build from
5. Click "Run workflow" to start the process

### Testing Pull Requests

For each pull request to the `main` branch:

1. The `test.yml` workflow will run tests, linting, and type checks
2. The `preview.yml` workflow will create a preview build
3. A comment will be added to the PR with instructions on how to test the preview build
