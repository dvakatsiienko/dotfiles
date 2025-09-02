---
description: migrate React component from inject() prop-drilling API to observer() API from mobx-react-lite
argument-hint: [component-name | component-path] [with props]
---

# 🚨 STRUCTURAL REFACTORING ONLY - PRESERVE 100% FUNCTIONALITY

**CRITICAL**: This is purely structural code transformation. You must:
- ❌ **NEVER fix linter warnings, TypeScript errors, or code quality issues**
- ❌ **NEVER add missing useEffect dependencies or fix React hooks warnings**
- ❌ **NEVER improve code style, formatting, or apply best practices**
- ✅ **ONLY transform the architectural pattern exactly as specified**
- ✅ **Preserve identical behavior and functionality**
- ✅ **Ask user before fixing any discovered issues**

### Instructions for Claude

Migrate React components from inject() prop-drilling to direct MobX store access with observer()
from mobx-react-lite. Eliminate the dual component pattern (Base + inject wrapper) and use direct
`mobx.store.property` access.

**COMBINED MIGRATION**: When "with props" is specified in the prompt, perform TWO migrations in this
EXACT order:

1. **FIRST**: Complete MobX 6 migration (as described in this command) - this is CRITICAL for
   correct identifier linking
2. **SECOND**: Apply React props migration (destructuring → accessor pattern from
   migrate-react-props.md)

**IDENTIFIER PRESERVATION**: During MobX migration, pay EXTREME attention to correctly linking
previously destructured identifiers to their new `mobx.store.property` references. This
re-referencing work is complex and must be done meticulously to avoid breaking functionality.

### Pattern to Follow

**BEFORE (inject() with dual component pattern):**

```tsx
import { inject, observer } from "mobx-react";

export const AuthResolverBase = ({
  setCoreSettings,
  setAlert,
  getToken,
  languageFromStore,
  // ...other injected props
}) => {
  return <div>component code...</div>;
};

export const AuthResolver = inject(
  ({
    ui: { setCoreSettings, setAlert, language: languageFromStore },
    profile: { getToken },
  }) => ({
    setCoreSettings,
    setAlert,
    getToken,
    languageFromStore,
  })
)(observer(AuthResolverBase));
```

**AFTER (direct MobX store access):**

```tsx
import { observer } from "mobx-react-lite";
import { mobx } from "@/lib/mobx";

export const AuthResolver = observer<AuthResolverProps>(() => {
  return (
    <div>
      <button disabled={!mobx.profile.token} onClick={mobx.ui.setCoreSettings}>
        {mobx.ui.language}
      </button>
      <span onClick={() => mobx.ui.setAlert("message")}>
        {mobx.profile.getToken()}
      </span>
    </div>
  );
});
```

### Migration Steps

1. **Update Imports**:

   - Replace `import { inject, observer } from 'mobx-react'` with
     `import { observer } from 'mobx-react-lite'`
   - Add `import { mobx } from '@/lib/mobx'`

2. **Eliminate Dual Component Pattern**:

   - Delete the `ComponentNameBase` function entirely
   - Delete the `inject()(observer(ComponentNameBase))` export
   - Create single `export const ComponentName = observer(() => { ... })` component

3. **Convert Props to Direct Store Access**:

   - Map injected props to `mobx.store.property` calls in JSX
   - Example: `setCoreSettings` → `mobx.ui.setCoreSettings`, `languageFromStore` →
     `mobx.ui.language`
   - **Do NOT use destructuring** - reference store properties directly in render

4. **Preserve Real Component Props**:

   - Keep props that are passed from parent components (not injected from MobX)
   - Only remove props that were injected via the inject() wrapper

5. **Function Declaration Conversion**:
   - Convert `function ComponentName()` to `export const ComponentName = observer(() => {})`

### Key Requirements

- **No Destructuring**: Use `mobx.store.property` directly in JSX, not
  `const { property } = mobx.store`
- **Direct Access Only**: Late dereferencing preserves MobX performance optimizations
- **Single Component**: Eliminate `Base` component + inject wrapper pattern
- **Rename Mapping**: Map `language: languageFromStore` → `mobx.ui.language`
- **⚠️ CRITICAL: Observer Closing Parenthesis**: Always ensure the observer() call has its closing parenthesis - `observer(() => { ... })` - this is commonly forgotten!

### Verification

- Component renders correctly with identical functionality
- No inject() or Base component remnants
- All store access uses `mobx.store.property` pattern (no destructuring)
- Real component props preserved, injected props removed
- Observer wrapper applied to single component export

### Usage

To use this command:

- Basic: `@migrate-mobx-6.md [ComponentName]`
- Combined: `@migrate-mobx-6.md [ComponentName] with props`

The assistant should:

1. Read the specified component file
2. **If "with props" specified**: Perform BOTH migrations in correct order (MobX first, then props)
3. Apply the MobX migration pattern systematically with EXTREME care for identifier linking
4. Remove the inject() wrapper and Base component pattern
5. Migrate to direct MobX store access using `mobx.store.property` accessor pattern
6. Use direct accessors throughout (avoid destructuring unless explicitly needed)
7. **If "with props" specified**: Then apply props migration (destructuring → accessor pattern)
8. Verify the migration doesn't break component functionality
9. Provide a summary of changes made

### Important Notes

- **IGNORE ALL AUTOMATED TOOLING WARNINGS**: Do not fix ESLint errors, Prettier formatting, TypeScript errors, or any IDE suggestions during migration
- **IGNORE REACT HOOKS WARNINGS**: Do not add missing useEffect dependencies, fix exhaustive-deps warnings, or address hooks-related linting issues
- **PRESERVE EXACT FUNCTIONALITY**: Every piece of logic, conditional rendering, event handling, and side effects must remain completely unchanged
- **NO CODE IMPROVEMENTS**: Do not refactor, optimize, or modernize code patterns - only transform the architectural pattern
- **ASK BEFORE FIXING**: If you discover bugs, performance issues, or code smells, ask the user: "Should we address this issue?" rather than fixing automatically
- Use direct access (`mobx.ui.property`) not destructuring for optimal MobX performance
- **CRITICAL**: During the complex re-referencing work, ensure ALL previously destructured identifiers are correctly mapped to their new `mobx.store.property` equivalents

**Example of what NOT to fix during migration:**
```tsx
// DON'T fix missing dependencies, unused variables, or formatting
useEffect(() => {
  mobx.store.fetchData(); // eslint-disable-line react-hooks/exhaustive-deps
}, []); // Missing dependency warning - IGNORE
```
