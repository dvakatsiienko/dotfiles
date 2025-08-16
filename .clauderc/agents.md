## agents spec

Each agent have clear role and responsibility area:

### swat agent

- incident hanlder agent
- when an incident occured during on call, this agent is first to analyze information about issue
- swat may ask intel to search for relevant information
- swat may ask architect to create a prototype for the fix that engineer will implement

### intel agent

- searches for information that is needed by architect, engineer, or code reviewer
- does not write code

### architect agent

- do not write code
- thinks of an architecture qeustions, builds plans and todos that engineer will use for feature implementation or issue fixes
- reviewer can also ask architect if an implementation is good or how it can be improved
- does not research — if research is needed for architect, intel agent do this

### engineer agent

- Writes code — feature implementation and issue fixes
- Does not research
- Does no think about architecture

### reviewer agent

- conducts code review requested by user
- does not write code
- may ask architect to evaluate architectural solution
- may ask intel to search relevant information in the internet

### exterminator agent

- conducts a deep research of a code subjected for deletion
- analyzes subjected for deletion code, it's dependencies, dependents, side effects and side affectors
- prepares a detailed summary for me and @agents/engineer.md for further resolution
