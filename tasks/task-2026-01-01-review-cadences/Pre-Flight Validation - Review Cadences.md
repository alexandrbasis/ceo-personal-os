# Pre-Flight Validation - Review Cadences

**Date**: 2026-01-01T00:00:00Z
**Validator**: Pre-Flight Validation Agent
**Status**: ⚠️ NEEDS_CLARIFICATION

## Document Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Primary Objective | ✅ | Clear - Implement weekly, quarterly, and annual reviews |
| Implementation Steps | ✅ | Well-structured in 4 phases with detailed breakdown |
| Test Plan | ✅ | Testing requirements specified with multiple test types |
| Acceptance Criteria | ✅ | 5 clear acceptance criteria with detailed checklists |
| Linear Reference | ❌ | No Linear issue reference found |
| Technical Design | ✅ | Comprehensive data models, API endpoints, file structure |
| Dependencies | ⚠️ | Listed but needs verification (see below) |

**Score**: 6/7 sections complete

## Clarity Assessment

### Clear Requirements

1. **Weekly Review Fields**: ✅ Specific fields mapped from README template
   - What moved the needle
   - Noise disguised as work
   - Time leaks
   - Strategic insight
   - Adjustment for next week

2. **Quarterly Review Fields**: ✅ Specific fields defined
   - Progress against 1-year goals
   - Alignment analysis
   - Energy-to-output ratio
   - Course corrections

3. **Annual Review Structure**: ✅ Three-section breakdown specified
   - Morning (Past Year Reflection, Quarterly review, Life Map)
   - Midday (Pattern Recognition, Uploads, Memory updates)
   - Afternoon (Vivid Vision, Lifestyle Costing, Goals, North Star)

4. **Data Models**: ✅ Complete TypeScript interfaces provided

5. **API Endpoints**: ✅ RESTful patterns clearly defined

6. **File Structure**: ✅ Directory layout and component organization specified

### Ambiguous Items (Need Clarification)

1. **AMBIGUOUS**: "Links to Past Year Reflection interview" (AC3)
   - **Issue**: How should these "links" be implemented? Are they:
     - Markdown hyperlinks in the saved file?
     - UI buttons that open the interview in a modal?
     - Navigation links to separate pages?
     - References to file paths?
   - **Suggestion**: Specify exact UI implementation - e.g., "Add navigation button to `/interviews/past-year-reflection` page" or "Include markdown link in annual review template"

2. **AMBIGUOUS**: "Links to Life Map update" (AC3)
   - **Issue**: Same as above - implementation method unclear
   - **Suggestion**: Clarify if this is a deep link to `/life-map` page or embedded component

3. **AMBIGUOUS**: "Progress is saved between sessions" (AC3)
   - **Issue**: What defines a "session"? Is it:
     - Browser session (localStorage)?
     - Database/file-based persistence?
     - Draft auto-save mechanism like daily reviews?
   - **Suggestion**: Specify storage mechanism - e.g., "Auto-save to annual review file every 30 seconds like daily reviews" or "Save progress to separate draft file"

4. **AMBIGUOUS**: "Review uploads" in Annual Review Midday section
   - **Issue**: No uploads feature exists in codebase. What are "uploads"?
   - **Suggestion**: Clarify if this means:
     - Files in `/uploads/` directory (not implemented yet)
     - Past documents to review manually
     - Feature to be implemented later (mark as out of scope)

5. **AMBIGUOUS**: "Update memory.md" in Annual Review
   - **Issue**: How is this integrated? Is it:
     - Manual instruction displayed to user?
     - Editable textarea in the form?
     - Separate page navigation?
   - **Suggestion**: Specify exact UI - e.g., "Display reminder message: 'Remember to update memory.md after completing review'" or "Add textarea for memory.md updates"

6. **AMBIGUOUS**: "Quarterly uses quarter designation (Q1, Q2, Q3, Q4)" (AC5)
   - **Issue**: File naming convention unclear. Is it:
     - `2026-Q1.md`?
     - `Q1-2026.md`?
     - `2026-01-01.md` (date of quarter start)?
   - **Suggestion**: Provide exact filename format - e.g., "`YYYY-QN.md` format: `2026-Q1.md`"

7. **AMBIGUOUS**: "Annual uses year designation (2026.md)" (AC5)
   - **Issue**: Clear format but inconsistent with other date formats
   - **Suggestion**: Confirm this is intentional departure from `YYYY-MM-DD.md` pattern

8. **AMBIGUOUS**: "Week picker instead of date picker" for Weekly Review
   - **Issue**: What does "week picker" mean? HTML input doesn't have native week picker. Is it:
     - Date picker that auto-calculates week start/end?
     - Custom dropdown with week numbers?
     - Text input for week range?
   - **Suggestion**: Specify exact UI component or reference library/implementation pattern

