defmodule ThreeChat.Media do
  @moduledoc """
  The Media context - handles file uploads and media management.
  """

  import Ecto.Query
  alias ThreeChat.Repo
  alias ThreeChat.Schemas.Media, as: MediaSchema
  alias ThreeChat.Media.{Attachment, VoiceNote}

  @doc """
  Upload a general attachment (image, video, audio, or document).
  """
  def upload_attachment(%Plug.Upload{} = file, user_id) do
    scope = %{user_id: user_id}

    case Attachment.store({file, scope}) do
      {:ok, filename} ->
        attrs = %{
          filename: filename,
          original_filename: file.filename,
          content_type: file.content_type,
          file_type: to_string(Attachment.file_type(file.filename)),
          user_id: user_id,
          url: Attachment.url({filename, scope}),
          thumb_url: Attachment.url({filename, scope}, :thumb)
        }

        %MediaSchema{}
        |> MediaSchema.create_changeset(attrs)
        |> Repo.insert()
        |> case do
          {:ok, media} -> {:ok, MediaSchema.to_map(media)}
          {:error, _changeset} -> {:error, :create_failed}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Upload a voice note recording.
  """
  def upload_voice_note(%Plug.Upload{} = file, user_id, duration_seconds \\ nil) do
    scope = %{user_id: user_id}

    case VoiceNote.store({file, scope}) do
      {:ok, filename} ->
        attrs = %{
          filename: filename,
          original_filename: file.filename,
          content_type: file.content_type,
          file_type: "voice_note",
          user_id: user_id,
          url: VoiceNote.url({filename, scope}),
          duration: duration_seconds
        }

        %MediaSchema{}
        |> MediaSchema.create_changeset(attrs)
        |> Repo.insert()
        |> case do
          {:ok, media} -> {:ok, MediaSchema.to_map(media)}
          {:error, _changeset} -> {:error, :create_failed}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get a media record by ID.
  """
  def get_media(id) do
    case Repo.get(MediaSchema, id) do
      nil -> {:error, :not_found}
      media -> {:ok, MediaSchema.to_map(media)}
    end
  end

  @doc """
  Get all media uploaded by a user.
  """
  def get_user_media(user_id) do
    from(m in MediaSchema,
      where: m.user_id == ^user_id,
      order_by: [desc: m.uploaded_at]
    )
    |> Repo.all()
    |> Enum.map(&MediaSchema.to_map/1)
  end

  @doc """
  Delete a media file and its record.
  """
  def delete_media(id, user_id) do
    case Repo.get(MediaSchema, id) do
      nil ->
        {:error, :not_found}

      media ->
        if media.user_id == user_id do
          # Delete file from storage
          scope = %{user_id: user_id}
          Attachment.delete({media.filename, scope})
          Repo.delete(media)
          :ok
        else
          {:error, :unauthorized}
        end
    end
  end

  @doc """
  Clean up orphaned media files.
  Files older than 30 days without associated messages.
  """
  def cleanup_orphaned_files do
    cutoff = DateTime.utc_now() |> DateTime.add(-30 * 24 * 60 * 60, :second)

    {count, _} =
      from(m in MediaSchema,
        where: m.uploaded_at < ^cutoff
      )
      |> Repo.delete_all()

    {:ok, count}
  end
end
