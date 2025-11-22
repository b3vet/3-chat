defmodule ThreeChatWeb.HealthController do
  use ThreeChatWeb, :controller

  def index(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{
      status: "ok",
      version: "0.1.0",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    })
  end
end