9. **AMBIGUOUS**: "Reference to goals files" in Quarterly Review
   - **Issue**: No goals API or page exists in current codebase. How to reference?
   - **Suggestion**: Clarify if this is:
     - Manual note in instructions
     - Read-only display of goals file content
     - Link to file browser
     - Out of scope for this task

10. **AMBIGUOUS**: "Multi-page wizard (Morning → Midday → Afternoon)" for Annual Review
    - **Issue**: Navigation pattern unclear. Is it:
      - Single page with scroll sections?
      - Separate routes (`/annual/morning`, `/annual/midday`, etc.)?
      - Tabbed interface?
      - Step-by-step modal?
    - **Suggestion**: Specify exact navigation pattern and routing structure

### Ambiguity Score: 16/26 requirements clear (10 ambiguous items)

## Scope Assessment

- **Bounded**: ⚠️ Partially bounded
  - Core review functionality is well-scoped
  - However, several features reference systems not yet implemented:
    - Goals file integration
    - Uploads review
    - Memory.md updates
    - Framework pages (Vivid Vision, Lifestyle Costing)
  
- **Single PR sized**: ❌ NO
  - Estimated 38-48 hours across 4 sprints
  - Document explicitly suggests 4 separate phases
  - Should be broken into separate tasks/PRs per phase
  
- **Open-ended indicators**: Found
  - "Cross-review insights (patterns across time)" in Phase 4 - vague
  - "Notifications/reminders" in Phase 4 - undefined scope
  - "Export functionality" in Phase 4 - format not specified

**Recommendation**: Split into 3 separate tasks aligned with phases 1-3. Phase 4 (Polish) should be separate feature requests with detailed specs.

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| DailyForm.tsx | ✅ EXISTS | Can be used as template for new forms |
| Daily API routes | ✅ EXISTS | Pattern established at `/api/reviews/daily` |
| Reviews directory structure | ✅ EXISTS | `/reviews/weekly/`, `/reviews/quarterly/`, `/reviews/annual/` all exist with TEMPLATE.md files |
| UI components (Button, Card, Input, Textarea, etc.) | ✅ EXISTS | All required shadcn/ui components available |
| Form validation (zod, react-hook-form) | ✅ EXISTS | Libraries installed and used in DailyForm |
| Config.ts | ⚠️ PARTIAL | Exists but only has REVIEWS_DAILY_PATH - needs weekly/quarterly/annual paths added |
| Types.ts | ⚠️ NEEDS UPDATE | No WeeklyReview, QuarterlyReview, or AnnualReview interfaces defined yet |
| Parsers | ⚠️ MISSING | No weekly/quarterly/annual parsers exist (only daily-review parser) |
| Goals files/API | ❌ NOT IMPLEMENTED | Referenced in quarterly review but doesn't exist |
| Frameworks pages | ❌ NOT IMPLEMENTED | Life Map, Vivid Vision, Lifestyle Costing pages don't exist |
| Uploads feature | ❌ NOT IMPLEMENTED | Referenced in annual review but doesn't exist |
| QuickActions component | ⚠️ NEEDS UPDATE | Only shows Daily Review button, needs multi-review support |
| ReviewsList component | ⚠️ NEEDS UPDATE | Only lists daily reviews, needs filtering by type |

**Critical Dependencies to Create**:
1. New path constants in `config.ts`
2. New type interfaces in `types.ts`
3. Parser/serializer functions for weekly, quarterly, annual reviews
4. Update QuickActions to support multiple review types
5. Update ReviewsList to filter by review type

**External Dependencies (Out of Scope)**:
- Goals file integration (should be separate task)
- Framework pages (should be separate task)
- Uploads feature (should be separate task)

## Environment Readiness

- **Branch available**: ✅ No `review-cadences` branch exists
- **Clean working tree**: ✅ No uncommitted changes
- **Tests passing**: ⚠️ Jest not installed in node_modules (needs `npm install`)
- **npm dependencies**: ⚠️ Need to run `npm install` in dashboard directory

## Blockers

### Critical Blockers

1. **Ambiguous Multi-Session Persistence** (AC3)
   - Annual review requires "progress saved between sessions" but implementation strategy is not defined
   - Blocking: Cannot implement annual review without knowing persistence mechanism
   - **Required**: Specify storage strategy (localStorage draft vs file-based vs database)

2. **Missing Parser Implementation Details**
   - Weekly and Quarterly templates have complex table structures that aren't addressed in data models
   - Example: Weekly template has "Time Leak" table with columns, but `WeeklyReview` interface only has `timeLeaks: string`
   - **Required**: Decide if complex template sections are simplified to text fields or parsed into structured data

3. **Unclear Integration Points**
   - Multiple references to non-existent features (goals, frameworks, uploads)
   - **Required**: Clarify which are manual instructions vs. actual integrations vs. out of scope

