defmodule ThreeChat.Storage.Friendships do
  @moduledoc """
  In-memory storage for friendships using ETS.
  """

  use GenServer

  @table_name :friendships_table

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(user_id, friend_id) do
    GenServer.call(__MODULE__, {:create, user_id, friend_id})
  end

  def get_friends(user_id) do
    :ets.foldl(
      fn {_id, friendship}, acc ->
        cond do
          friendship.user_id == user_id and friendship.status == "accepted" ->
            [friendship.friend_id | acc]

          friendship.friend_id == user_id and friendship.status == "accepted" ->
            [friendship.user_id | acc]

          true ->
            acc
        end
      end,
      [],
      @table_name
    )
  end

  def get_pending_requests(user_id) do
    :ets.foldl(
      fn {_id, friendship}, acc ->
        if friendship.friend_id == user_id and friendship.status == "pending" do
          [friendship | acc]
        else
          acc
        end
      end,
      [],
      @table_name
    )
  end

  def accept(user_id, friend_id) do
    GenServer.call(__MODULE__, {:accept, user_id, friend_id})
  end

  def reject(user_id, friend_id) do
    GenServer.call(__MODULE__, {:reject, user_id, friend_id})
  end

  def remove(user_id, friend_id) do
    GenServer.call(__MODULE__, {:remove, user_id, friend_id})
  end

  def are_friends?(user_id, friend_id) do
    friends = get_friends(user_id)
    friend_id in friends
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl true
  def handle_call({:create, user_id, friend_id}, _from, state) do
    # Check if friendship already exists
    existing =
      :ets.foldl(
        fn {_id, f}, acc ->
          if (f.user_id == user_id and f.friend_id == friend_id) or
               (f.user_id == friend_id and f.friend_id == user_id) do
            [f | acc]
          else
            acc
          end
        end,
        [],
        @table_name
      )

    if Enum.empty?(existing) do
      id = UUID.uuid4()

      friendship = %{
        id: id,
        user_id: user_id,
        friend_id: friend_id,
        status: "pending",
        created_at: DateTime.utc_now()
      }

      :ets.insert(@table_name, {id, friendship})
      {:reply, {:ok, friendship}, state}
    else
      {:reply, {:error, :already_exists}, state}
    end
  end

  @impl true
  def handle_call({:accept, user_id, friend_id}, _from, state) do
    result =
      :ets.foldl(
        fn {id, f}, acc ->
          if f.friend_id == user_id and f.user_id == friend_id and f.status == "pending" do
            updated = %{f | status: "accepted"}
            :ets.insert(@table_name, {id, updated})
            {:ok, updated}
          else
            acc
          end
        end,
        {:error, :not_found},
        @table_name
      )

    {:reply, result, state}
  end

  @impl true
  def handle_call({:reject, user_id, friend_id}, _from, state) do
    result =
      :ets.foldl(
        fn {id, f}, acc ->
          if f.friend_id == user_id and f.user_id == friend_id and f.status == "pending" do
            :ets.delete(@table_name, id)
            :ok
          else
            acc
          end
        end,
        {:error, :not_found},
        @table_name
      )

    {:reply, result, state}
  end

  @impl true
  def handle_call({:remove, user_id, friend_id}, _from, state) do
    :ets.foldl(
      fn {id, f}, _acc ->
        if (f.user_id == user_id and f.friend_id == friend_id) or
             (f.user_id == friend_id and f.friend_id == user_id) do
          :ets.delete(@table_name, id)
        end
      end,
      nil,
      @table_name
    )

    {:reply, :ok, state}
  end
end
