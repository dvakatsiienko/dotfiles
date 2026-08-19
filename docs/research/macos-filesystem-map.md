Ticket: DOT-158

# macos filesystem — the working map

what each top-level directory is for, which ones you may touch, and the reasoning that makes the
answer obvious next time. written from a live machine on 2026-08-19, during the DOT-39 sweep.

not a reference of every path — a map of **who owns what**, which is the thing that decides whether
deleting something is safe.

## 1 · two disks pretending to be one

    mount | grep '^/dev/disk3s1s1'
    /dev/disk3s1s1 on / (apfs, sealed, local, read-only, journaled)

**sealed** and **read-only**. that is `/` — apple's system. signed as a whole; changing one byte
breaks the seal and the mac will not boot. **SIP off does not help**, because the seal is the point.

your side is a second volume, `/dev/disk3s5`, mounted at `/System/Volumes/Data`. macos overlays the
two so the tree looks whole.

the sizes say everything:

| volume | size | used |
| --- | --- | --- |
| `/` — the whole operating system | 12 gib | **4%** |
| `/System/Volumes/Data` — everything of yours | 926 gib | **49%** |

📌 **if a number is big, it is on your side of the line and you are allowed to have an opinion
about it.**

### four symlinks at the root

    etc  -> private/etc
    tmp  -> private/tmp
    var  -> private/var
    home -> /System/Volumes/Data/home

unix software expects `/etc` and `/tmp` to exist, so apple kept the names and pointed them at real
directories under `/private`. 🔎 this is why a stray file shows up as `/private/etc/dotnet` in
`mdfind` but as `/etc/dotnet` when you type it. same place, two spellings.

## 2 · the directories, one line each

| path | what it is | yours? |
| --- | --- | --- |
| `/bin`, `/sbin` | the commands needed to boot — `ls`, `cp`, `mount` | 🚫 sealed. `touch /bin/x` → `Operation not permitted`, even as root |
| `/usr` | the rest of the shipped unix system; `/usr/bin` holds apple's `git`, `python3` | 🚫 sealed |
| `/usr/local` | the crack left open in `/usr` for third parties | ✅ yours |
| `/opt` | "optional" — third-party trees | ✅ yours. **`/opt/homebrew` is the only thing in it** |
| `/etc` → `/private/etc` | system-wide config, small text files | ⚠️ root-owned, edit deliberately |
| `/tmp` → `/private/tmp` | scratch. **wiped on reboot** | ✅ world-writable |
| `/var` → `/private/var` | state that *varies* while running: logs, dbs, `/var/db/receipts` | ⚠️ mostly root |
| `/private` | the real home of `etc`, `tmp`, `var` | — |
| `/dev` | not files — every disk and device as a pseudo-file | 🚫 kernel |
| `/Volumes` | where usb drives and disk images appear | — |
| `/System/Applications` | **apple's built-in apps** | 🚫 unremovable, sealed |
| `/Applications` | everything you installed | ✅ removable |

📌 **the folder tells you whether an app can be removed.** `/System/Applications/Journal.app` cannot
be, by design. `/Applications/iMovie.app` can. same vendor, different answer.

### homebrew is in `/opt`, not `/usr/local`

    brew --prefix  →  /opt/homebrew        # 429 entries in its bin/

on apple silicon brew moved to `/opt/homebrew` specifically to stop fighting `/usr/local`. on intel
macs it was `/usr/local`, which is why half the internet still says so. verified: **zero** homebrew
entries in this machine's `/usr/local/bin` (it holds one `code` symlink into Cursor).

### where a hand-made cli belongs

- ✅ **`~/.local/bin`** — per-user, no password. the right default.
- ⚠️ `/usr/local/bin` — shared, needs root.
- 🚫 `/opt/homebrew/bin` — brew's to manage.
- 🚫 `/bin`, `/sbin` — impossible.

**`PATH` order decides the winner, not recency:**

    /opt/homebrew/bin → /usr/local/bin → /usr/bin → /bin

first match wins. this is why `git` resolves to brew's 2.55.0 rather than apple's `/usr/bin/git` —
and why installing a brew cask for a **self-updating** tool creates two copies whose winner is
decided by this list instead of by which is newer. (DOT-155 declined three casks on exactly this.)

