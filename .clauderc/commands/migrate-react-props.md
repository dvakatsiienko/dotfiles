---
description: migrate React component props destructuring pattern to accessor pattern
argument-hint: [component-name | component-path]
---

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

- **Do not iterate on linter or TypeScript errors** during migration - ignore these completely
- **This is structural refactoring ONLY** - 100% of functionality must remain identical
- **If you notice issues** during refactoring that would be good to address, shape the proposal and present it as a question like "Should we take care of this problem?"

### Usage

To use this command: `@migrate-react-props.md [ComponentName]`

The assistant should:

1. Read the specified component file
2. Apply the migration pattern
3. Verify the changes compile without TypeScript errors
4. Do not break anything
5. Notify, if issues are encountered during execution
6. Provide a summary of what was changed
