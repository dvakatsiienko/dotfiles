#!/bin/sh
# Cloud sessions clone the repo and stop there: no node_modules, so no biome, no
# tsc, no vitest. An agent then commits and pushes with every local gate skipped.
# This puts the tools back within reach. It does not install git hooks — see below.
#
# Runs on every session start, cloud or local. Locally it is a no-op after the
# first install; the cost is a lockfile check.

[ -f package.json ] || exit 0
command -v pnpm >/dev/null 2>&1 || exit 0

# --ignore-scripts skips `prepare` → skips `lefthook install`, on purpose.
#
# The pre-push hook runs `pnpm dotfiles-link`, which exits 1 anywhere the links
# are absent or conflicting — every fresh container, always. Installing hooks
# here would block the agent's push instead of gating it. CI is the gate that
# survives a container; hooks stay a local-machine convenience, wired by
# `prepare` on a real `pnpm install`.
pnpm install --frozen-lockfile --ignore-scripts >/dev/null 2>&1 || exit 0
