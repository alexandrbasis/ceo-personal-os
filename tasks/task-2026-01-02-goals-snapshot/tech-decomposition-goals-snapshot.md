# Technical Task: Goals Snapshot on Dashboard

## Overview
Add Goals Snapshot component to dashboard as specified in SPEC-web-dashboard.md.

## Problem Statement
SPEC specifies a "Goals Snapshot" section on dashboard that was never implemented:
- 3-5 goals from `goals/1_year.md`
- Status: On Track / Needs Attention / Behind
- Based on quarterly progress if available

## Acceptance Criteria

### AC1: Goals Snapshot Component
- [ ] Card on dashboard showing 3-5 goals from 1-year goals
- [ ] Each goal shows text (truncated if needed)
- [ ] Status indicator per goal (On Track / Needs Attention / Behind)

### AC2: Status Calculation
- [ ] Default status based on time of year vs goal
- [ ] Optional: Manual status override
- [ ] Optional: Derive from quarterly review mentions

### AC3: API
- [ ] `GET /api/goals/1-year/summary` - returns top goals with status

### AC4: Navigation
- [ ] Click goal → navigate to goals page
- [ ] "View All" link → `/goals`

## Test Plan
- API route tests
- Component tests for GoalsSnapshot
- Dashboard integration test

## Implementation Steps
1. Create `GoalsSnapshot.tsx` component
2. Create API endpoint for goals summary
3. Add goal status logic
4. Add to dashboard page
5. Style per design system

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
