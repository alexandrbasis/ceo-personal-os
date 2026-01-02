# Technical Task: Implement Review Cadences (Weekly, Quarterly, Annual)

## Overview
Implement the complete review system as specified in the CEO Personal OS README, adding Weekly, Quarterly, and Annual review capabilities to the web dashboard.

## Problem Statement
The current dashboard only supports Daily reviews. The system is designed for four review rhythms:
- Daily (5 min) - **Implemented**
- Weekly (20 min) - **Missing**
- Quarterly (2 hours) - **Missing**
- Annual (full day) - **Missing**

Users cannot complete the full reflection cycle without these features.

## Acceptance Criteria

### AC1: Weekly Reviews
- [ ] User can create a new weekly review from dashboard
- [ ] Weekly review form includes all required fields per README
- [ ] Weekly reviews stored in `reviews/weekly/` directory
- [ ] Weekly reviews visible in Reviews list (filtered/grouped)
- [ ] Timer tracks reflection time
- [ ] Can view/edit past weekly reviews

**Weekly Review Fields (per README):**
1. What actually moved the needle this week
2. What was noise disguised as work
3. Where your time leaked
4. One strategic insight
5. One adjustment for next week

### AC2: Quarterly Reviews
- [ ] User can create a new quarterly review from dashboard
- [ ] Quarterly review form includes all required fields per README
- [ ] Quarterly reviews stored in `reviews/quarterly/` directory
- [ ] Quarterly reviews visible in Reviews list
- [ ] Longer-form text areas for strategic reflection
- [ ] Can view/edit past quarterly reviews

**Quarterly Review Fields (per README):**
1. Progress against 1-year goals
2. Alignment between daily actions and stated priorities
3. Energy-to-output ratio analysis
4. Course corrections needed

### AC3: Annual Reviews
- [ ] User can create/continue an annual review
- [ ] Annual review is multi-section (Morning/Midday/Afternoon)
- [ ] Progress is saved between sessions
- [ ] Links to Past Year Reflection interview
- [ ] Links to Life Map update
- [ ] Annual reviews stored in `reviews/annual/` directory
- [ ] Can view/edit past annual reviews

**Annual Review Structure (per README):**
- Morning (3 hours): Past Year Reflection, Review quarterly reviews, Update Life Map
- Midday (2 hours): Pattern Recognition, Review uploads, Update memory.md
- Afternoon (3 hours): Vivid Vision, Ideal Lifestyle Costing, Set goals, Refine North Star

### AC4: Dashboard Integration
- [ ] Quick Actions card shows options for all review types
- [ ] Status indicators for each review type (last completed date)
- [ ] Reviews page filters by review type (daily/weekly/quarterly/annual)
- [ ] Navigation between review types

### AC5: Data Persistence
- [ ] All review types save to markdown files in correct directories
- [ ] File naming convention: `YYYY-MM-DD.md` for all types
- [ ] Quarterly uses quarter designation (Q1, Q2, Q3, Q4)
- [ ] Annual uses year designation (2026.md)

## Technical Design

### Data Models

```typescript
// Weekly Review
interface WeeklyReview {
  date: string; // ISO date of week start
  weekNumber: number;
  movedNeedle: string;
  noiseDisguisedAsWork: string;
  timeLeaks: string;
  strategicInsight: string;
  adjustmentForNextWeek: string;
  notes?: string;
  duration?: number; // minutes
}

// Quarterly Review
interface QuarterlyReview {
  date: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  progressAgainstGoals: string;
  alignmentAnalysis: string;
  energyToOutputRatio: string;
  courseCorrections: string;
  notes?: string;
  duration?: number;
}

// Annual Review
interface AnnualReview {
  year: number;
  status: 'in_progress' | 'completed';
  sections: {
    morning: {
      pastYearReflection: string;
      quarterlyReviewSummary: string;
      lifeMapUpdates: Record<string, number>;
      completed: boolean;
    };
    midday: {
      patternRecognition: string;
      uploadReviewNotes: string;
      memoryUpdates: string;
      completed: boolean;
    };
    afternoon: {
      vividVision: string;
      idealLifestyleCosting: string;
      goals: {
        oneYear: string;
        threeYear: string;
        tenYear: string;
      };
      northStarRefinement: string;
      principlesUpdates: string;
      completed: boolean;
    };
  };
  duration?: number;
}
```

### API Endpoints

