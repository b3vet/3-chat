defmodule ThreeChatWeb.FriendController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Friendships
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

  def pending(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    pending_requests = Friendships.get_pending_requests(user.id)

    requests =
      pending_requests
      |> Enum.map(fn req ->
        case Accounts.get_user(req.user_id) do
          {:ok, requester} -> Map.merge(format_friend(requester), %{requested_at: req.created_at})
          _ -> nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    conn
    |> put_status(:ok)
    |> json(%{requests: requests})
  end

  def sent(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    sent_requests = Friendships.get_sent_requests(user.id)

    requests =
      sent_requests
      |> Enum.map(fn req ->
        case Accounts.get_user(req.friend_id) do
          {:ok, friend} -> Map.merge(format_friend(friend), %{requested_at: req.created_at})
          _ -> nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    conn
    |> put_status(:ok)
    |> json(%{requests: requests})
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

  def accept(conn, %{"id" => friend_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Friendships.accept(user.id, friend_id) do
      {:ok, _friendship} ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Friend request accepted"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Friend request not found"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def reject(conn, %{"id" => friend_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Friendships.reject(user.id, friend_id) do
      :ok ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Friend request rejected"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Friend request not found"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
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
