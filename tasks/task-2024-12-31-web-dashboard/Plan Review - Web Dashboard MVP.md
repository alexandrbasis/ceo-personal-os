# Plan Review - CEO Personal OS Web Dashboard MVP

**Date**: 2024-12-31 | **Reviewer**: AI Plan Reviewer
**Task**: `/tasks/task-2024-12-31-web-dashboard/` | **Linear**: TBD | **Status**: NEEDS REVISIONS

## Summary

The technical decomposition document is well-structured with comprehensive test planning and clear implementation steps. However, there are critical gaps between the spec and the implementation plan, particularly around parser implementation depth, missing spec requirements (Goals Snapshot), and format misalignment with actual existing markdown templates. The plan delivers real functionality but requires revisions to handle actual file formats correctly.

## Analysis

### Strengths

- **Comprehensive TDD approach**: Detailed Gherkin test scenarios covering parsers, API routes, components, and E2E flows
- **Clear technology stack**: Next.js 14 + shadcn/ui + Recharts is appropriate for the MVP scope
- **Well-defined API contracts**: RESTful endpoints with TypeScript interfaces
- **Risk mitigation table**: Practical approach to file system errors and parsing failures
- **Explicit out-of-scope definition**: Clear boundaries for MVP vs future iterations
- **Detailed shadcn/ui integration notes**: Proper understanding of the component library workflow
- **File system access patterns**: Atomic writes and proper encoding considerations

### Reality Check Issues

- **Functional Implementation**: The plan delivers real functionality (forms, parsers, API routes, file I/O) - this is NOT a mockup
- **Depth Concern**: Parser implementation lacks specific regex patterns for ACTUAL template format (see Critical Issues)
- **Value Question**: Users will get actual working daily review forms and life map visualization - real value delivered
- **Template Format Mismatch**: The tech decomposition shows a markdown format that differs from the ACTUAL `reviews/daily/TEMPLATE.md` file structure

### Critical Issues

1. **Markdown Format Mismatch Between Spec and Reality**
   - **Problem**: The tech decomposition document shows a parsed format like:
     ```markdown
     ## Energy
     **Level:** 7/10
     ```
     But the actual `reviews/daily/TEMPLATE.md` uses:
     ```markdown
     ## Energy Check
     **Energy level (1-10):** [ ]
     ```
   - **Impact**: Parser will fail to extract data from actual files users create
   - **Recommendation**: Update parser tests (T2) and implementation to match ACTUAL template format:
     - Section header: `## Energy Check` (not `## Energy`)
     - Field format: `**Energy level (1-10):**` (not `**Level:**`)
     - Checkbox format for friction action: `[ ] Needs action` / `[ ] Just needs acknowledgment`

2. **Missing Goals Snapshot Requirement**
   - **Problem**: SPEC-web-dashboard.md specifies "Goals Snapshot" component showing 3-5 goals from `goals/1_year.md` with status indicators
   - **Impact**: Incomplete MVP delivery - spec requirement not addressed
   - **Recommendation**: Either:
     - Add Step for Goals Snapshot component + `/api/goals` route
     - Or explicitly move to "Out of Scope" with justification

3. **Missing Life Map Parser Implementation Details**
   - **Problem**: Life map parser test (T3) shows simple table parsing, but actual `frameworks/life_map.md` has empty score cells by default
   - **Impact**: Parser may fail on unfilled templates
   - **Recommendation**: Add test scenario for completely empty table (default template state):
     ```gherkin
     Scenario: Parse unfilled life map template
       Given life_map.md with empty score cells (default template)
       When I parse the life map
       Then all scores return 0
       And parser does not error
     ```

4. **No Markdown Generation/Serialization Tests**
   - **Problem**: Tests cover parsing markdown TO JSON but not generating markdown FROM form data
   - **Impact**: POST endpoint requires generating markdown from DailyReviewFormData - untested path
   - **Recommendation**: Add test section T2.5 for markdown serialization:
     ```gherkin
     Feature: Daily Review Markdown Generator
     Scenario: Generate markdown from form data
       Given DailyReviewFormData with all fields
       When I call generateDailyReviewMarkdown()
       Then output matches expected markdown format
       And file is human-readable
     ```

### Major Issues

1. **Test Commands Reference Non-Existent Scripts**
   - **Problem**: Test commands reference `npm run test:components` and `npm run test:api` but package.json only defines a generic `jest` command
   - **Impact**: Developer confusion during TDD workflow
   - **Recommendation**: Add explicit Jest configuration with test path patterns:
     ```json
     "test:unit": "jest --testPathPattern=lib",
     "test:components": "jest --testPathPattern=components --config jest.config.component.js",
     "test:api": "jest --testPathPattern=api"
     ```

2. **View/Edit Page Ambiguity**
   - **Problem**: `/daily/[date]` page has dual purpose (view AND edit) per spec, but Step 5 implementation is unclear on mode switching
   - **Impact**: Unclear UX - does user see rendered markdown or form?
   - **Recommendation**: Clarify page behavior:
     - Default: View mode (rendered markdown)
     - Edit button: Switch to form with pre-filled data
     - Add mode state management to sub-step acceptance criteria

