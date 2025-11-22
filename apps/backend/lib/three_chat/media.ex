defmodule ThreeChat.Media do
  @moduledoc """
  The Media context - handles file uploads and media management.
  """

  alias ThreeChat.Media.{Attachment, VoiceNote}
  alias ThreeChat.Storage.Media, as: MediaStorage

  @doc """
  Upload a general attachment (image, video, audio, or document).
  """
  def upload_attachment(%Plug.Upload{} = file, user_id) do
    scope = %{user_id: user_id}

    case Attachment.store({file, scope}) do
      {:ok, filename} ->
        media_record = %{
          id: UUID.uuid4(),
          filename: filename,
          original_filename: file.filename,
          content_type: file.content_type,
          file_type: Attachment.file_type(file.filename),
          user_id: user_id,
          url: Attachment.url({filename, scope}),
          thumb_url: Attachment.url({filename, scope}, :thumb),
          uploaded_at: DateTime.utc_now()
        }

        {:ok, _} = MediaStorage.create(media_record)
        {:ok, media_record}

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
        media_record = %{
          id: UUID.uuid4(),
          filename: filename,
          original_filename: file.filename,
          content_type: file.content_type,
          file_type: :voice_note,
          user_id: user_id,
          url: VoiceNote.url({filename, scope}),
          duration: duration_seconds,
          uploaded_at: DateTime.utc_now()
        }

        {:ok, _} = MediaStorage.create(media_record)
        {:ok, media_record}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get a media record by ID.
  """
  def get_media(id), do: MediaStorage.get(id)

  @doc """
  Get all media uploaded by a user.
  """
  def get_user_media(user_id), do: MediaStorage.get_by_user(user_id)

  @doc """
  Delete a media file and its record.
  """
  def delete_media(id, user_id) do
    case MediaStorage.get(id) do
      {:ok, media} ->
        if media.user_id == user_id do
          # Delete file from storage
          scope = %{user_id: user_id}
          Attachment.delete({media.filename, scope})
          MediaStorage.delete(id)
        else
          {:error, :unauthorized}
        end

      error ->
        error
    end
  end

  @doc """
  Clean up orphaned media files.
  Files older than 30 days without associated messages.
  """
  def cleanup_orphaned_files do
    cutoff = DateTime.utc_now() |> DateTime.add(-30 * 24 * 60 * 60, :second)
    MediaStorage.delete_older_than(cutoff)
  end
end
