defmodule ThreeChat.Storage.Media do
  @moduledoc """
  In-memory storage for media files metadata using ETS.
  """

  use GenServer

  @table_name :media_table

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(media_params) do
    GenServer.call(__MODULE__, {:create, media_params})
  end

  def get(id) do
    case :ets.lookup(@table_name, id) do
      [{^id, media}] -> {:ok, media}
      [] -> {:error, :not_found}
    end
  end

  def get_by_user(user_id) do
    :ets.foldl(
      fn {_id, media}, acc ->
        if media.user_id == user_id do
          [media | acc]
        else
          acc
        end
      end,
      [],
      @table_name
    )
  end

  def delete(id) do
    GenServer.call(__MODULE__, {:delete, id})
  end

  def delete_older_than(datetime) do
    GenServer.call(__MODULE__, {:delete_older_than, datetime})
  end

  def all do
    :ets.foldl(
      fn {_id, media}, acc -> [media | acc] end,
      [],
      @table_name
    )
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl true
  def handle_call({:create, params}, _from, state) do
    id = params[:id] || UUID.uuid4()

    media = %{
      id: id,
      filename: params[:filename],
      original_filename: params[:original_filename],
      content_type: params[:content_type],
      file_type: params[:file_type],
      user_id: params[:user_id],
      url: params[:url],
      thumb_url: params[:thumb_url],
      duration: params[:duration],
      uploaded_at: params[:uploaded_at] || DateTime.utc_now()
    }

    :ets.insert(@table_name, {id, media})
    {:reply, {:ok, media}, state}
  end

  @impl true
  def handle_call({:delete, id}, _from, state) do
    :ets.delete(@table_name, id)
    {:reply, :ok, state}
  end

  @impl true
  def handle_call({:delete_older_than, datetime}, _from, state) do
    deleted_count =
      :ets.foldl(
        fn {id, media}, count ->
          case DateTime.compare(media.uploaded_at, datetime) do
            :lt ->
              :ets.delete(@table_name, id)
              count + 1

            _ ->
              count
          end
        end,
        0,
        @table_name
      )

    {:reply, {:ok, deleted_count}, state}
  end
end
