#!/bin/zsh
# sline on a clean stage, for render-svg.ts: a throwaway home + shallow clone, so no live stash,
# handoff or peer-socket state leaks in. `show.sh stage` builds it, `show.sh ansi` writes each
# fixture state (fresh, mid, heavy) as raw ansi. then: node render-svg.ts
stage=/tmp/sline-stage
bin=/Users/dima/.claude/sline/bin; dir=/Users/dima/.claude/sline/showcase
if [[ $1 == stage ]]; then
  rm -rf $stage && mkdir -p $stage/.claude/shelf/handoffs $stage/.claude/sline /tmp/cc-socks
  git clone -q --depth 1 file:///Users/dima/frame $stage/frame
  # pin the model emoji to 🔮 (pool index 48), stamped fresh so it does not rotate mid-clip
  printf '{"current_index":48,"last_update_time":%s}' "$(date +%s)" > $stage/.claude/sline/sline-state.json
  exit
fi
# `show.sh ansi` writes each state's raw sline output to $stage/sN.ansi for render-svg.ts
touch /tmp/cc-socks/$$.sock
export HOME=$stage
cd $stage/frame
i=0
for f in $dir/s{0,1,2}.json; do
  sed "s#/Users/dima/frame#$stage/frame#g" $f | FORCE_HYPERLINK=0 $bin > $stage/s$i.ansi; i=$((i+1))
done
rm -f /tmp/cc-socks/$$.sock
