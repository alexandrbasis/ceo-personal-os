# Test Plan - Critical Bug Fixes

**Date**: 2026-01-01
**Status**: Complete - Tests Written & Compiling
**Implementation**: Option B - Add 6 domain ratings to daily review form

## Summary

- **Total Criteria**: 3 (AC1, AC2, AC3)
- **Test Files Created**: 5
- **Total Test Cases**: 97 (76 failing, 21 passing)
- **Tests Compiling**: Yes (TypeScript errors fixed)
- **Ready for Implementation**: Yes

## Stub Modules Created

The following stub modules were created to allow tests to compile:
- `src/lib/utils/life-map-aggregation.ts` - Stub with "Not implemented" errors
- `src/lib/utils/date-formatting.ts` - Stub with "Not implemented" errors
- `src/components/ui/client-date.tsx` - Stub with "Not implemented" error

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Status |
|---|-----------|-----------|-----------|--------|
| AC1.1 | Life Map shows radar chart when reviews exist | Integration | `LifeMapChart.critical-bugs.test.tsx` | Written (FAILING) |
| AC1.2 | Energy Level populates meaningful metric | Unit | `life-map-aggregation.test.ts` | Written (FAILING) |
| AC1.3 | Alternative visualization when 6-domain unavailable | Component | `LifeMapChart.critical-bugs.test.tsx` | Written (FAILING) |
| AC1.4 | Empty state only for truly no data | Component | `LifeMapChart.critical-bugs.test.tsx` | Written (FAILING) |
| AC2.1 | No hydration mismatch errors | Component | `hydration.test.tsx` | Written (FAILING) |
| AC2.2 | No red "1 Issue" error badge | Component | `hydration.test.tsx` | Written (FAILING) |
| AC2.3 | Date formatting consistent SSR/client | Unit | `date-formatting.test.ts` | Written (FAILING) |
| AC2.4 | Identical SSR and client rendering | Component | `hydration.test.tsx` | Written (FAILING) |
| AC3.1 | Red icons removed or explained | Component | `DailyForm.critical-bugs.test.tsx` | Written (FAILING) |
| AC3.2 | Tooltip explains icon purpose | Component | `DailyForm.critical-bugs.test.tsx` | Written (FAILING) |
| AC3.3 | No user confusion about errors | Component | `DailyForm.critical-bugs.test.tsx` | Written (FAILING) |

## Test Files Created

### 1. `src/__tests__/components/LifeMapChart.critical-bugs.test.tsx`
**Test Cases**: 14
- AC1.1: Radar chart display with domain data (3 tests)
- AC1.2: Energy level as meaningful metric (2 tests)
- AC1.3: Alternative visualization fallback (2 tests)
- AC1.4: Empty state conditions (3 tests)
- Edge cases (4 tests)

### 2. `src/__tests__/lib/life-map-aggregation.test.ts`
**Test Cases**: 23
- aggregateDomainScores (6 tests)
- deriveDomainsFromEnergy (3 tests)
- combineAggregatedWithDerived (2 tests)
- isDataEmpty (4 tests)
- shouldShowEmptyState (3 tests)
- getEnergyTrendData (3 tests)
- convertToChartData (2 tests)

### 3. `src/__tests__/components/hydration.test.tsx`
**Test Cases**: 12
- AC2.1 & AC2.2: Hydration mismatch prevention (3 tests)
- AC2.3: Date formatting consistency (2 tests)
- AC2.4: SSR/client parity (4 tests)
- Date input field (2 tests)
- Date formatting utilities (1 test block)

### 4. `src/__tests__/lib/date-formatting.test.ts`
**Test Cases**: 16
- formatDateForForm (6 tests)
- formatDisplayDate (4 tests)
- getTodayISOString (3 tests)
- compareDates (3 tests)
- isToday (4 tests)
- parseISODate (3 tests)
- SSR/Client consistency (1 test)

### 5. `src/__tests__/components/DailyForm.critical-bugs.test.tsx`
**Test Cases**: 20
- AC3.1: Red icons (4 tests)
- AC3.2: Tooltips (2 tests)
- AC3.3: Error clarity (4 tests)
- Option B: Domain ratings section (7 tests)
- Domain ratings validation (2 tests)
- Pre-filled data (1 test)

## New Modules Required for Implementation

The tests expect these new modules to be created:

### `src/lib/utils/life-map-aggregation.ts`
Functions needed:
- `aggregateDomainScores(reviews)` - Average domain scores from reviews
- `deriveDomainsFromEnergy(reviews)` - Derive health from energy level
- `combineAggregatedWithDerived(aggregated, derived)` - Merge results
- `isDataEmpty(data)` - Check if all scores are 0
- `shouldShowEmptyState(data, hasReviews)` - Determine empty state
- `getEnergyTrendData(reviews)` - Extract energy for trend chart
- `convertToChartData(scores)` - Convert to chart format

### `src/lib/utils/date-formatting.ts`
Functions needed:
- `formatDateForForm(date)` - YYYY-MM-DD format
- `formatDisplayDate(date)` - Human-readable, consistent
- `getTodayISOString()` - Today as YYYY-MM-DD
- `compareDates(date1, date2)` - Date comparison
- `isToday(dateString)` - Check if date is today
- `parseISODate(dateString)` - Parse YYYY-MM-DD string

### `src/components/ui/client-date.tsx`
Component for client-only date rendering to avoid hydration issues

### Updates to `src/components/LifeMapChart.tsx`
- Add `hasReviews` prop
- Add `energyTrendData` prop
- Add `showEnergyTrendFallback` prop
- Implement empty state with "complete your first review" message
- Implement energy trend chart fallback

### Updates to `src/components/DailyForm.tsx`
- Add collapsible domain ratings section
- Add 6 domain input fields (career, relationships, health, meaning, finances, fun)
- Include domainRatings in form data

### Updates to `src/lib/types.ts`
```typescript
interface DomainRatings {
  career?: number;
  relationships?: number;
  health?: number;
  meaning?: number;
  finances?: number;
  fun?: number;
}

interface DailyReview {
  // ... existing fields
  domainRatings?: DomainRatings;
}
```

## Verification Commands

Run all new tests:
```bash
npm run test -- --testPathPatterns="critical-bugs|life-map-aggregation|date-formatting|hydration"
```

Current output (stubs not implemented):
```
Test Suites: 5 failed, 5 total
Tests:       76 failed, 21 passed, 97 total
```

Expected output after implementation:
```
Tests: 0 failed, 97 passed
```

## Ready for Implementation

All tests are written and failing. Implementation can begin following this order:

1. **Phase 1**: Create utility modules (`life-map-aggregation.ts`, `date-formatting.ts`)
2. **Phase 2**: Update `LifeMapChart.tsx` with new props and fallback behavior
3. **Phase 3**: Update `DailyForm.tsx` with domain ratings section
4. **Phase 4**: Fix hydration issues with `suppressHydrationWarning` or client-only components
5. **Phase 5**: Run tests and fix any remaining failures
