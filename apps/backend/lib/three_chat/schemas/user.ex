defmodule ThreeChat.Schemas.User do
  @moduledoc """
  Schema for users table.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "users" do
    field :username, :string
    field :phone_number, :string
    field :display_name, :string
    field :password_hash, :string
    field :avatar_url, :string
    field :about, :string
    field :verified, :boolean, default: false

    # Virtual field for password (not stored in DB)
    field :password, :string, virtual: true

    has_many :sent_messages, ThreeChat.Schemas.Message, foreign_key: :sender_id
    has_many :group_memberships, ThreeChat.Schemas.GroupMember
    has_many :groups, through: [:group_memberships, :group]
    has_many :media, ThreeChat.Schemas.Media

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new user.
  """
  def create_changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :phone_number, :display_name, :password])
    |> validate_required([:username, :phone_number, :password])
    |> validate_username()
    |> validate_phone_number()
    |> unique_constraint(:username)
    |> unique_constraint(:phone_number)
    |> hash_password()
  end

  @doc """
  Changeset for updating an existing user.
  """
  def update_changeset(user, attrs) do
    user
    |> cast(attrs, [:display_name, :avatar_url, :about, :verified])
  end

  defp validate_username(changeset) do
    changeset
    |> validate_length(:username, min: 3, max: 20)
    |> validate_format(:username, ~r/^[a-zA-Z0-9_]+$/,
      message: "must contain only letters, numbers, and underscores"
    )
  end

  defp validate_phone_number(changeset) do
    changeset
    |> validate_format(:phone_number, ~r/^\+?[1-9]\d{1,14}$/,
      message: "must be a valid international phone number"
    )
  end

  defp hash_password(changeset) do
    case get_change(changeset, :password) do
      nil ->
        changeset

      password ->
        changeset
        |> put_change(:password_hash, Argon2.hash_pwd_salt(password))
        |> delete_change(:password)
    end
  end

  @doc """
  Converts a User schema to a map suitable for JSON responses.
  """
  def to_map(%__MODULE__{} = user) do
    %{
      id: user.id,
      username: user.username,
      phone_number: user.phone_number,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      about: user.about,
      verified: user.verified,
      created_at: user.inserted_at,
      updated_at: user.updated_at
    }
  end
end
