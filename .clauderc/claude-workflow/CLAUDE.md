# Claude Workflow System ¯\_(ツ)_/¯

## Overview

Streamlined workflow system for feature planning and implementation. Just you and me, no bureaucracy.

## How It Works

We use a simple 3-file system to plan and execute features:
1. **init.md** - You describe what we're building
2. **prescreen.md** - Technical evaluation of current state
3. **plan.md** - My todo-list style implementation plan

That's it. No committees, no approvals, just shipping code.

## Available Workflows

**IMPORTANT**: This list must be kept in sync with actual `claude-workflow/` directory contents.

### Currently Available Workflows:

1. **`preact-to-react/`** - Migration from Preact to React framework (Status: Research Complete ✅)
2. **`semantic-search/`** - Libsource semantic enhancement (Status: Research Complete ✅)
3. **`interactive-workflows/`** - N8N interactive workflow system (Status: Research Phase 🔄)
4. **`migrate-vite/`** - Webpack to Vite 7 migration with icon system modernization (Status: Init Phase 🆕)

### Workflow Management Rules:

- **Add New**: When creating new workflow directory, update this list
- **Remove**: When deleting workflow directory, remove from this list
- **Status Tracking**: Update status based on readiness checkmarks in each workflow

## File Structure

Each workflow lives in `claude-workflow/feature-name/`:

```
feature-name/
├── init.md       # What we're building (your idea, examples, links)
├── prescreen.md  # Tech evaluation of current state
└── plan.md       # Todo-list implementation plan
```

Keep it simple, ship it fast.

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

### Step 1: You Create init.md
Tell me what we're building. Include:
- The goal
- Examples/links if helpful
- Any specific requirements

### Step 2: Prescreen Analysis
I (or you) create prescreen.md with:
- Current state evaluation
- Technical context
- Potential gotchas

### Step 3: Implementation Plan
I create plan.md with:
- Todo-list style tasks
- Markdown checkboxes for tracking
- Concise, actionable items

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
