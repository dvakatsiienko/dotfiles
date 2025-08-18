#!/bin/bash

# Status line script for Claude Code
# Shows: Model | Node.js version | Git branch | Git diff stats | Git stash count
# With emoji prefixes and enhanced Unicode separators for better visual distinction

# Color definitions
NODE_COLOR=$'\033[38;5;71m'  # Node.js official green #3c873a
NODE_ICON_COLOR=$'\033[38;5;71m'  # Node.js green for icon
PNPM_COLOR=$'\033[38;5;202m' # dark orange
PNPM_ICON_COLOR=$'\033[38;5;202m' # dark orange for icon
DIR_COLOR=$'\033[38;5;248m'  # lighter gray for directory
GIT_COLOR=$'\033[2;37m'      # dim white for git
BRANCH_COLOR=$'\033[32m'     # green for branch
ADD_COLOR=$'\033[32m'        # green for additions
DEL_COLOR=$'\033[31m'        # red for deletions
CLEAN_COLOR=$'\033[2;37m'    # dim white for clean status
STASH_COLOR=$'\033[96m'      # cyan for stash
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

# Function to get current directory name with ~ shortening
get_current_dir_name() {
    local wd="$PWD"
    local home_dir="$HOME"
    
    # Handle special cases
    if [ "$wd" = "/" ]; then
        echo "/"
        return
    fi
    
    if [ "$wd" = "$home_dir" ]; then
        echo "~"
        return
    fi
    
    # If we're in home directory or subdirectory, use ~ prefix
    if [[ "$wd" == "$home_dir"* ]]; then
        local relative_path="${wd#$home_dir}"
        if [ -z "$relative_path" ]; then
            echo "~"
        else
            echo "~$relative_path"
        fi
    else
        # If we're outside home directory, return full path from root
        echo "$wd"
    fi
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

# Function to convert number to superscript
to_superscript() {
    local n="$1"
    local superscripts=("⁰" "¹" "²" "³" "⁴" "⁵" "⁶" "⁷" "⁸" "⁹")
    local result=""
    
    if [ "$n" -eq 0 ]; then
        echo "${superscripts[0]}"
        return
    fi
    
    # Convert each digit to superscript
    while [ "$n" -gt 0 ]; do
        local digit=$((n % 10))
        result="${superscripts[$digit]}$result"
        n=$((n / 10))
    done
    
    echo "$result"
}

# Function to get git branch sync status
get_git_sync_status() {
    local ahead=0
    local behind=0
    local has_upstream=false
    
    # Check if git is available and we're in a repo
    if ! command -v git >/dev/null 2>&1; then
        echo "0 0 false"
        return
    fi
    
    # Get branch status with tracking info
    local output
    output=$(git status -b --porcelain 2>/dev/null)
    
    if [ -z "$output" ]; then
        echo "0 0 false"
        return
    fi
    
    # Parse first line which contains branch info
    local branch_line
    branch_line=$(echo "$output" | head -n1)
    
    # Format: ## branch...origin/branch [ahead 2, behind 1]
    if [[ "$branch_line" != "## "* ]]; then
        echo "0 0 false"
        return
    fi
    
    # Check if branch has upstream
    if [[ "$branch_line" != *"..."* ]]; then
        echo "0 0 false"
        return
    fi
    
    has_upstream=true
    
    # Parse ahead/behind info using regex-like pattern matching
    if [[ "$branch_line" =~ \[ahead\ ([0-9]+) ]]; then
        ahead=${BASH_REMATCH[1]}
    fi
    
    if [[ "$branch_line" =~ behind\ ([0-9]+) ]]; then
        behind=${BASH_REMATCH[1]}
    fi
    
    echo "$ahead $behind $has_upstream"
}

# Function to format sync indicator
format_sync_indicator() {
    local ahead="$1"
    local behind="$2"
    local has_upstream="$3"
    
    # Color definitions for sync status
    local SYNC_AHEAD_COLOR=$'\033[33m'      # yellow for ahead
    local SYNC_BEHIND_COLOR=$'\033[31m'     # red for behind  
    local SYNC_DIVERGED_COLOR=$'\033[35m'   # magenta for diverged
    local BRANCH_COLOR=$'\033[32m'          # green for branch
    
    if [ "$has_upstream" = "false" ]; then
        echo ""  # No upstream, no indicator
        return
    fi
    
    if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
        # Diverged: arrows and numbers
        local ahead_str=$(to_superscript "$ahead")
        local behind_str=$(to_superscript "$behind")
        echo "${SYNC_BEHIND_COLOR}↕${ahead_str}${behind_str}↓${RESET}"
    elif [ "$ahead" -gt 0 ]; then
        # Ahead only: ↑ and number in green
        local ahead_str=$(to_superscript "$ahead")
        echo "${BRANCH_COLOR}↑${ahead_str}${RESET}"
    elif [ "$behind" -gt 0 ]; then
        # Behind only: ↓ and number in yellow
        local behind_str=$(to_superscript "$behind")
        echo "${SYNC_AHEAD_COLOR}↓${behind_str}${RESET}"
    else
        # Up to date: no indicator
        echo ""
    fi
}

# Function to parse git stats from shortstat output
parse_git_stats() {
    local stats="$1"
    local insertions="0"
    local deletions="0"
    
    if [ -z "$stats" ]; then
        echo "0 0"
        return
    fi
    
    # Extract insertions - look for pattern like "5 insertions(+)"
    if [[ "$stats" =~ ([0-9]+)\ insertion ]]; then
        insertions=${BASH_REMATCH[1]}
    fi
    
    # Extract deletions - look for pattern like "3 deletions(-)"
    if [[ "$stats" =~ ([0-9]+)\ deletion ]]; then
        deletions=${BASH_REMATCH[1]}
    fi
    
    echo "$insertions $deletions"
}

# Function to get untracked file count
get_untracked_count() {
    local output
    output=$(git ls-files --others --exclude-standard 2>/dev/null)
    
    if [ -z "$output" ]; then
        echo "0"
        return
    fi
    
    echo "$output" | wc -l | tr -d ' '
}

# Function to get untracked line count
get_untracked_line_count() {
    local files
    files=$(git ls-files --others --exclude-standard 2>/dev/null)
    
    if [ -z "$files" ]; then
        echo "0"
        return
    fi
    
    local total_lines=0
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            local lines
            lines=$(wc -l < "$file" 2>/dev/null || echo "0")
            total_lines=$((total_lines + lines))
        fi
    done <<< "$files"
    
    echo "$total_lines"
}

# Function to get staged file count
get_staged_file_count() {
    local output
    output=$(git diff --cached --name-only 2>/dev/null)
    
    if [ -z "$output" ]; then
        echo "0"
        return
    fi
    
    echo "$output" | wc -l | tr -d ' '
}

# Function to get modified file count
get_modified_file_count() {
    local output
    output=$(git diff --name-only 2>/dev/null)
    
    if [ -z "$output" ]; then
        echo "0"
        return
    fi
    
    echo "$output" | wc -l | tr -d ' '
}

# Function to get stash count
get_stash_count() {
    local output
    output=$(git stash list 2>/dev/null)
    
    if [ -z "$output" ]; then
        echo "0"
        return
    fi
    
    echo "$output" | wc -l | tr -d ' '
}

# Function to initialize state file
init_state_file() {
    if [ ! -f "$STATE_FILE" ]; then
        mkdir -p "$(dirname "$STATE_FILE")"
        echo '{"current_index": 0, "last_update_time": 0}' > "$STATE_FILE"
    fi
}

# Function to get model from settings.json
get_model_from_settings() {
    local settings_file="$HOME/.claude/settings.json"
    
    if [ ! -f "$settings_file" ]; then
        echo "sonnet"
        return
    fi
    
    # Extract model value using grep and basic pattern matching
    local model_line
    model_line=$(grep '"model"' "$settings_file" 2>/dev/null)
    
    if [ -z "$model_line" ]; then
        echo "sonnet"
        return
    fi
    
    # Extract the value between quotes after "model":
    # Handle both "model": "value" and "model":"value"
    local model
    model=$(echo "$model_line" | sed 's/.*"model"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    
    if [ -z "$model" ] || [ "$model" = "$model_line" ]; then
        echo "sonnet"
    else
        echo "$model"
    fi
}

# Function to get model display name with version and coloring
get_model_display_name() {
    local model_name=$(get_model_from_settings)
    local lightgray_color=$'\033[38;5;250m'  # Light gray color for version/plan
    
    case "$model_name" in
        "opus")
            echo "$(apply_gradient "opus")${lightgray_color} 4.1${RESET}"
            ;;
        "opusplan")
            echo "$(apply_gradient "opus plan")${lightgray_color} 4.1${RESET}"
            ;;
        "sonnet")
            echo "$(apply_gradient "sonnet")${lightgray_color} 4.0${RESET}"
            ;;
        "haiku")
            echo "$(apply_gradient "haiku")${lightgray_color} 3.5${RESET}"
            ;;
        *)
            echo "$(apply_gradient "$model_name")"
            ;;
    esac
}

