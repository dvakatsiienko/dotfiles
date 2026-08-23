---
name: guide-typescript
description: Binding TypeScript conventions — load EVERY time you write, edit, or review TypeScript code in any repo (also fires alongside guide-react for .tsx work). Naming, imports, inference-first typing, satisfies, literals, type placement.
---

# TypeScript Guide

`guide-code` carries the values that govern this one; these are the language-specific refinements.

Binding when printing TypeScript — follow exactly, no freestyle.

## Core
- Prefer using latest ECMAScript features, but only accepted step members, avoid proposals

## Naming

- **camelCase every identifier** — variables, functions, parameters, properties, object keys.
  `SCREAMING_SNAKE` is reserved for module-level constants (`BREWFILE`, `DEFAULT_APPS`);
  `PascalCase` for types, interfaces and components. Scripts and shell-adjacent code obey this
  too — a file's origins in zx or bash never license snake_case.
- **Plain names, no Hungarian prefixes.** `SelectProps`, `Payload`, `LoadingState` — the old
  `I`/`T`/`U` prefix system is retired 🪦.
- Component props: an interface named **`<Component>Props`**, e.g. `ButtonProps`.
- **Rename-on-touch:** legacy prefixed names (`ITool`, `TSvgProps`) get renamed when a real edit
  visits their file — never in dedicated rename sweeps.

## Imports & exports

- **`import type` for every type-only import**, including the namespace form:
  `import type * as gql from '@/graphql'`.
- **Named exports over default exports.** A default-exported identifier can be imported under
  *any* name, which hides usages and breaks rename-refactors at scale. The only exception is a
  framework that demands a default (Next.js pages/layouts).

## Inference first

Derive types from the source of truth instead of re-declaring shapes — hand-retyped copies
drift, derivations can't:

| Source of truth | Derivation |
| --- | --- |
| zod schema | `z.infer<typeof schema>` |
| cva config | `VariantProps<typeof buttonCva>` |
| Convex table | `Doc<'chats'>`, generated `api` types |
| `as const` list | `(typeof themeList)[number]` |

## `satisfies` — the habit to build

`satisfies` checks a value against a type **without widening it**: literal inference *and*
shape safety. A plain annotation (`const x: Config = …`) erases literals; `satisfies` keeps both.

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

- **`as const`** for fixed lists and config literals; derive the union from the list
  (`(typeof list)[number]`) instead of maintaining a parallel union type.

## Placement

- Types live at the **bottom of the file** under `/* Types */` (see guide-react's file anatomy).
- A shared type earns its own module only when 2+ files import it.

## Stack idioms

_Bytes-flavoured; apply where the stack matches, skip where it doesn't._

- **jotai** — let atoms infer from their initial value; annotate only when inference can't see it:
  `atom<string | null>(null)`.
- **Convex** — consume `Doc<'table'>` and the generated `api`; never hand-retype documents.
- **GraphQL codegen** — `import type * as gql from '@/graphql'`; reference `gql.LoginMutation` etc.
- **zod + react-hook-form** — the schema is the type: `type FormShape = z.infer<typeof schema>`.

---

🌲 **Evergreen.** Spot a recurring pattern worth codifying, or guide-vs-reality drift? Propose
the update; to fold it in, load `writing-for-agents` and edit this file (real path:
`~/dotfiles/home/.claude/plugin-x/skills/guide-typescript/SKILL.md`). Keep it pretty — scannable
sections, tight prose, working examples.
