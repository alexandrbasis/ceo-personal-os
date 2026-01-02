# CEO Personal OS - Web Dashboard MVP

## Overview

A localhost web application providing a user-friendly interface for the CEO Personal OS framework. Replaces manual file editing with forms and visualizations while keeping markdown files as the single source of truth.

**Launch command**: `npm run dev` → `localhost:3000`

## Problem Statement

Current workflow pain points:
- Difficult to navigate between files
- Inconvenient to fill templates in text editor
- No visualization of progress/trends
- No reminders for regular reviews

## Selected Approach

**MVP Dashboard** with:
- Daily review form
- Life Map visualization
- Recent reviews list
- Direct markdown file read/write (no database)

**Tech Stack**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts (for radar chart)

**UI Style**: Minimalist - clean, calm, lots of whitespace, reflection-focused

## Architecture

### Project Structure

```
ceo-personal-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard (главная)
│   │   ├── layout.tsx          # Root layout
│   │   ├── daily/
│   │   │   ├── page.tsx        # Daily Review form
│   │   │   └── [date]/page.tsx # View specific review
│   │   ├── reviews/
│   │   │   └── page.tsx        # All reviews list
│   │   └── api/
│   │       ├── reviews/
│   │       │   └── daily/
│   │       │       ├── route.ts        # GET list, POST create
│   │       │       └── [date]/route.ts # GET/PUT specific
│   │       └── life-map/
│   │           └── route.ts    # GET life map scores
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── LifeMapChart.tsx    # Radar chart for 6 domains
│   │   ├── DailyForm.tsx       # Daily review form
│   │   ├── ReviewsList.tsx     # Recent reviews list
│   │   └── QuickActions.tsx    # Action buttons
│   └── lib/
│       ├── markdown.ts         # Read/write .md files
│       ├── parsers/
│       │   ├── daily-review.ts # Parse daily review files
│       │   └── life-map.ts     # Parse life_map.md
│       └── utils.ts            # Date formatting, etc.
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── [existing md files...]      # Untouched
```

### Data Flow

```
User fills form → API Route → Generate markdown → Write to reviews/daily/YYYY-MM-DD.md
                     ↑
User opens app → API Route → Read markdown files → Parse → Return JSON → Render UI
```

## Pages Specification

### 1. Dashboard (`/`)

**Layout**: Single page with sidebar on larger screens

**Components**:

1. **Life Map Radar Chart** (центр)
   - 6 axes: Career, Relationships, Health, Meaning, Finances, Fun
   - Data source: `frameworks/life_map.md`
   - Clickable axes → future: navigate to domain details
   - shadcn: Card wrapper

2. **Quick Actions** (top right)
   - Primary button: "Start Daily Review" → `/daily`
   - Status indicator:
     - Green: "Last review: Today"
     - Yellow: "Last review: Yesterday"
     - Red: "No review for 2+ days"

3. **Recent Reviews** (below chart)
   - Last 5 daily reviews
   - Each item shows:
     - Date (formatted: "Dec 31, 2024")
     - Energy level (colored badge 1-10)
     - Tomorrow's priority (truncated)
   - Click → `/daily/[date]`

4. **Goals Snapshot** (sidebar or bottom)
   - 3-5 goals from `goals/1_year.md`
   - Status: On Track / Needs Attention / Behind
   - Based on quarterly progress if available

### 2. Daily Review Form (`/daily`)

**Purpose**: Create new daily check-in

**Form Fields** (from TEMPLATE.md):

| Field | Component | Validation |
|-------|-----------|------------|
| Date | DatePicker (shadcn) | Default: today |
| Energy Level | Slider 1-10 | Required |
| Energy Factors | Textarea | Optional |
| One Meaningful Win | Textarea | Required |
| Friction Point | Textarea | Optional |
| Friction Action | RadioGroup: "Will address" / "Letting go" | If friction filled |
| Thing to Let Go | Textarea | Optional |
| Tomorrow's Priority | Textarea | Required |
| Notes | Textarea | Optional |

**Behavior**:
- Auto-save draft to localStorage every 30s
- Timer showing elapsed time
- On submit:
  1. Generate markdown from form data
  2. POST to `/api/reviews/daily`
  3. Create file `reviews/daily/YYYY-MM-DD.md`
  4. Redirect to `/` with toast "Daily review saved"

