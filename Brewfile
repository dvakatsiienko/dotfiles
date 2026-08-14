# Everything this machine is built from. `brew bundle` is the source of truth —
# add a package here, not to a script.
#
#   brew bundle            # install everything missing
#   brew bundle check      # what's missing, without installing
#   brew bundle cleanup    # what's installed but not listed

tap "charmbracelet/tap"
tap "lutzifer/tap"
tap "oven-sh/bun"
tap "schpet/tap"
tap "teamookla/speedtest"
tap "withgraphite/tap"

# ── Shell ───────────────────────────────────────────────────────────────────
brew "zsh"                       # the shell itself, newer than the system one
brew "zsh-autosuggestions"       # fish-style inline suggestions
brew "zsh-syntax-highlighting"   # fish-style command highlighting
brew "starship"                  # the prompt

# ── Moving around ───────────────────────────────────────────────────────────
brew "zoxide"                    # z — jump to any directory by frecency
brew "fzf"                       # fuzzy finder, wired into zoxide's interactive mode
brew "eza"                       # ls
brew "bat"                       # cat, with highlighting
brew "fd"                        # find
brew "ripgrep"                   # grep (replaced the_silver_searcher)
brew "tree"                      # directory trees
brew "trash"                     # rm, but recoverable

# ── Git and review ──────────────────────────────────────────────────────────
brew "git"
brew "gh"                        # GitHub CLI
brew "git-filter-repo"           # history rewriting, for the rare surgery
brew "schpet/tap/linear"         # Linear CLI — the pm skill runs on this
brew "withgraphite/tap/graphite" # stacked PRs

# ── Languages and package managers ──────────────────────────────────────────
brew "fnm"                       # Node version manager
brew "pnpm"                      # the package manager for every JS project here
brew "oven-sh/bun/bun"           # Bun runtime
brew "go"                        # sline is written in Go
brew "uv"                        # the only approved Python package manager

# ── Editors and formatters ──────────────────────────────────────────────────
brew "vim"
brew "neovim"
brew "biome"                     # JS/TS toolchain
brew "stylua"                    # Lua formatter

# ── Containers ──────────────────────────────────────────────────────────────
brew "colima"                    # container runtime, Docker Desktop replacement
brew "docker"
brew "docker-buildx"
brew "docker-compose"

# ── Media and data ──────────────────────────────────────────────────────────
brew "jq"                        # JSON on the command line
brew "ffmpeg"
brew "yt-dlp"
brew "whisper-cpp"               # local speech-to-text
brew "poppler"                   # PDF tooling

# ── Odds and ends ───────────────────────────────────────────────────────────
brew "charmbracelet/tap/crush"          # terminal AI assistant
brew "lutzifer/tap/keyboardswitcher"    # drives the Raycast layout switcher
brew "teamookla/speedtest/speedtest"

# ── Casks ───────────────────────────────────────────────────────────────────
cask "1password-cli"             # op — SSH agent + signing
cask "warp"                      # terminal
cask "dotnet-sdk"
