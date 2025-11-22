defmodule ThreeChatWeb.Router do
  use ThreeChatWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug :put_resp_header, "api-version", "1.0.0"
  end

  pipeline :authenticated do
    plug ThreeChatWeb.AuthPipeline
  end

  # Public API routes (no authentication required)
  scope "/api", ThreeChatWeb do
    pipe_through :api

    # Authentication
    post "/auth/register", AuthController, :register
    post "/auth/verify-otp", AuthController, :verify_otp
    post "/auth/login", AuthController, :login
    post "/auth/refresh", AuthController, :refresh

    # Health check
    get "/health", HealthController, :index
  end

  # Protected API routes (authentication required)
  scope "/api", ThreeChatWeb do
    pipe_through [:api, :authenticated]

    # User profile
    get "/users/profile", UserController, :profile
    put "/users/profile", UserController, :update_profile
    get "/users/search", UserController, :search

    # Friends
    post "/friends/add", FriendController, :add
    get "/friends", FriendController, :index
    delete "/friends/:id", FriendController, :delete

    # Messages
    get "/messages/:chat_id", MessageController, :index
    post "/messages", MessageController, :create
    delete "/messages/:id", MessageController, :delete

    # Groups
    post "/groups", GroupController, :create
    get "/groups", GroupController, :index
    put "/groups/:id", GroupController, :update
    post "/groups/:id/members", GroupController, :add_member
    delete "/groups/:id/members/:user_id", GroupController, :remove_member

    # Media
    post "/media/upload", MediaController, :upload
    get "/media/:id", MediaController, :show
  end

  # OpenAPI documentation
  scope "/api" do
    pipe_through :api
    get "/openapi", OpenApiSpex.Plug.RenderSpec, []
  end

  # Enable LiveDashboard in development
  if Application.compile_env(:three_chat, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: ThreeChatWeb.Telemetry
    end
  end
end
