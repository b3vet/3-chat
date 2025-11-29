# Usage

## Installation

```bash
# Install all dependencies
pnpm install
```

## Development

```bash
# Start all services (backend + mobile)
pnpm dev

# Start backend only
cd apps/backend && mix phx.server

# Start backend with interactive shell
cd apps/backend && iex -S mix phx.server

# Start mobile only
cd apps/mobile && pnpm expo start

# Start mobile for iOS
cd apps/mobile && pnpm expo run:ios

# Start mobile for Android
cd apps/mobile && pnpm expo run:android

# Start mobile for web
cd apps/mobile && pnpm expo start --web
```

## Code Quality

```bash
# Run Biome checks on all packages
pnpm check

# Format code with Biome
pnpm format

# Run TypeScript type checking
pnpm type-check

# Lint mobile app
cd apps/mobile && pnpm lint
```

## Backend Commands

```bash
cd apps/backend

# Install Elixir dependencies
mix deps.get

# Compile project
mix compile

# Run tests
mix test

# Generate Phoenix secret
mix phx.gen.secret

# Generate Guardian secret
mix guardian.gen.secret

# Build release
mix release
```

## Docker

```bash
# Build and run backend container
docker-compose up -d backend

# Run with PostgreSQL (for future use)
docker-compose --profile with-db up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Type Generation

```bash
# Generate TypeScript types from OpenAPI spec
pnpm generate:types
```

## Build

```bash
# Build all applications
pnpm build

# Build mobile bundle visualizer
cd apps/mobile && pnpm bundle-visualizer
```

## Environment Setup

```bash
# Copy root environment template
cp .env.example .env

# Copy backend environment template
cp apps/backend/.env.example apps/backend/.env

# Copy mobile environment template
cp apps/mobile/.env.example apps/mobile/.env
```

## Mobile Development

```bash
cd apps/mobile

# Clear Expo cache and restart
pnpm expo start --clear

# Open iOS simulator
pnpm expo run:ios --device

# Open Android emulator
pnpm expo run:android --device

# Generate native iOS project
npx expo prebuild --platform ios

# Generate native Android project
npx expo prebuild --platform android
```

## API Health Check

```bash
# Check backend health
curl http://localhost:4000/api/health

# View OpenAPI spec
curl http://localhost:4000/api/openapi
```

## Phoenix Channels (WebSocket)

```
ws://localhost:4000/socket

Channels:
- user:{user_id}      # User-specific events
- chat:{chat_id}      # Direct message channel
- group:{group_id}    # Group message channel
- presence:lobby      # Online presence tracking
```
