# Pre-Flight Validation - Memory Editor

**Date**: 2026-01-04T00:00:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness
| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear - Add viewer/editor for memory.md |
| Implementation Steps | ⚠️| Basic steps present but lacking detail |
| Test Plan | ⚠️| Listed but not detailed (API, Component, E2E) |
| Acceptance Criteria | ✅ | Well-defined with 4 clear ACs |
| Linear Reference | ❌ | Missing - shows "TBD" |

**Score**: 3/5 sections complete

## Clarity Assessment

### Clear Requirements
- AC1: Page at `/memory` showing memory.md content ✅ Specific and actionable
- AC2: Markdown editor with structure guidance ✅ Clear requirement
- AC3: API routes (GET/PUT) ✅ Well-defined
- AC4: Integration points ✅ Clear integration needs
- File location: memory.md exists at `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/memory.md` ✅

### Ambiguous Items (Need Clarification)

1. **AC1: "Sections for: Patterns noticed across years, Insights that keep proving true..."**
   - Issue: Unclear if these are static sections to display OR UI guidance prompts
   - Current memory.md already has these sections defined with comprehensive structure
   - Suggestion: Clarify if the requirement is to:
     - Display existing sections from memory.md (view mode)
     - Provide section headers as guidance in editor (edit mode)
     - Both of the above

2. **AC2: "structure guidance"**
   - Issue: Vague term - what does "structure guidance" mean exactly?
   - Suggestion: Specify implementation:
     - Formatting toolbar (like PrinciplesEditor)?
     - Section templates to insert?
     - Placeholder text showing structure?
     - Help text explaining each section?

3. **AC4: "Reminder to review before quarterly/annual reviews"**
   - Issue: Implementation mechanism unclear
   - Suggestion: Specify HOW reminder works:
     - Toast notification?
     - Banner on review pages?
     - Link/callout in review forms?
     - Automated check based on review dates?

4. **Implementation Step 1: "Create API route app/api/memory/route.ts"**
   - Issue: Incorrect path - should be `src/app/api/memory/route.ts` (missing `src/`)
   - Suggestion: Update path to match codebase structure

5. **Implementation Step 2: "Create page app/memory/page.tsx"**
   - Issue: Incorrect path - should be `src/app/memory/page.tsx` (missing `src/`)
   - Suggestion: Update path to match codebase structure

### Ambiguity Score: 5/9 requirements clear (56%)

## Scope Assessment
- **Bounded**: ✅ Scope is well-defined with clear acceptance criteria
- **Single PR sized**: ✅ Comparable to existing PRs (Principles, North Star editors)
- **Open-ended indicators**: None found ✅

**Assessment**: Scope is appropriately bounded. Similar patterns exist for `/principles` and `/north-star` pages which took single PRs each.

## Dependencies

### Required Dependencies
| Dependency | Status | Location |
|------------|--------|----------|
| memory.md file | ✅ | `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/memory.md` |
| Next.js App Router | ✅ | Established pattern in codebase |
| ReactMarkdown | ✅ | Already in dependencies (v10.1.0) |
| remark-gfm | ✅ | Already in dependencies (v4.0.1) |
| PrinciplesEditor component | ✅ | Can be used as reference pattern |
| config.ts | ✅ | Needs MEMORY_PATH constant added |
| UI components (Card, Button, etc.) | ✅ | Available in @/components/ui |
| Sonner (toast) | ✅ | Already in dependencies |

### Missing Config Entry
- Need to add `MEMORY_PATH` constant to `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/lib/config.ts`
- Pattern: `export const MEMORY_PATH = path.join(MARKDOWN_BASE_PATH, 'memory.md');`

### Navigation Integration
- QuickActions component at `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/components/QuickActions.tsx`
- Currently has sections: Daily, Weekly, Goals, North Star, Principles
- Need to add Memory section (AC4 requirement)

## Environment Readiness
- **Branch available**: ✅ No existing memory-related branches found
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ⚠️ Cannot verify - Jest not found in PATH (may need npm install)
- **Dependencies installed**: ⚠️ Test suite check failed, may need `npm install` in dashboard/

## Test Plan Detail Assessment

Current test plan is too high-level:
- "API route tests" - Not detailed
- "Component tests" - Not detailed  
- "E2E test" - Not detailed

### Recommended Test Coverage (Based on Existing Patterns)

