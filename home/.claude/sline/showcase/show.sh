#!/bin/zsh
# sline on a clean stage: a throwaway home + shallow clone, so no live stash, handoff or
# peer-socket state leaks in. `show.sh stage` builds it (hidden in the tape), `show.sh play`
# renders the three fixture states (fresh, mid, heavy).
stage=/tmp/sline-stage
bin=/Users/dima/.claude/sline/bin; dir=/Users/dima/.claude/sline/showcase
if [[ $1 == stage ]]; then
  rm -rf $stage && mkdir -p $stage/.claude/shelf/handoffs $stage/.claude/sline /tmp/cc-socks
  git clone -q --depth 1 file:///Users/dima/frame $stage/frame
  # pin the model emoji to 🔮 (pool index 48), stamped fresh so it does not rotate mid-clip
  printf '{"current_index":48,"last_update_time":%s}' "$(date +%s)" > $stage/.claude/sline/sline-state.json
  exit
fi
touch /tmp/cc-socks/$$.sock
export HOME=$stage
cd $stage/frame
for f in $dir/s{0,1,2}.json; do
  clear; printf '\n'; sed "s#/Users/dima/frame#$stage/frame#g" $f | $bin; printf '\n'; sleep 1.4
done
rm -f /tmp/cc-socks/$$.sock
