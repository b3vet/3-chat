defmodule ThreeChat.Storage.Supervisor do
  @moduledoc """
  Supervisor for all in-memory storage GenServers.
  """

  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    # Only OTP storage remains in ETS as it's ephemeral and doesn't need persistence
    # All other data is now stored in SQLite via Ecto
    children = [
      ThreeChat.Storage.OTP
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
