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
brew "coreutils"                 # gnu twins as g-prefixed names; `gtimeout` above all —
                                 # macos ships no `timeout`, and a missing one is SILENT, so a
                                 # command that never ran reads as a hang. NOT on PATH by design:
                                 # the gnubin shim would shadow bsd sed/date/ls and change their
                                 # behaviour repo-wide. call `gtimeout` by name.

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
brew "typescript"                # global tsc/tsserver; the pnpm global shim died in the
                                 # brew move. no global `turbo` on purpose — it has no
                                 # formula, and bytes pins its own, which pnpm exec runs

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
brew "gitingest"                  # repo→text for LLM context; was a broken uv tool
brew "whisper-cpp"               # local speech-to-text
brew "poppler"                   # PDF tooling

# ── Odds and ends ───────────────────────────────────────────────────────────
brew "charmbracelet/tap/crush"          # terminal AI assistant
brew "lutzifer/tap/keyboardswitcher"    # drives the Raycast layout switcher
brew "teamookla/speedtest/speedtest"
brew "duti"                             # sets the default app per file type
brew "tree-sitter-cli"                  # was an npm global; brew owns it now
brew "vercel"                           # vercel/vc — deploys; was a pnpm global that broke

# ── Casks ───────────────────────────────────────────────────────────────────
cask "1password-cli"             # op — SSH agent + signing
cask "warp"                      # terminal — the daily one
cask "iterm2"                    # terminal — fallback; its prefs live in import/iterm2
cask "font-hack-nerd-font"       # the font iTerm2 profiles name; without it, glyphs render as boxes
cask "pearcleaner"               # app uninstall + leftover hunting; open source, has a CLI
