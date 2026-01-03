# Pre-Flight Validation - Reviews Filters & Sorting

**Date**: 2026-01-03T16:42:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ✅ READY (Scoped to Daily/Weekly only)

## Document Completeness
| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Add filtering and sorting to /reviews page |
| Implementation Steps | ✅ | 5 steps listed with descriptions |
| Test Plan | ⚠️ | High-level only, lacks specific test scenarios |
| Acceptance Criteria | ✅ | 4 ACs with clear requirements |
| Linear Reference | ❌ | TBD - no issue created yet |

**Score**: 4/5 sections complete (Linear issue pending)

## Clarity Assessment

### Clear Requirements
- AC1: Type Filter: ✅ Specific UI requirements (dropdown/tabs), URL state management, persistence
- AC2: Date Sorting: ✅ Toggle behavior, default state, visual indicator specified
- AC4: API Updates: ✅ Exact query param syntax provided

### Ambiguous Items (Need Clarification)

1. **AC3: "Grouped or flat list view option"**
   - Issue: Not clear if this is a user-selectable toggle or automatic behavior
   - Impact: Affects UI complexity and implementation approach
   - Suggestion: Specify whether this is:
     - A toggle button (like sort toggle)?
     - Auto-grouped by date ranges?
     - Auto-grouped by type when "All" selected?
     - Or just a design decision for the implementer?

2. **Implementation Step 2: "Create aggregated reviews endpoint"**
   - Issue: Ambiguous what this means
   - Questions: 
     - Is this a new `/api/reviews` route (different from `/api/reviews/daily`)?
     - Or is it modifying the existing routes?
     - Should this aggregate all 4 types (daily/weekly/quarterly/annual)?
   - Suggestion: Clarify endpoint structure - recommend `/api/reviews?type=all` using existing pattern

3. **Test Plan: Lacks specific test scenarios**
   - Issue: "API route tests with query params" - which params? What edge cases?
   - Missing: No mention of testing quarterly/annual review APIs that don't exist yet
   - Suggestion: Add specific test scenarios:
     - Test type=all returns mixed review types
     - Test type filtering works for each type
     - Test sort parameter (asc/desc)
     - Test URL state persistence
     - Test empty states for each review type

4. **Filter UI component location**
   - Issue: Not specified where the filter/sort UI should be placed
   - Questions:
     - New controls on existing /reviews page?
     - Does this page need to be renamed/refactored?
     - Should it handle both daily and weekly in one view?
   - Current state: /reviews page only shows daily reviews hardcoded

### Ambiguity Score: 7/10 requirements clear (3 need clarification)

## Scope Assessment
- **Bounded**: ⚠️ Partially bounded
  - SPEC reference mentioned but SPEC document not found in codebase
  - "Grouped or flat view" adds uncertainty to scope
  - Core filtering/sorting is well-bounded
- **Single PR sized**: ⚠️ Depends on quarterly/annual APIs
  - If quarterly/annual APIs need to be built: Too large
  - If only using existing daily/weekly: Reasonable size
- **Open-ended indicators**: 
  - "or" in AC3 (grouped or flat) suggests optional feature not fully spec'd
  - SPEC reference creates external dependency on unavailable document

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `/api/reviews/daily` | ✅ | Exists at dashboard/src/app/api/reviews/daily/route.ts |
| `/api/reviews/weekly` | ✅ | Exists at dashboard/src/app/api/reviews/weekly/route.ts |
| `/api/reviews/quarterly` | ❌ | Does NOT exist - no API route found |
| `/api/reviews/annual` | ❌ | Does NOT exist - no API route found |
| `ReviewListItem` type | ✅ | Defined in dashboard/src/lib/types.ts |
| `WeeklyReviewListItem` type | ✅ | Defined in dashboard/src/lib/types.ts |
| Quarterly/Annual types | ❌ | Not defined in types.ts |
| Quarterly parser | ❌ | Does not exist in dashboard/src/lib/parsers/ |
| Annual parser | ❌ | Does not exist in dashboard/src/lib/parsers/ |
| `/reviews` page | ✅ | Exists at dashboard/src/app/reviews/page.tsx |
| `ReviewsList` component | ✅ | Exists at dashboard/src/components/ReviewsList.tsx |
| Review directories | ✅ | All 4 directories exist with templates |

**Critical Missing Dependencies**:
- Quarterly review API endpoint (GET/POST)
- Annual review API endpoint (GET/POST)
- Quarterly review parser
- Annual review parser
- QuarterlyReview, QuarterlyReviewFormData, QuarterlyReviewListItem types
- AnnualReview, AnnualReviewFormData, AnnualReviewListItem types

## Environment Readiness
- **Branch available**: ✅ No conflicting branch exists
- **Clean working tree**: ✅ Git status clean
- **Tests passing**: ⚠️ Jest not found (npm dependency issue, but test framework configured)

