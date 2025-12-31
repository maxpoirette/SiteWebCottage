#!/usr/bin/env bash
set -euo pipefail

# Install repository hooks by setting core.hooksPath to .githooks
ROOT_DIR="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$ROOT_DIR/.githooks"

if [ ! -d "$HOOKS_DIR" ]; then
  mkdir -p "$HOOKS_DIR"
fi

if [ -f "$ROOT_DIR/.githooks/pre-commit" ]; then
  chmod +x "$ROOT_DIR/.githooks/pre-commit"
else
  echo "ERROR: .githooks/pre-commit not found in repository." >&2
  exit 2
fi

git config core.hooksPath .githooks
echo "Installed commit hooks: core.hooksPath set to .githooks"
echo "Pre-commit hook is active. To bypass locally, set SKIP_COMMIT_MANIFEST=1 before committing."
