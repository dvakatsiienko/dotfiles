---
name: guide-react
description: Load EVERY time you write, edit, or review React/JSX components — always paired with guide-typescript for the type side.
---

# React Guide

`guide-code` carries the values that govern this one; these are the language-specific
refinements. Binding when printing React — follow exactly, no freestyle. Types side:
`guide-typescript`.

## Components

- **Named exports, arrow functions.** `export const Button = (props: ButtonProps) => …`.
  Default exports only where a framework demands them (Next.js pages/layouts).
- **`props.x` accessor — no destructuring.** The prefix keeps data origin visible at every use
  site. Destructure only when applying defaults.
- **No `import React from 'react'`** — noise under the modern JSX transform.
- **Derived JSX lives in named consts** before the return, suffixed `JSX` (`ListJSX` for
  collections): `const optionListJSX = props.options.map(…)`.
- **Explicit `return` in map/render callbacks** — block body over implicit-return arrow: a
  `console.log`/`debugger` drops in without restructuring mid-debug.
- **Body = logic, return = markup.** The body prepares data; the return stays pure JSX. Simple
  expressions inline are fine — complexity graduates to a named const.

## Imports

Three groups, fixed order — every dependency has one obvious home:

1. **Core** — node_modules
2. **Components** — local React components
3. **Instruments** — everything else: api, helpers, styles, assets, type imports

`/* Core */` · `/* Components */` · `/* Instruments */` comments are optional flourish — add
them in import-heavy files, skip when the list is short.

## File anatomy

One template — imports → component → styles → helpers → types:

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

Section meta-comments, in order, only the sections the file has:

- **`/* Styles */`** — cva variant configs, named `xxxCva`
- **`/* Helpers */`** — pure functions, configs, small non-component code
- **`/* Types */`** — every TypeScript shape, dead last; `<Component>Props` first
- Prefer inline `export const X = …`; a trailing `export { … }` block only when regrouping is
  needed

A large edit visiting an unpatterned file → propose aligning the whole file to this template.

## File layout

- **Flat file by default:** `components/Select.tsx`.
- **Folder + `index.ts` barrel** only when a component owns satellites (co-located assets, a
  `resolver.ts`, private SVGs): `LoginForm/{LoginForm.tsx, resolver.ts, img/, index.ts}`.
- **Route-local compositions** live in the route's `parts/` dir — they serve one page.

## Vendored code (shadcn `ui/`)

Owned, not sacred — **convert-on-touch**: bring a file to house style only while editing it
for real work. No style-only chore commits.

## Stack idioms

_Bytes-flavoured; apply where the stack matches._

- **cva** — variants under `/* Styles */`; types via `VariantProps<typeof xxxCva>`.
- **Forms** — react-hook-form + zod, resolver in its own `resolver.ts` beside the form.
