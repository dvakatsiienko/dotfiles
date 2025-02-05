# Dima Vakatsiienko's .dotfiles

### Installation

Before executing an install script, to kickoff the system windup, perform the following steps
manually:

1. Install **[brew](https://brew.sh/)**
1. Install **[fnm](https://github.com/Schniz/fnm)** via **[brew](https://brew.sh/)**
2. Install **[node](https://nodejs.org/en)** via **[fnm](https://github.com/Schniz/fnm)**
3. Install **[pnpm](https://pnpm.io/installation)** **[brew](https://brew.sh/)**
4. Install **[oh-my-zsh](https://ohmyz.sh/#install)** (curl)

Install project dependencies:

```bash
pnpm i
```

Install macOS defaults and binaries:

```bash
pnpm install-macos
```

Install dotfiles:

```bash
pnpm install-dotfiles
```

💡 **Note**: a [zx](https://github.com/google/zx#fs-package) scripting unility is used for
scripting.
