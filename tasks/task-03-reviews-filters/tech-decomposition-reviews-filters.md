# Technical Task: Reviews Filters & Sorting

## Overview
Add filtering and sorting to `/reviews` page. Support filtering by review types (Daily/Weekly) and sorting by date.

## Problem Statement
The reviews page should have:
- Filterable by type: Daily / Weekly (Quarterly/Annual deferred to later task)
- Sortable by date

Currently: Only shows daily reviews, hardcoded DESC sort.

## Scope
**In Scope**: Daily and Weekly review types only
**Deferred**: Quarterly and Annual filtering (blocked on task-09 and task-11)

## Acceptance Criteria

### AC1: Type Filter
- [ ] Filter dropdown/tabs for review types
- [ ] Options: All / Daily / Weekly
- [ ] URL reflects filter state (e.g., `/reviews?type=weekly`)
- [ ] Filter persists on page refresh (via URL params)

### AC2: Date Sorting
- [ ] Sort toggle: Newest First / Oldest First
- [ ] Default: Newest First
- [ ] URL reflects sort state (e.g., `/reviews?sort=asc`)
- [ ] Visual indicator of current sort direction

### AC3: Combined View
- [ ] "All" filter shows all review types together in flat chronological list
- [ ] Clear type indicator badge per review item (Daily/Weekly)
- [ ] **Clarification**: Flat list only - no grouped view option

### AC4: API Updates
- [ ] New aggregated endpoint: `GET /api/reviews?type=all|daily|weekly`
- [ ] Support sort parameter: `GET /api/reviews?sort=desc|asc`
- [ ] Default: type=all, sort=desc

## Test Plan

### API Route Tests (`__tests__/api/reviews-aggregated.test.ts`)
- Test `GET /api/reviews` returns all review types by default
- Test `GET /api/reviews?type=daily` returns only daily reviews
- Test `GET /api/reviews?type=weekly` returns only weekly reviews
- Test `GET /api/reviews?sort=asc` returns oldest first
- Test `GET /api/reviews?sort=desc` returns newest first
- Test combined params: `?type=weekly&sort=asc`
- Test invalid type param returns 400
- Test empty results for each type

### Component Tests (Filter/Sort UI)
- Test filter dropdown renders All/Daily/Weekly options
- Test filter selection updates URL
- Test sort toggle changes sort direction
- Test sort toggle has visual indicator
- Test filter persists on page refresh (via URL)
- Test type badge displayed for each review item

### E2E Tests
- Test filtering workflow: select type, see filtered results
- Test sorting workflow: toggle sort, see reordered results
- Test URL state: navigate directly to `/reviews?type=weekly&sort=asc`

## Implementation Steps
1. Create aggregated `/api/reviews` endpoint
2. Add filter UI component (dropdown with type options)
3. Add sort toggle component
4. Update ReviewsList to show type badges for daily/weekly
5. Wire up URL state management with Next.js `useSearchParams`
6. Add empty state handling for filtered views

## Files to Modify/Create
- `dashboard/src/app/api/reviews/route.ts` - NEW aggregated endpoint
- `dashboard/src/app/reviews/page.tsx` - Add filter/sort UI
- `dashboard/src/components/ReviewsList.tsx` - Add type badges
- `dashboard/src/components/ReviewsFilter.tsx` - NEW filter dropdown
- `dashboard/src/components/SortToggle.tsx` - NEW sort toggle

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: feature/reviews-filters
- **PR**: TBD
- **Status**: Ready for implementation
