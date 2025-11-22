defmodule ThreeChatWeb.UserChannel do
  use ThreeChatWeb, :channel

  @impl true
  def join("user:" <> user_id, _params, socket) do
    if user_id == socket.assigns.user_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("presence:update", %{"status" => status}, socket) do
    ThreeChat.Presence.update_status(socket.assigns.user_id, status)
    {:reply, :ok, socket}
  end
end
