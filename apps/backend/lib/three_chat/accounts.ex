defmodule ThreeChat.Accounts do
  @moduledoc """
  The Accounts context - handles user management and authentication.
  """

  alias ThreeChat.Storage.Users
  alias ThreeChat.Storage.OTP

  def register_user(attrs) do
    with :ok <- validate_registration(attrs),
         password_hash <- Argon2.hash_pwd_salt(attrs[:password] || ""),
         {:ok, user} <-
           Users.create(Map.put(attrs, :password_hash, password_hash)) do
      {:ok, user}
    end
  end

  def get_user(id), do: Users.get(id)

  def get_user_by_phone(phone_number), do: Users.get_by_phone(phone_number)

  def get_user_by_username(username), do: Users.get_by_username(username)

  def update_user(id, attrs), do: Users.update(id, attrs)

  def search_users(query), do: Users.search(query)

  def verify_user(id) do
    Users.update(id, %{verified: true})
  end

  def authenticate(username, password) do
    case Users.get_by_username(username) do
      {:ok, user} ->
        if Argon2.verify_pass(password, user.password_hash) do
          {:ok, user}
        else
          {:error, :invalid_credentials}
        end

      {:error, :not_found} ->
        Argon2.no_user_verify()
        {:error, :invalid_credentials}
    end
  end

  def create_otp(phone_number), do: OTP.create(phone_number)

  def verify_otp(phone_number, code), do: OTP.verify(phone_number, code)

  defp validate_registration(attrs) do
    cond do
      !valid_username?(attrs[:username]) ->
        {:error, :invalid_username}

      !valid_phone?(attrs[:phone_number]) ->
        {:error, :invalid_phone_number}

      true ->
        :ok
    end
  end

  defp valid_username?(nil), do: false

  defp valid_username?(username) do
    String.length(username) >= 3 and
      String.length(username) <= 20 and
      String.match?(username, ~r/^[a-zA-Z0-9_]+$/)
  end

  defp valid_phone?(nil), do: false

  defp valid_phone?(phone) do
    String.match?(phone, ~r/^\+?[1-9]\d{1,14}$/)
  end
end
