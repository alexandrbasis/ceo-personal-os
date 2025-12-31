# Task Splitting Decision
**Date**: 2024-12-31
**Decision**: SPLIT RECOMMENDED
**Task Directory**: /Users/alexandrbasis/Library/Mobile Documents/com~apple~CloudDocs/Coding Projects/ceo-personal-os/tasks/task-2024-12-31-web-dashboard/

## Executive Summary

This task covers a full-stack web application with 7 implementation steps spanning infrastructure, parsers, APIs, components, pages, and comprehensive testing. The estimated 1,150-1,600+ lines of meaningful code significantly exceeds the 200-400 line PR guideline. Splitting by architectural layer allows incremental delivery, focused reviews, and reduced merge conflict risk.

## Analysis

### Scope Concerns
- Estimated 1,150-1,600+ lines of meaningful code changes (3-4x above guideline)
- 7 distinct implementation steps with different technical concerns
- 5 API endpoints, 5 React components, 4+ pages
- 2 markdown parsers + 1 serializer with complex regex logic
- Full testing infrastructure (Jest + Playwright) with 6 test categories (T1-T6)

### Review Challenges
- Reviewing markdown parsing regex alongside React component rendering alongside API route logic
- Cognitive context-switching between file I/O, frontend state management, and test assertions
- Hard to verify correctness when all layers are intertwined in one PR
- Risk of rubber-stamping complex parser logic buried in a large PR

### Testing Complexity
- T1: Project setup tests (build, Tailwind, shadcn)
- T2/T2.5: Parser and serializer unit tests (round-trip validation)
- T3: Life map parser tests
- T4: API route integration tests
- T5: Component tests (React Testing Library)
- T6: Page integration and E2E tests (Playwright)

Running all tests together increases CI time and makes failure debugging harder.

## Recommended Split Strategy

### Proposed Sub-tasks

#### Sub-task 1: Project Initialization + Markdown Parsers
**Scope**: Next.js 14 project setup with shadcn/ui, Tailwind CSS, and markdown parsing utilities

**Domain**: Infrastructure / Data Layer

**Use cases included**:
1. Initialize Next.js project with TypeScript and App Router
2. Configure Tailwind CSS with shadcn/ui theming
3. Implement Daily Review parser (parse markdown to object)
4. Implement Daily Review serializer (object to markdown)
5. Implement Life Map parser

**Business Value**: Foundation layer that subsequent work depends on. Parsers can be validated with unit tests before building UI.

**Technical Changes**:
- Project scaffolding (package.json, tsconfig, tailwind.config, etc.) ~50 lines
- `src/lib/types.ts` - TypeScript interfaces ~40 lines
- `src/lib/config.ts` + `constants.ts` ~30 lines
- `src/lib/markdown.ts` - file read/write utilities ~50 lines
- `src/lib/parsers/daily-review.ts` - parser + serializer ~120 lines
- `src/lib/parsers/life-map.ts` - table parser ~60 lines
- Jest configuration + parser unit tests (T2, T2.5, T3) ~100 lines
- **Estimated total: 450 lines**

**Dependencies**: None

**Acceptance Criteria**:
- `npm run build` succeeds
- shadcn/ui Button component renders with correct styling
- Daily review parser passes all T2 scenarios
- Daily review serializer passes all T2.5 scenarios
- Life map parser passes all T3 scenarios
- Round-trip test (parse -> serialize -> parse) produces identical data

---

#### Sub-task 2: API Routes
**Scope**: All API endpoints for reviews and life map

**Domain**: API Layer

**Use cases included**:
1. GET /api/reviews/daily - list all reviews
2. POST /api/reviews/daily - create new review
3. GET /api/reviews/daily/[date] - get specific review
4. PUT /api/reviews/daily/[date] - update existing review
5. GET /api/life-map - get life map scores

**Business Value**: Complete backend functionality that can be tested via curl/Postman before building UI.

**Technical Changes**:
- `src/app/api/reviews/daily/route.ts` ~80 lines
- `src/app/api/reviews/daily/[date]/route.ts` ~60 lines
- `src/app/api/life-map/route.ts` ~40 lines
- API route tests (T4) ~80 lines
- **Estimated total: 260 lines**

**Dependencies**: Depends on Sub-task 1 (parsers)

**Acceptance Criteria**:
- All 5 API endpoints respond correctly
- POST creates properly formatted markdown file
- PUT updates existing file without data loss
- GET returns parsed data matching source markdown
- All T4 test scenarios pass

---

#### Sub-task 3: Core Components + Pages
**Scope**: React components and all page routes

**Domain**: Frontend / UI Layer

**Use cases included**:
1. Life Map radar chart visualization
2. Daily review form with validation
3. Recent reviews list component
4. Quick actions with status indicator
5. Dashboard page (/)
6. Daily review create/view/edit pages (/daily, /daily/[date], /daily/[date]/edit)
7. Reviews list page (/reviews)

**Business Value**: Delivers the complete user interface. User can create, view, and edit daily reviews through the web form.

