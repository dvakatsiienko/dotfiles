---
description: migrate React component from inject() prop-drilling API to observer() API from mobx-react-lite
argument-hint: [component-name | component-path]
---

### Instructions for Claude

Migrate React components from inject() prop-drilling to direct MobX store access with observer() from mobx-react-lite.
Eliminate the dual component pattern (Base + inject wrapper) and use direct `mobx.store.property` access.

### Pattern to Follow

**BEFORE (inject() with dual component pattern):**

```tsx
import { inject, observer } from 'mobx-react';

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
import { observer } from 'mobx-react-lite';
import { mobx } from '@/lib/mobx';

export const AuthResolver = observer(() => {
    return (
        <div>
            <button disabled={!mobx.profile.token} onClick={mobx.ui.setCoreSettings}>
                {mobx.ui.language}
            </button>
            <span onClick={() => mobx.ui.setAlert('message')}>
                {mobx.profile.getToken()}
            </span>
        </div>
    );
});
```

### Migration Steps

1. **Update Imports**:
   - Replace `import { inject, observer } from 'mobx-react'` with `import { observer } from 'mobx-react-lite'`
   - Add `import { mobx } from '@/lib/mobx'`

2. **Eliminate Dual Component Pattern**:
   - Delete the `ComponentNameBase` function entirely
   - Delete the `inject()(observer(ComponentNameBase))` export
   - Create single `export const ComponentName = observer(() => { ... })` component

3. **Convert Props to Direct Store Access**:
   - Map injected props to `mobx.store.property` calls in JSX
   - Example: `setCoreSettings` → `mobx.ui.setCoreSettings`, `languageFromStore` → `mobx.ui.language`
   - **Do NOT use destructuring** - reference store properties directly in render

4. **Preserve Real Component Props**:
   - Keep props that are passed from parent components (not injected from MobX)
   - Only remove props that were injected via the inject() wrapper

5. **Function Declaration Conversion**:
   - Convert `function ComponentName()` to `export const ComponentName = observer(() => {})`

### Key Requirements

- **No Destructuring**: Use `mobx.store.property` directly in JSX, not `const { property } = mobx.store`
- **Direct Access Only**: Late dereferencing preserves MobX performance optimizations  
- **Single Component**: Eliminate `Base` component + inject wrapper pattern
- **Rename Mapping**: Map `language: languageFromStore` → `mobx.ui.language`

### Verification

- Component renders correctly with identical functionality
- No inject() or Base component remnants
- All store access uses `mobx.store.property` pattern (no destructuring)
- Real component props preserved, injected props removed
- Observer wrapper applied to single component export

### Usage

To use this command: `@migrate-mobx-6.md [ComponentName]`

The assistant should:

1. Read the specified component file
2. Apply the migration pattern systematically
3. Remove the inject() wrapper and Base component pattern
4. Migrate to direct MobX store access using `mobx.store.property` accessor pattern
5. Use direct accessors throughout (avoid destructuring unless explicitly needed)
6. Verify the migration doesn't break component functionality
7. Provide a summary of changes made

### Important Notes

- Do not fix linter/TypeScript errors during migration
- Preserve component behavior - this is structure refactoring only  
- Use direct access (`mobx.ui.property`) not destructuring for optimal MobX performance
