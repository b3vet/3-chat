defmodule ThreeChatWeb.Presence do
  @moduledoc """
  Provides presence tracking to channels and processes.
  """

  use Phoenix.Presence,
    otp_app: :three_chat,
    pubsub_server: ThreeChat.PubSub
end
