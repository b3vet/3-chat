import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# temporary load files are cleaned up.

if config_env() == :prod do
  # Configure production database
  database_path = System.get_env("DATABASE_PATH") || "/var/data/three_chat.db"

  config :three_chat, ThreeChat.Repo,
    database: database_path,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :three_chat, ThreeChatWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # Configure Guardian for production
  guardian_secret =
    System.get_env("GUARDIAN_SECRET") ||
      raise """
      environment variable GUARDIAN_SECRET is missing.
      """

  config :three_chat, ThreeChat.Guardian,
    issuer: "three_chat",
    secret_key: guardian_secret

  # Configure SMS provider
  sms_provider =
    case System.get_env("SMS_PROVIDER") do
      "textbelt" -> ThreeChat.SMS.Providers.Textbelt
      _ -> ThreeChat.SMS.Providers.Console
    end

  config :three_chat, :sms_provider, sms_provider

  # Configure Textbelt API key if using
  if sms_provider == ThreeChat.SMS.Providers.Textbelt do
    textbelt_key =
      System.get_env("TEXTBELT_API_KEY") ||
        raise """
        environment variable TEXTBELT_API_KEY is missing.
        """

    config :three_chat, :textbelt_api_key, textbelt_key
  end

  # Configure uploads path
  uploads_path = System.get_env("UPLOADS_PATH") || "/var/uploads"
  config :three_chat, :uploads_path, uploads_path
end
