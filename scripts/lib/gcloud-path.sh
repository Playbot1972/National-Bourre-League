# shellcheck shell=bash
# Load gcloud into PATH on Mac (Homebrew cask). Source from other scripts.

ensure_gcloud() {
  if command -v gcloud >/dev/null 2>&1; then
    return 0
  fi

  local prefix="" inc=""
  if command -v brew >/dev/null 2>&1; then
    prefix="$(brew --prefix 2>/dev/null || true)"
  fi

  if [[ -n "${prefix}" ]]; then
    if [[ -n "${ZSH_VERSION:-}" && -f "${prefix}/share/google-cloud-sdk/path.zsh.inc" ]]; then
      # shellcheck disable=SC1090
      source "${prefix}/share/google-cloud-sdk/path.zsh.inc"
    elif [[ -f "${prefix}/share/google-cloud-sdk/path.bash.inc" ]]; then
      # shellcheck disable=SC1090
      source "${prefix}/share/google-cloud-sdk/path.bash.inc"
    fi
  fi

  if command -v gcloud >/dev/null 2>&1; then
    return 0
  fi

  if command -v brew >/dev/null 2>&1; then
    echo "==> Installing Google Cloud SDK (brew cask)…"
    brew install --cask google-cloud-sdk
    if [[ -n "${ZSH_VERSION:-}" && -f "${prefix}/share/google-cloud-sdk/path.zsh.inc" ]]; then
      # shellcheck disable=SC1090
      source "${prefix}/share/google-cloud-sdk/path.zsh.inc"
    elif [[ -f "${prefix}/share/google-cloud-sdk/path.bash.inc" ]]; then
      # shellcheck disable=SC1090
      source "${prefix}/share/google-cloud-sdk/path.bash.inc"
    fi
  fi

  command -v gcloud >/dev/null 2>&1
}
