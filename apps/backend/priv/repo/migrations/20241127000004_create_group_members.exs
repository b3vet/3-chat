defmodule ThreeChat.Repo.Migrations.CreateGroupMembers do
  use Ecto.Migration

  def change do
    create table(:group_members, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :group_id, references(:groups, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :role, :string, default: "member", null: false  # creator, admin, member
      add :joined_at, :utc_datetime, null: false
    end

    create unique_index(:group_members, [:group_id, :user_id])
    create index(:group_members, [:user_id])
  end
end
