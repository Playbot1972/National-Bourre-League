# shellcheck shell=bash
# Load gcloud into PATH on Mac (Homebrew cask). Source from other scripts.

_gcloud_source_path_inc() {
  local dir="$1"
  if [[ -n "${ZSH_VERSION:-}" && -f "${dir}/path.zsh.inc" ]]; then
    # shellcheck disable=SC1090
    source "${dir}/path.zsh.inc"
    return 0
  fi
  if [[ -f "${dir}/path.bash.inc" ]]; then
    # shellcheck disable=SC1090
    source "${dir}/path.bash.inc"
    return 0
  fi
  if [[ -f "${dir}/bin/gcloud" ]]; then
    export PATH="${dir}/bin:${PATH}"
    return 0
  fi
  return 1
}

_gcloud_try_known_locations() {
  local prefix="" dir candidate
  if command -v brew >/dev/null 2>&1; then
    prefix="$(brew --prefix 2>/dev/null || true)"
  fi

  local dirs=()
  [[ -n "${prefix}" ]] && dirs+=("${prefix}/share/google-cloud-sdk")
  [[ -n "${prefix}" ]] && dirs+=("${prefix}/Caskroom/google-cloud-sdk/latest/google-cloud-sdk")
  dirs+=(
    "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk"
    "/opt/homebrew/share/google-cloud-sdk"
    "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk"
    "/usr/local/share/google-cloud-sdk"
    "${HOME}/google-cloud-sdk"
    "${HOME}/google-cloud-sdk/google-cloud-sdk"
  )

  for dir in "${dirs[@]}"; do
    [[ -d "${dir}" ]] || continue
    _gcloud_source_path_inc "${dir}" && command -v gcloud >/dev/null 2>&1 && return 0
  done

  local bins=(
    "/opt/homebrew/bin/gcloud"
    "/usr/local/bin/gcloud"
  )
  [[ -n "${prefix}" ]] && bins+=("${prefix}/bin/gcloud")
  for candidate in "${bins[@]}"; do
    if [[ -x "${candidate}" ]]; then
      export PATH="$(dirname "${candidate}"):${PATH}"
      command -v gcloud >/dev/null 2>&1 && return 0
    fi
  done

  return 1
}

ensure_gcloud() {
  if command -v gcloud >/dev/null 2>&1; then
    return 0
  fi

  _gcloud_try_known_locations && return 0

  if command -v brew >/dev/null 2>&1; then
    echo "    Installing Google Cloud SDK (brew cask)…"
    if ! brew install --cask google-cloud-sdk; then
      echo "    brew install failed."
      return 1
    fi
    _gcloud_try_known_locations && return 0
  fi

  if command -v apt-get >/dev/null 2>&1; then
    echo "    Install gcloud: https://cloud.google.com/sdk/docs/install#linux"
  else
    echo "    Homebrew not found."
  fi

  return 1
}

gcloud_install_hint() {
  cat <<EOF
Install Google Cloud SDK, then re-run:

  brew install --cask google-cloud-sdk

  # After install, load gcloud into this shell (pick one that exists):
  source "\$(brew --prefix)/share/google-cloud-sdk/path.zsh.inc" 2>/dev/null || \\
  source "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc" 2>/dev/null || \\
  source "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc"

  gcloud --version
  npm run finish-setup -- national-bourre-league booray.win
EOF
}