**Technical Changes**:
- `src/components/LifeMapChart.tsx` ~60 lines
- `src/components/DailyForm.tsx` ~150 lines
- `src/components/ReviewsList.tsx` ~60 lines
- `src/components/QuickActions.tsx` ~50 lines
- `src/components/Navigation.tsx` ~30 lines
- `src/app/page.tsx` (Dashboard) ~60 lines
- `src/app/daily/page.tsx` ~40 lines
- `src/app/daily/[date]/page.tsx` ~50 lines
- `src/app/daily/[date]/edit/page.tsx` ~30 lines
- `src/app/reviews/page.tsx` ~40 lines
- Component tests (T5) ~100 lines
- **Estimated total: 670 lines** (borderline, see note below)

**Dependencies**: Depends on Sub-task 2 (API routes)

**Acceptance Criteria**:
- Dashboard displays Life Map radar chart with 6 axes
- Dashboard shows last 5 reviews with energy badges
- Quick Actions shows correct review status indicator
- Daily form validates required fields (energy, win, priority)
- Form saves draft to localStorage every 30 seconds
- Submit creates review via API and shows success toast
- View page renders markdown content with Previous/Next navigation
- Edit page pre-fills form with existing data
- All T5 component test scenarios pass

---

#### Sub-task 4: E2E Tests + Final Polish
**Scope**: Playwright E2E tests, loading states, error handling, performance

**Domain**: Quality Assurance / UX

**Use cases included**:
1. E2E test: complete daily review flow
2. E2E test: view and edit existing review
3. Loading skeletons for async data
4. Error boundaries with user-friendly messages
5. Toast notifications for all actions
6. Performance verification (<2s load time)

**Business Value**: Production-ready polish that ensures reliability and good user experience.

**Technical Changes**:
- Playwright configuration ~30 lines
- `src/__tests__/e2e/daily-review.spec.ts` ~80 lines
- Loading skeleton components ~50 lines
- Error boundary wrapper ~40 lines
- Toast notification integration ~30 lines
- Performance optimizations ~20 lines
- Page integration tests (T6) ~60 lines
- **Estimated total: 310 lines**

**Dependencies**: Depends on Sub-task 3 (pages)

**Acceptance Criteria**:
- E2E test: User can complete new daily review in <5 minutes
- E2E test: User can navigate between reviews
- Loading states appear during data fetching
- Errors display helpful messages (not stack traces)
- All actions trigger appropriate toast notifications
- Dashboard loads in <2 seconds
- All T6 test scenarios pass
- Markdown files remain human-readable after save

---

## Implementation Sequence

1. **First**: Sub-task 1 (Project + Parsers) - Establishes foundation and validates data layer independently
2. **Second**: Sub-task 2 (API Routes) - Backend complete, testable via curl before UI exists
3. **Third**: Sub-task 3 (Components + Pages) - Full UI connecting to working backend
4. **Fourth**: Sub-task 4 (E2E + Polish) - Production-ready quality and reliability

## Dependency Graph

```
Sub-task 1 (Project + Parsers)
         ↓
Sub-task 2 (API Routes)
         ↓
Sub-task 3 (Components + Pages)
         ↓
Sub-task 4 (E2E + Polish)
```

Linear dependency chain - each PR can be merged and deployed before starting the next.

## Benefits of Splitting

- **Focused reviews**: Each PR covers one architectural layer, reducing context-switching
- **Incremental validation**: Parsers can be unit-tested before building API; API can be tested before building UI
- **Reduced risk**: Issues in parsing logic caught early, before they affect 670 lines of UI code
- **Faster feedback**: 260-450 line PRs reviewable in 20-30 minutes each
- **Parallel development potential**: After Sub-task 1, parser improvements and API work could proceed in parallel
- **Clear rollback boundaries**: If Sub-task 3 has issues, Sub-tasks 1 and 2 remain stable

## Risks of NOT Splitting

- **Review fatigue**: 1,500+ line PR leads to superficial review, missing subtle parser bugs
- **All-or-nothing delivery**: No value delivered until everything works
- **Debugging complexity**: When E2E test fails, issue could be in parser, API, component, or page
- **Merge conflicts**: Long-running branch accumulates conflicts with main
- **Cognitive overload**: Reviewer must understand markdown regex, Next.js API routes, Recharts, React forms, and Playwright in one sitting

## Alternative Consideration: 3-PR Split

If 4 PRs feels excessive, Sub-tasks 3 and 4 could be combined into one PR (~980 lines). This is still on the high end but acceptable given:
- Components and pages are tightly coupled
- E2E tests validate the pages they test
- Polish items are small, scattered changes

**3-PR structure:**
1. Project + Parsers (450 lines)
2. API Routes (260 lines)
3. Components + Pages + E2E + Polish (980 lines)

## Recommendation

**Split this task into 4 sub-tasks following the strategy above.**

The 4-PR approach provides the cleanest separation of concerns and fastest review cycles. If team capacity favors fewer PRs, the 3-PR alternative (combining Sub-tasks 3+4) is acceptable.

The human should decide based on:
- Team review capacity
- Timeline urgency
- Preference for smaller vs. fewer PRs
