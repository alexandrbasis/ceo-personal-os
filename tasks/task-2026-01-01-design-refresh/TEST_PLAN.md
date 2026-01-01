# Test Plan - Design Refresh: Distinctive UI/UX

**Date**: 2026-01-01
**Status**: Complete - All Tests Written

## Summary
- **Total Criteria**: 6
- **Test Files Created**: 6
- **Total Test Cases**: 142
- **Failing Tests**: 57 (expected - awaiting implementation)
- **Passing Tests**: 85 (basic component rendering already works)

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Tests | Status |
|---|-----------|-----------|-----------|-------|--------|
| 1 | Distinctive Typography System | Unit | `typography.design-refresh.test.tsx` | 11 cases | Written |
| 2 | Refined Color Palette | Unit | `color-palette.design-refresh.test.tsx` | 22 cases | Written |
| 3 | Visual Texture and Depth | Unit | `visual-depth.design-refresh.test.tsx` | 17 cases | Written |
| 4 | Enhanced Component Design | Unit | `components.design-refresh.test.tsx` | 28 cases | Written |
| 5 | Accessibility Improvements | Unit | `accessibility.design-refresh.test.tsx` | 33 cases | Written |
| 6 | Motion and Micro-interactions | Unit | `motion.design-refresh.test.tsx` | 31 cases | Written |

## Test Structure

### AC1: Distinctive Typography System
**Test File**: `src/__tests__/design-refresh/typography.design-refresh.test.tsx`

**Test Cases**:
- [x] Should have CSS variable --font-display defined (Fraunces)
- [x] Should have CSS variable --font-body defined (Source Sans Pro)
- [x] Should have CSS variable --font-mono defined
- [x] Should apply display font to h1 elements
- [x] Should apply display font to h2 elements
- [x] Should apply body font to paragraph elements
- [x] Should have caption text class
- [x] Should define heading line-height CSS variable
- [x] Should define body line-height CSS variable
- [x] Should load Fraunces font family
- [x] Should load Source Sans Pro font family

### AC2: Refined Color Palette
**Test File**: `src/__tests__/design-refresh/color-palette.design-refresh.test.tsx`

