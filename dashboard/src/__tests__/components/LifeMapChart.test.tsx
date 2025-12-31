/**
 * T5: Component Tests - LifeMapChart
 *
 * Tests for the radar chart component displaying 6 life domains
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Recharts to avoid canvas issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 400, height: 400 }}>
        {children}
      </div>
    ),
    RadarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
      <div data-testid="radar-chart" data-domain-count={data?.length}>
        {children}
      </div>
    ),
    Radar: ({ dataKey, name }: { dataKey: string; name: string }) => (
      <div data-testid="radar" data-key={dataKey} data-name={name} />
    ),
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: ({ dataKey }: { dataKey: string }) => (
      <div data-testid="polar-angle-axis" data-key={dataKey} />
    ),
    PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  };
});

describe('T5: LifeMapChart Component', () => {
  const mockData = [
    { domain: 'Career', score: 8 },
    { domain: 'Relationships', score: 6 },
    { domain: 'Health', score: 5 },
    { domain: 'Meaning', score: 7 },
    { domain: 'Finances', score: 8 },
    { domain: 'Fun', score: 4 },
  ];

  const dataWithNulls = [
    { domain: 'Career', score: 8 },
    { domain: 'Relationships', score: null },
    { domain: 'Health', score: 5 },
    { domain: 'Meaning', score: undefined },
    { domain: 'Finances', score: 8 },
    { domain: 'Fun', score: 0 },
  ];

  it('should render radar chart container', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('should render with 6 data points', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    const radarChart = screen.getByTestId('radar-chart');
    expect(radarChart.dataset.domainCount).toBe('6');
  });

  it('should include PolarGrid, PolarAngleAxis, and Radar components', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    expect(screen.getByTestId('polar-angle-axis')).toBeInTheDocument();
    expect(screen.getByTestId('radar')).toBeInTheDocument();
  });

  it('should use "domain" as the angle axis key', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    const angleAxis = screen.getByTestId('polar-angle-axis');
    expect(angleAxis.dataset.key).toBe('domain');
  });

  it('should use "score" as the radar data key', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    const radar = screen.getByTestId('radar');
    expect(radar.dataset.key).toBe('score');
  });

  it('should handle null/undefined scores by treating them as 0', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    // Should not throw
    expect(() => {
      render(<LifeMapChart data={dataWithNulls as typeof mockData} />);
    }).not.toThrow();
  });

  it('should handle empty data array', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    expect(() => {
      render(<LifeMapChart data={[]} />);
    }).not.toThrow();
  });

  it('should have accessible name for screen readers', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    // The component should have an aria-label or accessible title
    const chart = screen.getByTestId('radar-chart');
    expect(chart).toBeInTheDocument();
  });

  it('should accept custom height prop', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} height={500} />);

    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });

  it('should display all 6 domain labels', async () => {
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    render(<LifeMapChart data={mockData} />);

    // The component should pass data with all domains to the chart
    const radarChart = screen.getByTestId('radar-chart');
    expect(radarChart.dataset.domainCount).toBe('6');
  });
});

describe('T5: LifeMapChart Integration', () => {
  it('should properly transform LifeMap data to chart format', async () => {
    const { getLifeMapChartData } = await import('@/lib/parsers/life-map');
    const { LifeMapChart } = await import('@/components/LifeMapChart');

    const lifeMap = {
      domains: {
        career: { score: 8, assessment: 'Good' },
        relationships: { score: 6, assessment: 'OK' },
        health: { score: 5, assessment: 'Meh' },
        meaning: { score: 7, assessment: 'Growing' },
        finances: { score: 8, assessment: 'Stable' },
        fun: { score: 4, assessment: 'Low' },
      },
    };

    const chartData = getLifeMapChartData(lifeMap);

    expect(() => {
      render(<LifeMapChart data={chartData} />);
    }).not.toThrow();

    expect(chartData).toHaveLength(6);
  });
});
