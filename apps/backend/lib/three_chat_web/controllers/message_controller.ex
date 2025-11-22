defmodule ThreeChatWeb.MessageController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Chat

  def index(conn, %{"chat_id" => chat_id} = params) do
    user = Guardian.Plug.current_resource(conn)

    if Chat.user_in_chat?(chat_id, user.id) do
      opts = [
        limit: String.to_integer(params["limit"] || "50"),
        offset: String.to_integer(params["offset"] || "0")
      ]

      messages = Chat.get_recent_messages(chat_id, opts)

      conn
      |> put_status(:ok)
      |> json(%{messages: Enum.map(messages, &format_message/1)})
    else
      conn
      |> put_status(:forbidden)
      |> json(%{error: "Not authorized to view this chat"})
    end
  end

  def create(conn, params) do
    user = Guardian.Plug.current_resource(conn)

    message_params = %{
      sender_id: user.id,
      chat_id: params["chat_id"],
      group_id: params["group_id"],
      content: params["content"],
      message_type: params["message_type"] || "text",
      media_url: params["media_url"],
      reply_to_id: params["reply_to_id"]
    }

    case Chat.create_message(message_params) do
      {:ok, message} ->
        conn
        |> put_status(:created)
        |> json(%{message: format_message(message)})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def delete(conn, %{"id" => message_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Chat.delete_message(message_id, user.id) do
      {:ok, _} ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Message deleted"})

      {:error, :unauthorized} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Not authorized to delete this message"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Message not found"})
    end
  end

  defp format_message(message) do
    %{
      id: message.id,
      sender_id: message.sender_id,
      chat_id: message.chat_id,
      group_id: message.group_id,
      content: message.content,
      message_type: message.message_type,
      status: message.status,
      media_url: message.media_url,
      reply_to_id: message.reply_to_id,
      created_at: message.created_at,
      delivered_at: message.delivered_at,
      read_at: message.read_at
    }
  end
end
