defmodule ThreeChat.Media.VoiceNote do
  @moduledoc """
  Waffle definition for voice note recordings.
  Handles audio files with specific voice note processing.
  """

  use Waffle.Definition

  @max_file_size 5 * 1024 * 1024
  @allowed_extensions ~w(.mp3 .wav .m4a .ogg .aac)

  @versions [:original]

  def acl(_, _), do: :public_read

  def validate({file, _scope}) do
    ext = file.file_name |> Path.extname() |> String.downcase()

    cond do
      ext not in @allowed_extensions ->
        {:error, "Invalid audio format. Allowed: #{Enum.join(@allowed_extensions, ", ")}"}

      true ->
        validate_size(file)
    end
  end

  defp validate_size(%{path: path}) do
    case File.stat(path) do
      {:ok, %{size: size}} when size <= @max_file_size ->
        :ok

      {:ok, %{size: _size}} ->
        {:error, "Voice note too large. Maximum size is 5MB."}

      {:error, _} ->
        {:error, "Could not read file."}
    end
  end

  def transform(:original, _), do: :noaction

  def filename(_version, {file, scope}) do
    timestamp = DateTime.utc_now() |> DateTime.to_unix()
    user_id = Map.get(scope, :user_id, "anonymous")
    ext = Path.extname(file.file_name)
    "voice_#{user_id}_#{timestamp}#{ext}"
  end

  def storage_dir(_version, {_file, scope}) do
    {{year, month, day}, _} = :calendar.local_time()

    user_id = Map.get(scope, :user_id, "anonymous")

    Path.join([
      "uploads",
      "voice_notes",
      Integer.to_string(year),
      String.pad_leading(Integer.to_string(month), 2, "0"),
      String.pad_leading(Integer.to_string(day), 2, "0"),
      user_id
    ])
  end
end
