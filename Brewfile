# Everything this machine is built from. `brew bundle` is the source of truth —
# add a package here, not to a script.
#
#   brew bundle            # install everything missing
#   brew bundle check      # what's missing, without installing
#   brew bundle cleanup    # what's installed but not listed

tap "lutzifer/tap"
tap "oven-sh/bun"
tap "schpet/tap"
tap "teamookla/speedtest"

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
brew "tokei"                     # loc counter
brew "trash"                     # rm, but recoverable
brew "coreutils"                 # gnu twins as g-prefixed names, plus the handful that have no
                                 # bsd counterpart under their plain name — `timeout` among them,
                                 # and macos ships none of its own. sed/date/ls/realpath/stat all
                                 # still resolve to the bsd originals, so nothing is shadowed and
                                 # the gnubin shim stays off PATH. `timeout` and `gtimeout` are
                                 # the same binary; either name works.

# ── Git and review ──────────────────────────────────────────────────────────
brew "git"
brew "gh"                        # GitHub CLI
brew "git-filter-repo"           # history rewriting, for the rare surgery
brew "git-lfs"                   # the lfs filter is wired in .gitconfig with required=true,
                                 # so without this binary an lfs-carrying repo fails to CLONE
brew "schpet/tap/linear"         # Linear CLI — the pm skill runs on this

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
brew "gron"                      # JSON → greppable path=value lines; schema discovery in one pipe
brew "yq"                        # jq-syntax for YAML/TOML — settings.toml, lefthook configs
brew "sd"                        # sed replacement without the macos -i '' quoting traps
brew "ffmpeg"
brew "yt-dlp"
brew "whisper-cpp"               # local speech-to-text — mcp-x-cw transcripts pipeline calls it
brew "poppler"                   # PDF tooling

# ── Odds and ends ───────────────────────────────────────────────────────────
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
cask "font-ia-writer-duo"        # cursor markdown font (iA Writer DuoS)
cask "font-ia-writer-quattro"    # proportional sibling, for prose without tables
cask "pearcleaner"               # app uninstall + leftover hunting; open source, has a CLI
