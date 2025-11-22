# Statement of Work: 3-Chat Application

## Executive Summary

3-Chat is an extravagant, visually extraordinary messaging application that reimagines the chat experience with creative and unconventional UI/UX while maintaining robust real-time communication features. Built as a monorepo with an Elixir/Phoenix backend and React Native/Expo frontend, the application prioritizes unique user experience and reliable messaging capabilities.

## Project Overview

### Vision

Create a messaging platform that breaks conventional design patterns while delivering core messaging functionality including real-time communication, media sharing, and group conversations with an emphasis on extraordinary and extravagant user interface design.

### Technology Stack

#### Core Technologies

- **Backend**: Elixir (latest version) with Phoenix Framework
- **Frontend**: React Native with Expo SDK (latest versions)
- **Package Manager**: pnpm (latest version) - used exclusively across the monorepo
- **Runtime**: Node.js (latest LTS version)
- **Real-time**: Phoenix Channels
- **Initial Storage**: In-memory with ETS/Agent
- **Future Storage**: PostgreSQL + Redis
- **Architecture**: Monorepo structure with Turborepo
- **Code Quality**: Biome (no ESLint/Prettier)

#### Backend Dependencies (Elixir/Phoenix)

```elixir
# mix.exs dependencies
defp deps do
  [
    # Core Phoenix
    {:phoenix, "~> 1.7.14"},
    {:phoenix_live_view, "~> 0.20.17"},
    {:phoenix_live_dashboard, "~> 0.8.4"},
    
    # Database & Storage (for future migration)
    {:ecto, "~> 3.11"},
    {:ecto_sql, "~> 3.11"},
    {:postgrex, ">= 0.0.0"},
    
    # Authentication & Security
    {:guardian, "~> 2.3"},
    {:argon2_elixir, "~> 4.0"},
    {:cloak, "~> 1.1"},
    
    # JSON & API
    {:jason, "~> 1.4"},
    {:cors_plug, "~> 3.0"},
    {:open_api_spex, "~> 3.18"},
    
    # File Handling
    {:waffle, "~> 1.1"},
    
    # Rate Limiting
    {:hammer, "~> 6.2"},
    {:hammer_backend_ets, "~> 0.5"},
    
    # Background Jobs
    {:oban, "~> 2.17"},
    
    # Utilities
    {:timex, "~> 3.7"},
    {:uuid, "~> 1.1"},
    
    # Development
    {:phoenix_live_reload, "~> 1.5", only: :dev},
    {:telemetry_metrics, "~> 1.0"},
    {:telemetry_poller, "~> 1.1"}
  ]
end
```

#### Frontend Dependencies (React Native/Expo)

```json
// package.json dependencies
{
  "dependencies": {
    // Core Expo & React Native
    "expo": "~51.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    
    // State Management
    "jotai": "^2.10.0",
    "jotai-tanstack-query": "^0.9.0",
    
    // Navigation
    "expo-router": "~3.5.0",
    "expo-linking": "~6.3.0",
    
    // HTTP & WebSocket
    "ky": "^1.7.0",
    "phoenix": "^1.7.0",
    
    // UI & Styling
    "tamagui": "^1.110.0",
    "@tamagui/animations-react-native": "^1.110.0",
    "@tamagui/config": "^1.110.0",
    "@tamagui/themes": "^1.110.0",
    
    // Animation & Graphics
    "react-native-reanimated": "~3.15.0",
    "@shopify/react-native-skia": "^1.3.0",
    "lottie-react-native": "^6.7.0",
    "moti": "^0.29.0",
    
    // Gesture Handling
    "react-native-gesture-handler": "~2.18.0",
    
    // Forms & Validation
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    
    // Media & Files
    "expo-image": "~1.12.0",
    "expo-image-picker": "~15.0.0",
    "expo-image-manipulator": "~12.0.0",
    "expo-av": "~14.0.0",
    "expo-file-system": "~17.0.0",
    
    // Icons
    "lucide-react-native": "^0.400.0",
    
    // Storage & Security
    "expo-secure-store": "~13.0.0",
    
    // Utilities
    "date-fns": "^3.6.0",
    "expo-haptics": "~13.0.0",
    "expo-font": "~12.0.0",
    "expo-constants": "~16.0.0",
    "expo-device": "~6.0.0",
    "expo-permissions": "~14.4.0",
    
    // TypeScript Types
    "@types/react": "~18.3.0",
    "@types/react-native": "~0.73.0"
  },
  "devDependencies": {
    // Build Tools
    "turbo": "^2.0.0",
    "@biomejs/biome": "^1.8.0",
    "typescript": "~5.6.0",
    
    // Development Tools
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "dotenv": "^16.4.0",
    
    // Type Generation
    "openapi-typescript": "^7.0.0",
    
    // Bundle Analysis
    "expo-bundle-visualizer": "^0.1.0"
  }
}
```

#### Monorepo Configuration

```json
// root package.json
{
  "name": "3-chat",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "biome format --write .",
    "check": "biome check .",
    "type-check": "turbo run type-check"
  }
}
```

## Functional Requirements

### 1. User Authentication & Management

#### 1.1 Registration Flow

- **Required Fields**:
  - Unique username (alphanumeric, 3-20 characters)
  - Phone number (international format validation)
  - Profile display name
- **OTP Verification**:
  - SMS-based OTP authentication
  - Provider-agnostic implementation using adapter pattern
  - Initial provider: Free tier service (e.g., Twilio trial, TextBelt)
  - Hot-swappable provider interface without code changes
  
  ```elixir
  # Example adapter interface
  defmodule ThreeChat.SMS.Adapter do
    @callback send_otp(phone_number :: String.t(), otp :: String.t()) :: {:ok, any()} | {:error, any()}
  end
  ```

#### 1.2 User Profile

- Profile picture upload and storage
- Editable display name
- About/Status message
- Phone number (non-editable after verification)
- Username (unique, editable with restrictions)

### 2. Contact Management

#### 2.1 Friend System

- Add friends via username search
- Add friends via phone number
- Friend request system (pending/accepted/rejected states)
- Friend list with search and filter capabilities
- Optional contact sync from device with permission

#### 2.2 Blocking System

- Block/unblock users
- Blocked users cannot:
  - Send messages
  - See online status
  - View profile updates
  - Add to groups

### 3. Messaging Features

#### 3.1 One-to-One Messaging

- Real-time text message delivery
- Message persistence in database
- Offline message queuing and delivery

#### 3.2 Creative Message Status Indicators

Instead of traditional checkmarks, implement animated, colorful status indicators:

