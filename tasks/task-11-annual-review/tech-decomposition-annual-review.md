# Technical Task: Annual Review Form

## Overview
Add Annual Review functionality - multi-phase full-day reflection process.

## Problem Statement
Dashboard lacks annual reviews - the deepest reflection rhythm from README (full day, 3 phases).

## Acceptance Criteria

### AC1: Annual Review Multi-Phase Form
- [ ] Three-phase structure from README:
  - **Morning (3h)**: Past Year Reflection, Review quarterly reviews, Update Life Map
  - **Midday (2h)**: Pattern Recognition, Review uploads, Update memory.md
  - **Afternoon (3h)**: Vivid Vision, Ideal Lifestyle Costing, Set goals, Refine North Star
- [ ] Progress saved between sessions
- [ ] Phase completion tracking
- [ ] Timer per phase

### AC2: Integration with Other Features
- [ ] Links to Past Year Reflection interview
- [ ] Links to Life Map for updating
- [ ] Links to quarterly reviews for reference
- [ ] Links to goals editor

### AC3: API & Storage
- [ ] `POST /api/reviews/annual` - create/continue review
- [ ] `GET /api/reviews/annual` - list reviews
- [ ] `GET /api/reviews/annual/[year]` - get specific review
- [ ] `PUT /api/reviews/annual/[year]` - update review
- [ ] Store in `reviews/annual/` as `YYYY.md`

### AC4: View & Edit
- [ ] View page at `/annual/[year]`
- [ ] Edit continues from last saved phase
- [ ] Navigation between annual reviews

## Test Plan
- Unit tests for annual review parser
- Component tests for multi-phase form
- API route tests
- E2E test for annual review flow

## Implementation Steps
1. Create `AnnualForm.tsx` with phase tabs/stepper
2. Create annual review parser in `lib/parsers/annual-review.ts`
3. Create API routes under `app/api/reviews/annual/`
4. Create pages: `/annual`, `/annual/[year]`
5. Add phase progress persistence

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
