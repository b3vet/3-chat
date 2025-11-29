defmodule ThreeChat.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :username, :string, null: false
      add :phone_number, :string, null: false
      add :display_name, :string
      add :password_hash, :string, null: false
      add :avatar_url, :string
      add :about, :text
      add :verified, :boolean, default: false, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:username])
    create unique_index(:users, [:phone_number])
  end
end
