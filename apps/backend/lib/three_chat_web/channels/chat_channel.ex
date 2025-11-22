defmodule ThreeChatWeb.ChatChannel do
  use ThreeChatWeb, :channel

  alias ThreeChat.Chat
  alias ThreeChatWeb.Presence

  @impl true
  def join("chat:" <> chat_id, _params, socket) do
    if authorized?(chat_id, socket.assigns.user_id) do
      send(self(), :after_join)
      {:ok, assign(socket, :chat_id, chat_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    # Track presence
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: DateTime.utc_now() |> DateTime.to_iso8601()
      })

    # Send recent messages
    messages = Chat.get_recent_messages(socket.assigns.chat_id)
    push(socket, "messages:history", %{messages: messages})

    {:noreply, socket}
  end

  @impl true
  def handle_in("message:send", %{"content" => content} = params, socket) do
    case Chat.create_message(%{
           sender_id: socket.assigns.user_id,
           chat_id: socket.assigns.chat_id,
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
  def handle_in("message:delete", %{"message_id" => message_id}, socket) do
    case Chat.delete_message(message_id, socket.assigns.user_id) do
      {:ok, _} ->
        broadcast!(socket, "message:deleted", %{message_id: message_id})
        {:reply, :ok, socket}

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

  @impl true
  def handle_in("message:status", %{"message_id" => message_id, "status" => status}, socket) do
    case Chat.update_message_status(message_id, status, socket.assigns.user_id) do
      {:ok, _} ->
        broadcast!(socket, "message:status", %{message_id: message_id, status: status})
        {:reply, :ok, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  # Check if user is authorized to join this chat
  defp authorized?(chat_id, user_id) do
    Chat.user_in_chat?(chat_id, user_id)
  end
end
