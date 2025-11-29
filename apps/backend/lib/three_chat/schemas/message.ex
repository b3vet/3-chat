defmodule ThreeChat.Schemas.Message do
  @moduledoc """
  Schema for messages table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "messages" do
    field :chat_id, :string
    field :group_id, :binary_id
    field :content, :string
    field :message_type, :string, default: "text"
    field :status, :string, default: "sent"
    field :media_url, :string
    field :delivered_at, :utc_datetime
    field :read_at, :utc_datetime
    field :deleted_at, :utc_datetime

    belongs_to :sender, ThreeChat.Schemas.User
    belongs_to :reply_to, ThreeChat.Schemas.Message

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new message.
  """
  def create_changeset(message, attrs) do
    message
    |> cast(attrs, [:sender_id, :chat_id, :group_id, :content, :message_type, :media_url, :reply_to_id])
    |> validate_required([:sender_id])
    |> validate_chat_or_group()
    |> validate_inclusion(:message_type, ["text", "image", "video", "audio", "voice_note", "document"])
  end

  @doc """
  Changeset for updating message status.
  """
  def status_changeset(message, status) do
    now = DateTime.utc_now()

    changes =
      case status do
        "delivered" -> %{status: status, delivered_at: now}
        "read" -> %{status: status, read_at: now}
        _ -> %{status: status}
      end

    message
    |> cast(changes, [:status, :delivered_at, :read_at])
    |> validate_inclusion(:status, ["sent", "delivered", "read"])
  end

  @doc """
  Changeset for soft deleting a message.
  """
  def delete_changeset(message) do
    message
    |> change(%{deleted_at: DateTime.utc_now(), content: nil})
  end

  defp validate_chat_or_group(changeset) do
    chat_id = get_field(changeset, :chat_id)
    group_id = get_field(changeset, :group_id)

    cond do
      is_nil(chat_id) and is_nil(group_id) ->
        add_error(changeset, :chat_id, "either chat_id or group_id must be provided")

      not is_nil(chat_id) and not is_nil(group_id) ->
        add_error(changeset, :chat_id, "cannot have both chat_id and group_id")

      true ->
        changeset
    end
  end

  @doc """
  Converts a Message schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = message) do
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
      created_at: message.inserted_at,
      delivered_at: message.delivered_at,
      read_at: message.read_at,
      deleted_at: message.deleted_at
    }
  end
end