3. **Environment Variable Path Handling**
   - **Problem**: `MARKDOWN_BASE_PATH` with spaces in path (iCloud folder) may cause issues
   - **Impact**: File operations could fail on paths with spaces
   - **Recommendation**: Add explicit test for path handling with spaces in integration tests

4. **Missing Error State Component Tests**
   - **Problem**: Components tests show happy paths but no error state testing
   - **Impact**: Poor UX when API fails or data is malformed
   - **Recommendation**: Add error state scenarios:
     ```gherkin
     Scenario: LifeMapChart handles API error
       Given /api/life-map returns 500
       When dashboard loads
       Then error message is displayed
       And retry button is available
     ```

### Minor Improvements

1. **Add Date Formatting Utility Tests**
   - `utils.ts` mentioned but no specific tests for date formatting functions
   - Add tests for `formatReviewDate()`, `parseReviewDate()`, etc.

2. **LocalStorage Draft Key Naming**
   - No specification for localStorage key format
   - Recommend: `ceo-os-daily-draft-${date}` to support multiple drafts

3. **Toast Provider Missing from Layout**
   - Step 5 mentions Toaster but Step 1 layout.tsx doesn't include it
   - Add to Step 1 file list or Step 5 requirements

4. **Recharts Import Size**
   - Recharts is large bundle; consider tree-shaking specific imports
   - Document in Technical Notes

## Implementation Analysis

**Structure**: Good
**Functional Depth**: Real Implementation
**Steps**: 7 well-sequenced steps with clear objectives | **Criteria**: Mostly measurable | **Tests**: Comprehensive TDD planning with gaps
**Reality Check**: This delivers working functionality users can actually use for daily reviews

### Critical Issues Checklist
- [ ] **Template Format**: Update T2 parser tests to match actual `TEMPLATE.md` format -> Parsers will fail without this -> Align regex patterns with actual template
- [ ] **Goals Snapshot**: Add or explicitly defer -> Missing spec requirement -> Add Step 4.5 or update Out of Scope
- [ ] **Markdown Generation**: Add T2.5 serialization tests -> POST endpoint untested -> Add generator tests

### Major Issues Checklist
- [ ] **Test Script Definitions**: Define all test commands in package.json -> Developer workflow blocked -> Add scripts in Step 6
- [ ] **View/Edit Page Mode**: Clarify mode switching behavior -> UX ambiguity -> Add state management details in Step 5
- [ ] **Path with Spaces**: Test iCloud path handling -> Potential file I/O failures -> Add integration test

### Minor Improvements Checklist
- [ ] **Date Utils Tests**: Add utility function tests
- [ ] **LocalStorage Key Format**: Specify draft key naming convention
- [ ] **Toaster in Layout**: Add to Step 1 or clarify in Step 5
- [ ] **Recharts Tree-Shaking**: Document bundle optimization

## Risk & Dependencies

**Risks**: Adequate
**Dependencies**: Well Planned

| Risk | Assessment |
|------|------------|
| Markdown parsing fails | Addressed with best-effort parsing |
| File system errors | Clear error messages planned |
| Concurrent edits | Acceptable for single-user |
| Large file reads | Lazy loading mentioned |
| **NEW: iCloud path with spaces** | Not addressed - needs test |
| **NEW: Empty template files** | Partially addressed - needs more test cases |

**Dependency Flow**: Correct sequencing - Step 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

## Testing & Quality

**Testing**: Good with gaps
**Functional Validation**: Tests Real Usage with missing serialization path
**Quality**: Well Planned

| Test Category | Coverage | Notes |
|---------------|----------|-------|
| Parser Unit Tests | 80% | Missing serialization, empty template cases |
| API Route Tests | 90% | Comprehensive CRUD coverage |
| Component Tests | 85% | Missing error states |
| E2E Tests | 70% | Happy path only |

**Missing Test Areas**:
1. Markdown generation from form data
2. Error state handling in components
3. Path with special characters
4. Empty/unfilled template parsing
5. LocalStorage draft recovery

## Success Criteria

**Quality**: Good
**Missing Criteria**:
- Success criteria for file round-trip (create -> read -> edit -> read)
- Explicit acceptance criteria for markdown remaining human-readable after edits
- Performance baseline for cold start vs cached data

**Existing Criteria Assessment**:
| Criterion | Measurable | Testable |
|-----------|------------|----------|
| Review in <5 minutes | Yes | Manual timing |
| Dashboard loads <2s | Yes | E2E performance test |
| Markdown human-readable | Subjective | Needs concrete definition |
| No data loss | Yes | Integration test |

## Technical Approach

**Soundness**: Solid
**Debt Risk**: Low

The tech stack (Next.js 14 + shadcn/ui + Recharts) is appropriate and well-understood. File-based data storage is correct for single-user local app. No major architectural concerns.

