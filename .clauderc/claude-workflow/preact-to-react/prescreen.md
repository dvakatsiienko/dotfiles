# Preact to React Migration Prescreen Analysis

## Prescreen Readiness

- **Claude Code**: ✅ (comprehensive analysis complete with two iterations)
- **Claude Desktop**: ❌ (set to ✅ when prescreen is reviewed and research is complete)

## Analysis Type

- **Type**: Codebase Migration Analysis - Framework Replacement
- **Scope**: Full application migration from Preact 10.27.1 to React 18.x
- **Analysis Date**: 2024-12-19

## Project Tech Stack (FOR CLAUDE DESKTOP FOCUS)

### Currently Used Technologies
- **UI Framework**: Preact 10.27.1 with React compatibility aliases
- **State Management**: MobX 6.13.7 (mixed v5/v6 patterns, ~50 inject() HOCs)
- **Styling**: Tailwind CSS v4 with @layer system, CSS custom properties, shadow DOM isolation
- **Bundler**: Webpack 5 with multiple entry points (migrating to Vite planned)
- **Routing**: React Router v7 with shadow DOM support
- **Testing**: NONE (zero test coverage - critical gap)
- **Real-time**: Custom WebSocket implementation with MobX integration
- **Performance**: Manual DOM optimizations, react-lazyload for virtualization
- **CSS Isolation**: Complex stylesInjector.js with media→container query transformation

### Technologies NOT Used (Avoid Research)
- **NOT styled-components** → Focus on Tailwind CSS migration patterns
- **NOT Redux/Zustand** → Focus on MobX 6 + React 18 integration  
- **NOT Socket.io** → Focus on custom WebSocket + React compatibility
- **NOT Vite** (yet) → Focus on Webpack 5 configuration for React
- **NOT Jest/Vitest** → Focus on testing setup from scratch
- **NOT Emotion/Stitches** → Focus on Tailwind + shadow DOM patterns
- **NOT Next.js** → Focus on React Router v7 migration
- **NOT create-react-app** → Focus on custom Webpack build system

## Current State Assessment

### Codebase Scale
- **Total React/JSX Components**: 516 files
- **Component Distribution**:
  - Functional Components: 510 (99%)
  - Class Components: 6 (1%)
  - Main app (`src/`): ~400 components
  - Mini-apps (`packages/`): ~100 components
- **Hooks Usage**: 202+ files with React hooks
- **MobX Integration**: 47+ components with direct MobX observable dependencies

### Current Architecture
- **Preact Version**: 10.27.1 with React compatibility layer
- **Webpack Aliases**: Complete React API aliasing to Preact
- **State Management**: MobX 6.13.7 (mixed v5/v6 patterns)
- **Routing**: React Router v7
- **Real-time**: Custom WebSocket with MobX integration
- **Testing**: **ZERO test coverage** (critical gap)

## Risk Areas & Weak Spots

### 🚨 CRITICAL RISKS (Migration Blockers)

#### 1. **Systematic useEffect Violations** (SEVERITY: CRITICAL)
- **202+ files** with useEffect patterns
- **15+ files** with intentionally missing dependencies
- **47+ components** using MobX observables directly in dependencies
- **Example**: `useSocketRPC.ts` - missing critical dependencies causing stale data
- **Impact**: Will cause runtime failures, infinite loops, memory leaks in React 18

#### 2. **MobX Observable Dependencies** (SEVERITY: CRITICAL)
```javascript
// Common anti-pattern found in 47+ files
useEffect(handleResize, [mobx.ui.appWidth, mobx.ui.isTopNavOrientation]);
```
- Direct observable access breaks React's dependency checking
- Can cause infinite re-render loops
- React 18's automatic batching will expose these issues

