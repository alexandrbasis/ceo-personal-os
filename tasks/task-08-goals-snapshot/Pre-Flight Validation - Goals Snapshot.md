# Pre-Flight Validation - Goals Snapshot on Dashboard

**Date**: 2026-01-04T20:15:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: NEEDS_CLARIFICATION

## Document Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear: Add Goals Snapshot component to dashboard |
| Implementation Steps | ⚠️ | High-level steps present but lack specificity |
| Test Plan | ⚠️ | Mentioned but not detailed |
| Acceptance Criteria | ✅ | Well-defined with AC1-AC4 |
| Linear Reference | ❌ | TBD - needs to be created |

**Score**: 3/5 sections complete

## Clarity Assessment

### Clear Requirements

- AC1: Goals Snapshot Component - ✅ Specific requirements for UI
- AC4: Navigation - ✅ Clear interaction patterns
- Goal file location - ✅ `/goals/1_year.md` exists and structure is known
- Existing patterns - ✅ GoalsPage component provides reference implementation

### Ambiguous Items (Need Clarification)

1. **"3-5 goals from 1-year goals"**
   - Issue: How to determine which goals to display? First 3-5? Random selection? Priority-based?
   - Suggestion: Specify selection criteria (e.g., "Display first 5 goals from document in order, or fewer if less than 5 exist")

2. **"Status Calculation (AC2)"**
   - Issue: Multiple optional approaches listed without clear priority or specification
   - Current spec says:
     - "Default status based on time of year vs goal" - VAGUE: What algorithm determines this?
     - "Optional: Manual status override" - Where is this stored? Frontmatter?
     - "Optional: Derive from quarterly review mentions" - How to parse quarterly reviews?
   - Suggestion: Choose ONE implementation approach for MVP:
     - Simplest: Read status from goal file frontmatter (already exists in GoalsPage)
     - OR: Specify exact algorithm for time-based calculation

3. **"Text (truncated if needed)"**
   - Issue: How much text? What part of goal (just "What" field? Full goal text?)
   - Suggestion: Specify exact field to display and character limit (e.g., "Display Goal 'What' field, truncated to 60 characters with ellipsis")

4. **API Endpoint Name: `/api/goals/1-year/summary`**
   - Issue: Conflicts with existing pattern `/api/goals/[timeframe]` which returns full goal
   - Current API: `GET /api/goals/1-year` returns full content + metadata
   - Suggestion: Either:
     - Use existing endpoint and parse on frontend
     - Create new endpoint `/api/goals/summary` or `/api/dashboard/goals-snapshot`

5. **Implementation Step: "Add goal status logic"**
   - Issue: Where does this logic live? Parser? Component? API?
   - Suggestion: Specify location (e.g., "Add status calculation in `/api/goals/1-year/summary` route" OR "Calculate status in GoalsSnapshot component from metadata")

### Ambiguity Score: 5/10 requirements clear (50%)

## Scope Assessment

- **Bounded**: ⚠️ PARTIALLY - Core feature is bounded, but AC2 "Optional" items create scope ambiguity
- **Single PR sized**: ✅ YES - If AC2 is simplified to use existing frontmatter status
- **Open-ended indicators**: 
  - "Optional: Manual status override" - suggests future work but unclear if in scope
  - "Optional: Derive from quarterly review mentions" - sounds like separate feature
  - "Based on quarterly progress if available" - unclear implementation

**Recommendation**: Mark AC2 optional items as explicitly OUT OF SCOPE for this PR, implement using existing frontmatter status only

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `/goals/1_year.md` file | ✅ | Exists with template structure |
| Goals API (`/api/goals/[timeframe]`) | ✅ | Fully implemented with GET/PUT |
| GoalsPage component | ✅ | Reference implementation exists |
| Goal metadata (status field) | ✅ | Already supported in frontmatter |
| Dashboard page layout | ✅ | `/dashboard/src/app/page.tsx` ready to extend |
| Card component | ✅ | Already used in dashboard |
| shadcn/ui components | ✅ | Available in project |
| Test infrastructure | ⚠️ | Jest configured but node_modules missing (needs `npm install`) |
| GOALS_PATH config | ✅ | Defined in `/lib/config.ts` |

