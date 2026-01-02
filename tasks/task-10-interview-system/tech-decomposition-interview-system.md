# Technical Task: Interview System

## Overview
Add guided self-interview functionality for the 3 interviews from README.

## Problem Statement
Dashboard lacks the interview system - structured thinking exercises from README:
- Past Year Reflection
- Identity and Values
- Future Self Interview

## Acceptance Criteria

### AC1: Interview List Page
- [ ] Page at `/interviews` listing all 3 interviews
- [ ] Show completion status for each
- [ ] Description of each interview's purpose

### AC2: Interview Experience
- [ ] Page at `/interviews/[interview-name]`
- [ ] Step-by-step question flow (one question at a time)
- [ ] Progress indicator
- [ ] Save answers between sessions
- [ ] Timer tracking

### AC3: Interviews Content
- [ ] **Past Year Reflection** (`interviews/past_year_reflection.md`)
  - What happened, what it meant, what you learned
- [ ] **Identity and Values** (`interviews/identity_and_values.md`)
  - Who you are beneath the role
- [ ] **Future Self Interview** (`interviews/future_self_interview.md`)
  - Advice from ten-years-ahead you

### AC4: API & Storage
- [ ] `GET /api/interviews/[name]` - get interview questions
- [ ] `POST /api/interviews/[name]/responses` - save responses
- [ ] Store responses alongside interview files or in separate directory

## Test Plan
- API route tests
- Component tests for interview stepper
- E2E test for completing interview

## Implementation Steps
1. Create interview parser to extract questions from markdown
2. Create `InterviewStepper.tsx` component
3. Create API routes
4. Create pages: `/interviews`, `/interviews/[name]`
5. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
