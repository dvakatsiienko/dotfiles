# 2026-09-09 — tails, stacks and the notes bench · run cclio-memory-bridge

- the evergreen fork said graphql 17 «merge» after grepping src; the coder had said on 2026-09-08 that apollo server is not ready — `npm view @apollo/server peerDependencies.graphql` = `^16.11.0`, so the pr breaks the peer contract · cost: one wrong ➡️ in front of dima · lesson: «what breaks» must read the PEER RANGES of every dependant (`pnpm why <pkg>` + `npm view <dependant> peerDependencies`), src grep is the second half — fold into `cclio:evergreen` step 3
