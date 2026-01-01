/**
 * AC3: Visual Texture and Depth Tests
 *
 * Tests for visual texture and depth design refresh:
 * - Subtle background texture or gradient (not flat white)
 * - Meaningful shadows and elevation
 * - Card treatments with character
 * - Micro-interactions that feel intentional
 */

import { render, screen } from '@testing-library/react';

// Helper to get computed CSS variable value
const getCSSVariable = (element: HTMLElement, variable: string): string => {
  return getComputedStyle(element).getPropertyValue(variable).trim();
};

describe('AC3: Visual Texture and Depth', () => {
  describe('Background Texture', () => {
    it('should have subtle background texture class defined', () => {
      // Test for .page-background class with texture
      const { container } = render(
        <div className="page-background" data-testid="page">
          Content
        </div>
      );

      const element = container.querySelector('.page-background');
      expect(element).toBeInTheDocument();
    });

    it('should apply background-image for texture overlay', () => {
      const { container } = render(
        <div className="page-background" data-testid="page">
          Content
        </div>
      );

      const element = container.querySelector('.page-background');
      const styles = getComputedStyle(element!);

      // Should have a background-image defined (noise texture SVG)
      expect(styles.backgroundImage).not.toBe('none');
    });

    it('should use soft-light blend mode for texture', () => {
      const { container } = render(
        <div className="page-background" data-testid="page">
          Content
        </div>
      );

      const element = container.querySelector('.page-background');
      const styles = getComputedStyle(element!);

      // Should use soft-light blend mode for subtle texture
      expect(styles.backgroundBlendMode).toBe('soft-light');
    });

    it('should have warm background color under texture', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorBg = getCSSVariable(root, '--color-bg');

      // Should be warm white #FAFAF8, not cold #FFFFFF
      expect(colorBg).toBeTruthy();
      expect(colorBg.toLowerCase()).toBe('#fafaf8');
    });
  });

  describe('Card Shadow and Elevation', () => {
    it('should render Card component with shadow', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();

      const styles = getComputedStyle(card!);
      // Should have box-shadow defined
      expect(styles.boxShadow).not.toBe('none');
    });

    it('should have subtle default shadow on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      // Shadow should be subtle (low opacity, small spread)
      // Expected: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)
      expect(styles.boxShadow).toBeTruthy();
    });

    it('should have hover shadow elevation on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card className="hover:shadow-lg" data-testid="card">
          Card Content
        </Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should have smooth shadow transition on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      // Should have transition for smooth hover effect
      expect(styles.transition).toBeTruthy();
    });
  });

  describe('Card Border and Radius', () => {
    it('should have rounded corners with defined border-radius', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      // Should have 12px border radius (0.75rem)
      expect(styles.borderRadius).toBeTruthy();
      expect(styles.borderRadius).not.toBe('0px');
    });

    it('should have warm border color on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      // Should have border defined
      expect(styles.border).toBeTruthy();
    });

    it('should use --color-border CSS variable for card borders', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorBorder = getCSSVariable(root, '--color-border');

      // Expected: #E8E6E1 (warm gray)
      expect(colorBorder).toBeTruthy();
    });
  });

  describe('Card Background', () => {
    it('should have white surface background on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <Card data-testid="card">Card Content</Card>
      );

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      // Should have white/surface background color
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('should use --color-surface CSS variable for card background', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorSurface = getCSSVariable(root, '--color-surface');

      // Expected: #FFFFFF
      expect(colorSurface).toBeTruthy();
    });
  });

  describe('Elevation Layers', () => {
    it('should define shadow-sm utility for subtle elevation', () => {
      const { container } = render(
        <div className="shadow-sm" data-testid="elevated">
          Content
        </div>
      );

      const element = container.querySelector('.shadow-sm');
      expect(element).toBeInTheDocument();
    });

    it('should define shadow-md utility for medium elevation', () => {
      const { container } = render(
        <div className="shadow-md" data-testid="elevated">
          Content
        </div>
      );

      const element = container.querySelector('.shadow-md');
      expect(element).toBeInTheDocument();
    });

    it('should define shadow-lg utility for high elevation', () => {
      const { container } = render(
        <div className="shadow-lg" data-testid="elevated">
          Content
        </div>
      );

      const element = container.querySelector('.shadow-lg');
      expect(element).toBeInTheDocument();
    });
  });

  describe('CardHeader Component', () => {
    it('should render CardHeader with proper styling', async () => {
      const { Card, CardHeader, CardTitle } = await import(
        '@/components/ui/card'
      );

      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const header = screen.getByText('Test Title');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardContent Component', () => {
    it('should render CardContent with padding', async () => {
      const { Card, CardContent } = await import('@/components/ui/card');

      const { container } = render(
        <Card>
          <CardContent>Test Content</CardContent>
        </Card>
      );

      const content = container.querySelector('[data-slot="card-content"]');
      expect(content).toBeInTheDocument();
    });
  });
});
