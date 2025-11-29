defmodule ThreeChatWeb.ApiSpec do
  @moduledoc """
  OpenAPI specification for ThreeChat API.
  """
  alias OpenApiSpex.{Info, OpenApi, Paths, Server}

  @behaviour OpenApi

  @impl OpenApi
  def spec do
    %OpenApi{
      info: %Info{
        title: "ThreeChat API",
        version: "1.0.0",
        description: "API for ThreeChat messaging application"
      },
      servers: [
        %Server{url: "http://localhost:4000", description: "Development server"}
      ],
      paths: Paths.from_router(ThreeChatWeb.Router)
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end