**Missing Dependencies**: None (test dependencies need install but not blocking)

## Environment Readiness

- **Branch available**: ✅ Current branch: `alexandrbasis/lusaka`
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ⚠️ Cannot verify - Jest not installed (`npm install` needed)
- **Existing goals branch**: ⚠️ `feature/goals-editor` exists - may need coordination

## Blockers

**No Critical Blockers** - Task can proceed with clarifications

## Recommendations

### High Priority (Must Fix Before Implementation)

1. **Clarify AC2 Status Calculation**
   - DECISION NEEDED: Use existing frontmatter status OR implement time-based algorithm?
   - RECOMMENDED: Start with frontmatter-only (simple, already implemented)
   - Document: If no status in frontmatter, default to "Unknown" or no status badge

2. **Specify Goal Selection Logic**
   - RECOMMENDED: "Display first 5 Goal sections (Goal 1-5) from document in order"
   - Handle edge case: If file has placeholders, skip or show empty state

3. **Specify Goal Text Display**
   - RECOMMENDED: Display the "What:" field from each goal, truncated to 60 chars
   - Alternative: Display goal heading only (e.g., "Goal 1", "Goal 2")

4. **Resolve API Endpoint Naming**
   - RECOMMENDED: Create new endpoint `/api/goals/1-year/summary` that returns:
     ```json
     {
       "goals": [
         { "id": 1, "what": "Launch product", "status": "on-track" },
         ...
       ]
     }
     ```
   - Alternative: Reuse `/api/goals/1-year` and parse markdown in component

### Medium Priority (Should Address)

5. **Add Missing Test Plan Details**
   - Specify test cases for:
     - Empty goals file (placeholders only)
     - No status in frontmatter
     - Less than 5 goals
     - Navigation behavior

6. **Create Linear Issue**
   - Update task doc with Linear issue ID once created

7. **Install Dependencies**
   - Run `npm install` in `/dashboard` before running tests

### Low Priority (Nice to Have)

8. **Define "View All" Link Behavior**
   - AC4 mentions "View All" → `/goals` 
   - Verify: Should it default to 1-year tab? Document this.

## Decision

**Ready for Implementation**: NO - NEEDS_CLARIFICATION

**Reasoning**: 
The task document has good structure and clear acceptance criteria, but contains critical ambiguities that would lead to implementation uncertainty:

1. **Status calculation logic is too vague** - "Default status based on time of year vs goal" has no specification
2. **Goal selection criteria undefined** - Could be interpreted multiple ways
3. **API design conflicts** with existing patterns

These ambiguities would result in:
- Developer making assumptions that may not match intent
- Rework if assumptions are wrong
- Unclear test expectations

However, the task is **close to ready** - with 1-2 hours of clarification, it would be fully implementable.

**Required Actions Before Proceeding**:

- [ ] **CRITICAL**: Define AC2 status calculation approach (frontmatter-only OR specify algorithm)
- [ ] **CRITICAL**: Specify which goals to show (first 5? all? priority-based?)
- [ ] **CRITICAL**: Define goal text display (which field? how much?)
- [ ] **IMPORTANT**: Clarify API endpoint design (new `/summary` endpoint OR reuse existing?)
- [ ] **RECOMMENDED**: Add detailed test scenarios to test plan
- [ ] **RECOMMENDED**: Create Linear issue and update task doc
- [ ] **OPTIONAL**: Mark AC2 optional features as explicitly out-of-scope

**Estimated Time to Address**: 1-2 hours of spec refinement

**Recommended Next Step**: 
Schedule 30-min clarification session to answer the 4 critical questions above, then task will be ready for autonomous implementation.

---

**Validation Completed**: 2026-01-04T20:15:00Z
