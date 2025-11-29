# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
import Config

# General application configuration
config :three_chat,
  ecto_repos: [ThreeChat.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :three_chat, ThreeChatWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: ThreeChatWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: ThreeChat.PubSub,
  live_view: [signing_salt: "your_signing_salt"]

# Configure Guardian for JWT
config :three_chat, ThreeChat.Guardian,
  issuer: "three_chat",
  secret_key: "your_secret_key_at_least_32_chars_long_change_in_production"

# Configure SMS provider (default to console for development)
config :three_chat, :sms_provider, ThreeChat.SMS.Providers.Console

# Configure uploads path
config :three_chat, :uploads_path, "uploads"

# Configure Hammer rate limiting (ETS backend)
config :hammer,
  backend: {Hammer.Backend.ETS, [
    expiry_ms: 60_000 * 60 * 2,        # 2 hours - how long to keep rate limit data
    cleanup_interval_ms: 60_000 * 10   # 10 minutes - how often to clean expired data
  ]}

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config
import_config "#{config_env()}.exs"
