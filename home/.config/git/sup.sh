#!/usr/bin/env bash
# git sup — status with a face: branch pill, drift, last commit, then the tree grouped by state
set -euo pipefail
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo"; exit 1; }

r=$'\e[0m'; b=$'\e[1m'; dim=$'\e[2m'
blue=$'\e[34m'; green=$'\e[32m'; yellow=$'\e[33m'; red=$'\e[31m'; cyan=$'\e[36m'; mag=$'\e[35m'

branch=$(git symbolic-ref --short -q HEAD || git rev-parse --short HEAD)
up=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)
drift=""
if [[ -n $up ]]; then
  read -r behind ahead < <(git rev-list --left-right --count "$up...HEAD" 2>/dev/null || echo "0 0")
  (( ahead )) && drift+=" ${green}⇡$ahead${r}"
  (( behind )) && drift+=" ${red}⇣$behind${r}"
  [[ -z $drift ]] && drift=" ${dim}= $up${r}"
else
  drift=" ${yellow}no upstream${r}"
fi
stash=$(git stash list 2>/dev/null | wc -l | tr -d ' ')
(( stash )) && drift+="  ${mag}⧉ $stash stashed${r}"

echo "${b}${blue} $branch${r}$drift"
echo "${dim}└ $(git log -1 --pretty=fleet 2>/dev/null)${r}"

staged=() unstaged=() untracked=() conflict=()
while IFS= read -r line; do
  case $line in
    "1 "*|"2 "*)
      xy=${line:2:2}; path=${line##* }
      [[ ${xy:0:1} != . ]] && staged+=("${xy:0:1} $path")
      [[ ${xy:1:1} != . ]] && unstaged+=("${xy:1:1} $path") ;;
    "u "*) conflict+=("${line##* }") ;;
    "? "*) untracked+=("${line:2}") ;;
  esac
done < <(git status --porcelain=v2 --untracked-files=all)

section() {  # icon colour title lines…
  local icon=$1 col=$2 title=$3; shift 3
  (( $# )) || return 0
  echo; echo "${col}${b}$icon $title${r} ${dim}($#)${r}"
  printf "  %s\n" "$@"
}
section "✚" "$green"  "staged"    ${staged[@]+"${staged[@]}"}
section "●" "$yellow" "unstaged"  ${unstaged[@]+"${unstaged[@]}"}
section "○" "$cyan"   "untracked" ${untracked[@]+"${untracked[@]}"}
section "✗" "$red"    "conflicts" ${conflict[@]+"${conflict[@]}"}
(( ${#staged[@]} + ${#unstaged[@]} + ${#untracked[@]} + ${#conflict[@]} )) || echo "${green}✨ clean${r}"