- **Sent**: Glowing orb pulsing in sender’s theme color
- **Delivered**: Orb splits into sparkles that float upward
- **Read**: Sparkles transform into a small firework explosion
- Users can customize their theme color for these animations
- Option to disable animations for battery saving

#### 3.3 Message Actions

- Delete for me (anytime)
- Delete for everyone (within 1 hour)
- Copy message text
- Forward messages
- Reply to specific messages with quote

#### 3.4 Typing Indicators

- Real-time “is typing…” indicator
- Custom animated typing bubble
- 3-second timeout after inactivity

### 4. Group Chat Features

#### 4.1 Group Management

- Create groups (up to 50 members)
- Group name and icon
- Add/remove members (admin only)
- Promote/demote admins
- Leave group functionality
- Delete group (creator only)

#### 4.2 Group Messaging

- All one-to-one messaging features
- Member notifications for joins/leaves
- @mentions with notifications
- Admin-only message option
- Mute notifications per group

### 5. Media & File Sharing

#### 5.1 Supported File Types

- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MOV, AVI
- Audio: MP3, WAV, M4A, voice recordings
- Documents: PDF, DOC, DOCX, TXT, and others
- Maximum file size: 10MB for all types

#### 5.2 Voice Recording

- In-app voice recording with waveform visualization
- Playback controls (play/pause, seek)
- Voice message duration display
- Cancel recording option

#### 5.3 File Storage

- Local filesystem storage in `/app/uploads/` directory
- Organized by date and user: `/YYYY/MM/DD/user_id/`
- Unique filename generation using UUID
- File metadata stored in database
- Future migration path to S3-compatible storage

### 6. Real-time Features

#### 6.1 Online Presence

- Real-time online/offline status
- Last seen timestamp with granularity:
  - “Online” (currently active)
  - “Today at HH:MM”
  - “Yesterday at HH:MM”
  - “Monday at HH:MM” (within week)
  - “MM/DD at HH:MM” (older)
- Privacy settings for last seen visibility

#### 6.2 Phoenix Channels Architecture

```elixir
# Channel structure
UserChannel - Personal notifications and status
ChatChannel:chat_id - Individual chat messages
GroupChannel:group_id - Group chat messages
PresenceChannel - Online/offline tracking
```

### 7. Notifications

#### 7.1 In-App Notifications

- Message received indicators
- Friend request notifications
- Group activity notifications
- System announcements

#### 7.2 Settings

- Global notification toggle
- Per-chat mute options
- Notification sound customization
- Do Not Disturb mode with schedule

## Non-Functional Requirements

### 1. Extravagant UI/UX Design

#### 1.1 Design Philosophy

The application must break conventional chat app design patterns with:

- **Fluid Animations**: Every interaction should have smooth, physics-based animations
- **Particle Effects**: Messages appear/disappear with particle effects
- **Dynamic Backgrounds**: Animated, interactive backgrounds that respond to user actions
- **3D Elements**: Subtle 3D transforms and perspectives on UI elements
- **Glassmorphism**: Frosted glass effects with dynamic blur
- **Neon Aesthetics**: Glowing borders, neon color schemes option
- **Sound Design**: Unique sound effects for all actions (optional)

#### 1.2 Creative UI Elements

- **Message Bubbles**:
  - Morphing shapes based on content
  - Gradient backgrounds that shift with time of day
  - Floating animation while typing
  - Elastic bounce on send/receive
- **Chat List**:
  - Cards that tilt with device gyroscope
  - Ripple effects on touch
  - Stacked card navigation with spring physics
- **Navigation**:
  - Liquid tab bar that flows between selections
  - Gesture-based navigation with visual trails
  - Portal transitions between screens

#### 1.3 Theme System

- Multiple extravagant themes:
  - Cyberpunk (neon colors, glitch effects)
  - Aurora (northern lights animations)
  - Ocean (water ripple effects, bubble particles)
  - Space (floating stars, galaxy backgrounds)
  - Retro Wave (80s aesthetics, synthwave colors)
- Custom theme creator for users
- Dynamic theme that changes with time/weather

### 2. Performance Requirements

#### 2.1 Scalability Targets

- Initial: 10,000 concurrent users
- Architecture supporting horizontal scaling to 100,000+
- Message delivery latency < 100ms for online users
- API response time < 200ms for 95th percentile

#### 2.2 Rate Limiting

- Messages: 100 per minute per user
- Media uploads: 10 per minute per user
- API calls: 1000 per hour per user
- WebSocket connections: 1 per device

### 3. Security

#### 3.1 End-to-End Encryption

- Implement Signal Protocol or similar
- Key exchange via Diffie-Hellman
- Message encryption using AES-256
- Perfect forward secrecy

#### 3.2 Data Protection

- Passwords hashed using Argon2
- JWT tokens for session management
- Rate limiting on all endpoints
- Input validation and sanitization

### 4. Database Architecture

#### 4.1 Initial In-Memory Implementation

```elixir
# Using ETS tables for different entities
:users_table
:messages_table
:groups_table
:media_table
:friendships_table
```

#### 4.2 Migration Path to PostgreSQL

```sql
-- Core schema structure
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID REFERENCES users(id),
    recipient_id UUID,
    group_id UUID,
    content TEXT,
    message_type VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TABLE groups (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    creator_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Additional tables for relationships, media, etc.
```

### 5. API Architecture

#### 5.1 RESTful Endpoints

All endpoints versioned via headers: `API-Version: 1.0.0`

```
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/search

POST   /api/friends/add
GET    /api/friends
DELETE /api/friends/:id

GET    /api/messages/:chat_id
POST   /api/messages
DELETE /api/messages/:id

POST   /api/groups
GET    /api/groups
PUT    /api/groups/:id
POST   /api/groups/:id/members

POST   /api/media/upload
GET    /api/media/:id
```

#### 5.2 WebSocket Events

```javascript
// Client -> Server
"message:send"
"message:delete"
"typing:start"
"typing:stop"
"presence:update"

// Server -> Client
"message:new"
"message:deleted"
"message:status"
"typing:update"
"presence:change"
```

## Technical Implementation Details

### 1. Monorepo Structure

