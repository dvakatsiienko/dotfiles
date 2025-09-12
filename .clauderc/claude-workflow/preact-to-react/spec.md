# Preact to React Migration

## Overview

This document outlines the requirements for migrating the sportsbook application from Preact to
React.

## Current State

- **UI Framework**: Preact 10.27.1 with React compatibility aliases
- **Codebase Size**: ~6 years old legacy betting application
- **Architecture**: Semi-monorepo with main app in `src/` and mini-apps in `packages/`
- **Component Count**: [TO BE DETERMINED]
- **Migration Scope**: [TO BE DEFINED]

## Migration Goals

Preact have inherently problematic design diea which makes this solution unoptimal. During this
migration we need to replace preact with react with minimum possible effort. The functionality
should be preserved by 100%, app should work exactly the same as before migration. Correction
probably by 99%, because since these two renderers are not identical, there might be a rendering
engine replacement natural app perceptance difference. This does not count.

## Requirements

- preact should be replaced with latest version of react
- all preact indirect referneces should be eliminated from the proj
- the app should be functional — no broken functionality should appear after migration

## Constraints

- none for now

## Success Criteria

- medium — an app react patterns usage is highly problematic, often incorrect and generraly was
  inherently wrong
- rules of react hooks were violated for a long and and app was built around wrong react use hooks
  usages
- the patterns were fixed rapidly without ensuring proper reliability
- because of all of this the risks of simply switching preact ot react as a renderer will product
  regressions is high
- this is due to a slight difference how preact and react treats different intricate rendering
  mechanism details
- claude code's priority in this process is to ensure most reliable react hook usage patterns at the
  level of code
- user will find inconsistensies by himself and manually instruct claude code with actual situation
  with the app

## notes

- important: useEffect needs to be cared of specifically intricatively.
- useEffect linting rules should not be taken in to account at all
- this is because linter sometimes incorrectly suggests to include or remove useEffect dependencies
- instead, when claude code reads the code he will evaluate each useEffect individually and analyze
  for potential bugs
- do not include missing useEffect dependencies automatially — in many places dependencies are
  omitted intentionally due to architectural decisions problems
- each time you notice a potential bug during this flow — ask me first, if we will take care of this
  issue or no

## References

- use fetch tool for most actual react documentation https://react.dev/
- use fetch tool for most actual preact documentation https://preactjs.com/, in case of functionaliy
  porting questions arise
