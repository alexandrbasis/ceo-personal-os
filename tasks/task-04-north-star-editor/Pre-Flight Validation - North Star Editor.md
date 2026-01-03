# Pre-Flight Validation - North Star Editor

**Date**: 2026-01-03T00:00:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: NEEDS_CLARIFICATION

## Document Completeness
| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Add viewer/editor for north_star.md |
| Implementation Steps | ✅ | 4 steps defined |
| Test Plan | ⚠️ | High-level only - needs specifics |
| Acceptance Criteria | ✅ | 4 ACs with checkboxes |
| Linear Reference | ❌ | "TBD" - not assigned |

**Score**: 4/5 sections complete (Linear reference pending)

## Clarity Assessment

### Clear Requirements
- AC1: Page at /north-star with markdown rendering - ✅ Specific and actionable
- AC1: Edit/Save buttons - ✅ Clear UI elements
- AC3: API routes GET/PUT /api/north-star - ✅ Standard REST pattern
- AC4: Link in navigation - ✅ Pattern exists in QuickActions component

### Ambiguous Items (Need Clarification)

1. **AC2: "Simple textarea or markdown editor"**
   - Issue: Two different implementations mentioned without clear choice
   - Context: Project uses `react-markdown` (v10.1.0) for rendering, but no editor component exists
   - Suggestion: Specify which approach:
     - Option A: Plain textarea (simpler, faster to implement)
     - Option B: Markdown editor with preview (like used in other editors)
   
2. **AC2: "Preview mode before saving"**
   - Issue: Unclear if this means:
     - A separate preview toggle/tab (like Goals editor pattern)
     - Live preview alongside editor
     - Preview modal on save button click
   - Suggestion: Clarify preview UX pattern - recommend following existing Goals/Life Map edit page patterns

3. **AC2: "Auto-save draft to localStorage"**
   - Issue: Unclear interaction with save button
   - Questions:
     - When does localStorage draft get cleared? (on successful save? on page load?)
     - Should it restore draft on page load if one exists?
     - What happens if user edits, has a draft, then cancels?
   - Suggestion: Specify complete draft lifecycle (create, restore, clear conditions)

4. **AC4: "North Star card/section on dashboard (optional)"**
   - Issue: "optional" creates scope ambiguity
   - Context: Implementation step 4 says "Add to navigation" but doesn't mention dashboard card
   - Suggestion: Either make this required or explicitly out of scope for this PR

5. **Implementation Step 1: "Create API route"**
   - Issue: No mention of file path resolution pattern
   - Context: Other files use `MARKDOWN_BASE_PATH` from config.ts, north_star.md is at project root
   - Suggestion: Add to config.ts: `NORTH_STAR_PATH = path.join(MARKDOWN_BASE_PATH, 'north_star.md')`

6. **Test Plan: "Component tests for editor"**
   - Issue: Too vague - no specific test scenarios
   - Suggestion: Specify tests like:
     - Renders markdown content correctly
     - Edit button switches to edit mode
     - Save button calls PUT /api/north-star
     - Cancel button discards changes
     - localStorage draft save/restore

7. **Test Plan: "E2E test for view/edit flow"**
   - Issue: No E2E test file location or test cases specified
   - Context: Project uses Playwright for E2E (e2e/daily-review.spec.ts exists)
   - Suggestion: Specify test file path and key scenarios

### Ambiguity Score: 7/14 requirements clear (50%)

## Scope Assessment
- **Bounded**: ⚠️ Mostly bounded, but "optional" dashboard card creates uncertainty
- **Single PR sized**: ✅ 4 implementation steps is reasonable
- **Open-ended indicators**: 
  - "Simple textarea **or** markdown editor" - choice not made
  - "North Star card/section on dashboard **(optional)**" - scope unclear

**Recommendation**: Remove optional items or make them explicit out-of-scope for v1

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| north_star.md file | ✅ | Exists at /Users/alexandrbasis/conductor/workspaces/ceo-personal-os/tunis/north_star.md |
| react-markdown | ✅ | Installed v10.1.0 with remark-gfm |
| API route pattern | ✅ | Pattern established in /api/life-map/route.ts |
| Page pattern | ✅ | Pattern established in life-map/edit/page.tsx |
| Config pattern | ✅ | /dashboard/src/lib/config.ts exists |
| fs/promises | ✅ | Used in existing API routes |
| localStorage API | ✅ | Browser standard, available client-side |
| Button component | ✅ | @/components/ui/button exists |
| Card component | ✅ | @/components/ui/card exists |
| Navigation pattern | ✅ | QuickActions component shows pattern |

**All dependencies available** ✅

