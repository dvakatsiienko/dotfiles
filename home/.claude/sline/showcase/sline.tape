# sline showcase. vhs 0.12 writes no gif (vhs #787): it records frames, ffmpeg builds the gif:
#   vhs sline.tape && cd /tmp/sline-frames && ffmpeg -y -start_number <first non-blank frame> -framerate 50 -i frame-text-%05d.png -framerate 50 -i frame-cursor-%05d.png \
#     -filter_complex "[0][1]overlay,mpdecimate=hi=64*12:lo=64*5:frac=0.1,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
#     -fps_mode vfr -loop -1 ~/frame/home/.claude/sline/showcase/sline.gif
Output "/tmp/sline-frames/"

Set Shell "zsh"
Set FontFamily "Hack Nerd Font Mono"
Set FontSize 14
Set Width 1620
Set Height 150
Set Padding 20
Set Theme { "name": "gruvbox-violet", "background": "#282828", "foreground": "#ebdbb2", "cursor": "#282828", "selection": "#504945", "black": "#282828", "red": "#cc241d", "green": "#98971a", "yellow": "#d79921", "blue": "#458588", "magenta": "#b16286", "cyan": "#689d6a", "white": "#a89984", "brightBlack": "#928374", "brightRed": "#fb4934", "brightGreen": "#b8bb26", "brightYellow": "#fabd2f", "brightBlue": "#83a598", "brightPurple": "#d3869b", "brightCyan": "#8ec07c", "brightWhite": "#ebdbb2" }

Hide
Type "export FORCE_HYPERLINK=0 PS1='' PROMPT_EOL_MARK='' && ~/.claude/sline/showcase/show.sh stage && clear"
Enter
Sleep 4s
Type "~/.claude/sline/showcase/show.sh play"
Enter
Sleep 300ms
Show
Sleep 6s
