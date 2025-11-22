defmodule ThreeChat.Chat do
  @moduledoc """
  The Chat context - handles messaging logic.
  """

  alias ThreeChat.Storage.Messages
  alias ThreeChat.Storage.Friendships

  def create_message(attrs) do
    Messages.create(attrs)
  end

  def get_message(id), do: Messages.get(id)

  def get_recent_messages(chat_id, opts \\ []) do
    case Messages.get_by_chat(chat_id, opts) do
      {:ok, messages} -> messages
      _ -> []
    end
  end

  def update_message_status(message_id, status, user_id) do
    Messages.update_status(message_id, status, user_id)
  end

  def delete_message(message_id, user_id) do
    Messages.delete(message_id, user_id)
  end

  def user_in_chat?(chat_id, user_id) do
    # Chat ID is typically "user1_id:user2_id" sorted
    case String.split(chat_id, ":") do
      [id1, id2] ->
        user_id in [id1, id2] and Friendships.are_friends?(id1, id2)

      _ ->
        false
    end
  end

  def get_or_create_chat_id(user1_id, user2_id) do
    [user1_id, user2_id]
    |> Enum.sort()
    |> Enum.join(":")
  end
end
