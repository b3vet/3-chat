defmodule ThreeChat.Groups do
  @moduledoc """
  The Groups context - handles group chat functionality.
  """

  alias ThreeChat.Storage.Groups
  alias ThreeChat.Storage.Messages

  @max_members 50

  def create_group(attrs) do
    Groups.create(attrs)
  end

  def get_group(id), do: Groups.get(id)

  def update_group(id, attrs, user_id) do
    if Groups.is_admin?(id, user_id) do
      Groups.update(id, attrs)
    else
      {:error, :unauthorized}
    end
  end

  def add_member(group_id, user_id, added_by) do
    with true <- Groups.is_admin?(group_id, added_by),
         {:ok, members} <- Groups.get_members(group_id),
         true <- length(members) < @max_members do
      Groups.add_member(group_id, user_id)
    else
      false -> {:error, :unauthorized}
      _ -> {:error, :group_full}
    end
  end

  def remove_member(group_id, user_id, removed_by) do
    cond do
      user_id == removed_by ->
        Groups.remove_member(group_id, user_id)

      Groups.is_admin?(group_id, removed_by) ->
        Groups.remove_member(group_id, user_id)

      true ->
        {:error, :unauthorized}
    end
  end

  def member?(group_id, user_id), do: Groups.member?(group_id, user_id)

  def is_admin?(group_id, user_id), do: Groups.is_admin?(group_id, user_id)

  def get_user_groups(user_id), do: Groups.get_user_groups(user_id)

  def get_members(group_id), do: Groups.get_members(group_id)

  def create_message(attrs) do
    Messages.create(attrs)
  end

  def get_recent_messages(group_id, opts \\ []) do
    case Messages.get_by_chat(group_id, opts) do
      {:ok, messages} -> messages
      _ -> []
    end
  end
end
