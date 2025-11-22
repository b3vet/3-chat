# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
import Config

# General application configuration
config :three_chat,
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

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config
import_config "#{config_env()}.exs"
