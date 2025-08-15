# Loftly

Loftly is an open, cross-platform social media manager for the Fediverse. Connect Mastodon, Pixelfed, Lemmy, and Bluesky accounts in one place — post everywhere at once, track engagement, and manage your online presence without the walled gardens.

## Features

- Cross-posting – Write once, publish to Mastodon, Pixelfed, Lemmy, and Bluesky.
- Scheduling – Plan posts ahead of time (coming soon?).
- History & analytics – View post history and track performance.
- Multiple account support – Switch between personal and professional accounts.
- Custom tiers – Unlock advanced features with subscription plans.

## Tech Stack

- Vue 3
- TypeScript
- Quasar Framework
- Electron (desktop app support)
- Supabase (backend)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Mikey-Dowsett/Loftly.git
cd Loftly
```

2. Install dependencies:
```bash
npm install
```

If you don't have Quasar CLI installed globally, you can do so with:
```bash
npm install -g @quasar/cli
```

3. Create necessary environment variables (create a `.env` file):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_API_URL=your_api_url
```

## Development

### Runs the app in development mode with hot-reload
```bash
quasar dev
```

### Build

### Builds the web version
```bash
quasar build
```

### Builds the Electron desktop app
```bash
quasar build -m electron
```

## Project Structure

- `/src` - Main application source code
- `/src/components` - Vue components
- `/src/pages` - Application pages/routes
- `/src/stores` - State management
- `/src/layouts` - Layout components
- `/public` - Static assets
- `/src-electron` - Electron-specific code

## Contact

- GitHub: [@Mikey-Dowsett](https://github.com/Mikey-Dowsett)