```
3-chat/
├── apps/
│   ├── backend/                    # Elixir/Phoenix application
│   │   ├── config/
│   │   │   ├── config.exs
│   │   │   ├── dev.exs
│   │   │   ├── prod.exs
│   │   │   └── runtime.exs
│   │   ├── lib/
│   │   │   ├── three_chat/
│   │   │   │   ├── accounts/       # User management context
│   │   │   │   ├── chat/          # Messaging context
│   │   │   │   ├── groups/        # Group chat context
│   │   │   │   ├── media/         # File handling context
│   │   │   │   ├── presence/      # Online status context
│   │   │   │   ├── storage/       # In-memory storage modules
│   │   │   │   └── sms/           # SMS adapter modules
│   │   │   ├── three_chat_web/
│   │   │   │   ├── channels/      # Phoenix channels
│   │   │   │   ├── controllers/   # API controllers
│   │   │   │   ├── plugs/         # Custom plugs
│   │   │   │   ├── views/         # JSON views
│   │   │   │   └── router.ex
│   │   │   └── three_chat.ex
│   │   ├── priv/
│   │   │   ├── repo/              # Future migrations
│   │   │   └── static/            # Static assets
│   │   ├── mix.exs
│   │   ├── mix.lock
│   │   └── .env.development
│   └── mobile/                     # React Native/Expo application
│       ├── app/                   # Expo Router file-based routing
│       │   ├── (auth)/            # Auth group routes
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   └── verify-otp.tsx
│       │   ├── (tabs)/            # Tab navigation group
│       │   │   ├── _layout.tsx
│       │   │   ├── chats.tsx
│       │   │   ├── groups.tsx
│       │   │   └── profile.tsx
│       │   ├── chat/
│       │   │   └── [id].tsx      # Dynamic chat route
│       │   ├── group/
│       │   │   └── [id].tsx      # Dynamic group route
│       │   ├── _layout.tsx       # Root layout
│       │   └── index.tsx         # Entry point
│       ├── src/
│       │   ├── components/
│       │   │   ├── animated/      # Reanimated components
│       │   │   ├── chat/          # Chat UI components
│       │   │   ├── particles/     # Skia particle effects
│       │   │   └── ui/            # Tamagui + custom UI
│       │   ├── services/
│       │   │   ├── api.ts         # Ky HTTP client
│       │   │   ├── phoenix.ts     # WebSocket service
│       │   │   └── storage.ts     # Secure storage
│       │   ├── stores/            # Jotai atoms
│       │   │   ├── atoms.ts
│       │   │   ├── userStore.ts
│       │   │   ├── chatStore.ts
│       │   │   └── uiStore.ts
│       │   ├── hooks/             # Custom hooks
│       │   ├── utils/
│       │   ├── themes/            # Theme definitions
│       │   │   ├── tamagui/       # Tamagui themes
│       │   │   └── custom/        # Extravagant themes
│       │   └── types/
│       ├── assets/                # Images, fonts, etc.
│       ├── app.json
│       ├── babel.config.js
│       ├── metro.config.js
│       ├── tsconfig.json
│       ├── package.json
│       └── .env.development
├── packages/                       # Shared packages
│   ├── types/                     # TypeScript definitions
│   │   ├── src/
│   │   │   ├── api.ts            # Generated from OpenAPI
│   │   │   ├── models.ts         # Shared data models
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── constants/                 # Shared constants
│       ├── src/
│       │   └── index.ts
│       └── package.json
├── scripts/                        # Build and utility scripts
│   ├── generate-types.sh
│   └── deploy.sh
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.mobile
│   └── docker-compose.yml
├── .husky/                        # Git hooks
│   └── pre-commit
├── biome.json                     # Biome configuration
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace config
├── .npmrc                         # pnpm configuration
├── package.json                   # Root package.json
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

### 2. Setup and Installation Instructions

#### 2.1 Prerequisites

```bash
# Required tools
- Elixir >= 1.17
- Erlang >= 27
- Node.js >= 20 LTS
- pnpm >= 9.0.0
- Docker & Docker Compose
- iOS Simulator (Mac only) or Android Studio

# Install pnpm globally
npm install -g pnpm@latest
```

#### 2.2 Initial Project Setup

```bash
# Clone repository
git clone https://github.com/your-org/3-chat.git
cd 3-chat

# Install pnpm dependencies for entire monorepo
pnpm install

# Setup git hooks
pnpm run prepare

# Install Turborepo globally (optional, for turbo commands)
pnpm add -g turbo
```

#### 2.3 Backend Setup

```bash
cd apps/backend

# Install Elixir dependencies
mix deps.get

# Compile the project
mix compile

# Copy and configure environment variables
cp .env.development.example .env.development

# Start Phoenix server
mix phx.server
# Or with interactive shell
iex -S mix phx.server
```

#### 2.4 Mobile Setup

```bash
cd apps/mobile

# Install iOS pods (Mac only)
cd ios && pod install && cd ..

# Start Expo development server
pnpm expo start

# Run on specific platform
pnpm expo run:ios
pnpm expo run:android
```

#### 2.5 Development Commands

```bash
# From root directory

# Start all development servers
pnpm dev

# Build all applications
pnpm build

# Run Biome checks
pnpm check

# Format code with Biome
pnpm format

# Type checking
pnpm type-check

# Generate TypeScript types from API
pnpm generate:types

# Analyze bundle size
cd apps/mobile && pnpm expo:bundle-visualizer
```

### 2. Backend Architecture

#### 2.1 Phoenix Application Structure

```elixir
# Core contexts with their responsibilities
ThreeChat.Accounts       # User management, authentication with Guardian
ThreeChat.Chat          # Messaging logic, message queue
ThreeChat.Groups        # Group chat functionality
ThreeChat.Media         # File handling with Waffle
ThreeChat.Presence      # Online status tracking
ThreeChat.RateLimiter   # Rate limiting with Hammer
ThreeChat.Jobs          # Background jobs with Oban

# GenServer for in-memory storage (ETS wrapper)
ThreeChat.Storage.Memory  # Ecto-like interface for seamless migration
```

#### 2.2 SMS Adapter Implementation

```elixir
# lib/three_chat/sms/adapter.ex
defmodule ThreeChat.SMS.Adapter do
  @callback send_otp(phone_number :: String.t(), otp :: String.t()) :: 
    {:ok, any()} | {:error, any()}
end

# lib/three_chat/sms/providers/textbelt.ex
defmodule ThreeChat.SMS.Providers.Textbelt do
  @behaviour ThreeChat.SMS.Adapter
  
  def send_otp(phone_number, otp) do
    # Textbelt implementation
    HTTPoison.post(
      "https://textbelt.com/text",
      Jason.encode!(%{
        phone: phone_number,
        message: "Your 3-Chat OTP is: #{otp}",
        key: get_api_key()
      }),
      [{"Content-Type", "application/json"}]
    )
  end
end

# lib/three_chat/sms/service.ex
defmodule ThreeChat.SMS.Service do
  def send_otp(phone_number, otp) do
    provider().send_otp(phone_number, otp)
  end
  
  defp provider do
    # Dynamically load provider from config
    Application.get_env(:three_chat, :sms_provider, ThreeChat.SMS.Providers.Textbelt)
  end
