# Preloader Grid Areas - Implementation Plan

## Overview
This plan outlines the step-by-step implementation of distributed preloaders across grid areas, moving from a single app-level preloader to granular, area-specific loading states.

## Implementation Phases

### Phase 1: Foundation Setup ✅
**Goal**: Create base infrastructure without breaking existing functionality

- [ ] Create new MobX store for grid loading states
  - [ ] Define `GridLoadingStore` in `src/lib/mobx/stores/gridLoading.ts`
  - [ ] Add area-specific loading flags
  - [ ] Implement computed properties for aggregate states
  - [ ] Wire into RootStore

- [ ] Create `GridAreaPreloader` wrapper component
  - [ ] Location: `src/components/GridAreaPreloader/GridAreaPreloader.tsx`
  - [ ] Props: area, isLoading, children, fallbackToGlobal
  - [ ] Implement conditional rendering logic
  - [ ] Add proper TypeScript types

- [ ] Create area-specific preloader variants
  - [ ] `HeaderPreloader` - Slim horizontal loader
  - [ ] `SidebarPreloader` - Vertical loading animation
  - [ ] `ContentPreloader` - Main area skeleton
  - [ ] `NavPreloader` - Navigation skeleton
  - [ ] `FooterPreloader` - Minimal footer loader

### Phase 2: Safe Component Migration ✅
**Goal**: Migrate low-risk components first

- [ ] Migrate widget-level preloaders
  - [ ] Update `BetsHistoryWidget`
  - [ ] Update `PromoticketBanner`
  - [ ] Update `PromoticketBonusBlock`
  - [ ] Test each migration individually

- [ ] Migrate page-level preloaders
  - [ ] Update page components with local loading states
  - [ ] Remove direct Preloader imports
  - [ ] Use GridAreaPreloader instead

### Phase 3: Grid Area Integration ✅
**Goal**: Implement preloaders for each grid area

- [ ] Update LayoutMain grid structure
  - [ ] Wrap Header in GridAreaPreloader
  - [ ] Wrap Sidebar in GridAreaPreloader
  - [ ] Wrap LobbyNavigation in GridAreaPreloader
  - [ ] Wrap Outlet content in GridAreaPreloader
  - [ ] Wrap Footer in GridAreaPreloader

- [ ] Connect to loading states
  - [ ] Header: `mobx.ui.hasHeader && gridLoading.areas.header`
  - [ ] Sidebar: `pageWithBetslip && gridLoading.areas.sidebar`
  - [ ] Nav: `pageWithNav && gridLoading.areas.nav`
  - [ ] Content: `gridLoading.areas.content`
  - [ ] Footer: `mobx.ui.isMobile && gridLoading.areas.footer`

### Phase 4: Critical Path Refactoring ✅
**Goal**: Safely refactor app initialization flow

- [ ] Create initialization orchestrator
  - [ ] `InitializationManager` class
  - [ ] Coordinate theme loading
  - [ ] Coordinate socket configuration
  - [ ] Manage transition from app-level to area-level loading

- [ ] Implement fallback mechanism
  - [ ] Add feature flag for new loading system
  - [ ] Maintain original Preloader as fallback
  - [ ] Gradual rollout capability

- [ ] Update critical components
  - [ ] Refactor LayoutMain initialization check
  - [ ] Update AuthResolver loading logic
  - [ ] Ensure backward compatibility

### Phase 5: State Synchronization ✅
**Goal**: Coordinate multiple loading states

- [ ] Implement loading orchestration
  - [ ] Priority-based loading (critical areas first)
  - [ ] Dependency management between areas
  - [ ] Progress tracking for overall app state

- [ ] Add transition animations
  - [ ] Smooth fade between loading and loaded
  - [ ] Staggered area reveals
  - [ ] Prevent layout shift

### Phase 6: Optimization & Polish ✅
**Goal**: Ensure performance and UX quality

- [ ] Performance optimization
  - [ ] Memoize preloader components
  - [ ] Optimize re-renders
  - [ ] Lazy load non-critical preloaders

- [ ] Visual consistency
  - [ ] Align animations across areas
  - [ ] Consistent timing functions
  - [ ] Proper shadow mode support

- [ ] Error handling
  - [ ] Timeout mechanisms
  - [ ] Fallback to full-screen loader on error
  - [ ] User feedback for stuck states

## Code Implementation Details

### 1. GridLoadingStore Structure
```typescript
// src/lib/mobx/stores/gridLoading.ts
import { makeAutoObservable } from 'mobx';

export class GridLoadingStore {
  areas = {
    header: true,
    sidebar: true,
    nav: true,
    content: true,
    footer: true
  };
  
  initializationComplete = false;
  
  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }
  
  setAreaLoading(area: keyof typeof this.areas, isLoading: boolean) {
    this.areas[area] = isLoading;
  }
  
  get isAnyLoading() {
    return Object.values(this.areas).some(v => v);
  }
  
  get canShowLayout() {
    return this.initializationComplete || !this.isAnyLoading;
  }
  
  completeInitialization() {
    this.initializationComplete = true;
    // Start showing areas progressively
    this.revealAreas();
  }
  
  private revealAreas() {
    // Staggered reveal logic
    setTimeout(() => this.setAreaLoading('header', false), 0);
    setTimeout(() => this.setAreaLoading('nav', false), 100);
    setTimeout(() => this.setAreaLoading('sidebar', false), 200);
    setTimeout(() => this.setAreaLoading('content', false), 300);
    setTimeout(() => this.setAreaLoading('footer', false), 400);
  }
}
```

