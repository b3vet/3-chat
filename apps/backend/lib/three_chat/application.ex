defmodule ThreeChat.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Phoenix Telemetry
      ThreeChatWeb.Telemetry,

      # Phoenix PubSub
      {Phoenix.PubSub, name: ThreeChat.PubSub},

      # Database Repo (SQLite)
      ThreeChat.Repo,

      # In-memory storage (only OTP for ephemeral codes)
      ThreeChat.Storage.Supervisor,

      # Presence tracking
      ThreeChatWeb.Presence,

      # Rate limiter backend
      {Hammer.Backend.ETS,
       [
         ets_table_name: :hammer_rate_limiter,
         expiry_ms: 60_000 * 60 * 2,
         cleanup_interval_ms: 60_000 * 10
       ]},

      # Phoenix endpoint (must be last)
      ThreeChatWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: ThreeChat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    ThreeChatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
