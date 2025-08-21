# Preact to React Migration Prescreen Analysis

## Analysis Type

- **Type**: Codebase Migration Analysis
- **Scope**: Complete UI framework migration from Preact to React
- **Analysis Date**: 2025-08-21

## Current State Assessment

### Preact Integration
The sportsbook-ui is currently using **Preact 10.27.1** with React compatibility layer through webpack aliases:

```javascript
// webpack.config.ts aliases
react: 'preact/compat',
'react-dom/test-utils': 'preact/test-utils',
'react-dom': 'preact/compat',
```

All React imports are transparently aliased to Preact equivalents throughout the codebase.

### MobX Store Architecture

**Root Store Structure:**
- **Central Store**: `RootStoreMobx` class orchestrates all sub-stores
- **Key Stores**: `ui`, `store` (main), `betslip`, `auth`, `profile`, `search`, `categorizer`, etc.
- **MobX Version**: 6.13.7 with modern `makeAutoObservable()` API
- **Migration Status**: **PARTIALLY MIGRATED** - ~50% still using MobX 5 patterns

**Store Organization:**
```
src/lib/mobx/
├── RootStoreMobx.ts (TypeScript)
├── models/
│   ├── index.mobx.js (JavaScript - legacy)
│   ├── betslip.mobx.js (JavaScript - legacy)
│   ├── UI.mobx.ts (TypeScript - modern)
│   ├── Search.mobx.ts (TypeScript - modern)
│   └── [other stores mix of .js/.ts]
```

### MobX Integration Patterns

**Modern Components (MobX 6 + observer):**
```tsx
// Current pattern using observer from mobx-react-lite
import { observer } from 'mobx-react-lite';
import { mobx } from '@/lib/mobx';

export const Search = observer<ISearchProps>((props) => {
  // Direct store access
  mobx.search.searchState
  mobx.ui.isMobile
});
```

**Legacy Components (MobX 5 + inject HOC):**
```tsx
// Legacy pattern using inject HOC
export const GridMarketsFilter = inject(
  ({
    ui: { mainMarketsFilters, setMainMarketsFilters, isAmericanView },
    store: { actualDiscipline, disciplinesValues, eventsValues },
  }: any) => ({
    actualDiscipline,
    disciplinesValues,
    // ... mapped props
  }),
)(observer(GridMarketsFilterBase));
```

**Store Provider Setup:**
```tsx
// App.tsx - Uses mobx-react Provider (legacy pattern)
<Provider {...mobx}>
  <CurrentRouter>
    {/* app content */}
  </CurrentRouter>
</Provider>
```

### Router Configuration

**Current Setup:**
- **React Router v7** (latest) 
- **Router Choice**: Conditional based on shadow mode
  - `BrowserRouter` for normal mode
  - `MemoryRouter` for shadow DOM mode
- **Routes**: Complex nested routing with 50+ routes
- **Integration**: Router state integrated with MobX stores via observers

### WebSocket & Real-time Integration

**Socket Management:**
- Custom `Socket` class for WebSocket connections
- Real-time data flows directly into MobX stores
- Socket subscriptions managed through `getFromWebSocket()` helper
- Store reactions trigger UI updates automatically via MobX

**Critical Pattern:**
```typescript
// WebSocket data -> MobX store -> Observer components -> Re-render
Socket.addEventListener('message', (event) => {
  // Updates MobX stores directly
  mobx.store.updateEntity(data);
  // Observer components auto-update
});
```

### Performance Optimizations

**Lazy Loading:**
- **Minimal**: Limited use of `React.lazy` and `Suspense`
- **Components**: Most components loaded synchronously
- **Routes**: Basic Suspense usage in RouterMain

**React Optimization Patterns:**
- **React.memo**: Found in ~13 components
- **useMemo/useCallback**: Sporadic usage
- **Performance**: Relies heavily on MobX observability for optimization

### Testing Infrastructure

**Current State**: **NO TESTING SETUP FOUND**
- No test files (*.test.*, *.spec.*)
- No testing framework configuration
- No test utilities or helpers

