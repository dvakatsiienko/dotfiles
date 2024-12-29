# Dima Vakatsiienko's .dotfiles

### Installation

Before executing an install script, to kickoff the system windup, perform the following steps manually:
1. Install **brew**
2. Install **nvm** (curl) and **node**
3. Install **pnpm**
4. Install **oh-my-zsh** (curl)

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

Before running an install script, ensure that all
[required binaries](https://github.com/dvakatsiienko/.dotfiles/blob/main/script/install_macos.mjs#L36)
are installed.

💡 Note: a [zx](https://github.com/google/zx#fs-package) is used for scripting.
