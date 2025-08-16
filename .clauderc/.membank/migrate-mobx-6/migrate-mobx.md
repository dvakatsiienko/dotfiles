# overview

This plan is a template for targeted migrations from mobx-react v6.2.2 to mobx-react-lite v4.1.0 api.

# description

use this plan to create a task suite for a migration of a specified react components from mobx

# references

- old api example, uses mobx-react: ./migrate-mobx-example-old.tsx
- new api example, uses mobx-react-lite: ./migrate-mobx-example-new.tsx
- correct new api use: ./migrate-mobx-example-perf.tsx

# plan

When asked to migrate a react component to new mobx api:

1. scan spcified above old and new mobx api files as reference
2. replace import "observer" from mobx-react with "observer" from mobx-react-lite
3. add import { mobx } from '@/lib/mobx' if there is no such import in a file yet
4. wrap base component that was previously wrapped with inject + observer with new observer from mobx-react-lite
5. copy mobx props extracted via old inject api directly to component body and get it from mobx store directly
6. important:
   1. carefully diff destructured component props that were previoulsy prop-drilled via inject
   2. delete only props that are now destructured from mobx store directly
   3. be careful to not delte props that actually passed to a compnent from above component
7. when migration is completed delete export \* = inject... statement
8. rename const ComponentNameBase = () => null to export const ComponentName = () => null.
9. scan component to verify migration is correct.
10. if all good with migration check if destructuring from store contains unused variables if so delete them
    1. there is a chance for that since most of components are old and were not maintained
11. when all parts are migrated and cleaned up cerfull rewrite destrucutred values from mobx with direct reads from mobx
    1. early de-referencing (destructuring) from mobx store removes built-in memoization and makes component rerender on each value change
    2. perform this change epecially careful in order to map destructured values into direct access correctly

# additional info

1. do not interate on fixing linter and typescript errors
2. if initial component definition is defined function declaration change it to arrow component definition
