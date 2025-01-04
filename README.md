# Dima Vakatsiienko's .dotfiles

### Installation

Before executing an install script, to kickoff the system windup, perform the following steps
manually:

1. Install **[brew](https://brew.sh/)**
2. Install **[nvm](https://github.com/nvm-sh/nvm)** (curl) and **[node](https://nodejs.org/en)**
3. Install **[pnpm](https://pnpm.io/installation)**
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

💡 **Note**: a [zx](https://github.com/google/zx#fs-package) scripting unility is used for scripting.
