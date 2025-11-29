defmodule ThreeChatWeb.UserController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Accounts

  def profile(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    conn
    |> put_status(:ok)
    |> json(%{user: format_user(user)})
  end

  def update_profile(conn, params) do
    user = Guardian.Plug.current_resource(conn)

    updates =
      params
      |> Map.take(["display_name", "about", "avatar_url"])
      |> Enum.map(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> Map.new()

    case Accounts.update_user(user.id, updates) do
      {:ok, updated_user} ->
        conn
        |> put_status(:ok)
        |> json(%{user: format_user(updated_user)})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def search(conn, %{"q" => query}) do
    current_user = Guardian.Plug.current_resource(conn)

    users =
      query
      |> Accounts.search_users(exclude_user_id: current_user.id)
      |> Enum.map(&format_user_public/1)

    conn
    |> put_status(:ok)
    |> json(%{users: users})
  end

  def search(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Missing search query parameter 'q'"})
  end

  defp format_user(user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      about: user.about,
      verified: user.verified
    }
  end

  defp format_user_public(user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    }
  end
end
