---
name: guide-typescript
description: Binding TypeScript conventions — load EVERY time you write, edit, or review TypeScript code in any repo (also fires alongside guide-react for .tsx work). Naming, imports, inference-first typing, satisfies, literals, type placement.
---

# TypeScript Guide

`guide-code` carries the values that govern this one; these are the language-specific
refinements. Binding when printing TypeScript — follow exactly, no freestyle.

## Core

- Latest ECMAScript features, accepted-step members only — no proposals.

## Naming

- **camelCase every identifier** — variables, functions, parameters, properties, object keys.
  `SCREAMING_SNAKE` only for module-level constants; `PascalCase` for types, interfaces,
  components. Scripts and shell-adjacent code obey this too — zx or bash origins never license
  snake_case.
- **Plain names, no Hungarian prefixes** — `SelectProps`, `Payload`; the `I`/`T`/`U` prefix
  system is retired 🪦.
- Component props: an interface named **`<Component>Props`**.
- **Rename-on-touch:** legacy prefixed names get renamed when a real edit visits their file —
  never in dedicated rename sweeps.

## Imports & exports

- **`import type` for every type-only import**, namespace form included:
  `import type * as gql from '@/graphql'`.
- **Named exports over default.** A default import can take any name — hides usages, breaks
  rename-refactors. Exception: frameworks that demand a default (Next.js pages/layouts).

## Inference first

Derive types from the source of truth; hand-retyped copies drift, derivations can't:

- zod schema → `z.infer<typeof schema>`
- cva config → `VariantProps<typeof buttonCva>`
- Convex table → `Doc<'chats'>`, generated `api` types
- `as const` list → `(typeof themeList)[number]`

## `satisfies` — the habit to build

Checks a value against a type **without widening it** — literal inference AND shape safety. A
plain annotation erases literals; `satisfies` keeps both.

```ts
type ThemeOption = { label: string; value: 'light' | 'dark' | 'system' };

const themeList = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const satisfies readonly ThemeOption[];

// themeList[0].value is still the literal 'light' (not string) —
// but a typo'd key or an illegal value fails HERE, not at some distant use site.
```

Reach for it on anything config-shaped: option lists, route maps, tool registries, theme tables.

## Literals

- **`as const`** for fixed lists and config literals; derive the union from the list instead
  of maintaining a parallel union type.

## Placement

- Types at the **bottom of the file** under `/* Types */` (guide-react's file anatomy).
- A shared type earns its own module only when 2+ files import it.

## Stack idioms

_Bytes-flavoured; apply where the stack matches._

- **jotai** — atoms infer from their initial value; annotate only when inference can't see it:
  `atom<string | null>(null)`.
- **Convex** — consume `Doc<'table'>` and the generated `api`; never hand-retype documents.
- **GraphQL codegen** — `import type * as gql from '@/graphql'`; reference `gql.LoginMutation`.
- **zod + react-hook-form** — the schema is the type: `type FormShape = z.infer<typeof schema>`.
