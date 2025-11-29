defmodule ThreeChat.Accounts do
  @moduledoc """
  The Accounts context - handles user management and authentication.
  """

  import Ecto.Query
  alias ThreeChat.Repo
  alias ThreeChat.Schemas.User
  alias ThreeChat.Storage.OTP

  @doc """
  Registers a new user.
  """
  def register_user(attrs) do
    %User{}
    |> User.create_changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, user} -> {:ok, User.to_map(user)}
      {:error, changeset} -> {:error, format_changeset_errors(changeset)}
    end
  end

  @doc """
  Gets a user by ID.
  """
  def get_user(id) do
    case Repo.get(User, id) do
      nil -> {:error, :not_found}
      user -> {:ok, User.to_map(user)}
    end
  end

  @doc """
  Gets a user by phone number.
  """
  def get_user_by_phone(phone_number) do
    case Repo.get_by(User, phone_number: phone_number) do
      nil -> {:error, :not_found}
      user -> {:ok, User.to_map(user)}
    end
  end

  @doc """
  Gets a user by username.
  """
  def get_user_by_username(username) do
    case Repo.get_by(User, username: username) do
      nil -> {:error, :not_found}
      user -> {:ok, User.to_map(user)}
    end
  end

  @doc """
  Updates a user.
  """
  def update_user(id, attrs) do
    case Repo.get(User, id) do
      nil ->
        {:error, :not_found}

      user ->
        user
        |> User.update_changeset(attrs)
        |> Repo.update()
        |> case do
          {:ok, updated_user} -> {:ok, User.to_map(updated_user)}
          {:error, changeset} -> {:error, format_changeset_errors(changeset)}
        end
    end
  end

  @doc """
  Searches for users by username or display_name.
  Options:
    - :exclude_user_id - ID of user to exclude from results (typically current user)
  """
  def search_users(query, opts \\ [])

  def search_users(query, opts) when is_binary(query) and byte_size(query) > 0 do
    # Use lower() for case-insensitive search - works in both SQLite and PostgreSQL
    pattern = "%#{String.downcase(query)}%"
    exclude_id = Keyword.get(opts, :exclude_user_id)

    base_query =
      from(u in User,
        where:
          fragment("lower(?)", u.username) |> like(^pattern) or
            fragment("lower(?)", u.display_name) |> like(^pattern),
        limit: 20
      )

    query_with_exclusion =
      if exclude_id do
        from(u in base_query, where: u.id != ^exclude_id)
      else
        base_query
      end

    query_with_exclusion
    |> Repo.all()
    |> Enum.map(&User.to_map/1)
  end

  def search_users(_, _opts), do: []

  @doc """
  Marks a user as verified.
  """
  def verify_user(id) do
    update_user(id, %{verified: true})
  end

  @doc """
  Authenticates a user by username and password.
  """
  def authenticate(username, password) do
    case Repo.get_by(User, username: username) do
      nil ->
        Argon2.no_user_verify()
        {:error, :invalid_credentials}

      user ->
        if Argon2.verify_pass(password, user.password_hash) do
          {:ok, User.to_map(user)}
        else
          {:error, :invalid_credentials}
        end
    end
  end

  @doc """
  Creates an OTP for a phone number.
  OTP storage remains in ETS as it's ephemeral.
  """
  def create_otp(phone_number), do: OTP.create(phone_number)

  @doc """
  Verifies an OTP for a phone number.
  """
  def verify_otp(phone_number, code), do: OTP.verify(phone_number, code)

  # Private helper to format changeset errors
  defp format_changeset_errors(changeset) do
    errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)

    case Map.keys(errors) do
      [:username] -> :username_taken
      [:phone_number] -> :phone_number_taken
      _ -> errors
    end
  end
end
