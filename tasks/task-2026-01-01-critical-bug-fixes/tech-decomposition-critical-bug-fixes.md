# Technical Task: Critical Bug Fixes

## Overview
Fix critical bugs identified during QA review that impact core functionality and user experience.

## Problem Statement
Two critical issues are blocking proper dashboard functionality:
1. Life Map displays empty state despite existing reviews
2. Next.js hydration error causes visible error badge

## Acceptance Criteria

### AC1: Life Map Displays Data When Reviews Exist
- [ ] When user has completed daily reviews, Life Map shows radar chart (not empty state)
- [ ] Energy Level from daily reviews is used to populate at least one meaningful metric
- [ ] If 6-domain data unavailable, show alternative visualization (e.g., energy trend)
- [ ] Empty state only shows when truly no review data exists

### AC2: Hydration Error Resolved
- [ ] No hydration mismatch errors in browser console
- [ ] Red "1 Issue" error badge no longer appears
- [ ] Date formatting is consistent between server and client
- [ ] Page renders identically on SSR and client hydration

### AC3: Form Validation Icons Clarified
- [ ] Red exclamation icons either removed or clearly explained
- [ ] If kept, tooltip explains their purpose
- [ ] No user confusion about whether form has errors

## Technical Analysis

### Bug 1: Life Map Empty State

**Current Behavior:**
- `LifeMapChart.tsx` checks `isDataEmpty()` which returns true if all 6 domain scores are 0
- `/api/life-map` endpoint returns empty data or defaults to zeros
- Daily review form only captures `energyLevel`, not 6 domain scores

**Root Cause:**
Data model mismatch - Life Map expects 6 domain scores but daily reviews don't capture them.

**Proposed Solutions:**

**Option A: Use Energy Level as Primary Metric**
- Modify Life Map to show single-metric visualization when only energy data exists
- Display energy trend over time instead of radar chart
- Pros: Quick fix, works with existing data
- Cons: Doesn't leverage full Life Map concept

**Option B: Add Domain Ratings to Daily Review (Recommended)**
- Add optional 6-domain quick ratings (1-10) to daily review form
- Make them collapsible/optional to keep form lightweight
- Aggregate daily ratings for Life Map display
- Pros: Full feature as designed
- Cons: More implementation work, form gets longer

**Option C: Separate Life Map Update Flow**
- Per README, Life Map updated during annual review
- Add dedicated "Update Life Map" action
- Daily reviews don't affect Life Map
- Pros: Matches original system design
- Cons: Life Map stays empty for new users for a year

**Recommendation:** Option B with optional/collapsible domain ratings

**Files to Modify:**
- `dashboard/src/components/DailyForm.tsx` - Add domain ratings
- `dashboard/src/app/api/life-map/route.ts` - Calculate from reviews
- `dashboard/src/components/LifeMapChart.tsx` - Handle partial data
- `dashboard/src/lib/types.ts` - Update review type

### Bug 2: Hydration Error

**Current Behavior:**
- Error: "A tree hydrated but some attributes of server rendered HTML didn't match client properties"
- Visible red error badge in bottom-left corner

**Root Cause Analysis:**
- Date formatting: `new Date().toLocaleDateString()` differs between server and client
- Timer component likely starts at different values
- Browser extensions adding attributes (data-lt-installed)

**Proposed Solution:**
1. Use `suppressHydrationWarning` on date elements
2. Initialize timer with consistent value or use client-only rendering
3. Ensure date formatting uses ISO strings or client-only display

**Files to Modify:**
- `dashboard/src/components/DailyForm.tsx` - Timer and date handling
- `dashboard/src/app/layout.tsx` - Check for hydration issues
- Any component displaying dates

### Bug 3: Form Validation Icons

**Current Behavior:**
Red exclamation icons appear on textarea fields after content is entered.

**Investigation Needed:**
- Determine if these are from a UI library (shadcn/ui)
- Check if they indicate validation state or character limits

**Proposed Solution:**
- If validation: Fix validation logic
- If decoration: Remove or replace with neutral info icon
- Add tooltip if icon serves a purpose

**Files to Modify:**
- `dashboard/src/components/DailyForm.tsx`
- Potentially custom textarea component

## Implementation Plan

### Phase 1: Hydration Fix (1-2 hours)
1. Identify all date-dependent renders
2. Add suppressHydrationWarning or use client-only rendering
3. Test with clean browser (no extensions)
4. Verify no console errors

### Phase 2: Life Map Fix (3-4 hours)
1. Add optional domain ratings to DailyForm
2. Update API to aggregate domain scores from reviews
3. Update LifeMapChart to handle partial data gracefully
4. Test with various data scenarios

### Phase 3: Form Icons Fix (1 hour)
1. Investigate icon source
2. Remove or clarify with tooltips
3. Test form UX

## Testing Requirements

- [ ] Unit tests for `isDataEmpty()` function with various inputs
- [ ] Integration test: Create review → verify Life Map updates
- [ ] E2E test: Full daily review flow without console errors
- [ ] Visual regression: Form appearance before/after

## Dependencies
- None (self-contained fixes)

## Estimated Effort
- **Total:** 5-7 hours
- **Priority:** Critical - blocks core functionality