## 3 · an app is one bundle

    ls /Applications/Numi.app/Contents
    Frameworks  Info.plist  Library  MacOS  PkgInfo  PlugIns  Resources  _CodeSignature

`MacOS/` the binary · `Frameworks/` its libraries · `Resources/` its assets · `_CodeSignature`
apple's signature. **the `.app` is the whole program.** that is why dragging to the trash mostly works.

everything else an app leaves behind is *what it made*, not what it is:

| location | meaning | delete? |
| --- | --- | --- |
| `~/Library/Application Support/<name>` | the app is **not sandboxed** — it can read your whole home | ⚠️ **its data.** deliberate only |
| `~/Library/Containers/<bundle-id>` | the app **is sandboxed** — macos gave it a fake home (`Data/Documents`, `Data/Library`) and it sees nothing else | ⚠️ its entire world |
| `~/Library/Group Containers/<team-id>.<name>` | the deliberate hole in the sandbox wall: shared storage between apps from one vendor | 🚫 **check who else claims it** |
| `~/Library/Caches/<name>` | throwaway | ✅ free |
| `/private/var/folders/…` | per-app temp, macos-assigned | ✅ free |

📌 the clearest example on this machine: **`Draw Things` keeps 16 gib of models inside
`Containers/com.liuliu.draw-things/Data/Documents/Models`** — it is sandboxed, so they *cannot* live
in `~`.

⚠️ **the group-container trap, from a real near-miss.** removing `Spark Desktop` (unused, app-store
3.x) looked like it should take `Group Containers/3L68KQB4HG.group.com.readdle.smartemail` — 851 mib
that reads exactly like the dead app's leftovers. it is **live mail data for the older `Spark.app`
still in daily use**. `du` cannot tell you this. entitlements can:

    codesign -d --entitlements - /Applications/Spark.app | strings | grep 3L68KQB4HG

`Spark.app` 2.x claims `group.com.readdle.smartemail`; `Spark Desktop` 3.x claims `group.s3s`.
different containers, one team id.

## 4 · apple's own folders

`com.apple.*` under `Caches` and `Application Support` are **background services**, not apps. the
trailing `d` means daemon — a program with no window.

**they self-clean, and here is the measurement.** on the morning of 2026-08-19
`Caches/com.apple.callintelligenced` was 301 mib and `Caches/com.apple.textunderstandingd` was 301
mib. by that afternoon **both had been removed by macos**, with no action taken. all 22 apple cache
folders together total ~37 mib.

⚠️ two look like junk and are not:

- `Application Support/com.apple.TCC` — **privacy permissions**. delete it and every app re-asks for
  camera, mic and disk access.
- `Application Support/com.apple.wallpaper` (440 mib) — the actual desktop pictures, animated ones included.

also leave alone: `Metadata/CoreSpotlight` (the search index — deleting only forces a slow reindex)
and `/Library/SystemExtensions` (it stages **live** extensions; on this machine tunnelbear's vpn
sits beside a falcon sensor queued for removal).

## 5 · system extensions

not apps and not daemons — kernel-adjacent code apple lets vendors ship. they are **registered**, not
merely installed:

    systemextensionsctl list
    com.crowdstrike.falcon.Agent (7.39/211.04)  Falcon Sensor  [terminated waiting to uninstall on reboot]

📌 **read the state, not the presence.** `terminated waiting to uninstall on reboot` means macos has
accepted the removal and will finish it at boot. still appearing in the list is not failure.

📌 macos lists them by **display name**, not vendor — crowdstrike appears as `Falcon` under
*System Settings → General → Login Items & Extensions → Endpoint Security Extensions*.

⚠️ **never `rm -rf` an app whose system extension is active.** use the vendor's uninstaller
(`falconctl uninstall`) or the settings pane. deleting the bundle from under a live extension can
leave it registered with nothing behind it.

## 6 · the three rules

1. **the folder tells you the risk.** `Caches` throwaway · `Application Support` not · `Containers` a
   sandboxed app's whole world · `/System` untouchable · `/tmp` gone on reboot.
2. **`.app` is the program; everything else is what it made.** delete the second half freely, the
   first deliberately, and use a per-app uninstaller so both go together.
3. **check who else claims it before deleting.** entitlements and `pearcleaner list` answer this;
   `du` never does.

these three carried a 145 gib sweep — 582 → 437 gib used, 65% → 49% — with nothing broken.
