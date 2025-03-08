# Papercut Browser Extension

A browser extension for enhancing design workflow with live editing capabilities.

## Features

- **Live CSS Editing**: Select and modify elements on any webpage in real-time
- **Project Management**: Organize your design changes into projects
- **Version History**: Track changes and create snapshots of your designs
- **Collaboration**: Share projects with team members (coming soon)
- **Supabase Integration**: Cloud storage and authentication for seamless access across devices

## Development

This extension is built using:

- [Plasmo Framework](https://www.plasmo.com/) - Browser extension framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Supabase](https://supabase.io/) - Backend as a Service for authentication and storage

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   PLASMO_PUBLIC_SUPABASE_URL=your_supabase_url
   PLASMO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` directory

### Building for Production

```
npm run build
```

The built extension will be in the `build/chrome-mv3-prod` directory.

## Supabase Setup

This extension requires a Supabase project with the following tables:

### profiles

- id (uuid, primary key, references auth.users.id)
- email (text, not null)
- full_name (text)
- avatar_url (text)
- created_at (timestamp with time zone, default: now())

### projects

- id (uuid, primary key, default: uuid_generate_v4())
- name (text, not null)
- description (text)
- created_at (timestamp with time zone, default: now())
- updated_at (timestamp with time zone, default: now())
- owner_id (uuid, references profiles.id)
- is_public (boolean, default: false)
- thumbnail_url (text)

### project_collaborators

- id (uuid, primary key, default: uuid_generate_v4())
- project_id (uuid, references projects.id)
- user_id (uuid, references profiles.id)
- role (text, not null, check: role in ('viewer', 'editor', 'admin'))
- joined_at (timestamp with time zone, default: now())

### design_changes

- id (uuid, primary key, default: uuid_generate_v4())
- project_id (uuid, references projects.id)
- element_selector (text, not null)
- css_property (text, not null)
- previous_value (text)
- new_value (text, not null)
- created_at (timestamp with time zone, default: now())
- created_by (uuid, references profiles.id)
- snapshot_id (uuid, references design_snapshots.id)

### design_snapshots

- id (uuid, primary key, default: uuid_generate_v4())
- project_id (uuid, references projects.id)
- name (text, not null)
- description (text)
- created_at (timestamp with time zone, default: now())
- created_by (uuid, references profiles.id)
- thumbnail_url (text)

## Testing

The Papercut extension uses Jest for testing. We have a comprehensive test suite that covers utilities, hooks, and components.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Tests are organized alongside the code they test, following this structure:

- `src/utils/__tests__/` - Tests for utility functions
- `src/hooks/__tests__/` - Tests for React hooks
- `src/components/**/__tests__/` - Tests for React components

We provide test helpers to make it easier to test components and hooks that interact with Supabase:

```typescript
// Example: Testing a component that uses Supabase
import { setupOnboardingMocks } from "../../utils/test-helpers"

// In your test
const { supabaseMock, mockProfileQuery } = setupOnboardingMocks({
  profileExists: true,
  onboardingState: {
    completed: false,
    current_step: "welcome",
    steps_completed: []
  }
})

// Now you can use the mocks in your tests
```

For more details on testing, see the [TESTING.md](./TESTING.md) file.

## License

MIT
