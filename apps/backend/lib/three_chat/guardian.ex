defmodule ThreeChat.Guardian do
  @moduledoc """
  Guardian implementation for JWT authentication.
  """

  use Guardian, otp_app: :three_chat

  alias ThreeChat.Accounts

  def subject_for_token(user, _claims) do
    {:ok, to_string(user.id)}
  end

  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user(id) do
      {:ok, user} -> {:ok, user}
      {:error, :not_found} -> {:error, :resource_not_found}
    end
  end

  def resource_from_claims(_claims) do
    {:error, :invalid_claims}
  end

  def create_tokens(user) do
    {:ok, access_token, _claims} =
      encode_and_sign(user, %{}, token_type: "access", ttl: {1, :hour})

    {:ok, refresh_token, _claims} =
      encode_and_sign(user, %{}, token_type: "refresh", ttl: {7, :day})

    {:ok, %{access_token: access_token, refresh_token: refresh_token}}
  end

  def refresh_tokens(refresh_token) do
    case decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      {:ok, claims} ->
        case resource_from_claims(claims) do
          {:ok, user} -> create_tokens(user)
          error -> error
        end

      error ->
        error
    end
  end
end
