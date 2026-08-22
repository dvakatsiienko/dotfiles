---
name: yt-transcript
description: Turn a YouTube video into text in the conversation, and recall transcripts fetched earlier. Load whenever a YouTube link is pasted, or Dima asks to transcribe / read / summarise / ingest a video, or asks what a video already on the shelf said. Triggers: /x:yt-transcript <url> [transit], "get the transcript of <link>", "what did that video about X say".
argument-hint: "<youtube url> [transit] | <title fragment or video id> | list"
---

# yt-transcript

Dima finds a video useful and wants its content in the thread. This skill downloads YouTube's
captions, cleans them into readable text, and keeps them on a shelf so the same video is never
fetched twice.

**Captions only.** Whisper (model-generated transcripts, for when captions are wrong) is
deliberately not here — it is [DOT-211](linear://linear.app/issue/DOT-211). Never download a
model, never suggest one mid-run; point at that ticket instead.

## Execution adapter

The body is plain shell. Run it with whatever the current surface has:

- **Claude Code** — the `Bash` tool.
- **Claude Desktop / `cw`** — Desktop Commander `start_process` + `read_process_output`.

Requires `yt-dlp`, `jq`, `python3` on `PATH` (all present on this Mac).

## The store

```
~/.claude/shelf/yt-transcripts/{channel}-{title}-{video_id}/
├── transcript.txt    # clean readable text — the thing you read
├── metadata.json     # url, video_id, title, channel, duration, source
└── captions.vtt      # the raw download, kept as the audit trail
```

`metadata.json` is the provenance. `transcript.txt` alone does not say which video it came from,
so **always write metadata.json**, and when you quote a transcript back, name the video and its
url from that file.

📌 **The channel leads and the id trails, and both positions carry weight.**

- **Channel first** because the store sorts alphabetically, so every video from one creator lands
  in one contiguous block. Same reason as the entity-first naming rule everywhere else: the thing
  that groups goes first.
- **`-{video_id}` last** because it is the dedupe key and the recall key. Nothing goes after it.

The whole name is lowercase kebab-case with nothing in it that needs shell quoting — a path from
this store pastes anywhere unquoted. Channel is capped at 24 characters and title at 50, each cut
at a word boundary, so a long title shortens instead of the name growing. The id keeps its original
case, because YouTube ids are case-sensitive.

📌 **A video with no channel simply loses that segment** and becomes `{title}-{video_id}`. Still a
valid, still-dedupable name — better than padding every such directory with the word `unknown`.

## Three modes

| mode | trigger | what happens to the files |
| --- | --- | --- |
| **fetch** (default) | a url | written to the shelf and **kept** |
| **transit** | a url + the word `transit` | written, read into the thread, then **deleted** |
| **recall** | no url — a title fragment or a video id | read only, **never deletes** |

**Keep is the default and stays the default.** Dima picks videos he has already judged useful.

**`transit` is about the shelf staying searchable, not about disk.** The shelf's value is looking
a video back up later, so a video watched once and never revisited makes every later lookup
worse. It is safe as a flag rather than a question because **captions re-download in seconds** —
a transit delete can never lose anything.

## Fetch — the procedure

⚠️ **Shell variables do not survive between tool calls.** Whatever runs the shell here starts a
fresh process each time, so `URL`, `SHELF`, `WORK` and `DIR` are gone by the next call and a `cd`
does not carry either. Two consequences, both load-bearing:

- **Repeat this preamble at the top of every batch.** It is cheap and idempotent.
- **`WORK` is a fixed path, not `mktemp -d`.** A random temp directory cannot be found again from
  the next call. It is a dotfile inside the store, so it never shows up in an `ls` listing or in a
  dedupe match.

```bash
URL='<the youtube url>'
SHELF="$HOME/.claude/shelf/yt-transcripts"
SCRIPTS="$HOME/dotfiles/home/.claude/plugin-x/skills/yt-transcript/scripts"
WORK="$SHELF/.work"
mkdir -p "$SHELF" "$WORK"

# after step 1 has written meta.json, this line belongs in the preamble too
VID=$(jq -r .id "$WORK/meta.json")
```

📌 **Run the whole download as one batch.** Steps 1–2 end with a decision only you can make (which
language), so they are one call. Steps 3–5 need no further judgement, so make them the second call
and keep the whole thing to two round trips.

### 1. One metadata call — never `--list-subs`

```bash
yt-dlp -J --skip-download "$URL" 2>/dev/null > "$WORK/meta.json"
jq '{video_id: .id, title, channel: (.channel // .uploader), duration,
     manual: (.subtitles | keys),
     auto: (.automatic_captions | keys | map(select(startswith("en"))))}' "$WORK/meta.json"
```

⚠️ Never run `yt-dlp --list-subs` for this. It prints **every** language YouTube can machine
translate to — hundreds of rows of noise in the conversation. `-J` gives the same facts plus the
title and channel you need anyway, in one call, in about two seconds.

### 2. Dedupe before downloading anything

```bash
ls "$SHELF" 2>/dev/null | grep -E -- "-${VID}$"
```

A hit means the transcript already exists: **read it and stop.** Do not re-download. Say plainly
that you reused the existing copy.

⚠️ **Anchor the match with `$`, exactly as written.** The id is always the tail of the name after
a hyphen, so an anchored match can only ever hit the same video. An unanchored search would match a
slug that merely contains those letters. `--` is there because the pattern starts with a hyphen.

📌 Never reach for a glob or `find -name` here. This store used to be named `title [id]`, and
`*[PXzHKuBuyJU]` is a **character class** to both — it matches any name ending in one of those
letters. The kebab rename removed the brackets; do not reintroduce that shape.

### 3. Pick exactly ONE language code

From the step-1 output, in order:

1. a manual caption language (`.subtitles`) if one is there — human-written, best quality
2. otherwise the auto caption key ending in `-orig` (`en-orig`) — the spoken language, untranslated
3. otherwise plain `en`

⚠️ **One code, never a pattern.** `--sub-langs 'en.*'` or `'en,en-orig'` makes yt-dlp fetch many
tracks and YouTube answers **429 Too Many Requests**, which then blocks the whole run.

### 4. Download into the target directory

```bash
TITLE=$(jq -r .title "$WORK/meta.json")
CHANNEL=$(jq -r '.channel // .uploader // ""' "$WORK/meta.json")
NAME=$(python3 "$SCRIPTS/sanitize_title.py" "$CHANNEL" "$TITLE" "$VID") || exit 1
DIR="$SHELF/$NAME"
mkdir -p "$DIR" && cd "$DIR"

yt-dlp --skip-download --write-subs --write-auto-subs \
       --sub-langs '<the one code>' --sub-format vtt -o captions "$URL" >/dev/null 2>&1 || true

ls captions.*.vtt && mv captions.*.vtt captions.vtt
```

⚠️ Two things here that look wrong and are not:

- **`|| true`, and success judged by `ls`.** yt-dlp exits non-zero on conditions that still
  produced the file. The `ls` is the real test — if it finds nothing, the download failed;
  if it prints a file, the run is fine whatever the exit code said.
- **both `--write-subs` and `--write-auto-subs`.** Manual and auto captions are separate flags,
  and a video can have one without the other. `Me at the zoo` has manual `en` and zero auto
  captions; auto-only flags fetch nothing and the step fails for no good reason.

yt-dlp appends the language code to the filename (`captions.en-orig.vtt`), hence the rename.

⚠️ **Build the name into `NAME` and bail on failure — never inline it into `DIR`.** If the script
rejects the id, an inlined `$(...)` still leaves `DIR="$SHELF/"`, and the next two lines then
download into the root of the store. The `|| exit 1` is what stops that.

### 5. Clean and record

```bash
python3 "$SCRIPTS/clean_captions.py" captions.vtt transcript.txt

jq -n --slurpfile m "$WORK/meta.json" --arg url "$URL" --arg lang '<the one code>' \
      --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{url: $url, video_id: $m[0].id, title: $m[0].title,
    channel: ($m[0].channel // $m[0].uploader), duration_seconds: $m[0].duration,
    upload_date: $m[0].upload_date, source: "captions", caption_lang: $lang, fetched_at: $at}' \
  > metadata.json

rm -rf "$WORK"
```

`clean_captions.py` strips timestamps, cue numbers, inline tags and HTML entities, drops the
duplicate rolling lines auto captions emit, and groups the result into paragraphs.

### 6. Read it, then report

Read `transcript.txt` and answer whatever was asked.

📌 **Check the size before reading it whole.** A 50-minute talk cleans down to roughly 60k
characters, about 15k tokens. If it is large and the ask is narrow, `grep` it or read a slice
rather than the whole file, and say which you did.

Report in one line: title, channel, duration, and the path as a `cursor://` link.

## Transit

Identical to fetch through step 6, then:

```bash
cd "$SHELF" && rm -rf "$DIR"
ls "$SHELF"
```

- Delete **only** after the transcript is actually in the conversation. Reading is the point;
  deleting is the cleanup.
- The `ls` is the receipt. Confirm the directory is gone and say so.
- 🚫 Never delete anything but the directory for the video just fetched.
- 🚫 `transit` never applies in recall mode. Recall reads what is already there and leaves it.

## Recall

No url, just words: "what did that Theo video say about skills", "read the CLAUDE.md one again".
A bare `list` argument means the first command below and nothing else.

```bash
SHELF="$HOME/.claude/shelf/yt-transcripts"
ls "$SHELF"                                            # everything on the shelf
ls "$SHELF" | grep -iF -- '<fragment or video id>'     # narrow by directory name
grep -li -- '<fragment>' "$SHELF"/*/metadata.json      # search the real titles
```

📌 Directory names are kebab-case, so `CLAUDE.md` does not appear in one — `claude-md` does. When
a fragment is punctuated or Dima quotes a title as he saw it, search `metadata.json` instead; it
holds the title verbatim.

Then read that directory's `transcript.txt`, with `metadata.json` for the url and channel.

- **Recall never deletes.** This is the opposite of `handoff-pull`, which consumes what it reads.
  Deletion here is only ever explicit, and only ever asked for by Dima.
- No match: list what is on the shelf and offer to fetch the video instead. Never invent a url.

## Not in this skill

- **Whisper / model transcripts** — [DOT-211](linear://linear.app/issue/DOT-211). The trigger is
  "the captions are wrong", which no code can detect, so it can only ever be a manual flag.
- **`parakeet-cli`** — a possible future experiment for long English-only videos. Not wired,
  not installed, do not reach for it.
