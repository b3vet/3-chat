defmodule ThreeChatWeb.UserSocket do
  use Phoenix.Socket

  # Channels
  channel "user:*", ThreeChatWeb.UserChannel
  channel "chat:*", ThreeChatWeb.ChatChannel
  channel "group:*", ThreeChatWeb.GroupChannel
  channel "presence:*", ThreeChatWeb.PresenceChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case ThreeChat.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        case ThreeChat.Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            {:ok, assign(socket, :user_id, user.id)}

          {:error, _reason} ->
            :error
        end

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info) do
    :error
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
