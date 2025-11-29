defmodule ThreeChat.Groups do
  @moduledoc """
  The Groups context - handles group chat functionality.
  """

  import Ecto.Query
  alias ThreeChat.Repo
  alias ThreeChat.Schemas.{Group, GroupMember, Message}

  @max_members 50

  @doc """
  Creates a new group.
  """
  def create_group(attrs) do
    Repo.transaction(fn ->
      # Create the group
      group =
        %Group{}
        |> Group.create_changeset(attrs)
        |> Repo.insert!()

      # Add creator as a member with 'creator' role
      %GroupMember{}
      |> GroupMember.create_changeset(%{
        group_id: group.id,
        user_id: attrs[:creator_id],
        role: "creator"
      })
      |> Repo.insert!()

      Group.to_map(group)
    end)
  end

  @doc """
  Gets a group by ID.
  """
  def get_group(id) do
    case Repo.get(Group, id) do
      nil -> {:error, :not_found}
      group -> {:ok, Group.to_map(group)}
    end
  end

  @doc """
  Updates a group.
  """
  def update_group(id, attrs, user_id) do
    with {:ok, _} <- check_admin(id, user_id),
         group when not is_nil(group) <- Repo.get(Group, id) do
      group
      |> Group.update_changeset(attrs)
      |> Repo.update()
      |> case do
        {:ok, updated} -> {:ok, Group.to_map(updated)}
        {:error, _} -> {:error, :update_failed}
      end
    else
      nil -> {:error, :not_found}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Adds a member to a group.
  """
  def add_member(group_id, user_id, added_by) do
    with {:ok, _} <- check_admin(group_id, added_by),
         {:ok, members} <- get_members(group_id),
         true <- length(members) < @max_members do
      %GroupMember{}
      |> GroupMember.create_changeset(%{group_id: group_id, user_id: user_id, role: "member"})
      |> Repo.insert()
      |> case do
        {:ok, member} -> {:ok, GroupMember.to_map(member)}
        {:error, _changeset} -> {:error, :already_member}
      end
    else
      false -> {:error, :group_full}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Removes a member from a group.
  """
  def remove_member(group_id, user_id, removed_by) do
    cond do
      user_id == removed_by ->
        # Users can always remove themselves
        do_remove_member(group_id, user_id)

      is_admin?(group_id, removed_by) ->
        do_remove_member(group_id, user_id)

      true ->
        {:error, :unauthorized}
    end
  end

  defp do_remove_member(group_id, user_id) do
    from(gm in GroupMember,
      where: gm.group_id == ^group_id and gm.user_id == ^user_id
    )
    |> Repo.delete_all()

    :ok
  end

  @doc """
  Checks if a user is a member of a group.
  """
  def member?(group_id, user_id) do
    from(gm in GroupMember,
      where: gm.group_id == ^group_id and gm.user_id == ^user_id
    )
    |> Repo.exists?()
  end

  @doc """
  Checks if a user is an admin of a group.
  """
  def is_admin?(group_id, user_id) do
    from(gm in GroupMember,
      where:
        gm.group_id == ^group_id and
          gm.user_id == ^user_id and
          gm.role in ["admin", "creator"]
    )
    |> Repo.exists?()
  end

  @doc """
  Gets all groups for a user.
  """
  def get_user_groups(user_id) do
    from(g in Group,
      join: gm in GroupMember,
      on: gm.group_id == g.id,
      where: gm.user_id == ^user_id,
      select: g
    )
    |> Repo.all()
    |> Enum.map(&Group.to_map/1)
  end

  @doc """
  Gets all members of a group.
  """
  def get_members(group_id) do
    members =
      from(gm in GroupMember,
        where: gm.group_id == ^group_id,
        select: gm
      )
      |> Repo.all()
      |> Enum.map(&GroupMember.to_map/1)

    {:ok, members}
  end

  @doc """
  Creates a message in a group.
  """
  def create_message(attrs) do
    %Message{}
    |> Message.create_changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, message} -> {:ok, Message.to_map(message)}
      {:error, _changeset} -> {:error, :invalid_message}
    end
  end

  @doc """
  Gets recent messages for a group.
  """
  def get_recent_messages(group_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)
    offset = Keyword.get(opts, :offset, 0)

    from(m in Message,
      where: m.group_id == ^group_id and is_nil(m.deleted_at),
      order_by: [asc: m.inserted_at],
      limit: ^limit,
      offset: ^offset
    )
    |> Repo.all()
    |> Enum.map(&Message.to_map/1)
  end

  # Private helper to check if user is admin
  defp check_admin(group_id, user_id) do
    if is_admin?(group_id, user_id) do
      {:ok, true}
    else
      {:error, :unauthorized}
    end
  end
end