**Existing Review Warning**:
- If review exists for selected date, show warning
- Option to edit existing or create new

### 3. View Daily Review (`/daily/[date]`)

**Purpose**: View a specific daily review

**Layout**:
- Rendered markdown content
- Edit button → opens form with prefilled data
- Navigation: Previous/Next day

### 4. Reviews List (`/reviews`)

**Purpose**: Browse all reviews

**Features**:
- Filterable by type: Daily / Weekly / Quarterly / Annual
- Sortable by date
- Search (future iteration)

**MVP**: Only daily reviews listed

## API Specification

### GET `/api/reviews/daily`

Returns list of all daily reviews.

**Response**:
```typescript
{
  reviews: Array<{
    date: string;           // "2024-12-31"
    energyLevel: number;    // 1-10
    tomorrowPriority: string;
    filePath: string;
  }>
}
```

### POST `/api/reviews/daily`

Creates new daily review.

**Request Body**:
```typescript
{
  date: string;
  energyLevel: number;
  energyFactors?: string;
  meaningfulWin: string;
  frictionPoint?: string;
  frictionAction?: "address" | "letting_go";
  thingToLetGo?: string;
  tomorrowPriority: string;
  notes?: string;
  completionTimeMinutes: number;
}
```

**Response**: `{ success: true, filePath: string }`

### GET `/api/reviews/daily/[date]`

Returns specific daily review parsed to JSON.

### PUT `/api/reviews/daily/[date]`

Updates existing daily review.

### GET `/api/life-map`

Returns current Life Map scores.

**Response**:
```typescript
{
  domains: {
    career: { score: number; assessment: string };
    relationships: { score: number; assessment: string };
    health: { score: number; assessment: string };
    meaning: { score: number; assessment: string };
    finances: { score: number; assessment: string };
    fun: { score: number; assessment: string };
  };
  lastUpdated?: string;
}
```

## Markdown Format

### Daily Review File Structure

```markdown
# Daily Check-In: December 31, 2024

## Energy
**Level:** 7/10
**Affecting factors:** Good sleep, but heavy meeting load

## One Meaningful Win
Closed the partnership deal we've been working on for 3 months.

## One Friction Point
**What:** Back-to-back meetings left no time for deep work
**Action:** Won't address - letting go

## One Thing to Let Go
The guilt about not responding to all Slack messages immediately.

## Tomorrow's Priority
Finish the Q1 planning document.

## Notes
Remember to block calendar for focus time next week.

---
*Completed in 4 minutes*
```

### Parsing Strategy

Use regex patterns to extract structured data from markdown:
- `**Level:** (\d+)/10` → energyLevel
- Section headers (`## One Meaningful Win`) → content until next section
- `**Action:** (.+)` → frictionAction

## UI Components (shadcn/ui)

Required components:
- `button` - primary actions
- `card` - containers
- `input` - text inputs
- `textarea` - multiline text
- `slider` - energy level
- `radio-group` - friction action choice
- `toast` - notifications
- `calendar` / `date-picker` - date selection

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "gray-matter": "^4.0.3",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0"
  }
}
```

## Edge Cases & Error Handling

1. **File not found**: Return empty state, suggest creating first review
2. **Malformed markdown**: Best-effort parsing, show raw content if fails
3. **Duplicate date**: Warn user, offer to edit existing
4. **File system errors**: Toast with error, log details
5. **Concurrent edits**: Last write wins (acceptable for single-user)

## Success Metrics

- User completes daily review in <5 minutes
- Dashboard loads in <2 seconds
- Markdown files remain human-readable
- No data loss during save/edit operations

## Future Iterations (Not in MVP)

1. Weekly/Quarterly/Annual review forms
2. Goals editor
3. Email/push reminders (would need external service)
4. Search across all documents
5. Life Map trend visualization over time
6. Interview mode (guided questions)
7. PDF export
8. Mobile-responsive improvements

## Open Questions

None - all decisions made during brainstorming.

---

*Created: 2024-12-31*
*Approach: MVP Dashboard with markdown backend*
*Stack: Next.js + shadcn/ui + Tailwind*
