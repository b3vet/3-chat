defmodule ThreeChatWeb.MediaController do
  use ThreeChatWeb, :controller

  @max_file_size 10 * 1024 * 1024
  @allowed_types ~w(.jpg .jpeg .png .gif .webp .mp4 .mov .mp3 .wav .m4a .pdf .doc .docx .txt)

  def upload(conn, %{"file" => upload}) do
    user = Guardian.Plug.current_resource(conn)

    with :ok <- validate_file(upload),
         {:ok, path} <- store_file(upload, user.id) do
      conn
      |> put_status(:created)
      |> json(%{
        url: path,
        filename: upload.filename,
        content_type: upload.content_type
      })
    else
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end

  def show(conn, %{"id" => id}) do
    uploads_path = Application.get_env(:three_chat, :uploads_path, "uploads")
    file_path = Path.join(uploads_path, id)

    if File.exists?(file_path) do
      conn
      |> put_resp_content_type(MIME.from_path(file_path))
      |> send_file(200, file_path)
    else
      conn
      |> put_status(:not_found)
      |> json(%{error: "File not found"})
    end
  end

  defp validate_file(%Plug.Upload{path: path, filename: filename}) do
    ext = Path.extname(filename) |> String.downcase()

    with {:ok, %{size: size}} <- File.stat(path),
         true <- size <= @max_file_size,
         true <- ext in @allowed_types do
      :ok
    else
      false -> {:error, "File too large or invalid type"}
      {:error, _} -> {:error, "Could not read file"}
    end
  end

  defp store_file(%Plug.Upload{path: src_path, filename: filename}, user_id) do
    uploads_path = Application.get_env(:three_chat, :uploads_path, "uploads")
    {{year, month, day}, _} = :calendar.local_time()

    dir = Path.join([
      uploads_path,
      Integer.to_string(year),
      String.pad_leading(Integer.to_string(month), 2, "0"),
      String.pad_leading(Integer.to_string(day), 2, "0"),
      user_id
    ])

    File.mkdir_p!(dir)

    ext = Path.extname(filename)
    new_filename = UUID.uuid4() <> ext
    dest_path = Path.join(dir, new_filename)

    case File.cp(src_path, dest_path) do
      :ok -> {:ok, String.replace(dest_path, uploads_path <> "/", "")}
      error -> error
    end
  end
end
