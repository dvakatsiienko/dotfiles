# Claude Workflow System ¯\_(ツ)_/¯

## Overview

Streamlined workflow system for feature planning and implementation. Just you and me, no bureaucracy.

## How It Works

We use a structured workflow system to research, plan and execute features:

### Core Files
1. **spec.md** - Feature specification and requirements (you create this)
2. **implementation.md** - Structured implementation guide with copy-paste ready code (Claude Desktop creates)
3. **plan.md** - Todo-list style execution plan (Claude Code creates from implementation.md)

### Supporting Files  
- **prescreen.md** - Technical evaluation of current state (optional)
- **qa.md** - Q&A clarifications between user and Claude (optional)

That's it. Init → Guide → Plan → Ship.

## Available Workflows

**IMPORTANT**: This list must be kept in sync with actual `claude-workflow/` directory contents.

### Currently Available Workflows:

_None._ Add an entry here when a feature directory is created.

### Workflow Management Rules:

- **Add New**: When creating new workflow directory, update this list
- **Remove**: When deleting workflow directory, remove from this list
- **Status Tracking**: Update status based on readiness checkmarks in each workflow

## File Structure

Each workflow lives in `claude-workflow/feature-name/`:

```
feature-name/
├── prescreen.md        # Tech evaluation of current state (optional)
├── spec.md             # Feature specification (your requirements)
├── implementation.md   # Structured guide with ready code (Claude Desktop)
├── plan.md             # Todo-list execution plan (Claude Code)
└── qa.md               # Q&A clarifications (optional)
```

**Key difference**: `implementation.md` is NOT a plan - it's a structured reference guide with copy-paste ready code that Claude Code uses during execution.

## Workflow State Management

Use markdown checkboxes in plan.md to track progress:
- [ ] Not started
- [x] Done

When you say "continue workflow", I'll check where we left off and keep going.

### Continuation

When you say "continue workflow":
1. I check plan.md for unchecked boxes
2. Resume from where we left off
3. If multiple workflows exist, I'll ask which one

Never starting workflows without you asking.

## Workflow Process

### Step 1: You Create spec.md
Tell me what we're building. Include:
- The goal/objective
- Examples/links if helpful
- Any specific requirements

### Step 2: Prescreen Analysis (Optional)
Create prescreen.md with:
- Current state evaluation
- Technical context
- Potential gotchas

### Step 3: Implementation Guide
Claude Desktop creates implementation.md with:
- **Structured, copy-paste ready code**
- Step-by-step implementation order
- Testing protocols and benchmarks
- Common pitfalls to avoid
- Quick reference sections

### Step 4: Execution Plan
Claude Code creates plan.md from implementation.md:
- Todo-list style tasks
- Markdown checkboxes for tracking
- References implementation.md sections

### Step 5: Build It
Claude Code executes using:
- plan.md for task tracking
- implementation.md as reference guide
- Test and validate at each step

Then we ship it. 🚀

## Tips

- Keep descriptions concise and actionable
- Focus on shipping, not documentation
- Add ASCII art or jokes sparingly (don't be annoying)
- Delete the prod database only on Fridays (jk, never do this 💀)

## When to Use This

- Features that need planning
- Complex migrations
- When you want a clear roadmap

## When NOT to Use

- Quick fixes
- Obvious changes
- When you already know what to do

Just ship it. ( ͡° ͜ʖ ͡°)
