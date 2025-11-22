defmodule ThreeChatWeb.AuthController do
  use ThreeChatWeb, :controller

  alias ThreeChat.Accounts
  alias ThreeChat.Guardian
  alias ThreeChat.SMS.Service, as: SMSService

  def register(conn, params) do
    case Accounts.register_user(%{
           username: params["username"],
           phone_number: params["phone_number"],
           display_name: params["display_name"],
           password: params["password"]
         }) do
      {:ok, user} ->
        # Send OTP for verification
        SMSService.send_otp(user.phone_number)

        conn
        |> put_status(:created)
        |> json(%{
          message: "Registration successful. Please verify your phone number.",
          user_id: user.id
        })

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: format_error(reason)})
    end
  end

  def verify_otp(conn, %{"phone_number" => phone_number, "otp" => otp}) do
    with :ok <- Accounts.verify_otp(phone_number, otp),
         {:ok, user} <- Accounts.get_user_by_phone(phone_number),
         {:ok, _user} <- Accounts.verify_user(user.id),
         {:ok, tokens} <- Guardian.create_tokens(user) do
      conn
      |> put_status(:ok)
      |> json(%{
        message: "Phone verified successfully",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: format_user(user)
      })
    else
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: format_error(reason)})
    end
  end

  def login(conn, %{"username" => username, "password" => password}) do
    case Accounts.authenticate(username, password) do
      {:ok, user} ->
        {:ok, tokens} = Guardian.create_tokens(user)

        conn
        |> put_status(:ok)
        |> json(%{
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          user: format_user(user)
        })

      {:error, :invalid_credentials} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid username or password"})
    end
  end

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case Guardian.refresh_tokens(refresh_token) do
      {:ok, tokens} ->
        conn
        |> put_status(:ok)
        |> json(%{
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token
        })

      {:error, _reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid refresh token"})
    end
  end

  defp format_user(user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      about: user.about,
      verified: user.verified
    }
  end

  defp format_error(:username_taken), do: "Username is already taken"
  defp format_error(:phone_number_taken), do: "Phone number is already registered"
  defp format_error(:invalid_username), do: "Invalid username format"
  defp format_error(:invalid_phone_number), do: "Invalid phone number format"
  defp format_error(:invalid_code), do: "Invalid verification code"
  defp format_error(:expired), do: "Verification code has expired"
  defp format_error(:too_many_attempts), do: "Too many verification attempts"
  defp format_error(reason), do: to_string(reason)
end
