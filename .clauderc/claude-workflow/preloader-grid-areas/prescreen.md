# Preloader Grid Areas - Prescreen Analysis

## Current Architecture Analysis

### 1. Preloader Component Structure
**Location**: `src/components/Preloader/Preloader.tsx`

**Props Interface**:
```typescript
interface PreloaderProps {
  className?: string;
  disableBlur?: boolean;
}
```

**Key Features**:
- Observer pattern with MobX (`observer` HOC)
- Conditional rendering based on `privatebet_dev` brand
- Shadow mode support with blur effects
- 12 animated divs for loading animation
- SCSS-based styling with BEM methodology

### 2. Current Usage Patterns

#### Critical App-Level Usage (High Risk)
1. **LayoutMain.jsx:72-74** 
   - Blocks entire app rendering during initialization
   - Depends on: `mobx.ui.isLoadingTheme || !mobx.ui.socketConfigIsLoaded`
   - Returns full-screen Preloader before any layout rendering

2. **AuthResolver.tsx:23-27**
   - Authentication flow blocker
   - Shows during auth state determination
   - Critical for app security flow

#### Component-Level Usage (Moderate Risk)
3. **BetsLayout.tsx:53** - Grid area: `[grid-area:stream]`
4. **NotificationsLayout.tsx:58** - Notifications loading
5. **PromoticketBanner.jsx:97** - Conditional banner loading
6. **PromoticketBonusBlock.jsx:73** - Bonus block loading

#### Widget/Page Level Usage (Low Risk)
- Multiple widgets and pages use Preloader for local loading states
- These are generally safe to refactor

### 3. Grid Layout Architecture

#### Main Grid Definition (LayoutMain.scss)
```scss
.games-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar nav content"
    "sidebar footer content";
}
```

#### Grid Area Components Mapping
- **header**: Header component (`games-header`)
- **sidebar**: Sidebar/Betslip area
- **nav**: LobbyNavigationResolver
- **content**: Outlet (React Router content)
- **footer**: FooterMobile (mobile only)

### 4. Loading State Management

#### MobX Stores Involved
- `mobx.ui.isLoadingTheme` - Theme loading state
- `mobx.ui.socketConfigIsLoaded` - WebSocket configuration
- `mobx.betslip.inProgress` - Betslip operations
- `mobx.ui.lobbyNavMenuIsOpen` - Navigation state
- Various component-specific loading states

#### Loading Flow
1. App starts → Show Preloader (full screen)
2. Theme loads → `isLoadingTheme = false`
3. Socket config loads → `socketConfigIsLoaded = true`
4. Both complete → Remove Preloader, render layout
5. Component-level preloaders handle local states

### 5. Legacy Constraints & Risks

#### High-Risk Dependencies
- **Theme System**: Preloader removal triggers theme application
- **Socket Initialization**: App expects socket ready after Preloader
- **Shadow DOM Mode**: Special handling for `isShadowMode`
- **CSS Layer System**: Complex style injection order

#### Potential Breaking Points
1. Moving app-level Preloader breaks initialization sequence
2. Multiple preloaders may conflict with global state expectations
3. CSS animations may break with grid area constraints
4. Shadow mode blur effects depend on parent positioning

### 6. Proposed Migration Strategy

#### Phase 1: Safe Component Migration
- Start with low-risk widget/page preloaders
- Add loading state props to individual components
- Test each migration in isolation

#### Phase 2: Grid Area Preloaders
- Create GridAreaPreloader wrapper component
- Implement for non-critical areas first (footer, nav)
- Maintain backward compatibility flags

#### Phase 3: Critical Path Refactoring
- Refactor initialization flow to support distributed loading
- Implement coordination mechanism for multiple preloaders
- Add fallback to original behavior if issues detected

#### Phase 4: State Management Enhancement
- Create dedicated loading state store
- Implement per-area loading states
- Add loading orchestration logic

### 7. Technical Recommendations

#### New Component Structure
```typescript
interface GridAreaPreloaderProps {
  area: 'header' | 'sidebar' | 'nav' | 'content' | 'footer';
  isLoading: boolean;
  children: React.ReactNode;
  fallbackToGlobal?: boolean;
}
```

#### State Management Approach
```typescript
// New MobX store
class GridLoadingStore {
  areas = {
    header: false,
    sidebar: false,
    nav: false,
    content: false,
    footer: false
  };
  
  get isAnyLoading() {
    return Object.values(this.areas).some(v => v);
  }
  
  get isAllLoaded() {
    return !this.isAnyLoading;
  }
}
```

### 8. Implementation Challenges

1. **Coordination Complexity**: Multiple preloaders need synchronization
2. **Performance Impact**: More React components = more renders
3. **Visual Consistency**: Ensuring smooth transitions between states
4. **Legacy Compatibility**: Maintaining existing behavior paths
5. **Testing Complexity**: Many edge cases with distributed loading

### 9. Success Metrics

- [ ] Each grid area can show independent loading state
- [ ] No regression in app initialization flow
- [ ] Improved perceived performance (users see partial content sooner)
- [ ] Maintained support for shadow DOM mode
- [ ] Zero breaking changes for existing integrations

### 10. Next Steps

1. Create proof-of-concept GridAreaPreloader component
2. Test with single non-critical area (footer)
3. Gather performance metrics
4. Plan incremental rollout strategy
5. Document migration guide for team

## Risk Assessment Summary

| Component | Risk Level | Migration Priority | Notes |
|-----------|------------|-------------------|-------|
| LayoutMain app-level | 🔴 High | Last | Critical for app init |
| AuthResolver | 🔴 High | Last | Security flow dependency |
| BetsLayout | 🟡 Medium | Phase 2 | Has grid positioning |
| Widget preloaders | 🟢 Low | Phase 1 | Safe to migrate |
| Page preloaders | 🟢 Low | Phase 1 | Isolated usage |

## Conclusion

The migration is technically feasible but requires careful orchestration due to the app's initialization dependencies on the current Preloader placement. A phased approach starting with low-risk components and gradually moving to critical paths is recommended. The key challenge will be maintaining the initialization contract while distributing loading states across grid areas.