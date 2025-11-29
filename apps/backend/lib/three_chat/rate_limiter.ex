defmodule ThreeChat.RateLimiter do
  @moduledoc """
  Rate limiting module using Hammer.
  Provides rate limiting for messages, media uploads, and API calls.
  """

  @doc """
  Check rate limit for a given type and identifier.

  ## Rate limits by type:
  - `:message` - 100 messages per minute per user
  - `:media_upload` - 10 uploads per minute per user
  - `:api_call` - 1000 calls per hour per user
  - `:websocket` - 5 connection attempts per minute per user
  - `:otp` - 3 OTP requests per 10 minutes per phone number
  """
  def check_rate(type, identifier)

  def check_rate(:message, user_id) do
    Hammer.check_rate("message:#{user_id}", 60_000, 100)
  end

  def check_rate(:media_upload, user_id) do
    Hammer.check_rate("media:#{user_id}", 60_000, 10)
  end

  def check_rate(:api_call, user_id) do
    Hammer.check_rate("api:#{user_id}", 3_600_000, 1000)
  end

  def check_rate(:websocket, user_id) do
    Hammer.check_rate("ws:#{user_id}", 60_000, 5)
  end

  def check_rate(:otp, phone_number) do
    Hammer.check_rate("otp:#{phone_number}", 600_000, 3)
  end

  @doc """
  Check if a rate limit allows the action.
  Returns true if allowed, false if rate limited.
  """
  def allowed?(type, identifier) do
    case check_rate(type, identifier) do
      {:allow, _count} -> true
      {:deny, _limit} -> false
    end
  end

  @doc """
  Get remaining requests for a given rate limit type.
  """
  def remaining(type, identifier) do
    case check_rate(type, identifier) do
      {:allow, count} -> {:ok, get_limit(type) - count}
      {:deny, _limit} -> {:error, 0}
    end
  end

  defp get_limit(:message), do: 100
  defp get_limit(:media_upload), do: 10
  defp get_limit(:api_call), do: 1000
  defp get_limit(:websocket), do: 5
  defp get_limit(:otp), do: 3
end
