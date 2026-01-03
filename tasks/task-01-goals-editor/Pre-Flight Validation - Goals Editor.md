# Pre-Flight Validation - Goals Editor

**Date**: 2026-01-02T20:53:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness
| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Add viewer/editor for 1/3/10 year goals |
| Implementation Steps | ⚠️| Present but lacks detail (see Ambiguous Items) |
| Test Plan | ⚠️| Too vague - needs specific test cases |
| Acceptance Criteria | ✅ | 4 ACs defined with checkboxes |
| Linear Reference | ❌ | Marked as "TBD" - should be created before implementation |

**Score**: 3/5 sections complete

## Clarity Assessment

### Clear Requirements
- Goal files exist and are accessible: `/goals/1_year.md`, `/goals/3_year.md`, `/goals/10_year.md` ✅
- Page route clearly defined: `/goals` ✅
- API pattern follows existing convention: Similar to `/api/reviews/[type]/route.ts` ✅
- Acceptance criteria are structured and measurable ✅

### Ambiguous Items (Need Clarification)

1. **AC2: "Auto-save draft"**
   - Issue: No specification for auto-save behavior. Where are drafts stored? How often do they save? Do they persist on page refresh? Is this client-side (localStorage) or server-side?
   - Suggestion: Specify draft storage mechanism (recommend localStorage for MVP, similar to form drafts in review pages)

2. **AC2: "Markdown editor with preview"**
   - Issue: No specification for which markdown library to use. Project has `gray-matter` in package.json but no markdown renderer.
   - Suggestion: Specify required dependency (e.g., `react-markdown` + `remark-gfm`) or confirm if custom implementation is expected

3. **AC1: "tabs/sections"**
   - Issue: UI component not available. No Tabs component found in `/dashboard/src/components/ui/`
   - Suggestion: Either add shadcn/ui tabs component to dependencies or clarify if manual implementation is expected

4. **AC4: "Optional: Status per goal"**
   - Issue: "Optional" creates scope ambiguity. Should this be implemented in this PR or deferred?
   - Suggestion: Either move to separate task or make it explicit whether it's included in this implementation

5. **AC4: "Link goals to quarterly reviews"**
   - Issue: No quarterly review system exists yet. How should this linking work? Is this blocked on another feature?
   - Suggestion: Clarify if this is a placeholder for future work or needs implementation now

6. **Test Plan: "E2E test"**
   - Issue: No specific test scenario defined. What user flow should be tested end-to-end?
   - Suggestion: Specify exact test case (e.g., "User loads /goals, switches tabs, edits 1-year goal, saves, reloads page, sees persisted changes")

7. **Implementation Step 3: "Add goal status tracking (optional enhancement)"**
   - Issue: Conflicts with AC4 being marked as part of acceptance criteria. Is this required or optional?
   - Suggestion: Clarify scope - either remove from ACs or remove "optional" label

### Ambiguity Score: 7/14 requirements need clarification

## Scope Assessment
- **Bounded**: ⚠️ Mostly bounded, but AC4 "optional" items create uncertainty
- **Single PR sized**: ✅ Core functionality (AC1-AC3) is appropriately scoped
- **Open-ended indicators**: 
  - "Optional" appears twice (AC4)
  - "Link goals to quarterly reviews" suggests future feature dependency
  - No clear definition of what constitutes "done" for markdown editing features

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Goal files (`/goals/*.md`) | ✅ | All three files exist and accessible |
| Next.js App Router | ✅ | Confirmed at `/dashboard/src/app/` |
| File system patterns | ✅ | Existing patterns in `/api/reviews/` can be replicated |
| `fs/promises` module | ✅ | Already used in API routes |
| `gray-matter` | ✅ | In package.json but NOT currently used in codebase |
| Markdown renderer | ❌ | NOT in dependencies - needs to be added |
| Tabs UI component | ❌ | NOT in `/components/ui/` - needs to be added or built |
| Test infrastructure | ❌ | Dependencies not installed (`npm install` needed) |

