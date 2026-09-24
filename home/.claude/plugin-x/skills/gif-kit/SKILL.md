---
name: gif-kit
description: Load BEFORE making any gif — «make a gif», «gif from this video», «meme», a YouTube link with timestamps, «captions over a clip», «shrink this gif».
argument-hint: "<youtube url | clip path> [from] [to]"
---

# gif-kit

**lane** — `cc` only: ffmpeg, gifski, yt-dlp and agent-browser run on the mac.

🛠️ **the cli is [FRM-260](linear://linear.app/issue/FRM-260)** — `gif-kit/` with `pnpm gif:fetch` ·
`gif:motion` · `gif:build <spec.json>`, built on the **second real gif**. this gif is that second
one → say so to dima and propose building it first. once it exists, the steps below collapse to
«run the cli» and this line dies.

Scratch lives in `$CLAUDE_JOB_DIR/tmp` (or the session scratchpad); deliverables go to
`~/frame/gifs/<slug>/` — the gif storage, its shape and the sources rule in `gifs/AGENTS.md`. **Absolute paths in every command** — a `cd` moves the session's cwd and
sline shows the scratch path to dima.

## steps

### 1. fetch the section, with margin

```bash
yt-dlp -J --skip-download "$URL" | jq '{title, channel, duration, fps: [.formats[]|select(.vcodec!="none")|.fps]|max}'
yt-dlp -f 'bv*[height<=1080][ext=mp4]/bv*[height<=1080]' \
  --download-sections '*<from-2s>-<to+2s>' --force-keyframes-at-cuts -o "$W/clip.%(ext)s" "$URL"
```

Done when `ffprobe` prints the clip's fps and frame count. The source fps is the ceiling — a gif
never captures more often than the source.

### 2. motion scan — find the cuts and the jumps

A timestamp dima gives is approximate; the **cuts** are exact. Scan before choosing a range.

```bash
ffmpeg -v error -i "$W/clip.mp4" -vf "format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$W/diff.txt" -f null -
ffmpeg -v error -i "$W/clip.mp4" -vf "fps=2,scale=480:-1,tile=4x6" -frames:v 1 "$W/sheet.png"   # read it
```

- `YAVG` > ~20 on one frame = a hard cut. line `i` of `diff.txt` = the change INTO frame `i+1`.
- small moving things (a cursor, a fleeing button) score < 3 — find them with a per-frame
  thresholded diff + bounding box (`uv run --with numpy`, `abs(diff) > 25`, bbox of the mask).
- the bbox union across the segment **is the crop**: pick one square that holds every box.

Done when you can name: the first and last frame of each segment (frame numbers, not seconds),
the crop rect, and how many 1–2-frame events the segment holds.

### 3. frame-exact cut, crop, stack

Select by frame number — seconds drift by a frame.

```bash
ffmpeg -v error -i clip.mp4 -i clip2.mp4 -i top.png -i bot.png -filter_complex \
 "[0]select='between(n,A,B)',setpts=N/25/TB,crop=S:S:X:Y,scale=600:600:flags=lanczos,format=rgb24[a];\
  [1]select='between(n,C,D)',setpts=N/25/TB,crop=...,scale=600:600:flags=lanczos,format=rgb24[b];\
  [a][b]concat=n=2:v=1:a=0[v];[2]format=rgb24[t];[3]format=rgb24[u];[t][v][u]vstack=3" \
 -fps_mode passthrough "$W/frames/f%03d.png"
```

Done when the first and last frame are read as images: no stray frame from the neighbouring
shot, no watermark peeking in at an edge (tighten the crop, credit the creator in text instead).

### 4. captions — html, screenshotted

The local Homebrew ffmpeg has **no `drawtext` / `subtitles`** (no libfreetype, no libass), and
drawtext renders no colour emoji anyway. Captions are an html page:

- one page = top bar + a `600×600` middle slot (a still for preview via `?still=`) + bottom bar
- `agent-browser set viewport 600 <h>` → `open file://…` → `wait 1200` → `screenshot`; crop the
  bars out with ffmpeg at their exact heights
- colour emoji and system fonts render natively; SF Rounded loads by `@font-face` from
  `/System/Library/Fonts/SFNSRounded.ttf`
- bars beat text-over-video on a small gif: legible over white ui, no alpha, a smaller palette
- `text-transform: uppercase` flattens `macOS` — type caps by hand

Done when the preview png is read and the text is exactly dima's wording.

### 5. encode — gifski, plus an mp4 twin

```bash
gifski --fps 25 --quality 85 --motion-quality 85 --lossy-quality 85 -o main.gif "$W"/frames/f*.png
gifski --fps 25 --quality 80 --motion-quality 70 -o small.gif "$W"/frames/f*.png
ffmpeg -framerate 25 -i "$W/frames/f%03d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart main.mp4
```

Done when `ffprobe -show_entries format=duration` on each output equals frames ÷ fps — gifski
merges identical frames, so the **frame count drops and the duration must not**.

## reference

**frame rate** — keep every source frame. 25 fps = an exact 4 cs delay. browsers floor delays
under 2 cs to 10 cs, so never above 50 fps; 30 fps (3.33 cs) jitters. `mpdecimate` eats the
1–2-frame events a meme lives on — analysis only, never the pipeline.

**size targets** — main gif ≤ 5 MB (x mobile), small ≤ 3 MB (slack autoplay, discord), iMessage
over mms wants < 1 MB. telegram and x convert gifs to video: hand them the mp4. photo footage
costs ~3× flat ui per second.

**measured on the first gif** (siri-chase, 2026-09-24): 184 frames, 600×840, 7.36 s — 4.5 MB at
Q85, 3.0 MB at Q80/motion 70, mp4 447 KB. flat-ui-only v1 (133 frames): 1.2 MB at Q90.

**shell gotchas** — zsh does not word-split `$var` (`set -- $q` loops silently do nothing);
`rm dir/*.png` on an empty dir aborts the line (`no matches found`).
