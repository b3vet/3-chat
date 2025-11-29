defmodule ThreeChat.Schemas.Friendship do
  @moduledoc """
  Schema for friendships table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "friendships" do
    field :status, :string, default: "pending"

    belongs_to :user, ThreeChat.Schemas.User
    belongs_to :friend, ThreeChat.Schemas.User

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new friendship request.
  """
  def create_changeset(friendship, attrs) do
    friendship
    |> cast(attrs, [:user_id, :friend_id])
    |> validate_required([:user_id, :friend_id])
    |> validate_different_users()
    |> unique_constraint([:user_id, :friend_id], name: :friendships_user_friend_unique)
  end

  @doc """
  Changeset for updating friendship status.
  """
  def status_changeset(friendship, status) do
    friendship
    |> cast(%{status: status}, [:status])
    |> validate_inclusion(:status, ["pending", "accepted", "rejected"])
  end

  defp validate_different_users(changeset) do
    user_id = get_field(changeset, :user_id)
    friend_id = get_field(changeset, :friend_id)

    if user_id == friend_id do
      add_error(changeset, :friend_id, "cannot be friends with yourself")
    else
      changeset
    end
  end

  @doc """
  Converts a Friendship schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = friendship) do
    %{
      id: friendship.id,
      user_id: friendship.user_id,
      friend_id: friendship.friend_id,
      status: friendship.status,
      created_at: friendship.inserted_at
    }
  end
end
