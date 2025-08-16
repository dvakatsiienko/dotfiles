---
description: migrate React component from inject() prop-drilling API to observer() API from mobx-react-lite
argument-hint: [component-name | component-path]
---

### Instructions for Claude

When this command is invoked, migrate React components from the legacy inject() prop-drilling API to the modern observer() API from mobx-react-lite.
This migration eliminates the inject dependency injection pattern in favor of direct store access with better performance characteristics.

### Pattern to Follow

**BEFORE (Old - inject() prop-drilling API):**

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

**AFTER (New - observer() API with direct accessor pattern):**

```tsx
import { observer } from "mobx-react-lite";
import { mobx } from "@/lib/mobx";

export const AuthResolver = observer(() => {
  // Use direct accessors for better performance and MobX optimization
  return (
    <div>
      <button disabled={!mobx.profile.token} onClick={mobx.ui.setCoreSettings}>
        {mobx.ui.language}
      </button>
      <span onClick={mobx.ui.setAlert}>{mobx.profile.getToken()}</span>
    </div>
  );
});
```

**AVOID (Destructuring - only use when explicitly needed):**

```tsx
import { observer } from "mobx-react-lite";
import { mobx } from "@/lib/mobx";

export const AuthResolver = observer(() => {
  // ❌ Avoid destructuring - breaks MobX optimization
  const { ui, profile } = mobx;
  const { setCoreSettings, setAlert, language } = ui;

  return <div>component code...</div>;
});
```

### Migration Steps

1. **Identify Target Component**: Locate the React component to migrate (likely specified as $ARGUMENTS)
2. **Update Imports**:
   - Replace `import { inject, observer } from 'mobx-react'`
   - With `import { observer } from 'mobx-react-lite'`
   - Add `import { mobx } from '@/lib/mobx'` if not present
3. **Transform Component Structure**:
   - Remove the `Base` component function parameters (injected props)
   - Remove the `inject()` wrapper entirely
   - Rename `ComponentNameBase` to `ComponentName`
   - Change to direct export: `export const ComponentName = observer(() => { ... })`
4. **Migrate Store Access**:
   - Replace injected props with direct `mobx.store.property` accessor pattern
   - Map injected props to their corresponding store paths (e.g., `setCoreSettings` → `mobx.ui.setCoreSettings`)
   - Use direct access in JSX: `{mobx.ui.language}` instead of destructured variables
   - Avoid destructuring unless explicitly needed for complex operations
5. **Clean Up Props**:
   - Remove only props that are now sourced from MobX store via direct access
   - Keep props that are actually passed from parent components
   - Be careful not to delete legitimate component props
6. **Apply Direct Accessor Pattern**:
   - Use `mobx.store.property` throughout the component
   - This preserves MobX's built-in memoization and reduces unnecessary re-renders
   - Only use destructuring when explicitly prompted or for very complex operations

### Special Cases to Handle

- **Function Declaration to Arrow Function**: Convert `function ComponentName()` to `export const ComponentName = observer(() => { ... })`
- **Renamed Store Properties**: Map `language: languageFromStore` to `mobx.ui.language`
- **Nested Store Access**: Convert deep inject patterns to `mobx.ui.prop1`, `mobx.ui.prop2` direct access
- **Mixed Props**: Distinguish between MobX-injected props (convert to direct access) and actual component props (preserve)
- **Legacy Comments**: Preserve or update relevant comments about store usage

### Quality Checks

- Verify component still renders correctly
- Ensure all MobX store references are properly migrated
- Check that legitimate component props are preserved
- Confirm observer wrapper is correctly applied
- Test that performance optimizations don't break functionality

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

- Do not iterate on fixing linter and TypeScript errors during migration
- Focus on structural migration first, type safety second
- Preserve component behavior while modernizing the MobX integration - this commands is a purely code structure refactoring
- Consider performance implications of early vs late dereferencing
