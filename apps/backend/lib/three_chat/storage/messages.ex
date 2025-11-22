defmodule ThreeChat.Storage.Messages do
  @moduledoc """
  In-memory storage for messages using ETS.
  """

  use GenServer

  @table_name :messages_table
  @chat_index :messages_chat_index

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(message_params) do
    GenServer.call(__MODULE__, {:create, message_params})
  end

  def get(id) do
    case :ets.lookup(@table_name, id) do
      [{^id, message}] -> {:ok, message}
      [] -> {:error, :not_found}
    end
  end

  def get_by_chat(chat_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)
    offset = Keyword.get(opts, :offset, 0)

    case :ets.lookup(@chat_index, chat_id) do
      [{^chat_id, message_ids}] ->
        messages =
          message_ids
          |> Enum.drop(offset)
          |> Enum.take(limit)
          |> Enum.map(fn id ->
            case :ets.lookup(@table_name, id) do
              [{^id, message}] -> message
              [] -> nil
            end
          end)
          |> Enum.reject(&is_nil/1)

        {:ok, messages}

      [] ->
        {:ok, []}
    end
  end

  def update_status(id, status, user_id) do
    GenServer.call(__MODULE__, {:update_status, id, status, user_id})
  end

  def delete(id, user_id) do
    GenServer.call(__MODULE__, {:delete, id, user_id})
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])
    :ets.new(@chat_index, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl true
  def handle_call({:create, params}, _from, state) do
    id = UUID.uuid4()

    message = %{
      id: id,
      sender_id: params[:sender_id],
      chat_id: params[:chat_id],
      group_id: params[:group_id],
      content: params[:content],
      message_type: params[:message_type] || "text",
      status: "sent",
      media_url: params[:media_url],
      reply_to_id: params[:reply_to_id],
      created_at: DateTime.utc_now(),
      delivered_at: nil,
      read_at: nil,
      deleted_at: nil
    }

    :ets.insert(@table_name, {id, message})

    # Update chat index
    chat_key = params[:chat_id] || params[:group_id]

    case :ets.lookup(@chat_index, chat_key) do
      [{^chat_key, ids}] ->
        :ets.insert(@chat_index, {chat_key, ids ++ [id]})

      [] ->
        :ets.insert(@chat_index, {chat_key, [id]})
    end

    {:reply, {:ok, message}, state}
  end

  @impl true
  def handle_call({:update_status, id, status, _user_id}, _from, state) do
    case :ets.lookup(@table_name, id) do
      [{^id, message}] ->
        timestamp = DateTime.utc_now()

        updated_message =
          case status do
            "delivered" -> %{message | status: status, delivered_at: timestamp}
            "read" -> %{message | status: status, read_at: timestamp}
            _ -> %{message | status: status}
          end

        :ets.insert(@table_name, {id, updated_message})
        {:reply, {:ok, updated_message}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:delete, id, user_id}, _from, state) do
    case :ets.lookup(@table_name, id) do
      [{^id, message}] ->
        if message.sender_id == user_id do
          updated_message = %{message | deleted_at: DateTime.utc_now(), content: nil}
          :ets.insert(@table_name, {id, updated_message})
          {:reply, {:ok, updated_message}, state}
        else
          {:reply, {:error, :unauthorized}, state}
        end

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end
end
