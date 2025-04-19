# Dima Vakatsiienko's .dotfiles

### Installation

Before executing an install script, to kickoff the system windup, perform the following steps manually:

1. Install **[brew](https://brew.sh/)**
2. Install **[fnm](https://github.com/Schniz/fnm)** and **[pnpm](https://pnpm.io/installation)**
   via **[brew](https://brew.sh/)**
3. Install **[node](https://nodejs.org/en)** via **[fnm](https://github.com/Schniz/fnm)**
4. Install **[oh-my-zsh](https://ohmyz.sh/#install)** with **curl**

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
