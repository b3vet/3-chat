# Build stage
FROM elixir:1.17-otp-27-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base git

WORKDIR /app

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV
ENV MIX_ENV=prod

# Install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# Copy compile-time config files before we compile dependencies
COPY config/config.exs config/${MIX_ENV}.exs config/
RUN mix deps.compile

# Copy runtime config
COPY config/runtime.exs config/

# Compile the release
COPY lib lib
COPY priv priv

RUN mix compile

# Build release
RUN mix release

# Runtime stage
FROM alpine:3.20 AS runner

RUN apk add --no-cache libstdc++ openssl ncurses-libs

WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 elixir && \
    adduser -u 1000 -G elixir -s /bin/sh -D elixir

# Copy release from builder
COPY --from=builder --chown=elixir:elixir /app/_build/prod/rel/three_chat ./

# Create uploads directory
RUN mkdir -p /var/uploads && chown elixir:elixir /var/uploads

USER elixir

ENV HOME=/app
ENV PHX_HOST=localhost
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["bin/three_chat", "start"]
