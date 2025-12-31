import React from 'react';

// Mock ResponsiveContainer
export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="responsive-container" style={{ width: 400, height: 400 }}>
    {children}
  </div>
);

// Mock RadarChart
export const RadarChart = ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
  <div data-testid="radar-chart" data-domain-count={data?.length}>
    {children}
  </div>
);

// Mock Radar
export const Radar = ({ dataKey, name }: { dataKey: string; name?: string }) => (
  <div data-testid="radar" data-key={dataKey} data-name={name} />
);

// Mock PolarGrid
export const PolarGrid = () => <div data-testid="polar-grid" />;

// Mock PolarAngleAxis
export const PolarAngleAxis = ({ dataKey }: { dataKey: string }) => (
  <div data-testid="polar-angle-axis" data-key={dataKey} />
);

// Mock PolarRadiusAxis
export const PolarRadiusAxis = () => <div data-testid="polar-radius-axis" />;

// Other chart mocks for completeness
export const LineChart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const Line = () => null;
export const BarChart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const Bar = () => null;
export const AreaChart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const Area = () => null;
export const XAxis = () => null;
export const YAxis = () => null;
export const CartesianGrid = () => null;
export const Tooltip = () => null;
export const Legend = () => null;
export const Cell = () => null;
export const Pie = () => null;
export const PieChart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
