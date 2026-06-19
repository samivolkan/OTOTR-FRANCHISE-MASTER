#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

SPEC_SRC="ototr-giris-codex-spec.md"
TASK_SRC="ototr-giris-codex-task.md"
REF_LOGIN_SRC="ototr-login-soft-corporate-reference.png"
REF_FLOW_SRC="ototr-existing-auth-flow-reference.png"

mkdir -p docs/ui docs/design

if [[ -f "$SPEC_SRC" ]]; then
  cp "$SPEC_SRC" docs/ui/ototr-giris-codex-spec.md
fi

if [[ -f "$TASK_SRC" ]]; then
  cp "$TASK_SRC" docs/ui/ototr-giris-codex-task.md
fi

if [[ -f "$REF_LOGIN_SRC" ]]; then
  cp "$REF_LOGIN_SRC" docs/design/ototr-login-soft-corporate-reference.png
fi

if [[ -f "$REF_FLOW_SRC" ]]; then
  cp "$REF_FLOW_SRC" docs/design/ototr-existing-auth-flow-reference.png
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "HATA: codex komutu bulunamadı. Önce Codex CLI kurulu ve login yapılmış olmalı."
  exit 1
fi

if [[ ! -f docs/ui/ototr-giris-codex-task.md ]]; then
  echo "HATA: docs/ui/ototr-giris-codex-task.md bulunamadı."
  exit 1
fi

IMAGE_ARGS=()
if [[ -f docs/design/ototr-login-soft-corporate-reference.png ]]; then
  IMAGE_ARGS+=(--image docs/design/ototr-login-soft-corporate-reference.png)
fi
if [[ -f docs/design/ototr-existing-auth-flow-reference.png ]]; then
  IMAGE_ARGS+=(--image docs/design/ototr-existing-auth-flow-reference.png)
fi

codex exec \
  --cd "$ROOT" \
  --sandbox workspace-write \
  "${IMAGE_ARGS[@]}" \
  - < docs/ui/ototr-giris-codex-task.md
