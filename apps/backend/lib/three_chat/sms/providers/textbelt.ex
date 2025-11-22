defmodule ThreeChat.SMS.Providers.Textbelt do
  @moduledoc """
  Textbelt SMS provider implementation.
  """

  @behaviour ThreeChat.SMS.Adapter

  @impl ThreeChat.SMS.Adapter
  def send_otp(phone_number, otp) do
    api_key = get_api_key()

    body = %{
      phone: phone_number,
      message: "Your 3-Chat verification code is: #{otp}. Valid for 5 minutes.",
      key: api_key
    }

    case Req.post("https://textbelt.com/text", json: body) do
      {:ok, %{status: 200, body: %{"success" => true}}} ->
        {:ok, :sent}

      {:ok, %{body: body}} ->
        {:error, body["error"] || "Unknown error"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_api_key do
    Application.get_env(:three_chat, :textbelt_api_key, "textbelt")
  end
end