### 2. GridAreaPreloader Component
```typescript
// src/components/GridAreaPreloader/GridAreaPreloader.tsx
import { observer } from 'mobx-react-lite';
import { Preloader } from '@/components/Preloader';
import { mobx } from '@/lib/mobx';
import cn from 'classnames';

interface GridAreaPreloaderProps {
  area: 'header' | 'sidebar' | 'nav' | 'content' | 'footer';
  children: React.ReactNode;
  className?: string;
  customLoader?: React.ReactNode;
}

export const GridAreaPreloader = observer((props: GridAreaPreloaderProps) => {
  const { area, children, className, customLoader } = props;
  const isLoading = mobx.gridLoading.areas[area];
  
  if (!mobx.gridLoading.initializationComplete) {
    // During init, show children but with reduced opacity
    return (
      <div className={cn('grid-area-wrapper', className, {
        'opacity-30': true,
        [`grid-area-${area}`]: true
      })}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={cn('grid-area-wrapper', className, {
      [`grid-area-${area}`]: true
    })}>
      {isLoading ? (
        customLoader || <Preloader className={`preloader-${area}`} />
      ) : (
        children
      )}
    </div>
  );
});
```

### 3. Updated LayoutMain Integration
```jsx
// Partial update to LayoutMain.jsx
import { GridAreaPreloader } from '@/components/GridAreaPreloader';

// In render method, replace direct component renders with wrapped versions:

{mobx.ui.hasHeader && (
  <GridAreaPreloader area="header" className="games-header">
    <Header />
  </GridAreaPreloader>
)}

{pageWithNav && (
  <GridAreaPreloader area="nav">
    <LobbyNavigationResolver key="lobby-nav" />
  </GridAreaPreloader>
)}

<GridAreaPreloader area="content">
  <Outlet />
</GridAreaPreloader>

{!mobx.ui.isMobile && pageWithBetslip && !mobx.ui.isCompactMode && (
  <GridAreaPreloader area="sidebar">
    <Sidebar />
  </GridAreaPreloader>
)}
```

## Testing Strategy

### Unit Tests
- [ ] GridLoadingStore state transitions
- [ ] GridAreaPreloader rendering logic
- [ ] Area-specific preloader variants

### Integration Tests
- [ ] App initialization flow
- [ ] Area loading coordination
- [ ] Fallback mechanisms

### E2E Tests
- [ ] Full app loading sequence
- [ ] Error recovery scenarios
- [ ] Performance benchmarks

## Rollout Plan

1. **Feature Flag Implementation**
   ```typescript
   const USE_GRID_PRELOADERS = process.env.REACT_APP_GRID_PRELOADERS === 'true';
   ```

2. **Gradual Rollout**
   - Week 1: Internal testing (5% traffic)
   - Week 2: Beta users (25% traffic)
   - Week 3: General rollout (50% traffic)
   - Week 4: Full deployment (100% traffic)

3. **Monitoring**
   - Track initialization times
   - Monitor error rates
   - Measure perceived performance

## Risk Mitigation

### Fallback Strategies
1. **Timeout Protection**: If any area doesn't load within 10s, show full preloader
2. **Error Boundaries**: Catch and handle component errors gracefully
3. **Kill Switch**: Instant revert to original behavior via feature flag

### Performance Safeguards
1. **Render Optimization**: Use React.memo for all preloader components
2. **State Batching**: Batch multiple loading state updates
3. **Progressive Enhancement**: Start with basic loader, enhance as needed

## Success Criteria

- [ ] All grid areas load independently
- [ ] No increase in total load time
- [ ] Improved perceived performance (first paint < 500ms)
- [ ] Zero breaking changes
- [ ] Positive user feedback on loading experience

## Timeline

- **Week 1**: Foundation setup & component creation
- **Week 2**: Safe migrations & testing
- **Week 3**: Grid area integration
- **Week 4**: Critical path refactoring
- **Week 5**: State synchronization & optimization
- **Week 6**: Final testing & rollout preparation

## Notes & Considerations

1. **Shadow Mode**: Special attention needed for shadow DOM compatibility
2. **Mobile View**: Different grid layout on mobile requires adaptive approach
3. **Theme Loading**: Must complete before showing any styled content
4. **Socket Connection**: Critical for real-time features, affects sidebar/content
5. **Legacy Constraints**: Some components may break if loaded too early

## Next Actions

1. Create GridLoadingStore and wire into RootStore
2. Implement GridAreaPreloader component
3. Create area-specific loader designs
4. Begin Phase 1 implementation
5. Set up feature flag system

---

*This plan is a living document and will be updated as implementation progresses.*