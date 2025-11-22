defmodule ThreeChat.Storage.OTP do
  @moduledoc """
  In-memory storage for OTP codes using ETS with expiration.
  """

  use GenServer

  @table_name :otp_table
  @otp_validity_seconds 300

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def create(phone_number) do
    GenServer.call(__MODULE__, {:create, phone_number})
  end

  def verify(phone_number, code) do
    GenServer.call(__MODULE__, {:verify, phone_number, code})
  end

  def get(phone_number) do
    case :ets.lookup(@table_name, phone_number) do
      [{^phone_number, otp_data}] ->
        if DateTime.compare(DateTime.utc_now(), otp_data.expires_at) == :lt do
          {:ok, otp_data}
        else
          {:error, :expired}
        end

      [] ->
        {:error, :not_found}
    end
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [:set, :named_table, :public, read_concurrency: true])

    # Schedule cleanup every minute
    schedule_cleanup()

    {:ok, %{}}
  end

  @impl true
  def handle_call({:create, phone_number}, _from, state) do
    code = generate_otp()
    expires_at = DateTime.add(DateTime.utc_now(), @otp_validity_seconds, :second)

    otp_data = %{
      code: code,
      phone_number: phone_number,
      expires_at: expires_at,
      attempts: 0,
      created_at: DateTime.utc_now()
    }

    :ets.insert(@table_name, {phone_number, otp_data})
    {:reply, {:ok, code}, state}
  end

  @impl true
  def handle_call({:verify, phone_number, code}, _from, state) do
    case :ets.lookup(@table_name, phone_number) do
      [{^phone_number, otp_data}] ->
        cond do
          DateTime.compare(DateTime.utc_now(), otp_data.expires_at) != :lt ->
            :ets.delete(@table_name, phone_number)
            {:reply, {:error, :expired}, state}

          otp_data.attempts >= 3 ->
            :ets.delete(@table_name, phone_number)
            {:reply, {:error, :too_many_attempts}, state}

          otp_data.code == code ->
            :ets.delete(@table_name, phone_number)
            {:reply, :ok, state}

          true ->
            updated = %{otp_data | attempts: otp_data.attempts + 1}
            :ets.insert(@table_name, {phone_number, updated})
            {:reply, {:error, :invalid_code}, state}
        end

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = DateTime.utc_now()

    :ets.foldl(
      fn {phone_number, otp_data}, _acc ->
        if DateTime.compare(now, otp_data.expires_at) != :lt do
          :ets.delete(@table_name, phone_number)
        end
      end,
      nil,
      @table_name
    )

    schedule_cleanup()
    {:noreply, state}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, 60_000)
  end

  defp generate_otp do
    :rand.uniform(999_999)
    |> Integer.to_string()
    |> String.pad_leading(6, "0")
  end
end
