defmodule ThreeChat.SMS.Service do
  @moduledoc """
  SMS service that delegates to the configured provider.
  """

  alias ThreeChat.Accounts

  def send_otp(phone_number) do
    with {:ok, otp} <- Accounts.create_otp(phone_number) do
      provider().send_otp(phone_number, otp)
    end
  end

  defp provider do
    Application.get_env(
      :three_chat,
      :sms_provider,
      ThreeChat.SMS.Providers.Console
    )
  end
end
