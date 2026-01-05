# Technical Task: Goals Snapshot on Dashboard

## Overview
Add Goals Snapshot component to dashboard as specified in SPEC-web-dashboard.md.

## Problem Statement
SPEC specifies a "Goals Snapshot" section on dashboard that was never implemented:
- 3-5 goals from `goals/1_year.md`
- Status: On Track / Needs Attention / Behind
- Based on quarterly progress if available

## Design Decisions (Clarified)
- **Goal Selection**: First 3-5 goals in file order
- **Status Calculation**: Default status from goal frontmatter only (status field)
- **Text Display**: Title + brief description excerpt (truncated if needed)
- **API Endpoint**: `GET /api/goals/snapshot` (new dedicated endpoint)

## Acceptance Criteria

### AC1: Goals Snapshot Component
- [ ] Card on dashboard showing first 3-5 goals from 1-year goals
- [ ] Each goal shows title + description excerpt (truncated if >100 chars)
- [ ] Status indicator per goal (On Track / Needs Attention / Behind) from frontmatter

### AC2: Status from Frontmatter
- [ ] Read `status` field from goal frontmatter
- [ ] Default to "On Track" if no status field present
- [ ] Support values: "On Track", "Needs Attention", "Behind"

### AC3: API
- [ ] `GET /api/goals/snapshot` - returns first 3-5 goals with title, description, status

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
