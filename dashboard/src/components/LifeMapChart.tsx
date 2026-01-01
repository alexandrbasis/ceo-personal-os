'use client';

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export interface LifeMapChartData {
  domain: string;
  score: number | null | undefined;
}

export interface EnergyTrendDataItem {
  date: string;
  energy: number;
}

export interface LifeMapChartProps {
  data: LifeMapChartData[];
  height?: number;
  /** Whether the user has any daily reviews (used to determine empty state) */
  hasReviews?: boolean;
  /** Energy trend data for fallback visualization */
  energyTrendData?: EnergyTrendDataItem[];
  /** Whether to show energy trend chart as fallback when domain data is empty */
  showEnergyTrendFallback?: boolean;
}

/**
 * LifeMapChart - Radar chart displaying 6 life domains
 * Uses Recharts RadarChart with responsive container
 */
export function LifeMapChart({ data, height = 400 }: LifeMapChartProps) {
  // Normalize data - convert null/undefined scores to 0
  const normalizedData = data.map((item) => ({
    domain: item.domain,
    score: item.score ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={normalizedData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" />
        <PolarRadiusAxis angle={90} domain={[0, 10]} />
        <Radar
          name="Life Map"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
