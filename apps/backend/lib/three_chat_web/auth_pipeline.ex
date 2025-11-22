defmodule ThreeChatWeb.AuthPipeline do
  @moduledoc """
  Guardian authentication pipeline.
  """

  use Guardian.Plug.Pipeline,
    otp_app: :three_chat,
    module: ThreeChat.Guardian,
    error_handler: ThreeChatWeb.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
