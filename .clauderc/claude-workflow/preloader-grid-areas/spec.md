# Preloader Grid Areas Feature

## Overview
Update the Preloader component behavior to move it down in the component tree at the layer of main UI components. Each grid area of the app should be covered with its own preloader for better granular loading states.

## Current Situation
- The app uses a single Preloader component at a high level in the component tree
- The app is legacy with poor/naive logic that doesn't consider component swapping flexibility
- Moving the Preloader down the tree will likely cause errors due to architectural limitations

## Main Phases

### Phase 1: Research Current Implementation
- Find current Preloader component and understand its implementation
- Identify where and how it's currently used in the app
- Document all usage patterns and dependencies

### Phase 2: Analyze Layout Architecture
- Search and learn layouting components of the app
- Identify grid template areas used for layout
- Map the main UI components to their respective grid areas

### Phase 3: Design New Preloader Location
- Find optimal placement for new Preloader considering grid areas
- Identify which components should have their own preloaders
- Plan the component hierarchy changes needed

### Phase 4: Implementation
- Transfer preloader to new locations in the component tree
- Handle potential errors from the legacy architecture
- Ensure backward compatibility where needed

### Phase 5: Global State Management
- Add required global state for coordinating multiple preloaders
- Implement loading state management per grid area
- Ensure proper synchronization between preloaders

## Key Files to Investigate
- `src/components/Preloader/Preloader.tsx` - Current preloader implementation
- `src/modules/LayoutMain/LayoutMain.jsx` - Main layout component
- Other layout components that define grid areas

## Challenges & Considerations
- Legacy architecture may not support flexible component swapping
- Need to maintain backward compatibility
- Multiple preloaders need coordination through global state
- Performance implications of multiple preloader instances

## Success Criteria
- Each main grid area has its own preloader
- Loading states are granular and component-specific
- No breaking changes to existing functionality
- Improved user experience with more precise loading indicators