defmodule ThreeChat.Schemas.GroupMember do
  @moduledoc """
  Schema for group_members table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "group_members" do
    field :role, :string, default: "member"
    field :joined_at, :utc_datetime

    belongs_to :group, ThreeChat.Schemas.Group
    belongs_to :user, ThreeChat.Schemas.User
  end

  @doc """
  Changeset for creating a new group member.
  """
  def create_changeset(member, attrs) do
    member
    |> cast(attrs, [:group_id, :user_id, :role])
    |> validate_required([:group_id, :user_id])
    |> validate_inclusion(:role, ["creator", "admin", "member"])
    |> put_change(:joined_at, DateTime.utc_now())
    |> unique_constraint([:group_id, :user_id])
  end

  @doc """
  Changeset for updating a group member's role.
  """
  def update_role_changeset(member, role) do
    member
    |> cast(%{role: role}, [:role])
    |> validate_inclusion(:role, ["creator", "admin", "member"])
  end

  @doc """
  Converts a GroupMember schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = member) do
    %{
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at
    }
  end
end
