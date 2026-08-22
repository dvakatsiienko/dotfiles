---
name: guide-react
description: Binding React conventions — load EVERY time you write, edit, or review React/JSX components (pair with guide-typescript for the type side). Component shape, props access, import groups, file anatomy, file layout, cva/forms idioms.
---

# React Guide

`guide-code` carries the values that govern this one; these are the language-specific refinements.

Binding when printing React — follow exactly, no freestyle. Types side: `guide-typescript`.

## Components

- **Named exports, arrow functions.** `export const Button = (props: ButtonProps) => …`.
  Default exports only where a framework demands them (Next.js pages/layouts).
- **`props.x` accessor — no destructuring.** The `props.` prefix keeps data origin visible at
  every use site. Destructure only when applying defaults.
- **No `import React from 'react'`** — the modern JSX transform makes it noise.
- **Derived JSX lives in named consts** computed before the return, suffixed `JSX`
  (`ListJSX` for collections): `const optionListJSX = props.options.map(…)`.
- **Explicit `return` in map/render callbacks** — prefer a block body over an implicit-return
  arrow: a `console.log`/`debugger` drops in immediately, no restructuring mid-debug.
- **Body = logic, return = markup.** The component body prepares data (maps, transforms,
  branches); the return value stays pure JSX presentation. Simple expressions inline are fine —
  complexity graduates to a named const, case by case.

## Imports

Three groups, in a fixed order — every dependency has one obvious home:

1. **Core** — node_modules
2. **Components** — local React components
3. **Instruments** — everything else: api, helpers, styles, assets, type imports

`/* Core */` · `/* Components */` · `/* Instruments */` group comments are optional flourish —
add them in import-heavy files, skip them when the list is short.

## File anatomy

One template for every component file — imports → component → styles → helpers → types:

```tsx
import { useState } from 'react';
import { cva } from 'cva';

import { SpinnerSvg } from '@/components/svg/SpinnerIcon';

export const Select = (props: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const optionListJSX = props.options.map((option) => {
    return (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    );
  });

  return (
    <SelectRoot onOpenChange={setIsOpen} open={isOpen} value={props.value}>
      <SelectTrigger className={triggerCva({ loading: props.isLoading })}>
        <SelectValue placeholder={props.isLoading ? <SpinnerSvg /> : 'Select…'} />
      </SelectTrigger>
      <SelectContent>{optionListJSX}</SelectContent>
    </SelectRoot>
  );
};

/* Styles */
const triggerCva = cva({
  base: 'grid min-w-25 grid-flow-col gap-1 px-2 text-sm',
  variants: {
    loading: { true: 'justify-center' },
  },
});

/* Types */
interface SelectProps {
  isLoading?: boolean;
  onValueChange: (value: string) => void;
  options: Option[];
  value: string;
}
interface Option {
  label: string;
  value: string;
}
```

Section meta-comments, in order (only the sections the file actually has):

- **`/* Styles */`** — cva variant configs, named `xxxCva`
- **`/* Helpers */`** — pure functions, configs, small non-component code
- **`/* Types */`** — every TypeScript shape, dead last; `<Component>Props` first
- Prefer inline `export const X = …`; a trailing `export { … }` block only when regrouping is needed

When a large edit visits an unpatterned file, propose aligning the whole file to this template.

## File layout

- **Flat file by default:** `components/Select.tsx`.
- **Folder + `index.ts` barrel** only when a component owns satellites — co-located assets,
  a `resolver.ts`, private SVGs: `LoginForm/{LoginForm.tsx, resolver.ts, img/, index.ts}`.
- **Route-local compositions** live in the route's `parts/` dir — they serve one page and
  don't pretend to be shared.

## Vendored code (shadcn `ui/`)

Generated primitives are owned, not sacred — but **convert-on-touch**: bring a file to house
style only while editing it for real work. No style-only chore commits; freshly generated files
may keep upstream shape until first touched.

## Stack idioms

_Bytes-flavoured; apply where the stack matches, skip where it doesn't._

- **cva** — variants under `/* Styles */`; expose to types via `VariantProps<typeof xxxCva>`.
- **Forms** — react-hook-form + zod, resolver in its own `resolver.ts` beside the form.

---

🌲 **Evergreen.** Spot a recurring pattern worth codifying, or guide-vs-reality drift? Propose
the update; to fold it in, load `writing-for-agents` and edit this file (real path:
`~/dotfiles/home/.claude/plugin-x/skills/guide-react/SKILL.md`). Keep it pretty — scannable
sections, tight prose, working examples.