#### 3. **WebSocket Subscription Architecture** (SEVERITY: CRITICAL)
- `useSocketEntitySubscription.ts` (785 lines) - massive hook with complex cleanup
- Async operations in cleanup functions (React doesn't support)
- Race conditions in subscription management
- No proper cleanup for async operations

### 🔴 HIGH RISKS

#### 4. **Memory Leak Patterns** (SEVERITY: HIGH)
- Event listeners without cleanup in multiple components
- Timers/intervals with missing cleanup
- WebSocket subscriptions not properly disposed
- Example: `HistoryListener.jsx` - message listener never removed

#### 5. **Legacy MobX Patterns** (SEVERITY: HIGH)
- 50+ components still using `inject()` HOC (breaks in React 18 Strict Mode)
- Mixed JavaScript/TypeScript stores
- Different observable patterns between v5 and v6

#### 6. **Real-time Data Integrity** (SEVERITY: HIGH)
- Complex WebSocket → MobX → Component data flow
- Dependencies on timing and render order
- Live betting functionality at risk

### 🟡 MEDIUM RISKS

#### 7. **Shadow DOM & CSS Isolation System** (SEVERITY: HIGH → CRITICAL after 2nd analysis)
- **Complex Media Query Transformation**: `stylesInjector.js` converts `@media` to `@container` queries
- **11+ CSS Layers** with precise insertion order dependency
- **Blob URL Fallback** using fetch() and createObjectURL() for style processing
- **Race Conditions** with style load event listeners
- React 18 concurrent features could completely break this system

#### 8. **Performance Patterns** (SEVERITY: MEDIUM)
- Only 13 components use `React.memo`
- No systematic optimization strategy
- Heavy reliance on MobX for performance
- **20+ manual DOM optimizations** assuming synchronous updates

## Complexity Estimation

- **Overall Complexity**: **CRITICAL**
- **Confidence Level**: **LOW** (due to systematic violations)
- **Estimated Effort**: 
  - Fix blockers: 3-4 weeks
  - Migration: 2-3 weeks
  - Testing & validation: 2 weeks
  - **Total: 7-9 weeks minimum**

## Key Findings

### Most Critical Issues for Migration (Updated After 2nd Analysis)

1. **useEffect Dependency Violations Are Systemic**
   - Not isolated issues but architectural patterns
   - Developers intentionally omitted dependencies
   - Will require manual review of each instance

2. **CSS Isolation System Is Migration's Biggest Risk** (NEW PRIORITY)
   - Shadow DOM style injection with complex transformations
   - 11+ CSS layers requiring precise insertion order
   - Media query to container query conversion system
   - Fallback mechanisms using blob URLs
   - React 18 concurrent rendering will likely break this

3. **MobX Integration Fundamentally Incompatible**
   - Current patterns rely on Preact's lenient behavior
   - React 18 Strict Mode will break inject() HOCs
   - Observable dependencies in hooks need complete redesign
   - 8+ files use MobX reactions assuming Preact timing

4. **Bundle Size Constraints Will Be Violated**
   - Webpack enforces 1.5MB max entrypoint size
   - React is ~45KB larger than Preact
   - No React package installed - everything aliased
   - Build system expects Preact-sized chunks

5. **Zero Test Coverage Is Catastrophic**
   - No safety net for migration validation
   - Real-time betting logic completely unprotected
   - Cannot verify functionality preservation

6. **WebSocket Architecture Needs Rewrite**
   - Current implementation incompatible with React 18
   - Complex subscription management will fail
   - Critical for live betting functionality

7. **Hidden Performance Dependencies** (NEW)
   - 20+ manual DOM optimizations expecting sync updates
   - Virtual scrolling relies on Preact render timing
   - React-lazyload may break with concurrent features
   - Real-time updates batching differently could break UX

## Critical Questions for Claude Desktop Research

Based on the most problematic areas identified, please research answers to these critical questions:

### CSS Isolation & Shadow DOM (TOP PRIORITY)
1. **How does React 18's concurrent rendering affect shadow DOM style injection timing?**
   - Our `stylesInjector.js` relies on precise load event timing
   - Will concurrent features break our media→container query transformation?

2. **Are there React-compatible alternatives to our current CSS isolation approach?**
   - We have 11+ CSS layers with insertion order dependencies
   - Need solution that works in both shadow DOM and light DOM modes

### useEffect Dependency Crisis
3. **What strategies exist for migrating intentionally omitted useEffect dependencies?**
   - We have 15+ files where dependencies were omitted on purpose
   - How to preserve functionality while making React-compliant?

4. **Can React 18 be configured to be more lenient with useEffect dependencies?**
   - Is there a migration mode or configuration?
   - Can we disable exhaustive-deps temporarily?

### MobX Observable Integration
5. **What's the best practice for MobX observables in React 18 useEffect dependencies?**
   - Currently 47+ components use `[mobx.ui.someValue]` directly
   - Will this cause infinite loops with React 18's automatic batching?

6. **Is there a migration path from inject() HOC that doesn't require rewriting all 50+ components at once?**
   - Can we create a compatibility shim?
   - What about a codemod to automate this?

### WebSocket & Real-time Data
7. **How to handle async cleanup functions in useEffect for React 18?**
   - Our `useSocketEntitySubscription` has async cleanup
   - React doesn't support async cleanup functions

8. **Will React 18's automatic batching break real-time betting updates?**
   - Live odds must update immediately
   - How to opt-out of batching for critical updates?

### Bundle Size & Performance
9. **Can we use React 18 without Strict Mode initially?**
   - Would this reduce migration risk?
   - What features would we lose?

10. **Are there proven strategies for incrementally migrating from Preact to React in production?**
    - Can we run both renderers temporarily?
    - Module-by-module migration feasibility?

### Testing Strategy
11. **What's the minimum test coverage needed before attempting this migration?**
    - Focus on betting logic critical paths?
    - Snapshot testing for render differences?

12. **How to test shadow DOM components with React 18?**
    - Current zero test coverage is blocking
    - Need pragmatic testing approach

## Recommendations for Research

### Priority Research Areas for Claude Desktop (Updated)

1. **CSS Isolation & Shadow DOM Strategy** (NEW TOP PRIORITY)
   - React 18 compatibility with shadow DOM styling
   - Alternatives to media→container query transformation
   - Handling CSS layers in React 18 concurrent mode
   - Solutions for style injection timing issues

2. **React 18 Breaking Changes**
   - Strict Mode implications for MobX inject()
   - Automatic batching impact on real-time updates
   - Concurrent features interaction with WebSockets
   - Impact on manual DOM optimizations

3. **MobX Migration Strategies**
   - Best practices for MobX 6 + React 18
   - Migration path from inject() to observer()
   - Handling observable dependencies in hooks
   - MobX reactions timing in React 18

4. **Bundle Size & Build System**
   - Strategies to minimize React bundle size
   - Webpack configuration for React migration
   - Handling the alias system removal
   - Performance monitoring post-migration

5. **useEffect Migration Patterns**
   - Strategies for fixing intentionally missing dependencies
   - Patterns for async operations in effects
   - WebSocket subscription management in React 18

6. **Testing Strategy**
   - Minimum viable test coverage before migration
   - Testing real-time functionality
   - Shadow DOM testing approaches
   - Regression detection for betting logic

7. **Incremental Migration Approach**
   - Can we migrate module by module?
   - Shadow DOM gradual migration
   - Rollback strategies if issues arise
   - Maintaining two renderers temporarily?


## Migration Readiness Assessment

### ❌ **NOT READY FOR MIGRATION**

**Blockers that MUST be resolved**:
1. Fix critical useEffect violations
2. Migrate from inject() to observer()
3. Rewrite WebSocket subscription hooks
4. Add minimum test coverage

**Current State**: The codebase will experience **catastrophic failures** if migrated as-is.

## Specific Files Requiring Immediate Attention

### Critical Files (Fix First)
1. `/src/hooks/useSocketRPC.ts` - Missing dependencies
2. `/src/helpers/useSocketEntitySubscription.ts` - Complete rewrite needed
3. `/src/modules/LobbyNavigation/*.jsx` - MobX in dependencies
4. `/src/app/parts/HistoryListener.jsx` - Memory leaks
5. All 50+ files using `inject()` HOC

### High Priority Reviews
- All WebSocket-related hooks
- Components with timers/intervals
- Real-time betting components
- MobX store integration points

## Next Steps

1. **DO NOT PROCEED** with migration until blockers resolved
2. Research team should focus on migration strategies for identified issues
3. Consider hiring React expert familiar with complex migrations
4. Implement testing before any migration attempt
5. Plan for 2-3 month timeline minimum

---

**Note**: This analysis reveals fundamental architectural incompatibilities that pose extreme risk for a Preact→React migration. The intentional violations of React patterns throughout the codebase suggest the team specifically chose Preact for its lenient behavior, making this migration exceptionally challenging.