# Claude Code and Claude Desktop collaboration workflow contract

## Overview

This document defines the collaborative research workflow between Claude Desktop and Claude Code for
complex feature development.

## Roles & Responsibilities

### Claude Desktop (Researcher)

- Conducts deep research on feature requirements and implementation approaches
- Gathers code examples, architectural patterns, and best practices
- Provides comprehensive findings in structured format
- Responds to clarifying questions from Claude Code
- Updates research documentation as needed

### Claude Code (Implementer)

- Reviews research findings thoroughly
- Asks clarifying questions about technical details
- Validates implementation readiness before coding
- Implements features based on finalized research
- May request research updates during implementation

## Available Workflows

**IMPORTANT**: This list must be kept in sync with actual `claude-workflow/` directory contents.

### Currently Available Workflows:
1. **`preact-to-react/`** - Migration from Preact to React framework (Status: Research Complete ✅)
2. **`semantic-search/`** - Libsource semantic enhancement (Status: Research Complete ✅)

### Workflow Management Rules:
- **Add New**: When creating new workflow directory, update this list
- **Remove**: When deleting workflow directory, remove from this list  
- **Status Tracking**: Update status based on readiness checkmarks in each workflow

## File Structure

Each feature research lives in its own directory under `claude-workflow/feature-name/`:

```
feature-name/
├── init.md           # Initial briefing with requirements
├── prescreen.md      # MANDATORY: Claude Code's prescreen analysis (codebase/feature analysis)
├── research.md       # Claude Desktop's research findings
├── qa.md            # Questions & answers from both sides
└── final-plan.md    # Implementation plan with readiness checkboxes
```

## Workflow State Management

### Checkmark-Based Progress Tracking

**IMPORTANT**: The entire workflow state is determined by readiness checkmarks (✅/❌).

**Workflow Processing Rules**:
1. **Sequential Processing**: Process files in order: `prescreen.md` → `research.md` → `qa.md` → `final-plan.md`
2. **Current Focus**: The first file containing any ❌ checkmark is the current active task
3. **Completion Criteria**: A file is complete when ALL its checkmarks show ✅
4. **Progression Rule**: Only proceed to next file when current file has ALL ✅ checkmarks
5. **State Check**: Always scan files in order to find the first ❌ and focus efforts there

**Example State Flow**:
- `prescreen.md`: Claude Code ✅ → Move to research
- `research.md`: Claude Desktop ❌ → STOP, wait for Desktop to complete
- `qa.md`: Both ❌ → Work on QA until both mark ✅
- `final-plan.md`: All ❌ → Cannot start until previous files are ✅

This ensures systematic progression and prevents skipping critical steps.

### Workflow Continuation Rules

**Claude Code Workflow Memory**:
1. **Continuation Command**: When user says "let's continue workflow" → resume last active workflow
2. **State Recovery**: 
   - Check `claude-workflow/` directory for existing workflows
   - Scan each workflow's files for first ❌ checkmark
   - Resume from that point
3. **Uncertainty Handling**: If unsure which workflow was active:
   - List all existing workflows in `claude-workflow/`
   - Show current state (which file has ❌)
   - Ask user which workflow to continue
4. **Never Auto-Start**: Never begin a workflow without explicit user instruction
5. **Periodic Reminders**: Allowed to remind user about incomplete workflows occasionally
6. **Sync Maintenance**: When creating/deleting workflows, automatically update the Available Workflows list in this config

**Example Continuation**:
```
User: "Let's continue workflow"
Claude Code: 
1. Checks claude-workflow/ → finds "preact-to-react" 
2. Scans files → prescreen.md ❌ is first incomplete
3. Resumes prescreen analysis
```

## Workflow Process

### Phase 1: Research Initiation

Note: all research initiation steps are mandatory.

1. User creates `feature-name/init.md` with feature requirements
2. **MANDATORY: Claude Code performs prescreen analysis**
   - For migrations: Analyzes current codebase implementation state
   - For new features: Analyzes existing related code and integration points
   - Identifies potential challenges, weak spots, and risk areas
   - **CRITICAL**: Prepares specific questions for Claude Desktop based on most problematic areas
   - Creates `prescreen.md` with comprehensive findings and targeted research questions
   - Marks prescreen.md with Claude Code ✅ when complete
