# typescript guidelines

# convensions

- use type name distinction system:
  - interfaces: TextareaProps → ITextareaProps, where prefix I stand for interface, which is described by this interface type
  - types: TextareaProps → TTextareaProps, where prefix T stand for type, which is described by this type
  - unions: LoadingState → ULoadingState, where prefix U stand for union, which is described by this union type
  - discriminated unions are prefixe with U too
- when typing zustand stores prefer typed selectors with proper inference

# biggest problems

## absense of type coverage «from the top to bottom»

- @types dir contains important type definitions for EN.Event, EN.Tournament etc but rarely or not optimally used across codebase.
- such important type definition information is required to be used in important type infrastructure app places like zustand stores
- to resolve this issue type definitions need to be connected to zustand stores, correctly processed preserving type definition in correct shape, and consumed by React Components in appropriate type shape