## Blockers

### Critical Blockers (Must resolve before implementation):

1. **Missing Quarterly/Annual APIs**: AC1 and AC3 require filtering by "Quarterly" and "Annual" types, but these APIs don't exist
   - Need: `/api/reviews/quarterly/route.ts` with GET/POST
   - Need: `/api/reviews/annual/route.ts` with GET/POST
   - Need: Parsers for quarterly and annual reviews
   - Need: TypeScript types for both review types

2. **Scope Ambiguity - Grouped/Flat View**: AC3 mentions "grouped or flat list view option" without specifying requirements
   - Is this in scope for this PR?
   - What does "grouped" mean (by type? by date range?)?
   - Is it a user toggle or automatic?

3. **Missing SPEC Document**: Task references "SPEC specifies reviews page should have..." but no SPEC.md found
   - Cannot verify requirements against source of truth
   - May have additional unstated requirements

### Non-Critical Issues:

4. **Linear Issue Not Created**: Tracking issue is TBD
5. **Test Plan Lacks Detail**: General statements vs specific test scenarios

## Recommendations

### Option A: Scope Down to Existing Review Types (Recommended)
**Timeline**: Single PR, 1-2 days

Change AC1 to filter only existing types:
- Filter options: All / Daily / Weekly (remove Quarterly/Annual for now)
- Defer quarterly/annual to separate task after those APIs exist
- Keeps task focused and deliverable immediately

**Changes needed**:
- Update AC1: Remove Quarterly/Annual from filter options
- Update AC4: Clarify this modifies `/api/reviews/daily` and `/api/reviews/weekly`
- Clarify AC3: Specify exact behavior of "grouped or flat view"
- Add detailed test scenarios to test plan

### Option B: Full Scope with Quarterly/Annual APIs
**Timeline**: 2-3 PRs, 3-5 days

PR 1: Build quarterly/annual APIs (prerequisite)
- Create quarterly/annual parsers
- Create quarterly/annual types
- Create quarterly/annual API routes
- Tests for new APIs

PR 2: Implement filters (this task)
- All 4 review types supported
- Filter/sort UI
- URL state management

**Changes needed**:
- Split into 2 tasks in Linear
- Task 1: "Quarterly/Annual Review APIs" (AC1-AC4 for API layer)
- Task 2: "Review Filters & Sorting" (current task, depends on Task 1)

## Decision

**Ready for Implementation**: NO

**Reasoning**: 
The task document is well-structured with clear acceptance criteria, but has critical missing dependencies. AC1 and AC3 explicitly require filtering by "Quarterly" and "Annual" review types, but:
1. No quarterly/annual API endpoints exist
2. No quarterly/annual parsers exist  
3. No quarterly/annual TypeScript types exist
4. No clarity on "grouped or flat view" requirement

Additionally, the "SPEC" reference cannot be verified as the document doesn't exist in the codebase.

**Required Actions Before Proceeding**:

- [ ] **DECISION REQUIRED**: Choose Option A (scope down) or Option B (build prerequisites)
- [ ] If Option A: Update AC1 to remove Quarterly/Annual, clarify scope to daily/weekly only
- [ ] If Option B: Create prerequisite task for quarterly/annual APIs, block this task on that
- [ ] **Clarify AC3**: Specify exact behavior of "grouped or flat list view option"
  - Is this a user toggle or automatic behavior?
  - If grouped, group by what criteria (type/date/other)?
  - Is this a must-have or optional enhancement?
- [ ] **Add test scenarios**: Replace high-level test plan with specific scenarios
  - API: Test each type filter, test sort param, test combined filters
  - UI: Test filter selection, test sort toggle, test URL state, test persistence
  - Edge: Test empty results, test invalid params, test mixed type display
- [ ] **Create Linear issue**: Update tracking section with issue number
- [ ] **Clarify endpoint structure**: Confirm if creating new `/api/reviews` or modifying existing routes
- [ ] **Resolve SPEC reference**: Either provide SPEC document or remove reference and inline requirements

## Additional Notes

**Existing Codebase Observations**:
- Current `/reviews` page only fetches daily reviews (`/api/reviews/daily`)
- `ReviewsList` component already supports both daily and weekly types via `type` prop
- `AnyReviewListItem` union type exists but only includes daily and weekly
- URL state management will need `useSearchParams` from Next.js
- Filter persistence likely needs localStorage or cookies

**Implementation Complexity**:
- Core filtering/sorting: Low complexity (existing patterns)
- URL state management: Low complexity (standard Next.js)
- Grouped view: Medium complexity (depends on clarification)
- Quarterly/Annual support: High complexity (requires full API layer)

**Recommendation**: 
Strongly recommend **Option A** (scope down to daily/weekly only) to deliver value quickly. Quarterly/annual filtering can be added in a follow-up PR once those APIs are built by another task.
