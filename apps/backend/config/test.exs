import Config

# We don't run a server during test
config :three_chat, ThreeChatWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "test_secret_key_base_at_least_64_characters_long_for_testing_only",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Use console SMS provider for tests
config :three_chat, :sms_provider, ThreeChat.SMS.Providers.Console

# Test Guardian secret
config :three_chat, ThreeChat.Guardian,
  issuer: "three_chat",
  secret_key: "test_guardian_secret_key_at_least_32_chars"
