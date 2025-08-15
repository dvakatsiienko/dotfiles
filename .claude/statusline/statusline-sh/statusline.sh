#!/bin/bash

# Status line script for Claude Code
# Shows: Model | Node.js version | Git branch | Git diff stats | Git stash count
# With emoji prefixes and enhanced Unicode separators for better visual distinction

# Color definitions
NODE_COLOR=$'\033[38;5;71m'  # Node.js official green #3c873a
NODE_ICON_COLOR=$'\033[38;5;71m'  # Node.js green for icon
PNPM_COLOR=$'\033[38;5;202m' # dark orange
PNPM_ICON_COLOR=$'\033[38;5;202m' # dark orange for icon
GIT_COLOR=$'\033[2;37m'      # dim white for git
RESET=$'\033[0m'
BOLD=$'\033[1m'

# Gradient colors for the model name (retro rainbow)
GRADIENT_COLORS=(
    $'\033[95m'  # bright magenta
    $'\033[94m'  # bright blue  
    $'\033[96m'  # bright cyan
    $'\033[92m'  # bright green
    $'\033[93m'  # bright yellow
    $'\033[91m'  # bright red
)

# Function to apply retro gradient to text
apply_gradient() {
    local text="$1"
    local colored_text=""
    local text_length=${#text}
    local color_count=${#GRADIENT_COLORS[@]}

    for (( i=0; i<text_length; i++ )); do
        local char="${text:i:1}"
        local color_index=$((i % color_count))
        colored_text="${colored_text}${GRADIENT_COLORS[color_index]}${char}"
    done

    echo "${colored_text}${RESET}"
}

# Emoji arrays and state management
STATE_FILE="$HOME/.claude/statusline/statusline-db.json"
MODEL_EMOJIS=(👽 👻 💫 💨 💭 🤷‍♂️ 🤦‍♂️ 🏄‍♂️ 🐺 🦊 🐆 🦄 🦌 🦬 🐄 🐖 🐪 🦙 🦏 🐇 🦇 🐻 🦥 🦨 🦘 🐓 🐣 🐥 🦅 🦢 🦉 🦩 🐢 🦎 🦭 🪸 🐌 🦂 🌾 🍀 🍌 🥭 🥝 🥥 🍆 🥕 🌶️ 🧀 🍕 🎃 🥋 🔮 🧸 🪵 🪂 ⛈️ ⚡ 🌈 🎹 🕯️ 💡)

# Function to get day/night git emoji
get_git_emoji() {
    local hour=$(date +%H)
    if [ $hour -ge 6 ] && [ $hour -lt 18 ]; then
        echo "🦔"  # Day hedgehog
    else
        echo "🦦"  # Night otter
    fi
}

# Function to initialize state file
init_state_file() {
    if [ ! -f "$STATE_FILE" ]; then
        mkdir -p "$(dirname "$STATE_FILE")"
        echo '{"current_index": 0, "last_update_time": 0}' > "$STATE_FILE"
    fi
}

# Function to get rotating model emoji
get_model_emoji() {
    init_state_file
    
    local current_time=$(date +%s)
    local current_index=$(grep -o '"current_index": [0-9]*' "$STATE_FILE" | cut -d' ' -f2)
    local last_update=$(grep -o '"last_update_time": [0-9]*' "$STATE_FILE" | cut -d' ' -f2)
    
    # Check if 1+ hours (3600 seconds) have passed
    if [ $((current_time - last_update)) -ge 3600 ]; then
        # Rotate to next emoji
        current_index=$(((current_index + 1) % ${#MODEL_EMOJIS[@]}))
        # Update state file
        echo "{\"current_index\": $current_index, \"last_update_time\": $current_time}" > "$STATE_FILE"
    fi
    
    echo "${MODEL_EMOJIS[$current_index]}"
}

# Get model emoji
model_emoji=$(get_model_emoji)

# Build the model section with gradient
model_text=$(apply_gradient "sonnet")

# Get Node.js version
node_version=""
if command -v node >/dev/null 2>&1; then
    version=$(node --version 2>/dev/null | sed 's/v//')
    if [ ! -z "$version" ]; then
        node_version="${BOLD}${NODE_ICON_COLOR}󰎙${RESET} ${NODE_COLOR}v${version}${RESET}"
    fi
fi

# Get PNPM version
pnpm_version=""
if command -v pnpm >/dev/null 2>&1; then
    version=$(pnpm --version 2>/dev/null)
    if [ ! -z "$version" ]; then
        pnpm_version="${PNPM_ICON_COLOR}📦${RESET} ${PNPM_COLOR}v${version}${RESET}"
    fi
fi

# Get git information
git_info=""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git branch --show-current 2>/dev/null)
    if [ ! -z "$branch" ]; then
        git_emoji=$(get_git_emoji)
        git_info="${git_emoji} ${GIT_COLOR}${branch}${RESET}"
    fi
else
    git_emoji=$(get_git_emoji)
    git_info="${git_emoji} ${GIT_COLOR}no git${RESET}"
fi

# Build the complete status line
status_parts=()
status_parts+=("${model_emoji} ${model_text}")
[ ! -z "$node_version" ] && status_parts+=("$node_version")
[ ! -z "$pnpm_version" ] && status_parts+=("$pnpm_version")
[ ! -z "$git_info" ] && status_parts+=("$git_info")

# Join with separator
separator=" • "
status_line=""
for i in "${!status_parts[@]}"; do
    if [ $i -gt 0 ]; then
        status_line+="$separator"
    fi
    status_line+="${status_parts[$i]}"
done

echo "$status_line"