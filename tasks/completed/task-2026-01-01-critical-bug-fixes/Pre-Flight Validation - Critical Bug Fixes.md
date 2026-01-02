# Pre-Flight Validation - Critical Bug Fixes

**Date**: 2026-01-01T00:00:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clearly defined: Fix 3 critical bugs from QA review |
| Implementation Steps | ⚠️ | Phases defined but lacks specific step-by-step actions |
| Test Plan | ⚠️ | Testing requirements listed but ambiguous on specifics |
| Acceptance Criteria | ✅ | Well-defined with 3 clear ACs |
| Linear Reference | ❌ | No Linear issue ID referenced (WYT-XXX) |

**Score**: 3/5 sections complete

## Clarity Assessment

### Clear Requirements

- **AC1 - Life Map Data Display**: ✅ Specific and actionable
  - When: User has completed daily reviews
  - Expected: Life Map shows radar chart, not empty state
  - Fallback: Alternative visualization if 6-domain data unavailable

- **AC2 - Hydration Error**: ✅ Specific and actionable
  - Clear success criteria: No console errors, no error badge
  - Specific technical fix: Date formatting consistency

- **Bug 1 Root Cause**: ✅ Well-analyzed
  - Data model mismatch clearly identified
  - 3 solution options presented with trade-offs

- **Bug 2 Root Cause**: ✅ Well-analyzed
  - Multiple potential causes identified
  - Specific files to check listed

### Ambiguous Items (Need Clarification)

1. **IMPLEMENTATION DECISION NEEDED**: "Option B: Add Domain Ratings to Daily Review (Recommended)"
   - Issue: Task recommends Option B but doesn't commit to it
   - Is this the final decision or does implementer choose?
   - Question: Should daily reviews capture all 6 domain scores (1-10)?
   - Suggestion: User/PM must confirm implementation approach before proceeding

2. **TEST REQUIREMENTS VAGUE**: "Unit tests for `isDataEmpty()` function with various inputs"
   - Issue: Function `isDataEmpty()` mentioned but doesn't exist in codebase
   - Current code: `LifeMapChart` directly normalizes data, no empty check function
   - Actual logic: page.tsx checks `lifeMapRes.ok` and defaults to zeros
   - Suggestion: Clarify where empty state logic should live

3. **FORM ICONS INVESTIGATION**: "Investigation Needed" for Bug 3
   - Issue: Task says investigation needed but also proposes solutions
   - Current status: Unknown if icons are from shadcn/ui or custom
   - Question: Should implementer investigate first, then decide on fix?
   - Suggestion: Either complete investigation OR mark as separate discovery task

4. **EFFORT ESTIMATE ASSUMPTION**: "5-7 hours total"
   - Issue: Assumes Option B (most complex) but no confirmation
   - If Option A chosen: ~3-4 hours
   - If Option C chosen: ~2-3 hours  
   - Suggestion: Confirm scope before committing to estimate

5. **TEST COVERAGE GAPS**: "E2E test: Full daily review flow without console errors"
   - Issue: No test infrastructure detected (jest not installed)
   - No testing framework configured in package.json
   - Question: Should tests be written despite no test runner?
   - Suggestion: Either set up testing first OR remove test requirements

### Ambiguity Score: 3/8 requirements clear (5 need clarification)

## Scope Assessment

- **Bounded**: ⚠️ Partially bounded
  - 3 specific bugs identified
  - BUT Option B would expand daily review form significantly
  - Adding 6 domain ratings + UI = larger scope than "bug fix"

- **Single PR sized**: ⚠️ Depends on decision
  - If Option A or C: YES (small bug fixes)
  - If Option B: MAYBE (adds new feature to form, API changes)

- **Open-ended indicators**: 
  - "Investigation Needed" (Bug 3)
  - "Option B: Add domain ratings" (could expand scope)
  - "Make them collapsible/optional" (UX design decision needed)

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| DailyForm.tsx | ✅ | Exists at /dashboard/src/components/DailyForm.tsx |
| LifeMapChart.tsx | ✅ | Exists at /dashboard/src/components/LifeMapChart.tsx |
| /api/life-map route | ✅ | Exists at /dashboard/src/app/api/life-map/route.ts |
| types.ts | ✅ | Exists at /dashboard/src/lib/types.ts |
| layout.tsx | ✅ | Exists at /dashboard/src/app/layout.tsx |
| life_map.md file | ✅ | Exists at /frameworks/life_map.md with populated data |
| Test framework | ❌ | jest referenced in package.json but NOT installed |
| `isDataEmpty()` function | ❌ | Mentioned in task but doesn't exist in codebase |

