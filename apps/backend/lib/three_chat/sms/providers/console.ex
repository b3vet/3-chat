defmodule ThreeChat.SMS.Providers.Console do
  @moduledoc """
  Console SMS provider for development - prints OTP to console.
  """

  @behaviour ThreeChat.SMS.Adapter

  require Logger

  @impl ThreeChat.SMS.Adapter
  def send_otp(phone_number, otp) do
    Logger.info("""

    ========================================
    SMS OTP (Development Mode)
    ========================================
    Phone: #{phone_number}
    Code:  #{otp}
    ========================================

    """)

    {:ok, :logged}
  end
end
