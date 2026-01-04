# Pre-Flight Validation - Frameworks Viewer

**Date**: 2026-01-04T18:00:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness
| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Add viewer/editor for framework files |
| Implementation Steps | ⚠️| High-level steps present but lacks detail |
| Test Plan | ❌ | Very vague - "API route tests, Component tests, E2E test" without specifics |
| Acceptance Criteria | ✅ | Well-structured AC1-AC4 with clear deliverables |
| Linear Reference | ❌ | Marked as "TBD" - not ready for tracking |

**Score**: 3/5 sections complete

## Clarity Assessment

### Clear Requirements
- AC1: Page at `/frameworks` listing all frameworks ✅ Specific and actionable
- AC2: Page at `/frameworks/[framework-name]` with markdown rendering ✅ Specific and actionable
- AC3: Markdown editor with preview ✅ Specific and actionable
- AC4: API routes defined ✅ Specific and actionable
- Framework files identified: annual_review.md, vivid_vision.md, ideal_life_costing.md ✅ Verified in codebase

### Ambiguous Items (Need Clarification)

1. **AC1: "Card for each framework with description"**
   - Issue: Source of descriptions not specified. Should descriptions come from:
     - README.md framework table?
     - First paragraph of each framework file?
     - Hardcoded in component?
   - Suggestion: Specify explicit source for framework descriptions

2. **AC3: "Auto-save draft"**
   - Issue: Auto-save mechanism undefined
     - Should it use localStorage like other editors?
     - What's the auto-save interval?
     - Should it restore on load?
   - Suggestion: Clarify if following existing editor pattern (NorthStarEditor has NO localStorage per line 24 comment)

3. **Implementation Steps: "Add to navigation"**
   - Issue: Navigation location unclear
     - Add to QuickActions component?
     - Add to new navbar?
     - Add link from where?
   - Suggestion: Specify exact component and location for navigation link

4. **Test Plan: Generic test types**
   - Issue: No specific test scenarios defined
   - Suggestion: Should specify:
     - Which API endpoints to test (GET/PUT for each framework)
     - Which component behaviors to test (view mode, edit mode, save)
     - E2E user flow to validate

5. **Framework URL Pattern**
   - Issue: URL structure unclear for multi-word filenames
     - `annual_review.md` → `/frameworks/annual_review` or `/frameworks/annual-review`?
     - Should match filename exactly or convert underscores to hyphens?
   - Suggestion: Specify URL transformation pattern

### Ambiguity Score: 5/10 requirements clear

## Scope Assessment
- **Bounded**: ✅ Clear list of 3 frameworks (excluding life_map)
- **Single PR sized**: ✅ Reasonable scope - similar to existing north-star, principles, memory implementations
- **Open-ended indicators**: None found ✅

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Framework files exist | ✅ | Verified: annual_review.md, vivid_vision.md, ideal_life_costing.md in /frameworks/ |
| Config pattern exists | ✅ | MARKDOWN_BASE_PATH pattern in src/lib/config.ts |
| Editor component pattern | ✅ | NorthStarEditor.tsx provides clear template |
| Page pattern | ✅ | north-star/page.tsx provides clear template |
| API route pattern | ✅ | api/north-star/route.ts provides clear template |
| UI components | ✅ | Card, Button, Textarea, ReactMarkdown available |
| life_map exclusion | ✅ | Correctly excluded (has separate task) |

**All critical dependencies verified in codebase**

## Environment Readiness
- **Branch available**: ✅ No existing framework branch found
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ⚠️ Jest not installed/configured (command not found), but existing pattern doesn't break builds

## Blockers

**None** - All critical dependencies exist, but clarifications needed before implementation to avoid rework.

## Recommendations

### Required Clarifications (Before Implementation):

1. **Framework Descriptions Source**
   - Decision needed: Where to pull framework descriptions from?
   - Recommendation: Use README.md framework table (lines 122-127) as source of truth

2. **Auto-save Implementation**
   - Decision needed: Follow NorthStarEditor pattern (no localStorage) or add auto-save?
   - Recommendation: Follow existing pattern - NO auto-save, remove from AC3 or clarify intention

3. **Navigation Integration**
   - Decision needed: Where to add "Frameworks" link?
   - Recommendation: Add to QuickActions component after Memory section, before "View All Reviews"

4. **URL Slug Pattern**
   - Decision needed: How to convert filenames to URLs?
   - Recommendation: Use kebab-case (annual-review, vivid-vision, ideal-life-costing) for URLs

5. **Test Plan Details**
   - Decision needed: Specific test scenarios
   - Recommendation: Mirror north-star test patterns:
     - API: GET returns content, PUT updates file, validation errors
     - Component: View mode renders, Edit mode saves, Cancel reverts
     - E2E: Navigate to frameworks, view, edit, save flow

### Suggested Task Updates:

**AC3 Revision:**
```markdown
### AC3: Framework Editor
- [ ] Markdown editor with preview (tab-based like NorthStarEditor)
- [ ] Toolbar with formatting buttons (Bold, Italic, Header, List, Link)
- [ ] Save and Cancel functionality
- [ ] NO localStorage draft (consistent with other editors)
```

**Implementation Steps Expansion:**
```markdown
## Implementation Steps
1. Update config.ts with framework paths constants
2. Create API route `app/api/frameworks/[name]/route.ts`
   - GET: Read framework file from frameworks/ directory
   - PUT: Update framework file
   - Validate framework name against allowlist
3. Create frameworks list page at `/frameworks`
   - Display cards for: annual_review, vivid_vision, ideal_life_costing
   - Use descriptions from README.md table
4. Create framework viewer at `/frameworks/[name]`
   - View mode: Render markdown
   - Edit mode: Use shared FrameworkEditor component
5. Create FrameworkEditor component (similar to NorthStarEditor)
6. Add navigation link to QuickActions component
```

**Test Plan Expansion:**
```markdown
## Test Plan

### API Tests (`src/__tests__/api/frameworks/[name]/route.test.ts`)
- GET /api/frameworks/annual-review returns content
- GET /api/frameworks/invalid-name returns 404
- PUT /api/frameworks/vivid-vision updates file
- PUT validates framework name against allowlist

### Component Tests (`src/__tests__/components/FrameworkEditor.test.tsx`)
- Renders in edit mode with toolbar
- Toggles between edit and preview
- Save button calls onSave callback
- Cancel button calls onCancel callback

### E2E Tests (`e2e/frameworks.spec.ts`)
- Navigate to /frameworks and see 3 framework cards
- Click framework card to view content
- Click Edit to enter edit mode
- Make changes and save successfully
- Verify changes persisted
```

## Decision

**Ready for Implementation**: NO

**Reasoning**: Document has good structure and all dependencies exist, but contains 5 significant ambiguities that could lead to implementation mismatches. These are quick clarifications (not major rework), but resolving them upfront will prevent wasted effort and revision cycles.

**Required Actions Before Proceeding**:
- [ ] Clarify framework description source (README vs file content vs hardcoded)
- [ ] Confirm auto-save pattern (remove or specify localStorage behavior)
- [ ] Specify navigation integration location (QuickActions vs new component)
- [ ] Define URL slug transformation pattern (kebab-case recommended)
- [ ] Expand test plan with specific scenarios (can use recommendations above)
- [ ] Create Linear issue and update tracking section
- [ ] Update AC3 to remove/clarify auto-save requirement

**Estimated Time to Resolve**: 10-15 minutes of decision-making

Once clarified, this task will be READY - the pattern is well-established in the codebase and implementation is straightforward.
