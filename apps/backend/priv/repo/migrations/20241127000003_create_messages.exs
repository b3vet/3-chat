defmodule ThreeChat.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :sender_id, references(:users, type: :binary_id, on_delete: :nilify_all), null: false
      add :chat_id, :string  # Format: "user1_id:user2_id" sorted
      add :group_id, references(:groups, type: :binary_id, on_delete: :delete_all)
      add :content, :text
      add :message_type, :string, default: "text", null: false
      add :status, :string, default: "sent", null: false
      add :media_url, :string
      add :reply_to_id, :binary_id  # Self-reference, can't use references() easily
      add :delivered_at, :utc_datetime
      add :read_at, :utc_datetime
      add :deleted_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:messages, [:sender_id])
    create index(:messages, [:chat_id])
    create index(:messages, [:group_id])
    create index(:messages, [:inserted_at])
  end
end
