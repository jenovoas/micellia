# Multi-stage Dockerfile for Micelia Cortex Daemon & Dashboard
FROM rust:1.80-slim-bookworm AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar PyO3 y tokio-postgres
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos y código fuente
COPY system /app/system

WORKDIR /app/system
ENV PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1

# Compilar binario de Cortex en modo release
RUN cargo build --release --package cortex

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar binario compilado
COPY --from=builder /app/system/target/release/cortex /usr/local/bin/cortex

# Copiar archivos estáticos del dashboard
COPY system/dashboard /app/dashboard

ENV PORT=8080
ENV TCP_PORT=4000
ENV STATIC_DIR=/app/dashboard

EXPOSE 8080 4000

CMD ["/usr/local/bin/cortex"]
