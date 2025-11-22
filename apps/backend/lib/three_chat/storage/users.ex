defmodule ThreeChat.Storage.Users do
  @moduledoc """
  In-memory storage for users using ETS.
  """

  use GenServer

  @table_name :users_table

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(user_params) do
    GenServer.call(__MODULE__, {:create, user_params})
  end

  def get(id) do
    case :ets.lookup(@table_name, id) do
      [{^id, user}] -> {:ok, user}
      [] -> {:error, :not_found}
    end
  end

  def get_by_phone(phone_number) do
    case :ets.match_object(@table_name, {:_, %{phone_number: phone_number}}) do
      [{_id, user}] -> {:ok, user}
      [] -> {:error, :not_found}
      _ -> {:error, :not_found}
    end
  end

  def get_by_username(username) do
    case :ets.match_object(@table_name, {:_, %{username: username}}) do
      [{_id, user}] -> {:ok, user}
      [] -> {:error, :not_found}
      _ -> {:error, :not_found}
    end
  end

  def update(id, updates) do
    GenServer.call(__MODULE__, {:update, id, updates})
  end

  def search(query) do
    pattern = String.downcase(query)

    :ets.foldl(
      fn {_id, user}, acc ->
        username_match = String.contains?(String.downcase(user.username || ""), pattern)
        display_match = String.contains?(String.downcase(user.display_name || ""), pattern)

        if username_match or display_match do
          [user | acc]
        else
          acc
        end
      end,
      [],
      @table_name
    )
  end

  # Server Callbacks

  @impl true
  def init(_) do
    table = :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{table: table}}
  end

  @impl true
  def handle_call({:create, user_params}, _from, state) do
    id = UUID.uuid4()

    user = %{
      id: id,
      username: user_params[:username],
      phone_number: user_params[:phone_number],
      display_name: user_params[:display_name],
      password_hash: user_params[:password_hash],
      avatar_url: nil,
      about: nil,
      verified: false,
      created_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now()
    }

    # Check for uniqueness
    case check_uniqueness(user) do
      :ok ->
        :ets.insert(@table_name, {id, user})
        {:reply, {:ok, user}, state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:update, id, updates}, _from, state) do
    case :ets.lookup(@table_name, id) do
      [{^id, user}] ->
        updated_user =
          user
          |> Map.merge(updates)
          |> Map.put(:updated_at, DateTime.utc_now())

        :ets.insert(@table_name, {id, updated_user})
        {:reply, {:ok, updated_user}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  defp check_uniqueness(%{username: username, phone_number: phone_number}) do
    username_exists =
      case get_by_username(username) do
        {:ok, _} -> true
        _ -> false
      end

    phone_exists =
      case get_by_phone(phone_number) do
        {:ok, _} -> true
        _ -> false
      end

    cond do
      username_exists -> {:error, :username_taken}
      phone_exists -> {:error, :phone_number_taken}
      true -> :ok
    end
  end
end
