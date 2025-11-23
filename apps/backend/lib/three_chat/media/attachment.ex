defmodule ThreeChat.Media.Attachment do
  @moduledoc """
  Waffle definition for general file attachments.
  Handles images, videos, audio, and documents.
  """

  use Waffle.Definition

  @max_file_size 10 * 1024 * 1024
  @image_extensions ~w(.jpg .jpeg .png .gif .webp)
  @video_extensions ~w(.mp4 .mov .avi)
  @audio_extensions ~w(.mp3 .wav .m4a)
  @document_extensions ~w(.pdf .doc .docx .txt)
  @all_extensions @image_extensions ++ @video_extensions ++ @audio_extensions ++ @document_extensions

  @versions [:original, :thumb]

  def acl(:thumb, _), do: :public_read
  def acl(_, _), do: :public_read

  def validate({file, _scope}) do
    ext = file.file_name |> Path.extname() |> String.downcase()

    cond do
      ext not in @all_extensions ->
        {:error, "Invalid file type. Allowed: #{Enum.join(@all_extensions, ", ")}"}

      true ->
        validate_size(file)
    end
  end

  defp validate_size(%{path: path}) do
    case File.stat(path) do
      {:ok, %{size: size}} when size <= @max_file_size ->
        :ok

      {:ok, %{size: _size}} ->
        {:error, "File too large. Maximum size is 10MB."}

      {:error, _} ->
        {:error, "Could not read file."}
    end
  end

  def transform(:thumb, {file, _scope}) do
    ext = file.file_name |> Path.extname() |> String.downcase()

    if ext in @image_extensions do
      {:convert, "-strip -thumbnail 300x300^ -gravity center -extent 300x300 -format jpg", :jpg}
    else
      :noaction
    end
  end

  def transform(:original, _), do: :noaction

  def filename(version, {file, _scope}) do
    base = Path.basename(file.file_name, Path.extname(file.file_name))
    "#{base}_#{version}"
  end

  def storage_dir(_version, {_file, scope}) do
    {{year, month, day}, _} = :calendar.local_time()

    user_id = Map.get(scope, :user_id, "anonymous")

    Path.join([
      "uploads",
      Integer.to_string(year),
      String.pad_leading(Integer.to_string(month), 2, "0"),
      String.pad_leading(Integer.to_string(day), 2, "0"),
      user_id
    ])
  end

  def default_url(:thumb, _scope), do: "/images/default_attachment_thumb.png"
  def default_url(:original, _scope), do: nil

  @doc """
  Get the file type category based on extension.
  """
  def file_type(filename) do
    ext = filename |> Path.extname() |> String.downcase()

    cond do
      ext in @image_extensions -> :image
      ext in @video_extensions -> :video
      ext in @audio_extensions -> :audio
      ext in @document_extensions -> :document
      true -> :unknown
    end
  end
end
