# the readme's terminal clip. vhs records frames and ffmpeg builds the gif: vhs has no play-once
# or palette setting, and its own gif loops forever at twice the size (86 KB vs 39 KB, vhs 0.12.1):
#   vhs assets/frame-link.tape && cd /tmp/frame-link-frames && ffmpeg -y -framerate 50 -i frame-text-%05d.png \
#     -framerate 50 -i frame-cursor-%05d.png -filter_complex "[0][1]overlay,fps=12,scale=720:-1:flags=lanczos,split[a][b];\
#     [a]palettegen=max_colors=32:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
#     -loop -1 ~/frame/assets/frame-link.gif
Output "/tmp/frame-link-frames/"

Set Shell "zsh"
Set FontFamily "Menlo"
Set FontSize 14
Set Width 900
Set Height 560
Set Padding 24
Set TypingSpeed 60ms
Set Theme { "name": "gruvbox-violet", "background": "#282828", "foreground": "#ebdbb2", "cursor": "#fabd2f", "selection": "#504945", "black": "#282828", "red": "#cc241d", "green": "#98971a", "yellow": "#d79921", "blue": "#458588", "magenta": "#b16286", "cyan": "#689d6a", "white": "#a89984", "brightBlack": "#928374", "brightRed": "#fb4934", "brightGreen": "#b8bb26", "brightYellow": "#fabd2f", "brightBlue": "#83a598", "brightPurple": "#d3869b", "brightCyan": "#8ec07c", "brightWhite": "#ebdbb2" }

Hide
Type "cd ~/frame && export PS1='%F{#8ec07c}~/frame ❯%f ' && clear"
Enter
Show

Sleep 500ms
Type "pnpm --silent frame:link"
Sleep 400ms
Enter
Sleep 3s
