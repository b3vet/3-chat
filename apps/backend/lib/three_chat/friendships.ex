defmodule ThreeChat.Friendships do
  @moduledoc """
  The Friendships context - handles friend relationships.
  """

  import Ecto.Query
  alias ThreeChat.Repo
  alias ThreeChat.Schemas.Friendship

  @doc """
  Creates a friend request.
  """
  def create(user_id, friend_id) do
    # Check if friendship already exists in either direction
    existing =
      from(f in Friendship,
        where:
          (f.user_id == ^user_id and f.friend_id == ^friend_id) or
            (f.user_id == ^friend_id and f.friend_id == ^user_id)
      )
      |> Repo.exists?()

    if existing do
      {:error, :already_exists}
    else
      %Friendship{}
      |> Friendship.create_changeset(%{user_id: user_id, friend_id: friend_id})
      |> Repo.insert()
      |> case do
        {:ok, friendship} -> {:ok, Friendship.to_map(friendship)}
        {:error, _changeset} -> {:error, :create_failed}
      end
    end
  end

  @doc """
  Gets all friend IDs for a user.
  """
  def get_friends(user_id) do
    # Get accepted friendships where user is either the requester or the friend
    query =
      from(f in Friendship,
        where: f.status == "accepted",
        where: f.user_id == ^user_id or f.friend_id == ^user_id,
        select: %{user_id: f.user_id, friend_id: f.friend_id}
      )

    Repo.all(query)
    |> Enum.map(fn %{user_id: uid, friend_id: fid} ->
      if uid == user_id, do: fid, else: uid
    end)
  end

  @doc """
  Gets pending friend requests received by a user.
  """
  def get_pending_requests(user_id) do
    from(f in Friendship,
      where: f.friend_id == ^user_id and f.status == "pending",
      select: f
    )
    |> Repo.all()
    |> Enum.map(&Friendship.to_map/1)
  end

  @doc """
  Gets pending friend requests sent by a user.
  """
  def get_sent_requests(user_id) do
    from(f in Friendship,
      where: f.user_id == ^user_id and f.status == "pending",
      select: f
    )
    |> Repo.all()
    |> Enum.map(&Friendship.to_map/1)
  end

  @doc """
  Accepts a friend request.
  """
  def accept(user_id, friend_id) do
    # Find the pending request where user_id is the recipient
    from(f in Friendship,
      where: f.friend_id == ^user_id and f.user_id == ^friend_id and f.status == "pending"
    )
    |> Repo.one()
    |> case do
      nil ->
        {:error, :not_found}

      friendship ->
        friendship
        |> Friendship.status_changeset("accepted")
        |> Repo.update()
        |> case do
          {:ok, updated} -> {:ok, Friendship.to_map(updated)}
          {:error, _} -> {:error, :update_failed}
        end
    end
  end

  @doc """
  Rejects a friend request.
  """
  def reject(user_id, friend_id) do
    from(f in Friendship,
      where: f.friend_id == ^user_id and f.user_id == ^friend_id and f.status == "pending"
    )
    |> Repo.delete_all()
    |> case do
      {0, _} -> {:error, :not_found}
      {_, _} -> :ok
    end
  end

  @doc """
  Removes a friendship (either direction).
  """
  def remove(user_id, friend_id) do
    from(f in Friendship,
      where:
        (f.user_id == ^user_id and f.friend_id == ^friend_id) or
          (f.user_id == ^friend_id and f.friend_id == ^user_id)
    )
    |> Repo.delete_all()

    :ok
  end

  @doc """
  Checks if two users are friends.
  """
  def are_friends?(user_id, friend_id) do
    from(f in Friendship,
      where:
        f.status == "accepted" and
          ((f.user_id == ^user_id and f.friend_id == ^friend_id) or
             (f.user_id == ^friend_id and f.friend_id == ^user_id))
    )
    |> Repo.exists?()
  end
end
