defmodule ThreeChat.Repo.Migrations.CreateFriendships do
  use Ecto.Migration

  def change do
    create table(:friendships, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :friend_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :status, :string, default: "pending", null: false  # pending, accepted, rejected

      timestamps(type: :utc_datetime)
    end

    create index(:friendships, [:user_id])
    create index(:friendships, [:friend_id])
    create index(:friendships, [:status])
    # Prevent duplicate friendships (either direction)
    create unique_index(:friendships, [:user_id, :friend_id], name: :friendships_user_friend_unique)
  end
end