## Environment Readiness
- **Branch available**: ✅ No existing `goals-editor` branch found
- **Clean working tree**: ✅ Git status clean
- **Tests passing**: ❌ Dependencies not installed - `npm install` required before testing
- **npm dependencies**: ❌ UNMET DEPENDENCIES - Must run `npm install` in `/dashboard` directory

## Blockers

### Critical Blockers (Must Fix Before Starting)
1. **Missing npm dependencies**: Run `npm install` in `/dashboard` directory - all dev dependencies are unmet
2. **Missing Linear issue**: Create Linear issue and update task document with reference
3. **Markdown rendering dependency**: Add `react-markdown` or equivalent to package.json (not currently installed)

### Clarification Needed (Should Fix Before Starting)
4. **Tabs component**: Decide on implementation approach (add shadcn/ui tabs vs custom implementation)
5. **Auto-save mechanism**: Specify storage approach for drafts
6. **AC4 scope**: Clarify if "optional" items are in scope for this PR

## Recommendations

### Before Implementation Can Begin:
1. **Install dependencies**: 
   ```bash
   cd /Users/alexandrbasis/conductor/workspaces/ceo-personal-os/nuuk/dashboard && npm install
   ```

2. **Create Linear issue** and update task document with issue ID

3. **Clarify scope decisions**:
   - Is AC4 (goal status tracking) in scope? If yes, remove "optional" label
   - Is AC4 (link to quarterly reviews) blocked on another feature? If yes, defer to future task
   - Recommend: Remove AC4 entirely from this task, focus on core viewer/editor (AC1-AC3)

4. **Add missing dependencies to package.json**:
   ```json
   "react-markdown": "^9.0.0",
   "remark-gfm": "^4.0.0"
   ```
   And add Tabs component from shadcn/ui

5. **Enhance Test Plan** with specific test cases:
   - Unit tests for API routes (GET /api/goals/1-year, PUT /api/goals/1-year)
   - Component tests for GoalsPage with tab switching
   - Component tests for markdown editor with preview
   - E2E test: Load page → switch tabs → edit goal → save → reload → verify persistence

6. **Specify auto-save behavior**:
   - Recommend: Use localStorage for drafts (key: `goals-draft-{timeframe}`)
   - Auto-save every 2 seconds after user stops typing
   - Show visual indicator when draft is saved

### Suggested Task Document Updates:

```markdown
## Dependencies
- Add to package.json: `react-markdown`, `remark-gfm`
- Add shadcn/ui Tabs component: `npx shadcn@latest add tabs`

## Auto-Save Specification
- Store drafts in localStorage with key pattern: `goals-draft-{timeframe}`
- Debounce auto-save: 2 seconds after last keystroke
- Show toast notification: "Draft saved" (subtle, non-intrusive)
- Clear draft on successful save

## Out of Scope (Defer to Future Tasks)
- Goal status tracking (On Track / Needs Attention / Behind)
- Linking goals to quarterly reviews
- Goal version history
```

## Decision

**Ready for Implementation**: NO

**Reasoning**: 
The core task is well-conceived and follows existing patterns in the codebase. Goals files exist, API patterns are established, and the basic structure is clear. However, critical environment issues (uninstalled dependencies) and specification gaps (missing markdown library, unclear auto-save behavior, ambiguous "optional" scope) would lead to implementation delays and potential rework.

With clarifications and environment setup, this task could move to READY status within 30 minutes.

**Required Actions Before Proceeding**:
- [ ] Run `npm install` in `/dashboard` directory
- [ ] Create Linear issue and update task document
- [ ] Add markdown rendering dependencies to package.json
- [ ] Add Tabs UI component (shadcn/ui or custom)
- [ ] Clarify AC4 scope - recommend removing from this task
- [ ] Specify auto-save mechanism (localStorage recommended)
- [ ] Enhance test plan with specific test cases
- [ ] Verify tests pass after dependency installation

**Estimated Time to READY**: 30-45 minutes (mostly dependency installation and quick clarifications)
