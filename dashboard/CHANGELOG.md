# Changelog

All notable changes to the CEO Personal OS Web Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-31

### Added

- **Daily Review Form** - Create and edit daily check-ins via web form
  - Energy level slider (1-10)
  - Meaningful win, friction point, thing to let go fields
  - Tomorrow's priority and optional notes
  - Elapsed timer and localStorage draft saving
  - Form validation with real-time feedback

- **Life Map Visualization** - Radar chart showing 6 life domains
  - Career, Relationships, Health, Meaning, Finances, Fun
  - Scores parsed from `frameworks/life_map.md`
  - Interactive Recharts visualization

- **Recent Reviews List** - Browse and view past reviews
  - Energy level badges (color-coded)
  - Tomorrow's priority preview
  - Links to detail pages

- **Quick Actions** - Status indicator and quick access
  - Review status (green/yellow/red based on last review)
  - "Start Daily Review" button

- **API Endpoints**
  - `GET/POST /api/reviews/daily` - List and create reviews
  - `GET/PUT /api/reviews/daily/[date]` - Fetch and update specific review
  - `GET /api/life-map` - Fetch life map scores

- **Direct Markdown R/W** - No database, read/write markdown files directly
  - Daily reviews stored in `reviews/daily/YYYY-MM-DD.md`
  - Life map parsed from `frameworks/life_map.md`
  - Human-readable file format preserved

### Technical Details

- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS with shadcn/ui components
- Recharts for data visualization
- Jest + React Testing Library (147 tests)
- Playwright E2E tests ready (40 tests)

---

**PR**: #1
**Branch**: alexandrbasis/des-moines