**Test Cases**:
- [x] Should have --color-primary CSS variable defined (#1E4D5C)
- [x] Should have --color-primary-hover CSS variable
- [x] Should have --color-primary-light CSS variable
- [x] Should have --color-accent CSS variable defined (#C4A35A)
- [x] Should have --color-accent-light CSS variable
- [x] Should have --color-bg warm white (#FAFAF8)
- [x] Should have --color-surface for cards
- [x] Should have --color-muted warm gray
- [x] Should have --color-border warm gray
- [x] Should have --color-text warm black
- [x] Should have --color-text-muted
- [x] Should have --color-success (forest green)
- [x] Should have --color-warning (amber)
- [x] Should have --color-error (deep red)
- [x] Should have --energy-low, --energy-mid, --energy-high
- [x] Dark mode: background color defined
- [x] Dark mode: surface color defined
- [x] Dark mode: text color defined
- [x] Dark mode: primary color adjusted
- [x] CSS variables use consistent naming

### AC3: Visual Texture and Depth
**Test File**: `src/__tests__/design-refresh/visual-depth.design-refresh.test.tsx`

**Test Cases**:
- [x] Should have page-background class defined
- [x] Should apply background-image for texture
- [x] Should use soft-light blend mode
- [x] Should have warm background color
- [x] Card should render with shadow
- [x] Card should have subtle default shadow
- [x] Card should have hover shadow elevation
- [x] Card should have smooth shadow transition
- [x] Card should have rounded corners
- [x] Card should have warm border color
- [x] Should use --color-border for borders
- [x] Card should have white surface background
- [x] Should use --color-surface variable
- [x] Should define shadow-sm, shadow-md, shadow-lg utilities
- [x] CardHeader should render properly
- [x] CardContent should render with padding

### AC4: Enhanced Component Design
**Test File**: `src/__tests__/design-refresh/components.design-refresh.test.tsx`

**Test Cases**:
- [x] Button renders with default variant
- [x] Button has data-variant attribute
- [x] Button has hover state transition
- [x] Button has focus-visible styling
- [x] Button supports translateY on active
- [x] Button uses primary variant with brand color
- [x] Button has hover lift effect
- [x] Input renders with refined styling
- [x] Input has data-slot attribute
- [x] Input has focus-visible ring
- [x] Input has rounded border
- [x] Input supports aria-invalid
- [x] Slider renders with custom appearance
- [x] Slider has data-slot attribute
- [x] Slider has custom thumb styling
- [x] Slider has track element
- [x] Slider has range element
- [x] Slider supports energy gradient
- [x] EmptyState component exists
- [x] EmptyState renders title
- [x] EmptyState renders description
- [x] EmptyState renders optional icon
- [x] EmptyState renders optional action button
- [x] EmptyState has personality styling
- [x] Textarea has focus-visible styling
- [x] Label renders properly
- [x] RadioGroup renders accessible items

### AC5: Accessibility Improvements
**Test File**: `src/__tests__/design-refresh/accessibility.design-refresh.test.tsx`

**Test Cases**:
- [x] Should respect prefers-reduced-motion media query
- [x] Should have motion-reduce utility class
- [x] Should have motion-safe utility class
- [x] Button has visible focus indicator
- [x] Button has focus-visible:ring styling
- [x] Input has visible focus indicator
- [x] Input has focus-visible:border-ring
- [x] Slider has visible focus indicator
- [x] Button allows keyboard focus
- [x] Input allows keyboard focus
- [x] Slider allows keyboard navigation
- [x] Slider supports arrow key control
- [x] Slider has aria-label support
- [x] Slider has aria-labelledby support
- [x] Slider has aria-valuemin/max
- [x] Slider has aria-valuenow
- [x] Input supports aria-invalid
- [x] Input supports aria-describedby
- [x] Button uses semantic element
- [x] Input uses semantic element
- [x] Label uses semantic element
- [x] Label associates with form control
- [x] Primary color has sufficient contrast
- [x] Text color has sufficient contrast
- [x] Muted text has sufficient contrast
- [x] Error color has sufficient contrast
- [x] Slider has role="slider"
- [x] Button has role="button"
- [x] Input has role="textbox"
- [x] RadioGroup has role="radiogroup"
- [x] Button has disabled styling
- [x] Input has disabled styling
- [x] Slider has disabled styling

### AC6: Motion and Micro-interactions
**Test File**: `src/__tests__/design-refresh/motion.design-refresh.test.tsx`

**Test Cases**:
- [x] Should define fadeInUp keyframe animation
- [x] Should define celebrate keyframe animation
- [x] Should define fadeIn animation
- [x] Should define slideIn animation
- [x] Cards have staggered animation delay
- [x] Animation-fill-mode: both for smooth finish
- [x] Button has transition property
- [x] Button has transition-all class
- [x] Card has hover transition
- [x] Transitions use ease timing
- [x] Slider thumb has transition
- [x] Slider thumb has hover transform
- [x] Shake animation for validation errors
- [x] Pulse animation for loading states
- [x] Spin animation for spinners
- [x] Celebration animation class available
- [x] Scale animation on celebration
- [x] Confetti animation class
- [x] Motion-reduce disables animations
- [x] Motion-reduce disables transitions
- [x] Motion-safe enables animations
- [x] 200ms duration for micro-interactions
- [x] Duration-200 utility available
- [x] Duration-300 utility available
- [x] --animation-duration CSS variable
- [x] --animation-timing CSS variable

## Edge Cases Identified
- Dark mode switching: CSS variables should update
- Empty state with/without icon and action
- Energy slider at boundary values (1 and 10)
- Focus states on all interactive elements
- Reduced motion preference respected

## Dependencies (mocks needed)
- window.matchMedia for dark mode and reduced motion
- CSS custom properties access via getComputedStyle
- React Testing Library for component rendering

## Test Files Created
- `src/__tests__/design-refresh/typography.design-refresh.test.tsx`
- `src/__tests__/design-refresh/color-palette.design-refresh.test.tsx`
- `src/__tests__/design-refresh/visual-depth.design-refresh.test.tsx`
- `src/__tests__/design-refresh/components.design-refresh.test.tsx`
- `src/__tests__/design-refresh/accessibility.design-refresh.test.tsx`
- `src/__tests__/design-refresh/motion.design-refresh.test.tsx`

## Verification
```
npm test -- --testPathPatterns="design-refresh"
Test Suites: 6 failed, 6 total
Tests: 57 failed, 85 passed, 142 total
```

Tests failing as expected - awaiting implementation of:
- CSS variables in globals.css
- EmptyState component
- Typography classes and font configuration
- Color palette and dark mode
- Animation keyframes and utilities

## Ready for Implementation
All tests are written and failing where expected. Implementation can begin.
