defmodule ThreeChatWeb.GroupChannel do
  use ThreeChatWeb, :channel

  alias ThreeChat.Groups
  alias ThreeChatWeb.Presence

  @impl true
  def join("group:" <> group_id, _params, socket) do
    if Groups.member?(group_id, socket.assigns.user_id) do
      send(self(), :after_join)
      {:ok, assign(socket, :group_id, group_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: DateTime.utc_now() |> DateTime.to_iso8601()
      })

    messages = Groups.get_recent_messages(socket.assigns.group_id)
    push(socket, "messages:history", %{messages: messages})

    {:noreply, socket}
  end

  @impl true
  def handle_in("message:send", %{"content" => content} = params, socket) do
    case Groups.create_message(%{
           sender_id: socket.assigns.user_id,
           group_id: socket.assigns.group_id,
           content: content,
           message_type: Map.get(params, "message_type", "text")
         }) do
      {:ok, message} ->
        broadcast!(socket, "message:new", message)
        {:reply, {:ok, message}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  @impl true
  def handle_in("typing:start", _params, socket) do
    broadcast_from!(socket, "typing:update", %{
      user_id: socket.assigns.user_id,
      typing: true
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("typing:stop", _params, socket) do
    broadcast_from!(socket, "typing:update", %{
      user_id: socket.assigns.user_id,
      typing: false
    })

    {:noreply, socket}
  end
end