3. User forwards `init.md` + `prescreen.md` to Claude Desktop for research
4. **MANDATORY: Claude Desktop tech stack analysis**
   - **Step 4a**: Examine project's actual tech stack using:
     - Project CLAUDE.md for technology overview
     - package.json dependencies
     - prescreen.md findings
   - **Step 4b**: Read and analyze Claude Code's prescreen findings and questions
   - **Step 4c**: Align research focus with ACTUAL technologies used (avoid irrelevant research)
   - Example: If project uses Tailwind → research Tailwind patterns, NOT styled-components
   - Marks prescreen.md with Claude Desktop ✅ after tech stack analysis and prescreen review
5. Claude Desktop conducts focused research based on actual tech stack
6. Claude Desktop may ask clarifying questions to the user
7. Once all Claude Desktop questions are answered, Claude Desktop registers its questions and
   answers in qa.md
8. Claude Desktop populates `research.md` with findings relevant to actual project tech stack
9. Claude Desktop confirms prescreen.md Claude Desktop ✅ when research is complete

### Phase 2: Clarification Loop

1. Claude Code reviews `research.md`
2. Claude Code adds questions to `qa.md` under `## claude-code qa`
    - **Note**: Claude Code can directly reference Claude Desktop's research when asking questions
      to reduce back-and-forth
3. User forwards questions to Claude Desktop
4. Claude Desktop answers in `qa.md` under `## claude-desktop qa`
5. Repeat until all technical unknowns are resolved

### Phase 3: Implementation Planning

1. When QA is complete, create `final-plan.md` with:
    - Readiness checkboxes requiring approval from both Claude Desktop and Claude Code
    - Detailed step-by-step implementation plan with markdown checkboxes
2. Both Claude Desktop and Claude Code must mark their readiness as ✅
3. Claude Code begins implementation only when all readiness criteria are ✅ from both sides

### Phase 4: Dynamic Refinement

- If new questions arise during implementation:
    - Add questions to `qa.md`
    - Flip readiness checkboxes to ❌ in `final-plan.md` for both parties
    - Resolve questions before continuing
- Implementation can be suspended mid-step using markdown checkboxes
- Implementation can be resumed from any checkpoint after refinements
- Research and plan may evolve based on implementation learnings

## Fast-Track Exception

For simple features where research is comprehensive and no obvious unknowns exist, Claude Code may
skip the QA phase if:

- Research meets all quality standards
- Implementation approach is straightforward
- No major technical unknowns identified
- Both parties mark "Fast-Track Approved: ✅" in research.md

## File Formats

### prescreen.md Structure (MANDATORY)

```markdown
# [Feature/Migration Name] Prescreen Analysis

## Prescreen Readiness

- **Claude Code**: ❌ (set to ✅ when analysis and questions are complete)
- **Claude Desktop**: ❌ (set to ✅ when prescreen is reviewed and research is complete)

## Analysis Type

- **Type**: Codebase Migration / Feature Integration / Refactor Analysis
- **Scope**: [Components affected, files involved]
- **Analysis Date**: [Date]

## Project Tech Stack (FOR CLAUDE DESKTOP FOCUS)

### Currently Used Technologies
- **UI Framework**: [e.g., Preact 10.x, React 18.x]
- **State Management**: [e.g., MobX 6, Redux Toolkit, Zustand]
- **Styling**: [e.g., Tailwind v4, styled-components, Sass]
- **Bundler**: [e.g., Webpack 5, Vite, Parcel]
- **Routing**: [e.g., React Router v7, Next.js Router]
- **Testing**: [e.g., Jest, Vitest, none]
- **Real-time**: [e.g., WebSocket, Socket.io, none]

### Technologies NOT Used (Avoid Research)
- [List technologies that might be confused with current stack]
- [Helps Claude Desktop avoid irrelevant research paths]

## Current State Assessment

[Comprehensive analysis of current implementation]

## Risk Areas & Weak Spots

[Identified problematic areas that may cause migration/implementation issues]

## Complexity Estimation

- **Overall Complexity**: Low/Medium/High/Critical
- **Confidence Level**: High/Medium/Low
- **Estimated Effort**: [Time/scope estimate]

## Key Findings

[Bullet points of most important discoveries]

## Critical Questions for Claude Desktop Research

[Specific questions based on most problematic areas identified]

## Recommendations for Research

[Specific areas Claude Desktop should focus on]
```

### research.md Structure

```markdown
# [Feature Name] Research

## Research Scope

- **Complexity**: Simple/Medium/Complex
- **Confidence**: High/Medium/Low
- **Ready for QA**: Yes/No
- **Fast-Track Approved**:
    - Claude Desktop: ✅/❌
    - Claude Code: ✅/❌

## [Rest of research content...]
```

