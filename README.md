# 3-Chat

An extravagant, visually extraordinary messaging application that reimagines the chat experience with creative and unconventional UI/UX while maintaining robust real-time communication features.

## Features

**Communication**
- One-to-one and group messaging with real-time delivery
- Voice recording with animated waveform visualization
- Media sharing (images, videos, audio, documents)
- Real-time typing indicators and online presence

**Extravagant Visual Effects**
- 5 immersive themes: Cyberpunk, Aurora, Ocean, Space, Retro Wave
- Animated message status indicators (glowing orbs, sparkles, burst effects)
- Background particle systems with Skia canvas rendering
- Glassmorphism UI components with shimmer animations
- Fluid tab bar with portal transitions

**Security**
- Phone number authentication with OTP verification
- JWT-based session management with Guardian
- Rate limiting on all endpoints

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.82, React 19, Expo SDK 54, Tamagui 1.138, Reanimated 4, Skia 2 |
| Backend | Elixir 1.19, Phoenix 1.8, Guardian, ETS (in-memory storage) |
| Real-time | Phoenix Channels with WebSocket |
| State | Jotai with TanStack Query |
| Build | Turborepo, pnpm |
| Code Quality | Biome |

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Elixir >= 1.19 (for backend development)
- Erlang/OTP >= 28 (for backend development)
- Docker (optional, for containerized backend)

## Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd 3-chat
pnpm install

# Backend setup (apps/backend)
cd apps/backend
cp .env.example .env
mix deps.get

# Mobile setup (apps/mobile)
cd ../mobile
cp .env.example .env
```

## Quick Start

```bash
# Start all services (from root)
pnpm dev

# Or individually:
# Backend: cd apps/backend && mix phx.server
# Mobile: cd apps/mobile && pnpm expo start
```

## Architecture

```
3-chat/
├── apps/
│   ├── backend/          # Elixir/Phoenix API server
│   │   ├── lib/
│   │   │   ├── three_chat/           # Business logic
│   │   │   │   ├── storage/          # ETS-based storage modules
│   │   │   │   ├── sms/              # OTP delivery providers
│   │   │   │   └── media/            # File upload handling
│   │   │   └── three_chat_web/       # HTTP/WebSocket layer
│   │   │       ├── channels/         # Phoenix Channels
│   │   │       └── controllers/      # REST API endpoints
│   │   └── config/
│   └── mobile/           # React Native/Expo mobile app
│       ├── app/                      # Expo Router screens
│       │   ├── (auth)/               # Authentication flow
│       │   ├── (tabs)/               # Main tab navigation
│       │   ├── chat/                 # Chat screens
│       │   └── group/                # Group screens
│       └── src/
│           ├── components/
│           │   ├── animated/         # Portal, elastic, fluid animations
│           │   ├── chat/             # Message bubbles, status indicators
│           │   ├── media/            # Voice recorder, image picker
│           │   ├── particles/        # Background effects, message particles
│           │   └── ui/               # Glass cards, neon text
│           ├── services/             # API, Phoenix client, haptics, sound
│           ├── stores/               # Jotai atoms
│           └── themes/               # 5 extravagant theme configurations
├── packages/
│   ├── types/            # Shared TypeScript definitions
│   └── constants/        # Shared constants
└── docker-compose.yml    # Container orchestration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with phone number |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/login` | Login |
| GET | `/api/users/profile` | Get user profile |
| GET/POST | `/api/friends` | Manage friends |
| GET/POST | `/api/messages` | Send/retrieve messages |
| GET/POST | `/api/groups` | Manage groups |
| POST | `/api/media/upload` | Upload media files |
| POST | `/api/media/voice` | Upload voice notes |

## Environment Variables

**Backend (`apps/backend/.env`)**
```
SECRET_KEY_BASE=<64+ character secret>
GUARDIAN_SECRET=<32+ character secret>
SMS_PROVIDER=console|textbelt
PORT=4000
```

**Mobile (`apps/mobile/.env`)**
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_WS_URL=ws://localhost:4000/socket
```

## License

[Polyform Noncommercial 1.0.0](LICENSE) - Free for personal and non-commercial use. Commercial use requires a separate license.
