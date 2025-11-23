defmodule ThreeChatWeb.RateLimitPlug do
  @moduledoc """
  Plug for rate limiting API requests.
  Uses Hammer backend for rate limiting.
  """

  import Plug.Conn
  alias ThreeChat.RateLimiter

  def init(opts), do: opts

  def call(conn, opts) do
    type = Keyword.get(opts, :type, :api_call)

    case get_identifier(conn) do
      {:ok, identifier} ->
        check_and_respond(conn, type, identifier)

      :error ->
        # If no user is authenticated, use IP address
        ip = get_client_ip(conn)
        check_and_respond(conn, type, ip)
    end
  end

  defp get_identifier(conn) do
    case Guardian.Plug.current_resource(conn) do
      nil -> :error
      user -> {:ok, user.id}
    end
  end

  defp get_client_ip(conn) do
    conn.remote_ip
    |> :inet.ntoa()
    |> to_string()
  end

  defp check_and_respond(conn, type, identifier) do
    case RateLimiter.check_rate(type, identifier) do
      {:allow, count} ->
        conn
        |> put_resp_header("x-ratelimit-limit", to_string(get_limit(type)))
        |> put_resp_header("x-ratelimit-remaining", to_string(get_limit(type) - count))

      {:deny, _limit} ->
        conn
        |> put_status(:too_many_requests)
        |> put_resp_header("x-ratelimit-limit", to_string(get_limit(type)))
        |> put_resp_header("x-ratelimit-remaining", "0")
        |> put_resp_header("retry-after", "60")
        |> Phoenix.Controller.json(%{error: "Rate limit exceeded. Please try again later."})
        |> halt()
    end
  end

  defp get_limit(:message), do: 100
  defp get_limit(:media_upload), do: 10
  defp get_limit(:api_call), do: 1000
  defp get_limit(:websocket), do: 5
  defp get_limit(:otp), do: 3
end
