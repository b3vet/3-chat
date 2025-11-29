defmodule ThreeChat.Repo do
  use Ecto.Repo,
    otp_app: :three_chat,
    adapter: Ecto.Adapters.SQLite3
end