## Environment Readiness
- **Branch available**: ✅ No branch named "north-star" exists
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ⚠️ Jest not in PATH (npm run test fails with "jest: command not found")
  - Note: This appears to be an environment issue, not a blocker
  - package.json has jest configured properly
  - Existing test files follow correct patterns

## Blockers

### Critical (Must Fix Before Implementation)
1. **Editor component choice not specified** - Task says "textarea or markdown editor" but doesn't specify which
2. **Preview mode UX not defined** - Multiple interpretations possible
3. **localStorage draft lifecycle incomplete** - Save/restore/clear logic not specified

### Minor (Should Clarify)
1. **Linear issue not created** - Tracking reference is "TBD"
2. **Dashboard card scope unclear** - Marked as "optional" but no definition of what's in/out of scope
3. **Test plan lacks specifics** - Need concrete test scenarios for API, component, and E2E tests

## Recommendations

### To Make Task Ready for Implementation

1. **Specify Editor Choice** (Critical)
   - Recommend: Start with plain `<textarea>` for v1 (simpler, faster)
   - Future enhancement: Add proper markdown editor in separate PR
   - Update AC2 to remove "or markdown editor"

2. **Define Preview Mode** (Critical)
   - Recommend: Follow Goals editor pattern (separate edit page with live markdown preview)
   - Alternative: Remove preview requirement for v1, just show raw markdown in textarea
   - Update AC2 with specific UX pattern

3. **Complete localStorage Draft Spec** (Critical)
   - Add to AC2:
     - "On page load, restore draft from localStorage if exists"
     - "On successful save, clear localStorage draft"
     - "On cancel, clear localStorage draft and navigate back"
     - "Show indicator if draft exists and differs from saved content"

4. **Clarify Dashboard Integration** (Minor)
   - Option A: Make it required with specific design (add to Quick Actions as 4th button)
   - Option B: Explicitly mark as out of scope for this PR
   - Recommend Option B for smaller PR scope

5. **Add File Path Config** (Minor)
   - Add to implementation step 1: "Add NORTH_STAR_PATH to dashboard/src/lib/config.ts"
   - Following pattern: `export const NORTH_STAR_PATH = path.join(MARKDOWN_BASE_PATH, 'north_star.md');`

6. **Expand Test Plan** (Minor)
   - API tests should cover:
     - GET returns file content as markdown string
     - PUT updates file content
     - PUT returns 400 on invalid body
     - GET/PUT return 500 on file system errors
   - Component tests should cover:
     - Initial render shows markdown content
     - Edit mode shows textarea
     - Save calls API and navigates
     - Cancel discards and navigates
   - E2E test should cover:
     - Full view → edit → save → view flow

7. **Create Linear Issue** (Administrative)
   - Create tracking issue and update task document
   - Suggested title: "North Star Editor - View and Edit north_star.md"

## Decision

**Ready for Implementation**: NO

**Reasoning**: While the task has good structure and all dependencies are available, there are 3 critical ambiguities that would lead to implementation uncertainty:

1. **Editor choice not specified** - Developer would have to guess between textarea vs full markdown editor
2. **Preview mode UX undefined** - Multiple valid interpretations exist
3. **localStorage draft lifecycle incomplete** - Edge cases not handled

These ambiguities could lead to:
- Implementation delays while waiting for clarification
- Rework if assumptions don't match expectations
- Inconsistent UX patterns across the app

## Required Actions Before Proceeding

### Critical (Must Complete)
- [ ] Choose and specify editor implementation (recommend: plain textarea for v1)
- [ ] Define preview mode UX pattern (recommend: follow Goals editor pattern)
- [ ] Document complete localStorage draft lifecycle (save/restore/clear conditions)

### Recommended (Should Complete)
- [ ] Clarify dashboard integration scope (recommend: mark as out-of-scope for v1)
- [ ] Add specific test scenarios to test plan
- [ ] Add NORTH_STAR_PATH constant to implementation steps
- [ ] Create Linear issue and update task document

### Estimated Time to Resolve Blockers
- Critical clarifications: 10-15 minutes of decision-making
- Recommended updates: 15-20 minutes of documentation
- **Total: 30-35 minutes** to make task fully ready

## Strengths of Current Task Document

Despite the ambiguities, the task document has several strengths:

1. ✅ Clear primary objective with concrete deliverable
2. ✅ Well-structured acceptance criteria using checkboxes
3. ✅ All technical dependencies already exist in codebase
4. ✅ Follows established patterns (API routes, edit pages, config)
5. ✅ Reasonable scope for single PR (4 implementation steps)
6. ✅ Test plan includes API, component, and E2E coverage

**With the recommended clarifications, this task will be ready for autonomous implementation.**
