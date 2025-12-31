/**
 * TypeScript interfaces for CEO Personal OS Dashboard
 */

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
}