## Risk Areas & Weak Spots

### 1. **MobX Provider/Inject Migration (CRITICAL)**

**Problem**: 50+ components still use legacy `inject()` HOC pattern
```tsx
// This pattern will break in React 18+
export const Component = inject(
  ({ ui: { prop1 }, store: { prop2 } }) => ({ prop1, prop2 })
)(observer(ComponentBase));
```

**Risk**: React 18 Strict Mode renders components twice, breaking inject's prop mapping

### 2. **MobX Store Mixed Architecture (HIGH)**

**Legacy JavaScript Stores:**
- `src/lib/mobx/models/index.mobx.js` - Main store (JavaScript)
- `src/lib/mobx/models/betslip.mobx.js` - Critical betting logic (JavaScript) 
- `src/lib/mobx/auth.mobx.js` - Authentication (JavaScript)

**Risk**: JavaScript stores may have different observable behaviors in React

### 3. **Preact-Specific Optimizations (MEDIUM)**

**Potential Breaking Changes:**
- Preact's smaller bundle size vs React
- Different event handling behaviors
- Ref handling differences
- Lifecycle timing differences

### 4. **Real-time Data Flow Integrity (HIGH)**

**Critical Path**: 
```
WebSocket → MobX Store → Observer Components → UI Updates
```

**Risk**: React 18's automatic batching and concurrent rendering could affect real-time betting updates

### 5. **Shadow DOM Integration (MEDIUM)**

**Current Setup:**
- Dynamic router selection based on `isShadowMode`
- Custom `stylesInjector` for shadow DOM styles
- MobX context may behave differently in shadow DOM with React

### 6. **No Testing Safety Net (CRITICAL)**

**Risk**: Zero test coverage means migration errors will only be caught in production

## Complexity Estimation

- **Overall Complexity**: **HIGH**
- **Confidence Level**: **MEDIUM** 
- **Estimated Effort**: 4-6 weeks full development

**Complexity Drivers:**
1. MobX inject() → observer() migration across 50+ components
2. JavaScript → TypeScript store migrations
3. Real-time betting data integrity verification
4. Shadow DOM compatibility testing
5. Performance regression prevention

## Key Findings

### Positive Factors
1. **Modern React Router v7** already in use
2. **MobX 6** provides React 18 compatibility
3. **~50% stores already migrated** to modern patterns
4. **TypeScript coverage** growing (~30%)
5. **Strong build system** with webpack

### Critical Blockers
1. **Legacy inject() HOCs** need systematic migration
2. **JavaScript stores** need TypeScript conversion
3. **No test coverage** for migration validation
4. **Real-time data flows** need careful validation
5. **Shadow DOM integration** needs compatibility verification

### Migration Dependencies
1. Complete MobX 6 migration (finish inject() → observer())
2. Establish testing framework
3. Validate WebSocket/real-time data flows
4. Shadow DOM React compatibility testing

## Recommendations for Research

### Claude Desktop should focus on:

1. **MobX Migration Strategy**
   - Best practices for inject() → observer() migration at scale
   - Patterns for gradual migration without breaking changes
   - Testing strategies for MobX + React integration

2. **Real-time Data Integrity**
   - React 18 concurrent rendering impact on real-time updates
   - WebSocket → MobX → React observer chain validation
   - Performance monitoring for betting applications

3. **Shadow DOM Compatibility**
   - React 18 behavior in shadow DOM environments
   - Context provider patterns for shadow DOM
   - Event handling differences

4. **Testing Infrastructure Setup**
   - MobX + React testing patterns
   - Real-time data flow testing strategies
   - Shadow DOM testing approaches

5. **Performance Migration Strategy**
   - Bundle size impact analysis
   - Performance monitoring setup
   - Critical path optimization (betting flows)

6. **Migration Execution Plan**
   - Safe migration order (stores → components → optimization)
   - Feature flag strategies
   - Rollback procedures

The migration requires careful planning due to the complex real-time betting requirements and lack of existing test coverage.