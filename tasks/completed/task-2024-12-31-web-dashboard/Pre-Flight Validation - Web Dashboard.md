# Pre-Flight Validation - Web Dashboard MVP

**Date**: 2025-01-01T00:15:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Build localhost web app for CEO Personal OS |
| Implementation Steps | ✅ | 7 steps with detailed file structures and commands |
| Test Plan | ✅ | Comprehensive TDD approach with Gherkin scenarios |
| Acceptance Criteria | ✅ | Defined as Success Metrics |
| Linear Reference | ❌ | Marked as "TBD" - not blocking for pre-flight |

**Score**: 4/5 sections complete (Linear reference pending, acceptable)

## Clarity Assessment

### Clear Requirements

- ✅ Tech stack fully specified (Next.js 14, TypeScript, Tailwind, shadcn/ui, Recharts)
- ✅ File structure explicitly defined for all components
- ✅ API contracts with TypeScript interfaces
- ✅ Configuration details (Tailwind config, shadcn setup)
- ✅ Dependencies list with version numbers
- ✅ Test commands and testing infrastructure
- ✅ Success metrics are measurable (<5 min completion, <2s load time)
- ✅ Out of scope items clearly documented

### Ambiguous Items (Need Clarification)

1. **Daily Review Template Format Mismatch**
   - Issue: The test plan shows OUTPUT format (lines 67-97) with specific markdown structure, but the actual TEMPLATE.md file in the repo has a different format (blockquotes for answers, checkboxes with different syntax)
   - Comparison:
     - Test expects: `**Energy level (1-10):** 7`
     - Template has: `**Energy level (1-10):** [ ]` with separate line for factors
   - Suggestion: Clarify whether the parser should handle the existing template format OR if the template should be updated to match the test expectations
   - Impact: Parser implementation will differ significantly

2. **Life Map Score Extraction**
   - Issue: life_map.md has empty scores in Current State Assessment table (line 28-35), but tests expect numeric values
   - Current state: All score cells are empty (`| Career | | |`)
   - Suggestion: Either provide sample filled data OR clarify that empty scores should return 0/null
   - Impact: Cannot test Life Map visualization without data

3. **Page Route Ambiguity**
   - Issue: Step 5 (lines 750-757) shows two different routes for viewing/editing:
     - `/daily/[date]` - "View specific review" (line 741)
     - `/daily/[date]/edit` - "Edit existing review" (line 744)
   - But the spec (line 155) says "Edit button → opens form with prefilled data"
   - Suggestion: Clarify if edit is separate route or modal/same page toggle
   - Impact: Affects routing structure and component organization

4. **Form Submission Behavior with Existing Review**
   - Issue: Lines 218-222 mention POST should warn if file exists, but line 757 behavior is "Pre-filled form for updating existing review"
   - Question: Should edit mode use PUT to /api/reviews/daily/[date] or POST with overwrite?
   - Suggestion: Clarify update flow explicitly
   - Impact: API route logic and form submission handling

5. **Markdown Path Configuration**
   - Issue: Lines 616-631 describe MARKDOWN_BASE_PATH with "smart default" using process.cwd()
   - Concern: process.cwd() varies based on where npm is run from
   - Current expectation: Dashboard runs FROM the des-moines directory
   - Suggestion: Document assumption explicitly or add validation check
   - Impact: File system access could fail if run from wrong directory

6. **Goals Snapshot Component**
   - Issue: Mentioned in spec (lines 113-116) but marked as "Out of Scope" (lines 963-967)
   - Suggestion: Confirm it's removed from MVP dashboard layout
   - Impact: Dashboard component structure

### Ambiguity Score: 21/27 requirements clear (78%)

## Scope Assessment

- **Bounded**: ✅ Clear MVP definition with explicit out-of-scope list
- **Single PR sized**: ⚠️ 7 implementation steps is substantial, but well-structured
  - Recommended: Could be split into 2 PRs (Setup + Core Features, then Polish)
  - As single PR: Estimated 8-12 hours for experienced Next.js dev
- **Open-ended indicators**: ✅ None found - all features have concrete acceptance criteria

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| reviews/daily/ directory | ✅ | Exists with TEMPLATE.md |
| frameworks/life_map.md | ✅ | Exists but scores are empty |
| goals/1_year.md | ✅ | Exists (though Goals Snapshot out of scope) |
| Node.js environment | ⚠️ | Not verified - assume available |
| npm/package manager | ⚠️ | Not verified - assume available |

