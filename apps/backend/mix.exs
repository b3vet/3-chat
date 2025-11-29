defmodule ThreeChat.MixProject do
  use Mix.Project

  def project do
    [
      app: :three_chat,
      version: "0.1.0",
      elixir: "~> 1.19",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      listeners: [Phoenix.CodeReloader]
    ]
  end

  def application do
    [
      mod: {ThreeChat.Application, []},
      extra_applications: [:logger, :runtime_tools, :os_mon]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      # Core Phoenix
      {:phoenix, "~> 1.8.1"},
      {:phoenix_live_view, "~> 1.1.17"},
      {:phoenix_live_dashboard, "~> 0.8.7"},

      # Database & Storage
      {:ecto, "~> 3.13"},
      {:ecto_sql, "~> 3.13"},
      {:ecto_sqlite3, "~> 0.17"},
      # Keep postgrex for future PostgreSQL migration
      {:postgrex, "~> 0.21", optional: true},

      # Authentication & Security
      {:guardian, "~> 2.4"},
      {:argon2_elixir, "~> 4.1"},
      {:cloak, "~> 1.1"},

      # JSON & API
      {:jason, "~> 1.4"},
      {:cors_plug, "~> 3.0"},
      {:open_api_spex, "~> 3.21"},

      # File Handling
      {:waffle, "~> 1.1"},

      # Rate Limiting (ETS backend is built-in as of 6.x)
      {:hammer, "~> 6.2"},

      # Background Jobs
      {:oban, "~> 2.20"},

      # Utilities
      {:timex, "~> 3.7"},
      {:elixir_uuid, "~> 1.2"},

      # HTTP Client (for SMS providers)
      {:req, "~> 0.5"},

      # Development
      {:phoenix_live_reload, "~> 1.5", only: :dev},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.1"},

      # Plug & WebSocket
      {:plug_cowboy, "~> 2.7"},
      {:bandit, "~> 1.6"}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
