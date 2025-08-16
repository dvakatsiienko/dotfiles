# migration from preact to react guide

# this doc describes the information about migration from preact to react

## overview

- emphasis react / preact / ui questions during this flow
- preact is current ui renderer, being replaced with preact and deleted afterwards.
- after preact uninstalled, and react installed and connected to app imports, a regressions may appear across the app.

## flow

- when a react-specific issue occured e.g. infinite render loop, setting state on an unmounted component etc, use @intel subagent to research an issue details and fix approaches
- pick best/simple possible approach to handle a problem
- do not care too much about useEffect rules violation (no included elements in the array), but take care of elements that are redundant participants in useEffect remove those from useEffect dependencies
- encounter of multiple children with the same key is also a common problem you'll handle. for such case think if nearby ids are unique enough, if they're liekly not then figure out path to ensure key uniqeness by using id concatenation with other likely unique entities nearby.
- during tasks, don't hesitate to other important but not complex react anti patterns you notice
- if some questionable or complicated parts encountered ask me about them

## tools

- don't hesitate to call out @itel agent for research
- use grep-mcp to grep react or other codebaes for relevant info
- use contex7-mcp to get info regarding relevant docs, but rely on grep-mcp since it provides you with more relevant and fresh information about code since it search over source code, documentation may be outdated
- use fetch tool for most actual react documentation https://react.dev/
- use fetch tool for most actual preact documentation https://preactjs.com/, in case of functionaliy porting questions arise