4. **Test Infrastructure Not Ready**
   - Jest not installed despite being in package.json
   - **Required**: Run `npm install` before starting

### Non-Blocking Issues

1. **No Linear Issue Reference** - Nice to have for tracking but not blocking
2. **Phase 4 (Polish) is under-specified** - Can be deferred to separate task
3. **File naming conventions need confirmation** - Can be decided during implementation

## Recommendations

### Before Implementation

1. **Run Environment Setup**
   ```bash
   cd dashboard && npm install
   ```

2. **Clarify Ambiguous Requirements** - Get answers to the 10 ambiguous items listed above

3. **Consider Task Splitting**
   - **Task 1**: Weekly Reviews (Phase 1) - 8-10 hours
   - **Task 2**: Quarterly Reviews (Phase 2) - 10-12 hours  
   - **Task 3**: Annual Reviews (Phase 3) - 16-20 hours
   - Each can be a separate PR with focused scope

4. **Update Dependencies First** (Quick PR)
   - Add type interfaces to `types.ts`
   - Add path constants to `config.ts`
   - Create parser/serializer skeletons
   - This creates foundation for all three review types

5. **Defer External Integrations**
   - Goals file integration → separate task
   - Framework pages → separate task
   - Uploads review → separate task
   - Memory.md editing → separate task
   - Mark these as "out of scope" for review cadences task

### Technical Suggestions

1. **Simplify Data Models**: Weekly/Quarterly templates have rich tables and checklists. Recommend starting with simplified text field storage (like daily reviews) rather than complex structured parsing.

2. **Reuse Daily Review Patterns**: Timer, auto-save draft, validation - all proven patterns to replicate

3. **Week Picker Implementation**: Recommend date input that calculates week start/end and displays as range text, rather than custom widget

4. **Annual Review Wizard**: Recommend tabbed interface on single page (like settings pages) rather than multi-route wizard for simplicity

## Decision

**Ready for Implementation**: NO - NEEDS_CLARIFICATION

**Reasoning**: 
The task document is well-structured with excellent technical design, but has 10+ ambiguous requirements that could lead to implementation mismatches. The scope is also too large for a single PR (38-48 hours). Critical blockers include unclear multi-session persistence strategy for annual reviews and missing details on how complex template structures should be parsed.

Additionally, the task references several non-existent features (goals, frameworks, uploads) without clarifying whether these are in-scope integrations or out-of-scope references.

**Required Actions Before Proceeding**:

1. **Clarification Required** (Blocking)
   - [ ] Define annual review session persistence mechanism (localStorage/file/database)
   - [ ] Specify how "links to frameworks" should be implemented (navigation buttons/markdown links/instructions)
   - [ ] Clarify file naming conventions for quarterly (`YYYY-QN.md`?) and confirm annual format
   - [ ] Decide if weekly/quarterly complex tables are simplified to text or parsed to structured data
   - [ ] Define week picker UI implementation (date range selector vs. custom widget)
   - [ ] Specify annual review wizard navigation (single page tabs vs. multi-route)
   - [ ] Clarify "uploads review" requirement (feature to build vs. manual instruction vs. defer)
   - [ ] Define memory.md integration (reminder text vs. editable field vs. separate page)
   - [ ] Specify goals file "reference" implementation (display content vs. link vs. defer)

2. **Environment Setup** (Non-blocking - can do during dev)
   - [ ] Run `npm install` in dashboard directory to install jest

3. **Recommended Task Restructuring** (Non-blocking - organizational)
   - [ ] Consider splitting into 3 separate PRs (Weekly, Quarterly, Annual)
   - [ ] Move Phase 4 (Polish) to separate feature requests
   - [ ] Create separate tasks for goals integration, framework pages, uploads feature

4. **Documentation Updates Needed**
   - [ ] Add Linear issue reference for tracking
   - [ ] Specify exact test scenarios (currently just test types listed)
   - [ ] Add error handling requirements
   - [ ] Define mobile responsiveness requirements more specifically

## Summary

This is a comprehensive, well-thought-out task document with excellent technical design. The data models are clear, the API structure follows established patterns, and the phased approach is logical. However, it's currently **NOT READY** for autonomous implementation due to:

1. **10+ ambiguous requirements** that need clarification to avoid rework
2. **Scope too large** for single PR (4 sprints) - recommend splitting
3. **Critical blocker** on annual review persistence strategy
4. **External dependencies** not clearly marked as in/out of scope

**Estimated time to resolve**: 1-2 hours of clarification discussion with product owner/stakeholder to answer the 10 ambiguous items and make architectural decisions on persistence and navigation patterns.

**Once clarified**, this task has all the necessary components for successful implementation: clear acceptance criteria, detailed technical design, existing patterns to follow, and comprehensive test requirements.
