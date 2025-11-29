# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3-Chat is a visually extravagant messaging application built as a monorepo:
- **Backend**: Elixir/Phoenix API with real-time WebSocket support (ETS storage, designed for PostgreSQL migration)
- **Mobile**: React Native/Expo with 5 animated themes and particle effects
- **Shared**: TypeScript types generated from backend OpenAPI spec

## Development Commands

### Quick Start
```bash
pnpm install                    # Install all dependencies
pnpm dev                        # Start all services (backend + mobile)
```

### Backend (apps/backend)
```bash
mix deps.get                    # Install Elixir dependencies
mix phx.server                  # Start development server
iex -S mix phx.server           # Start with interactive shell
mix test                        # Run tests
mix format                      # Format Elixir code
mix phx.gen.secret              # Generate Phoenix secret
mix guardian.gen.secret         # Generate Guardian JWT secret
```

### Mobile (apps/mobile)
```bash
pnpm expo start                 # Start Expo development server
pnpm expo start --clear         # Start with cleared cache
pnpm expo run:ios               # Run on iOS simulator
pnpm expo run:android           # Run on Android emulator
```

### Code Quality (from root)
```bash
pnpm check                      # Biome lint + format check
pnpm format                     # Format with Biome
pnpm type-check                 # TypeScript type checking
pnpm generate:types             # Regenerate TS types from OpenAPI (requires running backend)
```

### Docker
```bash
docker-compose up -d backend    # Start backend container
docker-compose logs -f backend  # View logs
```

## Architecture

### Backend Structure (apps/backend/lib/)
- `three_chat/` - Business logic contexts: `accounts.ex`, `chat.ex`, `groups.ex`, `media.ex`
- `three_chat/storage/` - ETS GenServer modules (Users, Messages, Groups, Friendships, OTP, Media)
- `three_chat/sms/` - SMS provider abstraction (Console for dev, Textbelt for prod)
- `three_chat_web/` - HTTP/WebSocket layer (controllers, channels, plugs, router)

### Mobile Structure (apps/mobile/)
- `app/` - Expo Router file-based routing: `(auth)/` for auth flow, `(tabs)/` for main navigation
- `src/components/` - UI organized by domain: `animated/`, `chat/`, `media/`, `particles/`, `ui/`
- `src/services/` - API client (ky), Phoenix WebSocket, secure storage, haptics, sound
- `src/stores/` - Jotai atoms for state management
- `src/themes/` - 5 theme configurations (Cyberpunk, Aurora, Ocean, Space, Retro Wave)

### Real-Time Communication
WebSocket via Phoenix Channels at `ws://localhost:4000/socket`:
- `user:{user_id}` - User-specific events
- `chat:{chat_id}` - Direct messages (chat_id format: "user1_id:user2_id")
- `group:{group_id}` - Group messages
- `presence:lobby` - Online presence tracking

## Key Patterns

### Backend
- **Context modules**: Business logic in `ThreeChat.Accounts`, `ThreeChat.Chat`, `ThreeChat.Groups`, `ThreeChat.Media`
- **Storage abstraction**: GenServer modules wrap ETS tables, designed for easy PostgreSQL migration
- **Guardian auth**: JWT tokens via pluggable authentication pipeline
- **Rate limiting**: Hammer library with per-endpoint configuration

### Frontend
- **Atomic state**: Jotai atoms for minimal re-renders
- **Service layer**: API calls, WebSocket, storage separated from components
- **Tamagui theming**: Runtime theme switching without app restart

## Environment Variables

Required `.env` files (copy from `.env.example`):
- `apps/backend/.env`: `SECRET_KEY_BASE`, `GUARDIAN_SECRET`, `SMS_PROVIDER`
- `apps/mobile/.env`: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`

## Useful URLs (local development)
- API Health: http://localhost:4000/api/health
- OpenAPI Spec: http://localhost:4000/api/openapi
- Live Dashboard: http://localhost:4000/dev/dashboard (dev only)