# react guidelines

- always use named exports for react components unless a framework requires a component to be exported (like pages in next.js app router)
- prefer arrow functions for react components
- avoid react props destructuring pattern unless default props are required — use props.propName accessor pattern instead
- do not reduntantly `import React from 'react'` when modern jsx transform is used

#### react component organisation structure

Always write this component file organisation pattern for new code.
And prefer this pattern over other unpatterned react component files. if you work on a big file changes propose me to align entire file with patterned structure. we should have all react components be organized using a temaplate for standartisation purposes.

### typical \*.tsx file structure

- imports
- component definition
- helper code: functions, configs, cva, class-variants-authority variant styles, then typescript types: interfaces etc. expots at the all the end if necessary.

```tsx
/* imports at the start of a file */

export const Button: React.FC<ButtonProps> = (props) => {
  return <button>{trim(props.text)}</button>;
};

/* Helpers — all helper functions, configs and other helper code goes after component body */
function trim(val: string) {
  return val.trim();
}

/* Types — types goes after helpers */
interface ButtonProps {
  text: string;
}
```

### special meta-comments

```tsx
/* Core */ // ← this comment is a «header» comment for a file, meaning an «imports» part.
import x from y; /* imports all imports */
import x from y; /* imports all imports */
import x from y; /* imports all imports */
import x from y; /* imports all imports */

// component defintion

/* Styles */ // ← optional cva or class-variance-authority variant styles

/* Heplers */ // ← heler functions, config files, and other small parts of code

/* Types */ // ← all typescript-related stuff: interfaces, types, unoons etc

export { x }; // ← exports are in the end but prefer to export const Component = ... right away.
```
