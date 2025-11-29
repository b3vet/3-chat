defmodule ThreeChat.Schemas.Group do
  @moduledoc """
  Schema for groups table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "groups" do
    field :name, :string
    field :description, :string
    field :icon_url, :string

    belongs_to :creator, ThreeChat.Schemas.User
    has_many :members, ThreeChat.Schemas.GroupMember
    has_many :users, through: [:members, :user]

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new group.
  """
  def create_changeset(group, attrs) do
    group
    |> cast(attrs, [:name, :description, :icon_url, :creator_id])
    |> validate_required([:name, :creator_id])
    |> validate_length(:name, min: 1, max: 100)
    |> validate_length(:description, max: 500)
  end

  @doc """
  Changeset for updating a group.
  """
  def update_changeset(group, attrs) do
    group
    |> cast(attrs, [:name, :description, :icon_url])
    |> validate_length(:name, min: 1, max: 100)
    |> validate_length(:description, max: 500)
  end

  @doc """
  Converts a Group schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = group) do
    %{
      id: group.id,
      name: group.name,
      description: group.description,
      icon_url: group.icon_url,
      creator_id: group.creator_id,
      created_at: group.inserted_at,
      updated_at: group.updated_at
    }
  end
end
