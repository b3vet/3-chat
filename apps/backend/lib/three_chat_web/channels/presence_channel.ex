defmodule ThreeChatWeb.PresenceChannel do
  use ThreeChatWeb, :channel

  alias ThreeChatWeb.Presence

  @impl true
  def join("presence:lobby", _params, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: DateTime.utc_now() |> DateTime.to_iso8601(),
        status: "online"
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
end
