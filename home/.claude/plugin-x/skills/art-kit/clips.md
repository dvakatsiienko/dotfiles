# clips — terminal → gif

**the tool is `vhs`** (charmbracelet, `brew "vhs"`): a `.tape` script types into a real shell and
records it. frame's readme clip is the live example: `~/frame/assets/frame-link.tape`, its header
holds the whole command.

**vhs records frames, ffmpeg builds the gif.** vhs has no play-once or palette setting
(`vhs manual` lists none, 0.12.1); its own gif loops forever at about twice the size (86 KB vs
39 KB on the frame clip). so the tape sets `Output "<dir>/"` and ffmpeg does the encode:

- overlay the text and cursor frame streams, `fps=12`, `scale=720:-1:flags=lanczos`
- `palettegen=max_colors=32:stats_mode=diff` → `paletteuse=dither=none:diff_mode=rectangle`
- `-loop -1` → plays once and rests on the last frame

a clip is a readme asset: it lands next to the readme it serves (`assets/`), never in `gifs/`.

**done when** the gif plays once, its last frame is the resting state, and the size is read back
against the old one.
