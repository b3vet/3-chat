import Config

# For development, we disable any cache and enable
# debugging and code reloading.
config :three_chat, ThreeChatWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "dev_secret_key_base_at_least_64_characters_long_for_development_only",
  watchers: []

# Enable dev routes for dashboard and mailbox
config :three_chat, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

# Configure SMS provider for development (prints to console)
config :three_chat, :sms_provider, ThreeChat.SMS.Providers.Console

# Development Guardian secret
config :three_chat, ThreeChat.Guardian,
  issuer: "three_chat",
  secret_key: "dev_guardian_secret_key_at_least_32_chars"