**Critical Finding**: No existing Next.js project structure found. This is expected per Step 1, which initializes the project from scratch.

## Environment Readiness

- **Branch available**: ✅ No conflicting branch found
- **Clean working tree**: ✅ Git status is clean
- **Tests passing**: ⚠️ N/A - no existing test suite (will be created in Step 6)
- **Directory structure**: ✅ reviews/, goals/, frameworks/ all exist

## Blockers

None - all blockers are clarification items, not technical blockers.

## Recommendations

### High Priority (Must Address Before Implementation)

1. **Resolve Template Format Discrepancy**
   - Compare tech-decomposition OUTPUT format vs actual TEMPLATE.md
   - Decision needed: Update template OR adjust parser expectations
   - This affects test writing and parser implementation

2. **Populate Life Map Sample Data**
   - Add sample scores to frameworks/life_map.md OR
   - Confirm empty state handling in parser tests
   - Cannot test radar chart visualization without data

3. **Clarify Edit Route Structure**
   - Confirm: Is edit a separate route (`/daily/[date]/edit`) or same page mode?
   - Update implementation steps to match decision

### Medium Priority (Can Clarify During Implementation)

4. **Document Working Directory Assumption**
   - Add note that dashboard must be run from des-moines/ directory
   - Consider adding validation check in config.ts

5. **Confirm Goals Snapshot Removal**
   - Update dashboard layout diagram (lines 766-784) to remove Goals Snapshot
   - Ensure no component stubs are created for out-of-scope feature

### Low Priority (Nice to Have)

6. **Add Pre-commit Hook Specification**
   - Document linting/formatting requirements mentioned in git.md
   - Specify when prettier/tsc should run

## Decision

**Ready for Implementation**: YES - All clarifications resolved

**Reasoning**:
All clarification items have been addressed through user decisions. The task is now ready for implementation.

**Resolved Clarifications** (2025-01-01):

- [x] **CRITICAL**: Align daily review markdown format
  - **Decision**: Update test expectations to parse existing TEMPLATE.md format
  - Parser will handle the actual template structure with blockquotes and checkbox syntax

- [x] **CRITICAL**: Provide sample data for Life Map
  - **Decision**: Added sample scores to frameworks/life_map.md
  - Scores: Career=8, Relationships=6, Health=5, Meaning=7, Finances=8, Fun=4

- [x] **HIGH**: Clarify edit flow
  - **Decision**: `/daily/[date]/edit` as separate route (cleaner URLs, easier deep linking)
  - API: PUT /api/reviews/daily/[date] for updates

- [x] **SCOPE CHANGE**: Goals Snapshot included in MVP
  - **Decision**: Include basic Goals display (read-only, no editing)
  - Dashboard will show goals from goals/1_year.md

- [x] **LOW**: Working directory requirement
  - Documented: Dashboard must be run from des-moines/ directory

## Additional Notes

### Strengths of This Task Document

1. **Exceptional test coverage**: Gherkin scenarios cover all user flows
2. **TDD approach**: Tests written before implementation (Step 3 before Step 2 usage)
3. **Detailed technical specs**: shadcn/ui patterns, Tailwind config, exact commands
4. **Risk mitigation**: Edge cases and error handling documented
5. **Clear architecture**: File structure and data flow diagrams
6. **Dependencies mapped**: Exact versions and installation commands

### Estimated Complexity

- **Lines of code**: ~2000-2500 (including tests)
- **Files created**: ~25-30 files
- **Time estimate**: 8-12 hours for experienced Next.js developer
- **Risk level**: Low-Medium (well-specified, but substantial scope)

### Recommendation for Split

If team prefers smaller PRs, could split as:

**PR 1: Foundation** (Steps 1-3)
- Project setup
- Markdown utilities and parsers
- API routes
- ~4-5 hours

**PR 2: UI & Polish** (Steps 4-7)
- Components
- Pages
- Testing setup
- Final polish
- ~4-6 hours

---

*Validation completed: 2025-01-01T00:15:00Z*
*Next action: Address critical clarifications before implementation*
