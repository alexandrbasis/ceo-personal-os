/**
 * TypeScript interfaces for CEO Personal OS Dashboard
 */

/**
 * Domain ratings for Life Map - each domain is 0-10 (0 = not rated)
 */
export interface DomainRatings {
  career?: number;
  relationships?: number;
  health?: number;
  meaning?: number;
  finances?: number;
  fun?: number;
}

export interface DailyReview {
  date: string;                    // "2024-12-31"
  energyLevel: number;             // 1-10
  energyFactors?: string;
  meaningfulWin: string;
  frictionPoint?: string;
  frictionAction?: "address" | "letting_go";
  thingToLetGo?: string;
  tomorrowPriority: string;
  notes?: string;
  completionTimeMinutes?: number;
  domainRatings?: DomainRatings;   // Optional Life Map domain ratings
  filePath: string;
}

export interface DailyReviewFormData {
  date: string;
  energyLevel: number;
  energyFactors?: string;
  meaningfulWin: string;
  frictionPoint?: string;
  frictionAction?: "address" | "letting_go";
  thingToLetGo?: string;
  tomorrowPriority: string;
  notes?: string;
  completionTimeMinutes?: number;
  domainRatings?: DomainRatings;   // Optional Life Map domain ratings
}

export interface LifeMapDomain {
  score: number;         // 1-10 or 0 if not set
  assessment?: string;
}

export interface LifeMap {
  domains: {
    career: LifeMapDomain;
    relationships: LifeMapDomain;
    health: LifeMapDomain;
    meaning: LifeMapDomain;
    finances: LifeMapDomain;
    fun: LifeMapDomain;
  };
  lastUpdated?: string;
}

export interface Goal {
  number: number;
  category: string;
  what?: string;
  whyMatters?: string;
  successCriteria?: string;
  milestones?: {
    Q1?: string;
    Q2?: string;
    Q3?: string;
    Q4?: string;
  };
}

export interface GoalsSummary {
  year?: string;
  goals: Goal[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReviewListItem {
  date: string;
  energyLevel: number;
  tomorrowPriority: string;
  filePath: string;
  type?: 'daily';
}

/**
 * Union type for any review list item
 */
export type AnyReviewListItem = (ReviewListItem & { type?: 'daily' }) | WeeklyReviewListItem;

/**
 * Weekly Review - 20 minute reflection on the week
 */
export interface WeeklyReview {
  date: string;                    // Week start date "YYYY-MM-DD" (Monday)
  weekNumber: number;              // 1-52
  movedNeedle: string;             // What actually moved the needle this week
  noiseDisguisedAsWork: string;    // What was noise disguised as work
  timeLeaks: string;               // Where your time leaked
  strategicInsight: string;        // One strategic insight
  adjustmentForNextWeek: string;   // One adjustment for next week
  notes?: string;
  duration?: number;               // Minutes spent on review
  filePath: string;
}

export interface WeeklyReviewFormData {
  date: string;                    // Week start date
  weekNumber: number;
  movedNeedle: string;
  noiseDisguisedAsWork: string;
  timeLeaks: string;
  strategicInsight: string;
  adjustmentForNextWeek: string;
  notes?: string;
  duration?: number;
}

export interface WeeklyReviewListItem {
  date: string;
  weekNumber: number;
  movedNeedle: string;
  filePath: string;
  type: 'weekly';
}
