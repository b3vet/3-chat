defmodule ThreeChat.Chat do
  @moduledoc """
  The Chat context - handles messaging logic.
  """

  import Ecto.Query
  alias ThreeChat.Repo
  alias ThreeChat.Schemas.{Message, Friendship}

  @doc """
  Creates a new message.
  """
  def create_message(attrs) do
    %Message{}
    |> Message.create_changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, message} -> {:ok, Message.to_map(message)}
      {:error, _changeset} -> {:error, :invalid_message}
    end
  end

  @doc """
  Gets a message by ID.
  """
  def get_message(id) do
    case Repo.get(Message, id) do
      nil -> {:error, :not_found}
      message -> {:ok, Message.to_map(message)}
    end
  end

  @doc """
  Gets recent messages for a chat.
  """
  def get_recent_messages(chat_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)
    offset = Keyword.get(opts, :offset, 0)

    from(m in Message,
      where: m.chat_id == ^chat_id and is_nil(m.deleted_at),
      order_by: [desc: m.inserted_at],
      limit: ^limit,
      offset: ^offset
    )
    |> Repo.all()
    |> Enum.map(&Message.to_map/1)
  end

  @doc """
  Updates message status.
  """
  def update_message_status(message_id, status, _user_id) do
    case Repo.get(Message, message_id) do
      nil ->
        {:error, :not_found}

      message ->
        message
        |> Message.status_changeset(status)
        |> Repo.update()
        |> case do
          {:ok, updated} -> {:ok, Message.to_map(updated)}
          {:error, _} -> {:error, :update_failed}
        end
    end
  end

  @doc """
  Soft deletes a message.
  """
  def delete_message(message_id, user_id) do
    case Repo.get(Message, message_id) do
      nil ->
        {:error, :not_found}

      message ->
        if message.sender_id == user_id do
          message
          |> Message.delete_changeset()
          |> Repo.update()
          |> case do
            {:ok, deleted} -> {:ok, Message.to_map(deleted)}
            {:error, _} -> {:error, :delete_failed}
          end
        else
          {:error, :unauthorized}
        end
    end
  end

  @doc """
  Checks if a user is part of a chat.
  """
  def user_in_chat?(chat_id, user_id) do
    case String.split(chat_id, ":") do
      [id1, id2] ->
        user_id in [id1, id2] and are_friends?(id1, id2)

      _ ->
        false
    end
  end

  @doc """
  Gets or creates a chat ID from two user IDs.
  """
  def get_or_create_chat_id(user1_id, user2_id) do
    [user1_id, user2_id]
    |> Enum.sort()
    |> Enum.join(":")
  end

  @doc """
  Gets recent chats for a user with their last message.
  Returns chats where the user has sent or received messages.
  """
  def get_user_chats(user_id) do
    # Find all distinct chat_ids where user is a participant
    # Chat ID format is "user1_id:user2_id"
    like_pattern1 = "#{user_id}:%"
    like_pattern2 = "%:#{user_id}"

    # Get distinct chat_ids with their latest message
    subquery =
      from(m in Message,
        where:
          is_nil(m.deleted_at) and
            (like(m.chat_id, ^like_pattern1) or like(m.chat_id, ^like_pattern2)),
        group_by: m.chat_id,
        select: %{chat_id: m.chat_id, last_message_at: max(m.inserted_at)}
      )

    # Join to get the full last message for each chat
    from(m in Message,
      join: s in subquery(subquery),
      on: m.chat_id == s.chat_id and m.inserted_at == s.last_message_at,
      where: is_nil(m.deleted_at),
      order_by: [desc: m.inserted_at],
      select: m
    )
    |> Repo.all()
    |> Enum.map(fn message ->
      %{
        chat_id: message.chat_id,
        last_message: Message.to_map(message)
      }
    end)
  end

  # Check if two users are friends
  defp are_friends?(user1_id, user2_id) do
    query =
      from(f in Friendship,
        where:
          f.status == "accepted" and
            ((f.user_id == ^user1_id and f.friend_id == ^user2_id) or
               (f.user_id == ^user2_id and f.friend_id == ^user1_id))
      )

    Repo.exists?(query)
  end
end
