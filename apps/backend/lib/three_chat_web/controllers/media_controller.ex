defmodule ThreeChatWeb.MediaController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Media
  alias ThreeChat.RateLimiter

  plug ThreeChatWeb.RateLimitPlug, type: :media_upload when action in [:upload, :upload_voice]

  def upload(conn, %{"file" => upload}) do
    user = Guardian.Plug.current_resource(conn)

    case Media.upload_attachment(upload, user.id) do
      {:ok, media} ->
        conn
        |> put_status(:created)
        |> json(%{
          id: media.id,
          url: media.url,
          thumb_url: media.thumb_url,
          filename: media.original_filename,
          content_type: media.content_type,
          file_type: media.file_type
        })

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: format_error(reason)})
    end
  end

  def upload_voice(conn, %{"file" => upload} = params) do
    user = Guardian.Plug.current_resource(conn)
    duration = params["duration"]

    case Media.upload_voice_note(upload, user.id, duration) do
      {:ok, media} ->
        conn
        |> put_status(:created)
        |> json(%{
          id: media.id,
          url: media.url,
          filename: media.original_filename,
          duration: media.duration,
          file_type: :voice_note
        })

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: format_error(reason)})
    end
  end

  def show(conn, %{"id" => id}) do
    case Media.get_media(id) do
      {:ok, media} ->
        conn
        |> put_status(:ok)
        |> json(%{
          id: media.id,
          url: media.url,
          thumb_url: media.thumb_url,
          filename: media.original_filename,
          content_type: media.content_type,
          file_type: media.file_type,
          duration: media.duration,
          uploaded_at: media.uploaded_at
        })

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Media not found"})
    end
  end

  def download(conn, %{"id" => id}) do
    case Media.get_media(id) do
      {:ok, media} ->
        uploads_path = Application.get_env(:three_chat, :uploads_path, "uploads")
        file_path = Path.join(uploads_path, media.url || "")

        if File.exists?(file_path) do
          conn
          |> put_resp_content_type(media.content_type || "application/octet-stream")
          |> put_resp_header(
            "content-disposition",
            "attachment; filename=\"#{media.original_filename}\""
          )
          |> send_file(200, file_path)
        else
          conn
          |> put_status(:not_found)
          |> json(%{error: "File not found"})
        end

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Media not found"})
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Guardian.Plug.current_resource(conn)

    case Media.delete_media(id, user.id) do
      :ok ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Media deleted"})

      {:error, :unauthorized} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Not authorized to delete this media"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Media not found"})
    end
  end

  def rate_limit_status(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    case RateLimiter.remaining(:media_upload, user.id) do
      {:ok, remaining} ->
        conn
        |> put_status(:ok)
        |> json(%{remaining: remaining, limit: 10, window: "1 minute"})

      {:error, _} ->
        conn
        |> put_status(:ok)
        |> json(%{remaining: 0, limit: 10, window: "1 minute"})
    end
  end

  defp format_error(reason) when is_binary(reason), do: reason
  defp format_error(reason) when is_atom(reason), do: Atom.to_string(reason)
  defp format_error(_), do: "Upload failed"
end
