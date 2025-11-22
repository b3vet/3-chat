defmodule ThreeChat.Presence do
  @moduledoc """
  Handles user presence and online status.
  """

  @presence_table :user_presence

  def init do
    :ets.new(@presence_table, [:set, :named_table, :public, read_concurrency: true])
  end

  def update_status(user_id, status) do
    presence = %{
      user_id: user_id,
      status: status,
      last_seen: DateTime.utc_now()
    }

    :ets.insert(@presence_table, {user_id, presence})
    :ok
  end

  def get_status(user_id) do
    case :ets.lookup(@presence_table, user_id) do
      [{^user_id, presence}] -> {:ok, presence}
      [] -> {:ok, %{status: "offline", last_seen: nil}}
    end
  end

  def format_last_seen(nil), do: "Never"

  def format_last_seen(datetime) do
    now = DateTime.utc_now()
    diff = DateTime.diff(now, datetime, :second)

    cond do
      diff < 60 ->
        "Online"

      diff < 3600 ->
        "#{div(diff, 60)} minutes ago"

      diff < 86400 ->
        "Today at #{Calendar.strftime(datetime, "%H:%M")}"

      diff < 172_800 ->
        "Yesterday at #{Calendar.strftime(datetime, "%H:%M")}"

      diff < 604_800 ->
        Calendar.strftime(datetime, "%A at %H:%M")

      true ->
        Calendar.strftime(datetime, "%m/%d at %H:%M")
    end
  end
end
