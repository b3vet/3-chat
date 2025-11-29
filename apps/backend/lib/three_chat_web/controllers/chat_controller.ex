defmodule ThreeChatWeb.ChatController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Chat
  alias ThreeChat.Accounts

  def index(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    chats = Chat.get_user_chats(user.id)

    # Enrich chats with recipient info
    enriched_chats =
      chats
      |> Enum.map(fn chat ->
        # Extract the other user's ID from chat_id
        other_user_id = get_other_user_id(chat.chat_id, user.id)

        recipient =
          case Accounts.get_user(other_user_id) do
            {:ok, u} -> %{id: u.id, username: u.username, display_name: u.display_name, avatar_url: u.avatar_url}
            _ -> nil
          end

        %{
          id: chat.chat_id,
          recipient: recipient,
          last_message: chat.last_message
        }
      end)
      |> Enum.reject(fn chat -> is_nil(chat.recipient) end)

    conn
    |> put_status(:ok)
    |> json(%{chats: enriched_chats})
  end

  defp get_other_user_id(chat_id, current_user_id) do
    case String.split(chat_id, ":") do
      [id1, id2] -> if id1 == current_user_id, do: id2, else: id1
      _ -> nil
    end
  end
end
