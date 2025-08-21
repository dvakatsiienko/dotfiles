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

## File Structure

Each feature research lives in its own directory under
`.clauderc/claude-workflow/feature-name/`:

```
feature-name/
├── init.md           # Initial briefing to Claude Desktop
├── research.md       # Claude Desktop's research findings
├── qa.md            # Questions & answers from both sides
└── final-plan.md    # Implementation plan with readiness checkboxes
```

## Workflow Process

### Phase 1: Research Initiation

1. User creates `feature-name/init.md` with feature requirements
2. User asks Claude Desktop to research the feature
3. Claude Desktop may ask clarifying questions to the user.
4. Once all Claude Desktop questions are answered, Cluade Desktop registers its questions and
   answers in qa.md
5. Claude Desktop populates `research.md` with findings

### Phase 2: Clarification Loop

1. Claude Code reviews `research.md`
2. Claude Code adds questions to `qa.md` under `## claude-code qa`
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

## File Formats

### qa.md Structure

```markdown
# Questions & Answers

## claude-desktop qa

**Q1:** [Question from Claude Desktop] **A1:** [Answer from user/Claude Code]

## claude-code qa

**Q1:** [Question from Claude Code] **A1:** [Answer from Claude Desktop via user]
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
