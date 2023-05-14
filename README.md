# Dima Vakatsiienko's .dotfiles

### Installation

First, install dependencies:

```bash
pnpm i
```
Before running an install script, ensure that all
[required binaries](https://github.com/dvakatsiienko/.dotfiles/blob/main/script/install-dotfiles.mjs#L36)
are installed.

💡 Note: a [zx](https://github.com/google/zx#fs-package) is used for scripting.

Install dotfiles:

```bash
pnpm install-dotfiles
```

Install macOS defaults and bins:

```bash
pnpm install-macos
```