## Environment Readiness

- **Branch available**: ✅ No conflicting branch exists
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ❌ Test framework not installed (jest command not found)

## Blockers

### Critical Blockers (Must Resolve Before Implementation)

1. **DECISION REQUIRED**: Which solution approach to implement?
   - Option A: Energy trend visualization (simple, limited value)
   - Option B: Add 6-domain ratings to daily form (complex, full feature)
   - Option C: Separate Life Map update flow (matches spec but poor UX)
   - **Recommendation**: User/PM must choose before coding begins

2. **MISSING LINEAR REFERENCE**: No WYT-XXX issue ID
   - Cannot track work in Linear without issue reference
   - Cannot follow git branch naming convention (feature/wyt-[ID]-description)
   - **Recommendation**: Create Linear issue or reference existing one

### Non-Critical Issues (Can Proceed With)

3. **TEST INFRASTRUCTURE MISSING**: Jest not installed
   - Test requirements in task cannot be met
   - Can implement fixes without tests, add tests later
   - **Recommendation**: Either install jest+testing-library OR remove test requirements from AC

4. **FUNCTION MISMATCH**: Task mentions `isDataEmpty()` but it doesn't exist
   - Empty state logic is currently inline in page.tsx
   - Not a blocker if we understand actual implementation
   - **Recommendation**: Update task doc to reflect actual code structure

## Recommendations

### Before Implementation Can Start:

1. **Get PM/User Decision on Life Map Approach**
   - Recommend Option B (add domain ratings) for completeness
   - BUT requires user confirmation on:
     - Should ratings be required or optional?
     - Should they be visible by default or collapsible?
     - How to aggregate daily ratings into Life Map scores (average? latest?)

2. **Create Linear Issue**
   - Tag as "Critical Bug Fix"
   - Reference QA review document
   - Include chosen solution approach

3. **Clarify Testing Expectations**
   - Install jest + @testing-library/react if tests required
   - OR remove test requirements from acceptance criteria
   - OR defer testing to separate task

4. **Complete Bug 3 Investigation** (Optional: can do during implementation)
   - Inspect shadcn/ui Textarea component
   - Determine icon source
   - Then decide on fix approach

### Implementation Sequence (After Decisions Made):

**Phase 1**: Hydration fix (clear, can start immediately)
- Fix timer initialization
- Fix date rendering with suppressHydrationWarning
- Verify no console errors

**Phase 2**: Life Map fix (blocked on decision)
- Implement chosen option (A, B, or C)
- Update API if needed
- Update types if needed

**Phase 3**: Form icons (low priority, can defer)
- Investigate source
- Implement chosen fix

## Decision

**Ready for Implementation**: NO

**Reasoning**: 

The task document is well-researched and identifies real bugs with clear acceptance criteria. However, it presents multiple solution options without committing to one approach. The recommended "Option B" would significantly expand scope beyond a simple bug fix - it would add new features (6 domain ratings) to the daily review form, modify the data model, and require UX design decisions about collapsibility and optional vs required fields.

Additionally, the missing Linear reference prevents proper workflow tracking, and test infrastructure is not configured despite test requirements in the AC.

The hydration fix (Bug 2) is clear and ready to implement, but the Life Map fix (Bug 1) requires a decision that will affect scope, effort, and possibly require design input.

**Required Actions Before Proceeding**:

- [ ] **PM/User Decision**: Choose Life Map implementation approach (A, B, or C)
- [ ] **If Option B chosen**: Clarify UX requirements (required vs optional, collapsible, aggregation logic)
- [ ] **Create Linear Issue**: Add WYT-XXX reference to task document
- [ ] **Clarify Testing**: Install jest OR remove test requirements from AC
- [ ] **Update Task Doc**: Fix reference to non-existent `isDataEmpty()` function

**Estimated Time to Resolve Blockers**: 30-60 minutes (decision meeting + Linear setup)

**Can Proceed With Partial Implementation**: YES
- Bug 2 (Hydration Error) is clear and can be implemented independently
- Bug 3 (Form Icons) requires investigation but is low priority
- Bug 1 (Life Map) blocked on decision
