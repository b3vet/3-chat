defmodule ThreeChat.Storage.Groups do
  @moduledoc """
  In-memory storage for groups using ETS.
  """

  use GenServer

  @table_name :groups_table
  @members_table :group_members_table

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(group_params) do
    GenServer.call(__MODULE__, {:create, group_params})
  end

  def get(id) do
    case :ets.lookup(@table_name, id) do
      [{^id, group}] -> {:ok, group}
      [] -> {:error, :not_found}
    end
  end

  def get_members(group_id) do
    case :ets.lookup(@members_table, group_id) do
      [{^group_id, members}] -> {:ok, members}
      [] -> {:ok, []}
    end
  end

  def member?(group_id, user_id) do
    case get_members(group_id) do
      {:ok, members} -> Enum.any?(members, fn m -> m.user_id == user_id end)
      _ -> false
    end
  end

  def is_admin?(group_id, user_id) do
    case get_members(group_id) do
      {:ok, members} ->
        Enum.any?(members, fn m -> m.user_id == user_id and m.role in ["admin", "creator"] end)

      _ ->
        false
    end
  end

  def add_member(group_id, user_id, role \\ "member") do
    GenServer.call(__MODULE__, {:add_member, group_id, user_id, role})
  end

  def remove_member(group_id, user_id) do
    GenServer.call(__MODULE__, {:remove_member, group_id, user_id})
  end

  def update(id, updates) do
    GenServer.call(__MODULE__, {:update, id, updates})
  end

  def get_user_groups(user_id) do
    :ets.foldl(
      fn {group_id, members}, acc ->
        if Enum.any?(members, fn m -> m.user_id == user_id end) do
          case get(group_id) do
            {:ok, group} -> [group | acc]
            _ -> acc
          end
        else
          acc
        end
      end,
      [],
      @members_table
    )
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])
    :ets.new(@members_table, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl true
  def handle_call({:create, params}, _from, state) do
    id = UUID.uuid4()

    group = %{
      id: id,
      name: params[:name],
      description: params[:description],
      icon_url: params[:icon_url],
      creator_id: params[:creator_id],
      created_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now()
    }

    :ets.insert(@table_name, {id, group})

    # Add creator as admin
    creator_member = %{
      user_id: params[:creator_id],
      role: "creator",
      joined_at: DateTime.utc_now()
    }

    :ets.insert(@members_table, {id, [creator_member]})

    {:reply, {:ok, group}, state}
  end

  @impl true
  def handle_call({:add_member, group_id, user_id, role}, _from, state) do
    case :ets.lookup(@members_table, group_id) do
      [{^group_id, members}] ->
        if Enum.any?(members, fn m -> m.user_id == user_id end) do
          {:reply, {:error, :already_member}, state}
        else
          new_member = %{
            user_id: user_id,
            role: role,
            joined_at: DateTime.utc_now()
          }

          :ets.insert(@members_table, {group_id, members ++ [new_member]})
          {:reply, {:ok, new_member}, state}
        end

      [] ->
        {:reply, {:error, :group_not_found}, state}
    end
  end

  @impl true
  def handle_call({:remove_member, group_id, user_id}, _from, state) do
    case :ets.lookup(@members_table, group_id) do
      [{^group_id, members}] ->
        updated_members = Enum.reject(members, fn m -> m.user_id == user_id end)
        :ets.insert(@members_table, {group_id, updated_members})
        {:reply, :ok, state}

      [] ->
        {:reply, {:error, :group_not_found}, state}
    end
  end

  @impl true
  def handle_call({:update, id, updates}, _from, state) do
    case :ets.lookup(@table_name, id) do
      [{^id, group}] ->
        updated_group =
          group
          |> Map.merge(updates)
          |> Map.put(:updated_at, DateTime.utc_now())

        :ets.insert(@table_name, {id, updated_group})
        {:reply, {:ok, updated_group}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end
end
