defmodule ThreeChatWeb.FriendController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Storage.Friendships
  alias ThreeChat.Accounts

  def index(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    friend_ids = Friendships.get_friends(user.id)

    friends =
      friend_ids
      |> Enum.map(fn id ->
        case Accounts.get_user(id) do
          {:ok, friend} -> format_friend(friend)
          _ -> nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    conn
    |> put_status(:ok)
    |> json(%{friends: friends})
  end

  def add(conn, %{"username" => username}) do
    user = Guardian.Plug.current_resource(conn)

    with {:ok, friend} <- Accounts.get_user_by_username(username),
         {:ok, friendship} <- Friendships.create(user.id, friend.id) do
      conn
      |> put_status(:created)
      |> json(%{message: "Friend request sent", friendship: friendship})
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "User not found"})

      {:error, :already_exists} ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "Friend request already exists"})
    end
  end

  def delete(conn, %{"id" => friend_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Friendships.remove(user.id, friend_id) do
      :ok ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Friend removed"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  defp format_friend(user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    }
  end
end
