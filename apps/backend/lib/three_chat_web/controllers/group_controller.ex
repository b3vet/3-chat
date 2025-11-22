defmodule ThreeChatWeb.GroupController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Groups

  def index(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    groups = Groups.get_user_groups(user.id)

    conn
    |> put_status(:ok)
    |> json(%{groups: Enum.map(groups, &format_group/1)})
  end

  def create(conn, params) do
    user = Guardian.Plug.current_resource(conn)

    case Groups.create_group(%{
           name: params["name"],
           description: params["description"],
           creator_id: user.id
         }) do
      {:ok, group} ->
        conn
        |> put_status(:created)
        |> json(%{group: format_group(group)})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def update(conn, %{"id" => group_id} = params) do
    user = Guardian.Plug.current_resource(conn)

    updates =
      params
      |> Map.take(["name", "description", "icon_url"])
      |> Enum.map(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> Map.new()

    case Groups.update_group(group_id, updates, user.id) do
      {:ok, group} ->
        conn
        |> put_status(:ok)
        |> json(%{group: format_group(group)})

      {:error, :unauthorized} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Not authorized to update this group"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def add_member(conn, %{"id" => group_id, "user_id" => member_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Groups.add_member(group_id, member_id, user.id) do
      {:ok, _} ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Member added"})

      {:error, :unauthorized} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Not authorized to add members"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  def remove_member(conn, %{"id" => group_id, "user_id" => member_id}) do
    user = Guardian.Plug.current_resource(conn)

    case Groups.remove_member(group_id, member_id, user.id) do
      :ok ->
        conn
        |> put_status(:ok)
        |> json(%{message: "Member removed"})

      {:error, :unauthorized} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Not authorized to remove members"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: to_string(reason)})
    end
  end

  defp format_group(group) do
    %{
      id: group.id,
      name: group.name,
      description: group.description,
      icon_url: group.icon_url,
      creator_id: group.creator_id,
      created_at: group.created_at
    }
  end
end