**API Tests** (following `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/__tests__/api/principles.test.ts`):
- GET /api/memory returns content
- GET handles missing file
- GET handles permission errors
- PUT updates content successfully
- PUT validates request body
- PUT handles write errors
- PUT handles special characters
- PUT preserves whitespace

**Component Tests** (following PrinciplesEditor pattern):
- Renders in view mode
- Switches to edit mode
- Saves content successfully
- Cancels editing
- Auto-saves draft to localStorage
- Restores draft on mount
- Handles save errors
- Formatting toolbar works

**Page Tests**:
- Loads and displays content
- Handles loading state
- Handles error state
- Edit/save workflow
- Navigation links work

**E2E Test**:
- Full user journey: view → edit → save → verify

## Blockers

**None** - All critical dependencies are available in the codebase.

## Recommendations

### Critical (Must Fix Before Implementation)
1. **Add Linear Issue Reference** - Update "TBD" in tracking section
2. **Fix Implementation Paths** - Correct `app/` to `src/app/` in steps 1-2
3. **Add MEMORY_PATH to config** - Add to implementation steps:
   ```typescript
   export const MEMORY_PATH = path.join(MARKDOWN_BASE_PATH, 'memory.md');
   ```

### Clarifications Needed (Should Address)
4. **Clarify "structure guidance"** - Specify exact UI behavior for AC2
5. **Clarify "reminder" mechanism** - Define implementation for AC4 reminder
6. **Clarify sections requirement** - AC1 sections (display vs guidance)
7. **Detail test plan** - Expand test cases following existing API/component test patterns

### Nice to Have
8. **Add MemoryEditor component** to implementation steps (parallel to PrinciplesEditor)
9. **Specify editor localStorage key** (e.g., 'memoryDraft' following 'principlesDraft' pattern)
10. **Consider section jump navigation** - memory.md has 15+ sections, might need table of contents

## Existing Patterns to Follow

The task can leverage these established patterns:

1. **API Route Pattern**: `/api/principles/route.ts`
   - GET: Read file, return JSON with content
   - PUT: Validate body, write file, return success
   - Error handling: 400 for validation, 500 for file errors

2. **Page Pattern**: `/principles/page.tsx`
   - View mode: ReactMarkdown rendering
   - Edit mode: Editor component
   - Loading/error states
   - Toast notifications

3. **Editor Pattern**: `PrinciplesEditor.tsx`
   - Edit/Preview tabs
   - Formatting toolbar
   - Auto-save to localStorage
   - Debounced saves (500ms)

4. **Navigation Pattern**: `QuickActions.tsx`
   - Section with description text
   - Button with variant="secondary"
   - Link to page

## Decision

**Ready for Implementation**: NO - Needs Clarification

**Reasoning**: 
The task document is well-structured and most technical dependencies exist, but has several ambiguities that could lead to rework or misalignment during implementation. The core structure is solid (following established patterns), but clarifications are needed for specific UX behaviors (structure guidance, reminder mechanism, sections display).

The missing Linear issue reference is a process blocker per standard workflow. The incorrect file paths in implementation steps could cause confusion.

**Confidence Level**: 70% ready - Very close, just needs clarification on 3-4 ambiguous points and correction of path errors.

## Required Actions Before Proceeding

### Must Do (Blockers)
- [ ] Add Linear issue reference (replace "TBD")
- [ ] Fix implementation step paths: `app/` → `src/app/`
- [ ] Add "Add MEMORY_PATH to config.ts" to implementation steps

### Should Do (Risk Reduction)
- [ ] Clarify what "structure guidance" means in AC2 (toolbar? templates? help text?)
- [ ] Clarify "reminder to review" implementation in AC4 (toast? banner? link?)
- [ ] Clarify sections requirement in AC1 (display only? or UI guidance?)
- [ ] Expand test plan with specific test cases (can reference principles.test.ts)

### Nice to Have (Quality Improvement)
- [ ] Add MemoryEditor component creation to implementation steps
- [ ] Consider adding table of contents navigation (memory.md has 15+ sections)
- [ ] Run `npm install` in dashboard/ to verify environment

## Summary

The Memory Editor task follows well-established patterns (Principles, North Star) and has clear acceptance criteria. All required dependencies exist in the codebase. However, 3 ambiguous requirements need clarification (structure guidance, reminder mechanism, sections display), and implementation paths need correction. The missing Linear issue reference is a process blocker. After addressing these items, the task will be ready for autonomous implementation. Estimated effort: ~30 minutes to clarify and update document.