end
```

#### 2.3 Authentication with Guardian

```elixir
# lib/three_chat/guardian.ex
defmodule ThreeChat.Guardian do
  use Guardian, otp_app: :three_chat
  
  def subject_for_token(user, _claims) do
    {:ok, to_string(user.id)}
  end
  
  def resource_from_claims(%{"sub" => id}) do
    user = ThreeChat.Accounts.get_user(id)
    {:ok, user}
  end
end

# lib/three_chat_web/auth_pipeline.ex
defmodule ThreeChatWeb.AuthPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :three_chat,
    module: ThreeChat.Guardian,
    error_handler: ThreeChatWeb.AuthErrorHandler
    
  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
```

#### 2.4 File Handling with Waffle

```elixir
# lib/three_chat/media/avatar.ex
defmodule ThreeChat.Media.Avatar do
  use Waffle.Definition
  use Waffle.Ecto.Definition
  
  @versions [:original, :thumb]
  @extension_whitelist ~w(.jpg .jpeg .gif .png .webp)
  
  def storage_dir(_version, {_file, user}) do
    "uploads/avatars/#{user.id}"
  end
  
  def transform(:thumb, _) do
    {:convert, "-strip -thumbnail 150x150^ -gravity center -extent 150x150"}
  end
  
  def validate({file, _}) do
    file_extension = file.file_name |> Path.extname() |> String.downcase()
    
    case Enum.member?(@extension_whitelist, file_extension) do
      true -> :ok
      false -> {:error, "Invalid file type"}
    end
  end
end

# lib/three_chat/media/attachment.ex
defmodule ThreeChat.Media.Attachment do
  use Waffle.Definition
  
  @max_file_size 10 * 1024 * 1024  # 10MB
  
  def storage_dir(_version, {_file, scope}) do
    {year, month, day} = :erlang.date()
    "uploads/#{year}/#{month}/#{day}/#{scope.user_id}"
  end
  
  def validate({file, _}) do
    case File.stat(file.path) do
      {:ok, %{size: size}} when size <= @max_file_size -> :ok
      _ -> {:error, "File too large (max 10MB)"}
    end
  end
end
```

#### 2.5 Rate Limiting with Hammer

```elixir
# lib/three_chat/rate_limiter.ex
defmodule ThreeChat.RateLimiter do
  def check_rate(:message, user_id) do
    Hammer.check_rate("message:#{user_id}", 60_000, 100)
  end
  
  def check_rate(:media_upload, user_id) do
    Hammer.check_rate("media:#{user_id}", 60_000, 10)
  end
  
  def check_rate(:api_call, user_id) do
    Hammer.check_rate("api:#{user_id}", 3_600_000, 1000)
  end
end

# lib/three_chat_web/plugs/rate_limit_plug.ex
defmodule ThreeChatWeb.RateLimitPlug do
  import Plug.Conn
  
  def init(opts), do: opts
  
  def call(conn, type: type) do
    user_id = conn.assigns.current_user.id
    
    case ThreeChat.RateLimiter.check_rate(type, user_id) do
      {:allow, _count} ->
        conn
      {:deny, _limit} ->
        conn
        |> put_status(:too_many_requests)
        |> Phoenix.Controller.json(%{error: "Rate limit exceeded"})
        |> halt()
    end
  end
end
```

#### 2.6 Background Jobs with Oban

```elixir
# lib/three_chat/jobs/message_delivery_job.ex
defmodule ThreeChat.Jobs.MessageDeliveryJob do
  use Oban.Worker, queue: :default, max_attempts: 3
  
  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"message_id" => message_id}}) do
    message = ThreeChat.Chat.get_message(message_id)
    
    # Attempt to deliver message via push notification
    case ThreeChat.Push.send_notification(message) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end
end

# lib/three_chat/jobs/media_cleanup_job.ex
defmodule ThreeChat.Jobs.MediaCleanupJob do
  use Oban.Worker, queue: :maintenance
  
  @impl Oban.Worker
  def perform(_job) do
    # Clean up orphaned media files
    ThreeChat.Media.cleanup_orphaned_files()
    :ok
  end
end
```

#### 2.7 Phoenix Channels Implementation

```elixir
# lib/three_chat_web/channels/user_socket.ex
defmodule ThreeChatWeb.UserSocket do
  use Phoenix.Socket
  
  channel "user:*", ThreeChatWeb.UserChannel
  channel "chat:*", ThreeChatWeb.ChatChannel
  channel "group:*", ThreeChatWeb.GroupChannel
  channel "presence:*", ThreeChatWeb.PresenceChannel
  
  def connect(%{"token" => token}, socket, _connect_info) do
    case ThreeChat.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        {:ok, user} = ThreeChat.Guardian.resource_from_claims(claims)
        {:ok, assign(socket, :user_id, user.id)}
      {:error, _reason} ->
        :error
    end
  end
  
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end

# lib/three_chat_web/channels/chat_channel.ex
defmodule ThreeChatWeb.ChatChannel do
  use ThreeChatWeb, :channel
  alias ThreeChat.{Chat, Presence}
  
  def join("chat:" <> chat_id, _params, socket) do
    if authorized?(chat_id, socket.assigns.user_id) do
      send(self(), :after_join)
      {:ok, assign(socket, :chat_id, chat_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end
  
  def handle_info(:after_join, socket) do
    # Track presence
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })
    
    # Send recent messages
    messages = Chat.get_recent_messages(socket.assigns.chat_id)
    push(socket, "messages:history", %{messages: messages})
    
    {:noreply, socket}
  end
  
  def handle_in("message:send", %{"content" => content}, socket) do
    message = Chat.create_message(%{
      sender_id: socket.assigns.user_id,
      chat_id: socket.assigns.chat_id,
      content: content
    })
    
    broadcast!(socket, "message:new", message)
    {:reply, {:ok, message}, socket}
  end
  
  def handle_in("typing:start", _, socket) do
    broadcast_from!(socket, "typing:update", %{
      user_id: socket.assigns.user_id,
      typing: true
    })
    {:noreply, socket}
  end
