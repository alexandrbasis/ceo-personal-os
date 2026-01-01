'use client';

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { isDataEmpty } from '@/lib/utils/life-map-aggregation';

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
 * Falls back to energy trend line chart when domain data is unavailable
 */
export function LifeMapChart({
  data,
  height = 400,
  hasReviews = true,
  energyTrendData = [],
  showEnergyTrendFallback = false,
}: LifeMapChartProps) {
  // Normalize data - convert null/undefined scores to 0
  const normalizedData = data.map((item) => ({
    domain: item.domain,
    score: item.score ?? 0,
  }));

  const dataIsEmpty = isDataEmpty(normalizedData);

  // Case 1: No reviews at all - show empty state
  if (dataIsEmpty && !hasReviews) {
    return (
      <div
        data-testid="empty-state"
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
          Complete your first review
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Start tracking your life domains by completing a daily review.
        </p>
      </div>
    );
  }

  // Case 2: Domain data is empty but we have energy trend data - show energy trend fallback
  if (dataIsEmpty && showEnergyTrendFallback && energyTrendData.length > 0) {
    return (
      <div style={{ height }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Energy Trend</p>
          <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            Add domain ratings in daily reviews to unlock full Life Map
          </p>
        </div>
        <ResponsiveContainer width="100%" height={height - 60}>
          <LineChart data={energyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: '#8884d8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Case 3: Regular radar chart with domain data
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
