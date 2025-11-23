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
    children = [
      ThreeChat.Storage.Users,
      ThreeChat.Storage.Messages,
      ThreeChat.Storage.Groups,
      ThreeChat.Storage.Friendships,
      ThreeChat.Storage.OTP,
      ThreeChat.Storage.Media
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
