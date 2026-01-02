# Technical Task: Quarterly Review Form

## Overview
Add Quarterly Review functionality to the dashboard (2-hour strategic review every quarter).

## Problem Statement
Dashboard lacks quarterly reviews - one of the 4 core review rhythms from README.

## Acceptance Criteria

### AC1: Quarterly Review Form
- [ ] Form at `/quarterly` with all required fields
- [ ] Fields from README:
  - Progress against 1-year goals
  - Alignment between daily actions and stated priorities
  - Energy-to-output ratio analysis
  - Course corrections needed
- [ ] Longer-form text areas for strategic reflection
- [ ] Timer tracking reflection time
- [ ] Auto-save draft to localStorage

### AC2: API & Storage
- [ ] `POST /api/reviews/quarterly` - create review
- [ ] `GET /api/reviews/quarterly` - list reviews
- [ ] `GET /api/reviews/quarterly/[date]` - get specific review
- [ ] `PUT /api/reviews/quarterly/[date]` - update review
- [ ] Store in `reviews/quarterly/` as `YYYY-QX.md`

### AC3: View & Edit
- [ ] View page at `/quarterly/[date]`
- [ ] Edit page at `/quarterly/[date]/edit`
- [ ] Navigation between quarterly reviews

### AC4: Dashboard Integration
- [ ] Quick Actions shows "Start Quarterly Review" button
- [ ] Status indicator for quarterly reviews
- [ ] Recent quarterly reviews in Reviews list

## Test Plan
- Unit tests for quarterly review parser/serializer
- Component tests for QuarterlyForm
- API route tests for CRUD operations
- E2E test for quarterly review flow

## Implementation Steps
1. Create `QuarterlyForm.tsx` component
2. Create quarterly review parser in `lib/parsers/quarterly-review.ts`
3. Create API routes under `app/api/reviews/quarterly/`
4. Create pages: `/quarterly`, `/quarterly/[date]`, `/quarterly/[date]/edit`
5. Update QuickActions to include quarterly
6. Update ReviewsList to show quarterly reviews

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
