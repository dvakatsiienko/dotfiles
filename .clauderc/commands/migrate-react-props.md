---
description: migrate React component props destructuring pattern to accessor pattern
argument-hint: [component-name | component-path]
---

# 🚨 STRUCTURAL REFACTORING ONLY - PRESERVE 100% FUNCTIONALITY

**CRITICAL**: This is purely structural code transformation. You must:
- ❌ **NEVER fix linter warnings, TypeScript errors, or code quality issues**
- ❌ **NEVER add missing useEffect dependencies or fix React hooks warnings**
- ❌ **NEVER improve code style, formatting, or apply best practices**
- ✅ **ONLY transform the props access pattern exactly as specified**
- ✅ **Preserve identical behavior and functionality**
- ✅ **Ask user before fixing any discovered issues**

### Instructions for Claude

When this command is invoked, migrate React components from props destructuring pattern to props accessor pattern. This improves readability and maintainability for components with many props.

### Pattern to Follow

**BEFORE (Wrong - Destructuring):**

```tsx
export const ExampleWrong = ({
  prop1,
  prop2,
  prop3,
  prop4,
  prop5,
  prop6,
  prop7,
  prop8 = "default value",
  prop9,
  prop10,
}: ExampleCorrectProps) => {
  return (
    <div>
      <p>{prop1}</p>
      <p>{prop2}</p>
      <p>{prop3}</p>
      <p>{prop4}</p>
      <p>{prop5}</p>
      <p>{prop6}</p>
      <p>{prop7}</p>
      <p>{prop8}</p>
      <p>{prop9}</p>
      <p>{prop10}</p>
    </div>
  );
};
```

**AFTER (Correct - Accessor):**

```tsx
export const ExampleCorrect = (props: ExampleCorrectProps) => {
  const { prop8 = "default value" } = props;

  return (
    <div>
      <p>{props.prop1}</p>
      <p>{props.prop2}</p>
      <p>{props.prop3}</p>
      <p>{props.prop4}</p>
      <p>{props.prop5}</p>
      <p>{props.prop6}</p>
      <p>{props.prop7}</p>
      <p>{prop8}</p>
      <p>{props.prop9}</p>
      <p>{props.prop10}</p>
    </div>
  );
};
```

### Migration Steps

1. **Identify Target Component**: Locate the React component to migrate (likely specified as $ARGUMENTS)
2. **Change Function Signature**:
   - Replace `({ prop1, prop2, ... }: ComponentProps)`
   - With `(props: ComponentProps)`
3. **Update Prop References**:
   - Replace all instances of `{propName}`
   - With `{props.propName}` throughout the component body
4. **Handle Nested Destructuring**:
   - For nested objects, replace `const { nested } = prop`
   - With `props.prop.nested` or keep selective destructuring where it makes sense
5. **Preserve Event Handlers**:
   - Replace `onClick={onClickHandler}`
   - With `onClick={props.onClickHandler}`
6. **Update Conditional Logic**:
   - Replace `{condition && <Component />}`
   - With `{props.condition && <Component />}`

### Special Cases to Handle

- **Default Values**: Props with default values should remain destructured at the top of the function. Use selective destructuring: `const { propWithDefault = "defaultValue" } = props;` then reference as `propWithDefault` (not `props.propWithDefault`). This keeps defaults clean while migrating other props to accessor pattern.
- **Rest Props**: Convert `{ ...rest }` to `{ ...restProps }` or handle explicitly
- **Renamed Props**: Convert `{ prop: renamedProp }` to `const renamedProp = props.prop`
- **Callbacks**: Ensure all callback props are prefixed with `props.`

### Quality Checks

- Verify TypeScript types still work correctly
- Ensure no prop references are missed
- Check that default values are preserved
- Confirm event handlers are properly migrated
- Test component still renders correctly

### Important Notes

- **IGNORE ALL AUTOMATED TOOLING WARNINGS**: Do not fix ESLint errors, Prettier formatting, TypeScript errors, or any IDE suggestions during migration
- **IGNORE REACT HOOKS WARNINGS**: Do not add missing useEffect dependencies, fix exhaustive-deps warnings, or address hooks-related linting issues
- **PRESERVE EXACT FUNCTIONALITY**: Every piece of logic, conditional rendering, event handling, and side effects must remain completely unchanged
- **NO CODE IMPROVEMENTS**: Do not refactor, optimize, or modernize code patterns - only transform the props access pattern
- **ASK BEFORE FIXING**: If you discover bugs, performance issues, or code smells, ask the user: "Should we address this issue?" rather than fixing automatically

**Example of what NOT to fix during migration:**
```tsx
// DON'T fix missing dependencies, unused variables, or formatting
useEffect(() => {
  fetchUserData(props.userId); // eslint-disable-line react-hooks/exhaustive-deps
}, []); // Missing props.userId dependency - IGNORE

const unusedVariable = "keep this"; // unused-vars warning - IGNORE
```

### Usage

To use this command: `@migrate-react-props.md [ComponentName]`

The assistant should:

1. Read the specified component file
2. Apply the migration pattern
3. Verify the changes compile without TypeScript errors
4. Do not break anything
5. Notify, if issues are encountered during execution
6. Provide a summary of what was changed
