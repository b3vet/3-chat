defmodule ThreeChat.Schemas.Media do
  @moduledoc """
  Schema for media table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "media" do
    field :filename, :string
    field :original_filename, :string
    field :content_type, :string
    field :file_type, :string
    field :url, :string
    field :thumb_url, :string
    field :duration, :integer
    field :uploaded_at, :utc_datetime

    belongs_to :user, ThreeChat.Schemas.User
  end

  @doc """
  Changeset for creating a new media record.
  """
  def create_changeset(media, attrs) do
    media
    |> cast(attrs, [:user_id, :filename, :original_filename, :content_type, :file_type, :url, :thumb_url, :duration])
    |> validate_required([:user_id, :filename, :content_type, :file_type, :url])
    |> validate_inclusion(:file_type, ["image", "video", "audio", "document", "voice_note"])
    |> put_change(:uploaded_at, DateTime.utc_now())
  end

  @doc """
  Converts a Media schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = media) do
    %{
      id: media.id,
      filename: media.filename,
      original_filename: media.original_filename,
      content_type: media.content_type,
      file_type: media.file_type,
      url: media.url,
      thumb_url: media.thumb_url,
      duration: media.duration,
      uploaded_at: media.uploaded_at
    }
  end
end