end
```

#### 2.8 OTP Supervision Tree

```elixir
# lib/three_chat/application.ex
defmodule ThreeChat.Application do
  use Application
  
  def start(_type, _args) do
    children = [
      # Phoenix endpoint
      ThreeChatWeb.Endpoint,
      
      # In-memory storage supervisors
      ThreeChat.Storage.Supervisor,
      
      # Phoenix PubSub
      {Phoenix.PubSub, name: ThreeChat.PubSub},
      
      # Presence tracking
      ThreeChatWeb.Presence,
      
      # Oban job processor
      {Oban, Application.fetch_env!(:three_chat, Oban)},
      
      # Rate limiter backend
      {Hammer.Backend.ETS, [
        ets_table_name: :hammer_rate_limiter,
        cleanup_interval_ms: 60_000 * 10
      ]}
    ]
    
    opts = [strategy: :one_for_one, name: ThreeChat.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### 3. Frontend Architecture

#### 3.1 React Native Structure

```
mobile/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                  # Authentication group
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-otp.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── chats.tsx            # Chat list
│   │   ├── groups.tsx           # Group list
│   │   └── profile.tsx          # User profile
│   ├── chat/
│   │   └── [id].tsx             # Individual chat screen
│   ├── group/
│   │   ├── [id].tsx             # Group chat screen
│   │   └── create.tsx           # Create group
│   ├── settings/
│   │   ├── notifications.tsx
│   │   └── themes.tsx
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Redirect logic
│   └── +not-found.tsx           # 404 handler
├── src/                          # Non-routing code
│   ├── components/
│   │   ├── animated/            # Reanimated components
│   │   ├── chat/               # Chat UI components
│   │   ├── particles/          # Skia particle effects
│   │   └── ui/                 # Tamagui + custom UI
│   ├── services/               # API and WebSocket
│   ├── stores/                 # Jotai atoms
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Helper functions
│   └── themes/                 # Theme definitions
└── assets/                      # Static assets
```

#### 3.2 State Management with Jotai

```typescript
// stores/atoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// User atoms
export const userAtom = atom<User | null>(null);
export const authTokenAtom = atomWithStorage('authToken', '');

// Chat atoms  
export const messagesAtom = atom<Message[]>([]);
export const activeChatsAtom = atom<Chat[]>([]);
export const typingUsersAtom = atom<Map<string, boolean>>(new Map());

// UI atoms
export const themeAtom = atomWithStorage<ThemeName>('theme', 'cyberpunk');
export const animationsEnabledAtom = atomWithStorage('animations', true);

// stores/messageStore.ts
import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';

export const messagesQueryAtom = atomWithQuery((get) => ({
  queryKey: ['messages', get(activeChatIdAtom)],
  queryFn: async ({ queryKey: [, chatId] }) => {
    return ky.get(`/api/messages/${chatId}`).json();
  },
}));
```

#### 3.3 UI Component Architecture

```typescript
// Hybrid UI approach: Tamagui base + Reanimated enhancements

// components/ui/MessageBubble.tsx
import { styled } from '@tamagui/core';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Canvas, Path, LinearGradient } from '@shopify/react-native-skia';

// Tamagui styled component for base structure
const BubbleContainer = styled(View, {
  padding: '$3',
  borderRadius: '$4',
  maxWidth: '80%',
  variants: {
    sender: {
      true: { backgroundColor: '$primary' },
      false: { backgroundColor: '$secondary' },
    },
  },
});

// Enhanced with Reanimated for fluid animations
export const AnimatedMessageBubble = ({ message, isSender }) => {
  const scale = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value) },
      { rotate: `${interpolate(scale.value, [0, 1], [-5, 0])}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <BubbleContainer sender={isSender}>
        {/* Skia canvas for particle effects */}
        <Canvas style={StyleSheet.absoluteFill}>
          {/* Particle effects implementation */}
        </Canvas>
        {message.content}
      </BubbleContainer>
    </Animated.View>
  );
};
```

#### 3.4 Phoenix WebSocket Integration

```typescript
// services/phoenix.ts
import { Socket, Channel } from 'phoenix';
import { useSetAtom } from 'jotai';

class PhoenixService {
  private socket: Socket;
  private channels: Map<string, Channel> = new Map();

  connect(token: string) {
    this.socket = new Socket('ws://localhost:4000/socket', {
      params: { token },
    });
    
    this.socket.connect();
    this.setupChannels();
  }

  private setupChannels() {
    // User channel for personal notifications
    const userChannel = this.socket.channel('user:lobby');
    
    userChannel.on('message:new', (payload) => {
      // Update Jotai atoms
      const setMessages = useSetAtom(messagesAtom);
      setMessages((prev) => [...prev, payload]);
    });

    userChannel.on('presence:update', (payload) => {
      // Update presence atom
    });

    this.channels.set('user', userChannel);
    userChannel.join();
  }

  sendMessage(chatId: string, content: string) {
    const channel = this.channels.get(`chat:${chatId}`);
    channel?.push('message:send', { content });
  }
}

export const phoenixService = new PhoenixService();
```

#### 3.5 Expo Router Implementation

```typescript
// app/_layout.tsx - Root layout with auth check
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai';
import { authTokenAtom } from '@/stores/userStore';
import { phoenixService } from '@/services/phoenix';