### qa.md Structure

```markdown
# Questions & Answers

## QA Status

- Claude Desktop: ✅/❌ (readiness status)
- Claude Code: ✅/❌ (readiness status)

## claude-code qa

**Q1:** [Question from Claude Code]

**A1 by claude desktop:** [Answer from Claude Desktop] **A1 by claude code:** [Answer from Claude
Code] **A1 by user:** [Answer from user - highest priority]

## claude-desktop qa

**Q1:** [Question from Claude Desktop]

**A1 by claude desktop:** [Answer from Claude Desktop] **A1 by claude code:** [Answer from Claude
Code] **A1 by user:** [Answer from user - highest priority]
```

### final-plan.md Readiness Checkboxes

```markdown
# Feature Implementation Plan

## Readiness Status

- All QA resolved:
    - Cluade Desktop ✅
    - Cluade Code ✅
- All technical unknowns known:
    - Cluade Desktop ✅
    - Cluade Code ✅
- Detailed implementation plan complete:
    - Cluade Desktop ✅
    - Cluade Code ✅

## Implementation Steps

- [ ] [Detailed step-by-step todo list]
- [ ] [Each step should be specific and actionable]
- [ ] [Use markdown checkboxes for progress tracking]
- [ ] [Allows suspending and resuming implementation]
```

## Integration Notes

### Archon System

- Archon MCP is currently experimental/beta
- May be dropped if not mature enough
- This workflow operates independently of Archon for now

### When to Use This Workflow

- Complex features requiring architectural research
- Unknown implementation approaches or patterns
- Features involving multiple libraries or technologies
- When implementation strategy is unclear

### When NOT to Use

- Simple bug fixes or minor feature additions
- Well-understood implementation patterns
- Straightforward UI/styling changes

## Research Quality Standards ("Good Enough")

Claude Desktop research must include:

1. **Comprehensive MVP Information**: Sufficient detail to build a simple but stable first iteration
2. **Code Examples**: Real implementation patterns and usage examples
3. **External References**: Links to key documentation and relevant libsources
4. **Alternative Approaches**: Brief consideration of different implementation strategies
5. **Limitations & Trade-offs**: Known pitfalls, constraints, and compromises
6. **Complexity Estimation**: Effort level assessment for prioritization and breakdown
7. **Hacky Solutions**: Mark any workarounds clearly for future review and improvement

## Implementation Process

### Major Implementation Steps

Review after completing:

- **Logical feature components** (complete functional units)
- **When hitting uncertainty/questions** (immediate review needed)

### Step-by-Step Process

1. **Complete implementation step** using markdown checkboxes
2. **Review alignment** with qa.md and research.md
3. **Check scope adherence** against original requirements
4. **Continue OR prompt user** if issues/questions arise

### Scope Change Detection

- Monitor for feature drift during implementation
- **Immediately prompt user** if scope changes detected
- Update research/plan as needed before continuing

## Success Criteria

A feature is ready for implementation when:

1. **Research meets quality standards** (see criteria above)
2. **No major unknowns remain** about the implementation approach
3. **Step-by-step implementation plan** is detailed and clear with markdown checkboxes
4. **Both Claude Desktop and Claude Code have marked all readiness criteria as ✅**
5. **Dual approval ensures** shared understanding and commitment to the approach

## Post-Implementation Validation

After feature completion, verify:

1. **Requirements Alignment**: Matches initial requirements, research findings, and QA decisions
2. **Basic Functionality**: Feature works as expected without obvious bugs
3. **Code Quality**: Meets project standards and conventions
4. **Brief Confirmation**: Verbal confirmation to user (no separate documentation needed)

## Contract Compliance

Both Claude Desktop and Claude Code must:

- Follow the defined file structure exactly
- Use the specified QA format for clear communication
- **Maintain readiness checkboxes accurately with explicit ✅/❌ approval**
- **Only proceed when both parties have marked readiness as ✅**
- **Meet research quality standards** before marking research complete
- **Review implementation alignment** at major steps
- **Immediately prompt user** for deadlock resolution or scope changes
- Request clarification when anything is unclear
- Update documentation as the feature evolves
- Use markdown checkboxes in implementation steps for progress tracking

This contract ensures efficient collaboration and prevents implementation delays due to unclear
requirements or missing research.