# Function to extract JSON value (simple but more robust than grep/cut)
extract_json_value() {
    local json_file="$1"
    local key="$2"
    
    if [ ! -f "$json_file" ]; then
        echo "0"
        return
    fi
    
    # Use sed for more robust JSON value extraction
    # This handles various spacing around colons and values
    local value
    value=$(sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\\([0-9][0-9]*\\).*/\\1/p" "$json_file" 2>/dev/null)
    
    if [ -z "$value" ]; then
        echo "0"
    else
        echo "$value"
    fi
}

# Function to get rotating model emoji
get_model_emoji() {
    init_state_file
    
    local current_time=$(date +%s)
    local current_index=$(extract_json_value "$STATE_FILE" "current_index")
    local last_update=$(extract_json_value "$STATE_FILE" "last_update_time")
    
    # Check if 1+ hours (3600 seconds) have passed
    if [ $((current_time - last_update)) -ge 3600 ]; then
        # Rotate to next emoji
        current_index=$(((current_index + 1) % ${#MODEL_EMOJIS[@]}))
        # Update state file
        echo "{\"current_index\": $current_index, \"last_update_time\": $current_time}" > "$STATE_FILE"
    fi
    
    echo "${MODEL_EMOJIS[$current_index]}"
}

# Get model emoji and dynamic model name
model_emoji=$(get_model_emoji)
model_text=$(get_model_display_name)

# Get Node.js version with error handling
node_version=""
if command -v node >/dev/null 2>&1; then
    version=$(node --version 2>/dev/null | sed 's/^v//')
    if [ ! -z "$version" ]; then
        node_version="${BOLD}${NODE_ICON_COLOR}󰎙${RESET} ${NODE_COLOR}v${version}${RESET}"
    else
        node_version="${BOLD}${NODE_ICON_COLOR}󰎙${RESET} ${NODE_COLOR}error${RESET}"
    fi
else
    # Node not found, skip showing it
    node_version=""
fi

# Get PNPM version with error handling
pnpm_version=""
if command -v pnpm >/dev/null 2>&1; then
    version=$(pnpm --version 2>/dev/null)
    if [ ! -z "$version" ]; then
        pnpm_version="${PNPM_ICON_COLOR}📦${RESET} ${PNPM_COLOR}v${version}${RESET}"
    else
        pnpm_version="${PNPM_ICON_COLOR}📦${RESET} ${PNPM_COLOR}error${RESET}"
    fi
else
    # pnpm not found, skip showing it
    pnpm_version=""
fi

# Get git information with comprehensive stats
git_info=""
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git branch --show-current 2>/dev/null)
    if [ ! -z "$branch" ]; then
        git_emoji=$(get_git_emoji)
        
        # Get sync status
        read -r ahead behind has_upstream <<< "$(get_git_sync_status)"
        sync_indicator=$(format_sync_indicator "$ahead" "$behind" "$has_upstream")
        
        # Build branch info with sync status
        if [ ! -z "$sync_indicator" ]; then
            git_info="${git_emoji} ${BRANCH_COLOR}${branch}${RESET} ${sync_indicator}"
        else
            git_info="${git_emoji} ${BRANCH_COLOR}${branch}${RESET}"
        fi
        
        # Get git diff stats
        staged_stats=$(git diff --cached --shortstat 2>/dev/null)
        unstaged_stats=$(git diff --shortstat 2>/dev/null)
        
        # Get file counts
        staged_file_count=$(get_staged_file_count)
        modified_file_count=$(get_modified_file_count)
        untracked_count=$(get_untracked_count)
        total_file_count=$((staged_file_count + modified_file_count + untracked_count))
        
        # Parse insertions and deletions
        read -r staged_insertions staged_deletions <<< "$(parse_git_stats "$staged_stats")"
        read -r unstaged_insertions unstaged_deletions <<< "$(parse_git_stats "$unstaged_stats")"
        
        # Add untracked files line count to unstaged insertions
        if [ "$untracked_count" -gt 0 ]; then
            untracked_lines=$(get_untracked_line_count)
            unstaged_insertions=$((unstaged_insertions + untracked_lines))
        fi
        
        has_unstaged_changes=false
        if [ ! -z "$unstaged_stats" ] || [ "$untracked_count" -gt 0 ]; then
            has_unstaged_changes=true
        fi
        
        # Build git stats display based on what changes exist
        if [ ! -z "$staged_stats" ] && [ "$has_unstaged_changes" = "true" ]; then
            # Both staged and unstaged changes
            git_info="${git_info} • ${git_emoji} ${CLEAN_COLOR}(${total_file_count})${RESET} ${ADD_COLOR}+${staged_insertions}${RESET}${DEL_COLOR}-${staged_deletions}${RESET} ${ADD_COLOR}✓${RESET} | ${ADD_COLOR}+${unstaged_insertions}${RESET}${DEL_COLOR}-${unstaged_deletions}${RESET}"
        elif [ ! -z "$staged_stats" ]; then
            # Only staged changes
            git_info="${git_info} • ${git_emoji} ${CLEAN_COLOR}(${staged_file_count})${RESET} ${ADD_COLOR}+${staged_insertions}${RESET}${DEL_COLOR}-${staged_deletions}${RESET} ${ADD_COLOR}✓${RESET}"
        elif [ "$has_unstaged_changes" = "true" ]; then
            # Only unstaged changes (modified + untracked)
            unstaged_file_count=$((modified_file_count + untracked_count))
            git_info="${git_info} • ${git_emoji} ${CLEAN_COLOR}(${unstaged_file_count})${RESET} ${ADD_COLOR}+${unstaged_insertions}${RESET}${DEL_COLOR}-${unstaged_deletions}${RESET}"
        else
            # Clean repo
            git_info="${git_info} • ${git_emoji} ${CLEAN_COLOR}clean${RESET}"
        fi
        
        # Add stash count if any
        stash_count=$(get_stash_count)
        if [ "$stash_count" -gt 0 ]; then
            git_info="${git_info} • 💾 ${STASH_COLOR}stash: ${stash_count}${RESET}"
        fi
    fi
else
    git_emoji=$(get_git_emoji)
    git_info="${git_emoji} ${CLEAN_COLOR}no git${RESET}"
fi

# Get directory name
dir_name=$(get_current_dir_name)

# Build the complete status line
status_parts=()
status_parts+=("${DIR_COLOR}${dir_name}${RESET}")
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