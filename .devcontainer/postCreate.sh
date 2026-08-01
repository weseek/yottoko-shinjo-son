#!/usr/bin/env bash
set -eux

# --- Google Cloud CLI のインストール (Debian 系 / 新方式) ---
if ! command -v gcloud >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates gnupg curl
  curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
    | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
    | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
  sudo apt-get update
  sudo apt-get install -y google-cloud-cli
  sudo rm -rf /var/lib/apt/lists/*
fi

# --- 元の postCreateCommand 相当 ---
sudo chown node:node node_modules
pnpm install
pnpm prisma generate
pnpm prisma db push
