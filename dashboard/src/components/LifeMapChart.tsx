'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

export interface LifeMapChartData {
  domain: string;
  score: number | null | undefined;
}

export interface LifeMapChartProps {
  data: LifeMapChartData[];
  height?: number;
}

// Mobile-friendly label abbreviations for long domain names
const MOBILE_LABELS: Record<string, string> = {
  Relationships: 'Relations',
  Finances: 'Finance',
};

// Breakpoint for mobile view (in pixels)
const MOBILE_BREAKPOINT = 480;

/**
 * Custom hook to detect if viewport is mobile-sized
 */
function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial width
    const checkWidth = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkWidth();

    // Listen for resize events
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Custom tick component for PolarAngleAxis
 * Renders responsive labels that abbreviate on mobile viewports
 */
interface CustomTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
  isMobile: boolean;
}

function CustomTick({ x, y, payload, isMobile }: CustomTickProps) {
  if (!payload) return null;

  const label = isMobile
    ? MOBILE_LABELS[payload.value] || payload.value
    : payload.value;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-current text-xs sm:text-sm"
      style={{ fontSize: isMobile ? '11px' : '12px' }}
    >
      {label}
    </text>
  );
}

/**
 * Check if all scores in the data are zero or empty
 */
function isDataEmpty(data: LifeMapChartData[]): boolean {
  return data.every((item) => !item.score || item.score === 0);
}

/**
 * LifeMapChart - Radar chart displaying 6 life domains
 * Uses Recharts RadarChart with responsive container
 * Labels automatically abbreviate on mobile to prevent truncation
 * Shows encouraging empty state when no data exists
 */
export function LifeMapChart({ data, height = 400 }: LifeMapChartProps) {
  const isMobile = useIsMobile();

  // Normalize data - convert null/undefined scores to 0
  const normalizedData = data.map((item) => ({
    domain: item.domain,
    score: item.score ?? 0,
  }));

  // Show empty state when all scores are 0
  if (isDataEmpty(data)) {
    return (
      <EmptyState
        icon={Compass}
        title="Your Life Map Awaits"
        message="Complete your first daily review to start tracking your life domains. Each review helps build a picture of your overall well-being."
        ctaText="Start Your First Review"
        ctaHref="/daily"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={normalizedData} outerRadius={isMobile ? '65%' : '80%'}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="domain"
          tick={(props) => <CustomTick {...props} isMobile={isMobile} />}
        />
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
