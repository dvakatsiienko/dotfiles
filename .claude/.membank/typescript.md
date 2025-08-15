# typescript guide

# convensions

- use type name distinction system:
  - interfaces: TextareaProps → ITextareaProps, where prefix I stand for interface, which is described by this interface type
  - types: TextareaProps → TTextareaProps, where prefix T stand for type, which is described by this type
  - unions: LoadingState → ULoadingState, where prefix U stand for union, which is described by this union type
  - discriminated unions are prefixe with U too
- when typing mobx observer prefer observer<TypeName> pattern

# biggest problems

## absense of type coverage «from the top to bottom»

- @types dir contains important type definitions for EN.Event, EN.Tournament etc but rarely or not optimally used across codebase.
- such important type difinition information is required to be be used in important type infrasturcture app places like zustand or mobx store
- to resolve this issue type defintions needs to be connected to mobx store, correctly processed preserving it's type definition in a correct shape, and consumed by React Components in an appropriate type shape