**Potential Debt Areas**:
- Regex-based parser could become fragile with format variations
- No data migration strategy if markdown format changes
- Recommend: Document expected markdown format version in files

## Recommendations

### Immediate (Critical) - Must Fix Before Implementation

1. **Update Parser Tests to Match Actual Template Format**
   - Review `reviews/daily/TEMPLATE.md` section headers and field formats
   - Update T2 test scenarios with correct regex patterns
   - Update implementation plan regex examples

2. **Address Goals Snapshot Requirement**
   - Either add implementation step for Goals Snapshot + `/api/goals` API
   - Or explicitly add to "Out of Scope" section with rationale

3. **Add Markdown Serialization Tests**
   - Create new test section T2.5 for `generateDailyReviewMarkdown()`
   - Ensure round-trip consistency (parse -> modify -> serialize -> parse)

### Strongly Recommended (Major) - Should Fix

1. **Clarify View/Edit Page Behavior**
   - Document mode switching in Step 5
   - Add acceptance criteria for both modes
   - Specify how "Edit" button triggers mode change

2. **Complete Test Script Definitions**
   - Add all test commands to package.json in Step 6
   - Ensure test:components, test:api, test:e2e are properly configured

3. **Add Error State Component Tests**
   - Extend T5 with error handling scenarios
   - Test loading, error, and empty states for all data-fetching components

### Nice to Have (Minor) - Can Proceed Without

1. **Document LocalStorage Key Naming Convention**
2. **Add Date Utility Function Tests**
3. **Note Recharts Bundle Optimization**
4. **Add Toaster Provider to Step 1 Layout**

## Decision Criteria

**APPROVED FOR IMPLEMENTATION**: Critical issues resolved, clear technical requirements aligned with business approval, excellent step decomposition, comprehensive testing strategy, practical risk mitigation, measurable success criteria. Ready for `si` or `ci` command.

**NEEDS MAJOR REVISIONS**: Critical technical gaps (parser format mismatch, missing spec requirement), unclear implementation steps for view/edit page, inadequate testing for serialization path. Requires significant updates before implementation.

**NEEDS CLARIFICATIONS**: Minor technical clarifications needed, generally sound implementation plan, small improvements recommended. Can proceed after quick updates.

## Final Decision

**Status**: NEEDS REVISIONS

**Rationale**: While the technical decomposition is well-structured and delivers real functionality, there are 3 critical issues that would cause implementation failures:
1. Parser tests use wrong markdown format (different from actual templates)
2. Goals Snapshot from spec is completely missing
3. No tests for markdown generation (POST endpoint core functionality)

These are not minor oversights - they represent fundamental gaps that would block successful implementation.

**Strengths**:
- Comprehensive TDD approach with detailed test scenarios
- Clear 7-step implementation sequence
- Proper tech stack selection
- Good risk mitigation planning
- Real functional value delivered (not a mockup)

**Implementation Readiness**: NOT ready for `si` command. Revisions required.

## Next Steps

### Before Implementation (si/ci commands):

1. **Critical**: Update T2 parser tests to match actual `reviews/daily/TEMPLATE.md` format:
   - Change `## Energy` to `## Energy Check`
   - Change `**Level:** X/10` to `**Energy level (1-10):** X`
   - Update friction action format to checkbox style

2. **Critical**: Add Goals Snapshot requirement:
   - Add parser for `goals/1_year.md`
   - Add `/api/goals` endpoint
   - Add GoalsSnapshot component
   - OR explicitly move to Out of Scope with justification

3. **Critical**: Add T2.5 - Markdown Serialization Tests:
   - Test `generateDailyReviewMarkdown(formData)` function
   - Verify round-trip consistency

4. **Clarify**: View/Edit page mode switching behavior

5. **Revise**: Add error state tests for components

### Revision Checklist:
- [ ] T2 parser tests match actual `TEMPLATE.md` format
- [ ] Goals Snapshot addressed (implemented or deferred)
- [ ] Markdown serialization tests added (T2.5)
- [ ] View/Edit page mode documented in Step 5
- [ ] Test scripts defined in package.json (Step 6)
- [ ] Error state component tests added (T5)

### Implementation Readiness:
- **If APPROVED**: Ready for `si` (new implementation) or `ci` (continue implementation)
- **NEEDS REVISIONS**: Update tech-decomposition-web-dashboard.md, address critical issues, re-run review
- **If CLARIFICATIONS**: Quick updates needed, then proceed to implementation

## Quality Score: 6.5/10

**Breakdown**:
| Category | Score | Notes |
|----------|-------|-------|
| Business Alignment | 7/10 | Missing Goals Snapshot from spec |
| Implementation Plan | 7/10 | Good structure, format mismatch |
| Risk Management | 7/10 | Solid but missing path handling |
| Testing Strategy | 6/10 | Comprehensive but missing critical paths |
| Success Criteria | 6/10 | Some subjective criteria |

---

*Review completed: 2024-12-31*
*Reviewer: AI Plan Reviewer (Claude Opus 4.5)*
