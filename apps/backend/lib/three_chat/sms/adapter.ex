defmodule ThreeChat.SMS.Adapter do
  @moduledoc """
  Behaviour for SMS providers.
  """

  @callback send_otp(phone_number :: String.t(), otp :: String.t()) ::
              {:ok, any()} | {:error, any()}
end