```
POST /api/reviews/weekly          - Create weekly review
GET  /api/reviews/weekly          - List weekly reviews
GET  /api/reviews/weekly/[date]   - Get specific weekly review
PUT  /api/reviews/weekly/[date]   - Update weekly review

POST /api/reviews/quarterly       - Create quarterly review
GET  /api/reviews/quarterly       - List quarterly reviews
GET  /api/reviews/quarterly/[id]  - Get specific quarterly review
PUT  /api/reviews/quarterly/[id]  - Update quarterly review

POST /api/reviews/annual          - Create annual review
GET  /api/reviews/annual          - List annual reviews
GET  /api/reviews/annual/[year]   - Get specific annual review
PUT  /api/reviews/annual/[year]   - Update annual review
```

### File Structure

```
dashboard/src/
├── app/
│   ├── weekly/
│   │   ├── page.tsx              # Create new weekly review
│   │   └── [date]/
│   │       ├── page.tsx          # View weekly review
│   │       └── edit/page.tsx     # Edit weekly review
│   ├── quarterly/
│   │   ├── page.tsx              # Create new quarterly review
│   │   └── [id]/
│   │       ├── page.tsx          # View quarterly review
│   │       └── edit/page.tsx     # Edit quarterly review
│   └── annual/
│       ├── page.tsx              # Create/continue annual review
│       └── [year]/
│           └── page.tsx          # View annual review
├── components/
│   ├── WeeklyForm.tsx
│   ├── QuarterlyForm.tsx
│   ├── AnnualForm.tsx
│   └── ReviewTypeSelector.tsx
└── api/
    └── reviews/
        ├── weekly/route.ts
        ├── quarterly/route.ts
        └── annual/route.ts
```

### UI Components

**Weekly Review Form:**
- Similar structure to daily but with weekly-specific prompts
- Week picker instead of date picker
- Estimated time: 20 minutes displayed

**Quarterly Review Form:**
- Quarter selector (Q1-Q4) and year
- Larger text areas for strategic thinking
- Progress indicators for multi-section form
- Reference to goals files

**Annual Review Form:**
- Multi-page wizard (Morning → Midday → Afternoon)
- Save progress between sessions
- Links to frameworks (Life Map, Vivid Vision, etc.)
- Section completion checkmarks
- Full-day timer with breaks

### Dashboard Updates

**Quick Actions Card Enhancement:**
```
Quick Actions
├── Daily Review     [Today ✓]  [Start]
├── Weekly Review    [Last: Dec 29]  [Start]
├── Quarterly Review [Last: Q4 2025]  [Start]
└── Annual Review    [Last: 2025]  [Start 2026]
```

**Reviews Page Tabs:**
```
All Reviews
├── [Daily] [Weekly] [Quarterly] [Annual]  <- Filter tabs
└── List of reviews by selected type
```

## Implementation Plan

### Phase 1: Weekly Reviews (Sprint 1)
1. Create WeeklyForm component
2. Create API routes for weekly reviews
3. Create weekly review pages (create/view/edit)
4. Update dashboard Quick Actions
5. Update Reviews list with filtering
6. Add tests

### Phase 2: Quarterly Reviews (Sprint 2)
1. Create QuarterlyForm component
2. Create API routes for quarterly reviews
3. Create quarterly review pages
4. Add goals reference integration
5. Update dashboard and Reviews list
6. Add tests

### Phase 3: Annual Reviews (Sprint 3)
1. Create AnnualForm wizard component
2. Create API routes with session persistence
3. Create annual review pages
4. Integrate framework references
5. Add section completion tracking
6. Update dashboard and Reviews list
7. Add tests

### Phase 4: Polish (Sprint 4)
1. Cross-review insights (patterns across time)
2. Review streaks/consistency tracking
3. Export functionality
4. Notifications/reminders

## Testing Requirements

- [ ] Unit tests for each form validation
- [ ] API integration tests for CRUD operations
- [ ] E2E tests for complete review flows
- [ ] Mobile responsiveness testing
- [ ] Multi-session annual review persistence test

## Dependencies
- Task: Critical Bug Fixes (should be completed first)

## Estimated Effort
- **Weekly Reviews:** 8-10 hours
- **Quarterly Reviews:** 10-12 hours
- **Annual Reviews:** 16-20 hours
- **Dashboard Integration:** 4-6 hours
- **Total:** 38-48 hours (4-5 sprints)

## Success Metrics
- Users can complete all 4 review cadences
- Review completion rate increases
- No data loss between sessions
- Intuitive navigation between review types
