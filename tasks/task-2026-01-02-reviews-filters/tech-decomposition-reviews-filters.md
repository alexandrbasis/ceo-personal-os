# Technical Task: Reviews Filters & Sorting

## Overview
Add filtering and sorting to `/reviews` page as specified in SPEC.

## Problem Statement
SPEC specifies reviews page should have:
- Filterable by type: Daily / Weekly / Quarterly / Annual
- Sortable by date

Currently: Only shows daily reviews, hardcoded DESC sort.

## Acceptance Criteria

### AC1: Type Filter
- [ ] Filter dropdown/tabs for review types
- [ ] Options: All / Daily / Weekly / Quarterly / Annual
- [ ] URL reflects filter state (e.g., `/reviews?type=weekly`)
- [ ] Filter persists on page refresh

### AC2: Date Sorting
- [ ] Sort toggle: Newest First / Oldest First
- [ ] Default: Newest First
- [ ] Visual indicator of current sort

### AC3: Combined View
- [ ] "All" filter shows all review types together
- [ ] Clear type indicator per review item
- [ ] Grouped or flat list view option

### AC4: API Updates
- [ ] `GET /api/reviews?type=all|daily|weekly|quarterly|annual`
- [ ] `GET /api/reviews?sort=desc|asc`

## Test Plan
- API route tests with query params
- Component tests for filter/sort UI
- E2E test for filtering

## Implementation Steps
1. Update `/api/reviews` to support type and sort params
2. Create aggregated reviews endpoint
3. Add filter UI component
4. Add sort toggle
5. Update ReviewsList to use filters

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
