#!/bin/zsh
# plays sline through three fixture states (fresh, mid, heavy) on a clean stage:
# a throwaway home + shallow clone, so no live stash, handoff or peer-socket state leaks in
stage=/tmp/sline-stage
rm -rf $stage && mkdir -p $stage/.claude/shelf/handoffs $stage/.claude/sline /tmp/cc-socks
# pin the model emoji to 🔮 (pool index 48) and stamp it fresh so it does not rotate mid-clip
printf '{"current_index":48,"last_update_time":%s}' "$(date +%s)" > $stage/.claude/sline/sline-state.json
git clone -q --depth 1 file://$HOME/frame $stage/frame
bin=$HOME/.claude/sline/bin; dir=$HOME/.claude/sline/showcase
touch /tmp/cc-socks/$$.sock
export HOME=$stage
cd $stage/frame && clear
for f in $dir/s{0,1,2}.json; do
  clear; printf '\n'; sed "s#/Users/dima/frame#$stage/frame#g" $f | $bin; printf '\n'; sleep 1.4
done
rm -f /tmp/cc-socks/$$.sock