export default function RootLayout() {
  const [authToken] = useAtom(authTokenAtom);

  useEffect(() => {
    if (authToken) {
      phoenixService.connect(authToken);
    }
  }, [authToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx - Tab navigation with liquid tab bar
import { Tabs } from 'expo-router';
import { LiquidTabBar } from '@/components/animated/LiquidTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <ChatIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <GroupIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

// app/chat/[id].tsx - Dynamic chat route
import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import { messagesQueryAtom } from '@/stores/messageStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages] = useAtom(messagesQueryAtom(id));
  
  return (
    <ChatContainer>
      <ChatHeader chatId={id} />
      <MessageList messages={messages} />
      <MessageInput chatId={id} />
    </ChatContainer>
  );
}
```

#### 3.6 Key Libraries and Their Usage

- **Animation Stack**:
  - `react-native-reanimated`: Core animation engine for all UI animations
  - `@shopify/react-native-skia`: Advanced graphics and particle effects
  - `lottie-react-native`: Complex pre-built animations for special effects
  - `moti`: Declarative animations for simple transitions
- **UI Framework**:
  - `tamagui`: Base component system with theme support
  - Custom components built on top with Reanimated enhancements
  - Glassmorphism and neon effects using Skia shaders
- **State Management**:
  - `jotai`: Atomic state management
  - `jotai-tanstack-query`: Server state synchronization
  - Phoenix channels for real-time state updates
- **Form Handling**:
  - `react-hook-form`: Form state management
  - `zod`: Schema validation
  - Custom input components with Tamagui + animations

### 4. Deployment Architecture

#### 4.1 Container Configuration

```dockerfile
# Backend Dockerfile
FROM elixir:latest
WORKDIR /app
COPY mix.exs mix.lock ./
RUN mix deps.get
COPY . .
RUN mix compile
CMD ["mix", "phx.server"]
```

#### 4.2 VPS Deployment

- Single VPS initially with Docker Compose
- Nginx reverse proxy for API
- Let’s Encrypt SSL certificates
- Manual deployment initially
- Future: Coolify for deployment management

### 5. Development Workflow

#### 5.1 Git Strategy

- Main branch for production
- Develop branch for integration
- Feature branches for development
- Manual code review process
- Pre-commit hooks with Biome formatting

#### 5.2 Package Management with pnpm

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

#### 5.3 Biome Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingComma": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "quoteStyle": "single"
    },
    "parser": {
      "unsafeParameterDecoratorsEnabled": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noBannedTypes": "error",
        "noUselessTypeConstraint": "error"
      },
      "correctness": {
        "noUnusedVariables": "warn",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "noNegationElse": "off",
        "useConst": "error",
        "useTemplate": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noDoubleEquals": "error"
      }
    },
    "ignore": ["**/node_modules", "**/dist", "**/.expo", "**/coverage"]
  },
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      "build",
      ".turbo",
      ".expo",
      "*.min.js",
      "vendor"
    ]
  }
}
```

#### 5.4 Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "format": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

#### 5.5 Git Hooks Setup

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": [
      "biome check --apply"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run pre-commit
```

#### 5.6 Environment Configuration

```bash
# apps/backend/.env.development
DATABASE_URL=ecto://localhost/threechat_dev
SECRET_KEY_BASE=development_secret_key_at_least_64_chars_long
GUARDIAN_SECRET=guardian_secret_key
SMS_PROVIDER=textbelt
SMS_API_KEY=textbelt_key
STORAGE_PATH=/app/uploads
CORS_ORIGIN=http://localhost:8081

# apps/mobile/.env.development
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_WS_URL=ws://localhost:4000/socket
EXPO_PUBLIC_ENVIRONMENT=development
```

```bash
# apps/backend/.env.production
DATABASE_URL=${DATABASE_URL}
SECRET_KEY_BASE=${SECRET_KEY_BASE}
GUARDIAN_SECRET=${GUARDIAN_SECRET}
SMS_PROVIDER=${SMS_PROVIDER}
SMS_API_KEY=${SMS_API_KEY}
STORAGE_PATH=/var/uploads
CORS_ORIGIN=${FRONTEND_URL}

# apps/mobile/.env.production  
EXPO_PUBLIC_API_URL=${API_URL}
EXPO_PUBLIC_WS_URL=${WS_URL}
EXPO_PUBLIC_ENVIRONMENT=production
```

#### 5.7 TypeScript Configuration

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "moduleResolution": "node",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../../packages/*/src"]
    }
  }
}

// apps/mobile/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-native",
    "types": ["react-native", "jest"]
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

#### 5.8 API Type Generation

```bash
# Script to generate TypeScript types from Phoenix OpenAPI
#!/bin/bash
# scripts/generate-types.sh

# Start Phoenix server in API doc mode
cd apps/backend
mix phx.server &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Generate OpenAPI spec
curl http://localhost:4000/api/openapi > ../../packages/types/openapi.json

# Generate TypeScript types
cd ../../packages/types
pnpm openapi-typescript openapi.json -o src/api.ts

# Kill Phoenix server
kill $SERVER_PID
```

## Future Enhancements (Post-MVP)

### Phase 2 Features

- Voice and video calling (WebRTC)
- Stories/Status feature
- Payment integration
- Encrypted backup to cloud
- Multi-device support
- Push notifications (FCM/APNs)
- Advanced search with filters
- Message reactions
- Location sharing
- Stickers and GIF search

### Infrastructure Improvements

- Kubernetes orchestration
- CI/CD pipeline with GitHub Actions
- Monitoring stack (Prometheus, Grafana, ELK)
- CDN for media delivery
- S3 storage migration
- Database replication
- Rate limiting with Redis
- Caching layer implementation

## Success Metrics

### Technical Metrics

- Message delivery success rate > 99.9%
- API uptime > 99.5%
- Average message latency < 100ms
- WebSocket connection stability > 95%
- Successful OTP delivery rate > 95%

### User Experience Metrics

- App crash rate < 0.5%
- UI animation FPS > 30
- Screen transition time < 300ms
- Media upload success rate > 98%
- Time to first message < 5 seconds after login

## Risk Mitigation

### Technical Risks

1. **In-Memory Storage Limitations**
- Mitigation: Design repository pattern for seamless database migration
- Regular data exports to prevent data loss
1. **WebSocket Scalability**
- Mitigation: Implement connection pooling
- Design for horizontal scaling from start
1. **File Storage Growth**
- Mitigation: Implement file retention policies
- Plan for S3 migration path

### Operational Risks

1. **SMS Provider Failure**
- Mitigation: Adapter pattern for quick provider switching
- Fallback to email verification
1. **Single VPS Failure**
- Mitigation: Regular automated backups
- Quick migration playbook prepared

## Deliverables

### Core Deliverables

1. Fully functional monorepo with both backend and mobile apps
1. Docker containers for deployment
1. Database migration scripts (for future use)
1. API documentation (OpenAPI/Swagger)
1. Deployment instructions
1. Basic admin panel for user management

### Documentation

1. API endpoint documentation
1. WebSocket event documentation
1. Database schema documentation
1. Deployment and configuration guide
1. Theme customization guide

## Implementation Plan for AI Agent Development

This implementation plan is designed for Claude Sonnet 4.5 or similar AI coding agents. Each phase includes specific deliverables, file paths, and success criteria. Complete each phase fully before proceeding to the next.

### Phase 1: Project Foundation & Infrastructure Setup

**Duration:** 1-2 days
**Goal:** Establish the complete monorepo structure with all configurations

#### Deliverables:

1. **Initialize Monorepo Structure**
   
   ```bash
   # Create exact folder structure as specified in Section 1
   mkdir -p 3-chat/{apps/{backend,mobile},packages/{types,constants},scripts,docker}
   ```
1. **Root Configuration Files**
- Create `/package.json` with pnpm workspace configuration
- Create `/pnpm-workspace.yaml` with packages definition
- Create `/turbo.json` with build pipeline
- Create `/biome.json` with exact configuration from Section 5.3
- Create `/.npmrc` with pnpm settings
- Setup `.gitignore` for Elixir, Node, and common files
1. **Backend Foundation**
   
   ```bash
   cd apps/backend
   mix phx.new . --app three_chat --no-ecto --no-html --no-assets
   ```
- Update `mix.exs` with all dependencies from Section 2 (Technology Stack)
- Create modular context structure in `lib/three_chat/`
- Setup environment configuration in `config/`
1. **Mobile Foundation**
   
   ```bash
   cd apps/mobile
   npx create-expo-app . --template blank-typescript
   ```
- Install all dependencies listed in Frontend Dependencies
- Create `app/` folder structure for Expo Router
- Setup Tamagui configuration
- Configure TypeScript with strict mode
1. **Shared Packages**
- Create `packages/types/src/models.ts` with base TypeScript interfaces
- Create `packages/constants/src/index.ts` with shared constants

#### Success Criteria:

- [ ] `pnpm install` works from root
- [ ] `pnpm dev` starts both backend and mobile
- [ ] Biome formatting/linting works
- [ ] TypeScript compilation successful
- [ ] Phoenix server starts on port 4000
- [ ] Expo dev server starts

### Phase 2: Authentication & User Management System

**Duration:** 2-3 days
**Goal:** Complete authentication flow with OTP verification

#### Backend Implementation:

1. **Create SMS Adapter System**
- Implement `lib/three_chat/sms/adapter.ex` (behavior definition)
- Implement `lib/three_chat/sms/providers/textbelt.ex`
- Create `lib/three_chat/sms/service.ex` for dynamic provider loading
- Add provider configuration to `config/dev.exs`
1. **In-Memory User Storage**
   
   ```elixir
   # lib/three_chat/storage/users.ex
   - Implement GenServer with ETS table
   - Methods: create_user/1, get_user/1, get_user_by_phone/1, get_user_by_username/1
   - Store: id, username, phone_number, display_name, otp_code, otp_expires_at
   ```
1. **Guardian Authentication Setup**
- Configure Guardian in `lib/three_chat/guardian.ex`
- Create `lib/three_chat_web/auth_pipeline.ex`
- Implement `lib/three_chat_web/auth_error_handler.ex`
1. **API Controllers**
   
   ```elixir
   # lib/three_chat_web/controllers/
   - auth_controller.ex: register/2, verify_otp/2, login/2, refresh/2
   - user_controller.ex: profile/2, update_profile/2
   ```
1. **API Routes**
   
   ```elixir
   # lib/three_chat_web/router.ex
   POST /api/auth/register    # {username, phone_number, display_name}
   POST /api/auth/verify-otp  # {phone_number, otp_code}
   POST /api/auth/login       # {username, password}
   GET  /api/users/profile    # Protected route
   ```

#### Frontend Implementation:

1. **Authentication Screens**
- Create `app/(auth)/_layout.tsx` with stack navigation
- Create `app/(auth)/register.tsx` with react-hook-form
- Create `app/(auth)/verify-otp.tsx` with OTP input
- Create `app/(auth)/login.tsx`
1. **Jotai Store Setup**
   
   ```typescript
   // src/stores/userStore.ts
   - authTokenAtom with SecureStore persistence
   - userAtom for current user data
   - isAuthenticatedAtom derived atom
   ```
1. **API Service**
   
   ```typescript
   // src/services/api.ts
   - Setup Ky client with auth interceptor
   - Implement auth endpoints: register(), verifyOTP(), login()
   - Add token refresh logic
   ```

#### Success Criteria:

- [ ] User can register with username and phone
- [ ] OTP is sent and can be verified
- [ ] JWT token is generated and stored
- [ ] Protected routes require authentication
- [ ] Token persists across app restarts

### Phase 3: Core Messaging System

**Duration:** 3-4 days
**Goal:** Implement one-to-one messaging with persistence

#### Backend Implementation:

1. **Message Storage**
   
   ```elixir
   # lib/three_chat/storage/messages.ex
   - ETS table for messages
   - Methods: create_message/1, get_messages/2, delete_message/1
   - Index by chat_id for efficient retrieval
   ```
1. **Chat Context**
   
   ```elixir
   # lib/three_chat/chat/
   - chat.ex: Core business logic
   - message.ex: Message struct
   - Implement message status tracking (sent, delivered, read)
   ```
1. **Message Controller**
   
   ```elixir
   # lib/three_chat_web/controllers/message_controller.ex
   GET    /api/messages/:chat_id
   POST   /api/messages
   DELETE /api/messages/:id
   PUT    /api/messages/:id/status
   ```

#### Frontend Implementation:

1. **Chat UI Components**
   
   ```typescript
   // src/components/chat/
   - MessageBubble.tsx with Tamagui + Reanimated
   - MessageList.tsx with FlatList optimization
   - MessageInput.tsx with react-hook-form
   - ChatHeader.tsx with user info
   ```
1. **Chat Screen**
   
   ```typescript
   // app/chat/[id].tsx
   - Dynamic route for chat conversations
   - Load messages on mount
   - Implement pull-to-refresh for older messages
   - Auto-scroll to bottom on new messages
   ```
1. **Message Store**
   
   ```typescript
   // src/stores/chatStore.ts
   - messagesAtom: Map<chatId, Message[]>
   - activeChatsAtom: Chat[]
   - sendMessage action
   ```

#### Success Criteria:

- [ ] Messages persist in memory
- [ ] Chat history loads correctly
- [ ] Messages show correct status
- [ ] Delete message works
- [ ] UI scrolls smoothly with many messages

### Phase 4: Real-time Features & WebSocket Integration

**Duration:** 2-3 days
**Goal:** Add Phoenix Channels for real-time messaging

#### Backend Implementation:

1. **Phoenix Channels Setup**
   
   ```elixir
   # lib/three_chat_web/channels/
   - user_socket.ex: Authentication via JWT
   - chat_channel.ex: Handle message events
   - presence_channel.ex: Track online status
   ```
1. **Channel Events**
   
   ```elixir
   # Incoming events
   "message:send", "message:delete", "typing:start", "typing:stop"
   
   # Outgoing events
   "message:new", "message:deleted", "message:status", "typing:update"
   ```
1. **Presence Tracking**
   
   ```elixir
   # lib/three_chat_web/presence.ex
   - Track user online/offline status
   - Broadcast presence changes
   - Store last_seen timestamps
   ```

#### Frontend Implementation:

1. **Phoenix Service**
   
   ```typescript
   // src/services/phoenix.ts
   - Initialize Socket with auth token
   - Channel subscription management
   - Event handlers for all channel events
   - Reconnection logic with exponential backoff
   ```
1. **Real-time Integration**
   
   ```typescript
   // Update stores to handle WebSocket events
   - Auto-update messagesAtom on new messages
   - Update typing indicators
   - Update online status
   ```
1. **Creative Status Indicators**
   
   ```typescript
   // src/components/chat/MessageStatus.tsx
   - Implement animated status with Skia
   - Glowing orb → Sparkles → Firework animation
   - Use Reanimated for smooth transitions
   ```

#### Success Criteria:

- [ ] Messages appear instantly for both users
- [ ] Typing indicators work in real-time
- [ ] Online/offline status updates immediately
- [ ] Creative status animations work smoothly
- [ ] WebSocket reconnects after disconnect

### Phase 5: Media, Groups & Advanced Features

**Duration:** 4-5 days
**Goal:** Implement file sharing, voice notes, and group chats

#### Backend Implementation:

1. **File Upload with Waffle**
   
   ```elixir
   # lib/three_chat/media/
   - attachment.ex: Handle all file types
   - voice_note.ex: Specific voice handling
   - Implement file validation (10MB limit)
   - Local filesystem storage with date organization
   ```
1. **Group Chat System**
   
   ```elixir
   # lib/three_chat/groups/
   - group.ex: Group management
   - membership.ex: Member tracking
   - Implement admin permissions
   - Support up to 50 members
   ```
1. **Rate Limiting**
   
   ```elixir
   # Setup Hammer rate limiting
   - Message rate limits
   - Upload rate limits
   - API call rate limits
   ```

#### Frontend Implementation:

1. **Media Components**
   
   ```typescript
   // src/components/media/
   - ImagePicker.tsx using expo-image-picker
   - VoiceRecorder.tsx with waveform viz
   - FileAttachment.tsx with icons
   - MediaViewer.tsx for full-screen viewing
   ```
1. **Group Features**
   
   ```typescript
   // app/group/[id].tsx
   - Group info header
   - Member list
   - Admin controls
   // src/components/group/
   - CreateGroupModal.tsx
   - MemberList.tsx
   - GroupSettings.tsx
   ```
1. **Voice Recording**
   
   ```typescript
   // src/services/audio.ts
   - Recording with expo-av
   - Waveform generation
   - Playback controls
   ```

#### Success Criteria:

- [ ] Files upload and download correctly
- [ ] Voice notes record and play
- [ ] Groups can be created with members
- [ ] Group messages reach all members
- [ ] Rate limiting prevents spam

### Phase 6: Extravagant UI/UX Polish

**Duration:** 3-4 days
**Goal:** Implement all creative UI features and themes

#### Implementation:

1. **Particle Effects System**
   
   ```typescript
   // src/components/particles/
   - ParticleEngine.tsx using Skia
   - MessageParticles.tsx for send/receive
   - BackgroundParticles.tsx for ambiance
   ```
1. **Theme System**
   
   ```typescript
   // src/themes/custom/
   - cyberpunk.ts: Neon colors, glitch effects
   - aurora.ts: Northern lights animations
   - ocean.ts: Water ripples, bubbles
   - space.ts: Stars, galaxy backgrounds
   - retrowave.ts: 80s aesthetics
   ```
1. **Advanced Animations**
   
   ```typescript
   // src/components/animated/
   - FluidTabBar.tsx: Liquid navigation
   - ElasticMessage.tsx: Bouncy messages
   - GyroCards.tsx: Tilt-responsive cards
   - PortalTransition.tsx: Screen transitions
   ```
1. **Glassmorphism UI**
   
   ```typescript
   // Implement frosted glass effects
   - Use Skia blur filters
   - Dynamic backdrop blur
   - Gradient overlays
   ```
1. **Sound Effects**
   
   ```typescript
   // src/services/sound.ts
   - Message send/receive sounds
   - UI interaction sounds
   - Notification sounds
   - Theme-specific soundscapes
   ```

#### Success Criteria:

- [ ] All 5 themes work and look distinct
- [ ] Animations run at 60 FPS
- [ ] Particle effects don’t impact performance
- [ ] Glassmorphism effects render correctly
- [ ] Sound effects play on interactions

### Phase 7: Production Deployment & Optimization

**Duration:** 2-3 days
**Goal:** Deploy to VPS and optimize performance

#### Backend Deployment:

1. **Docker Configuration**
   
   ```dockerfile
   # docker/Dockerfile.backend
   - Multi-stage build for smaller image
   - Production configurations
   - Health check endpoint
   ```
1. **Production Setup**
   
   ```bash
   # Setup on VPS
   - Install Docker and Docker Compose
   - Configure Nginx reverse proxy
   - Setup Let's Encrypt SSL
   - Configure environment variables
   ```
1. **Database Migration Preparation**
   
   ```elixir
   # Prepare Ecto migrations for future
   - User migration
   - Message migration
   - Group migration
   - Create repository pattern for easy switch
   ```

#### Frontend Deployment:

1. **Build Optimization**
   
   ```bash
   # Expo production build
   expo build:android
   expo build:ios
   ```
1. **Performance Optimization**
- Implement React.memo for components
- Optimize FlatList with getItemLayout
- Lazy load heavy components
- Minimize bundle size

#### Success Criteria:

- [ ] Backend runs on VPS via Docker
- [ ] SSL certificates work
- [ ] Mobile app builds successfully
- [ ] App performs smoothly with 100+ messages
- [ ] Memory usage stays reasonable

## Development Guidelines for AI Agent

### Code Generation Best Practices:

1. **Always create complete files** - Don’t use placeholders or “// TODO” comments
1. **Follow the exact folder structure** specified in this document
1. **Use the specified dependencies** - Don’t substitute libraries
1. **Implement error handling** in all async operations
1. **Add TypeScript types** for all data structures

### Testing Approach:

1. **Test each phase independently** before moving to next
1. **Use curl/Postman** to test API endpoints
1. **Test on both iOS and Android** simulators
1. **Monitor memory usage** during development
1. **Test with poor network** conditions

### Common Pitfalls to Avoid:

1. **Don’t skip type definitions** - Create interfaces for all data
1. **Don’t ignore error states** - Handle all failure scenarios
1. **Don’t hardcode values** - Use environment variables
1. **Don’t skip animations** - They’re core to the experience
1. **Don’t simplify the UI** - Embrace the extravagance

### File Naming Conventions:

- **React components**: PascalCase (MessageBubble.tsx)
- **Utilities/services**: camelCase (apiService.ts)
- **Elixir modules**: snake_case (user_controller.ex)
- **CSS/Styles**: kebab-case (theme-config.ts)

### Git Commit Structure:

```
Phase X: [Component] Brief description

- Detailed change 1
- Detailed change 2
```

This plan provides clear, actionable steps for implementing the complete 3-Chat application. Each phase builds upon the previous one, ensuring a stable foundation before adding complexity.

## Conclusion

3-Chat represents an ambitious reimagining of messaging applications, prioritizing extraordinary user experience while maintaining robust technical foundations. The architecture supports rapid MVP development with clear paths for scaling and enhancement. The focus on extravagant UI/UX will differentiate 3-Chat in the messaging app market while the solid Elixir/Phoenix backend ensures reliable real-time communication.

The modular, adapter-based design allows for flexibility in providers and storage solutions, while the monorepo structure ensures coordinated development between frontend and backend teams. With careful attention to the migration paths defined in this document, the application can grow from MVP to enterprise-scale without major architectural changes.
