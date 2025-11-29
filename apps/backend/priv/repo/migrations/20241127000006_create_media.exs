defmodule ThreeChat.Repo.Migrations.CreateMedia do
  use Ecto.Migration

  def change do
    create table(:media, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :filename, :string, null: false
      add :original_filename, :string
      add :content_type, :string, null: false
      add :file_type, :string, null: false  # image, video, audio, document, voice_note
      add :url, :string, null: false
      add :thumb_url, :string
      add :duration, :integer  # For audio/video in seconds
      add :uploaded_at, :utc_datetime, null: false
    end

    create index(:media, [:user_id])
    create index(:media, [:uploaded_at])
  end
end
