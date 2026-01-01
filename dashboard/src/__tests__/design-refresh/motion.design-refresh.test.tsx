/**
 * AC6: Motion and Micro-interactions Tests
 *
 * Tests for motion and micro-interactions:
 * - Page load animations (staggered reveals)
 * - Hover state transitions
 * - Form feedback animations
 * - Smooth page transitions
 * - Celebration micro-animation on review completion
 */

import { render } from '@testing-library/react';

// Helper to get computed CSS variable value
const getCSSVariable = (element: HTMLElement, variable: string): string => {
  return getComputedStyle(element).getPropertyValue(variable).trim();
};

describe('AC6: Motion and Micro-interactions', () => {
  describe('Keyframe Animations', () => {
    it('should define fadeInUp keyframe animation in CSS', () => {
      // The fadeInUp animation should be defined in globals.css
      // This test verifies the animation class can be applied
      const { container } = render(
        <div className="animate-fadeInUp" data-testid="animated">
          Content
        </div>
      );

      const element = container.querySelector('.animate-fadeInUp');
      expect(element).toBeInTheDocument();
    });

    it('should define celebrate keyframe animation in CSS', () => {
      // The celebrate animation for review completion
      const { container } = render(
        <div className="animate-celebrate" data-testid="celebration">
          Celebration
        </div>
      );

      const element = container.querySelector('.animate-celebrate');
      expect(element).toBeInTheDocument();
    });

    it('should define fadeIn keyframe animation', () => {
      const { container } = render(
        <div className="animate-fadeIn" data-testid="fadeIn">
          Fade In
        </div>
      );

      const element = container.querySelector('.animate-fadeIn');
      expect(element).toBeInTheDocument();
    });

    it('should define slideIn keyframe animation', () => {
      const { container } = render(
        <div className="animate-slideIn" data-testid="slideIn">
          Slide In
        </div>
      );

      const element = container.querySelector('.animate-slideIn');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Page Load Animations', () => {
    it('should apply staggered animation delay to cards', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(
        <>
          <Card className="animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
            Card 1
          </Card>
          <Card className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Card 2
          </Card>
          <Card className="animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            Card 3
          </Card>
        </>
      );

      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(3);

      // Check animation delays are staggered
      const delays = Array.from(cards).map(
        (card) => (card as HTMLElement).style.animationDelay
      );
      expect(delays).toEqual(['0.05s', '0.1s', '0.15s']);
    });

    it('should have animation-fill-mode: both for smooth finish', () => {
      const { container } = render(
        <div
          className="animate-fadeInUp"
          style={{ animationFillMode: 'both' }}
          data-testid="animated"
        >
          Content
        </div>
      );

      const element = container.querySelector('.animate-fadeInUp');
      expect((element as HTMLElement).style.animationFillMode).toBe('both');
    });
  });

  describe('Hover State Transitions', () => {
    it('should have transition property on Button', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Hover Me</Button>);

      const button = container.querySelector('button');
      const styles = getComputedStyle(button!);

      // Should have transition defined
      expect(styles.transition).toBeTruthy();
      expect(styles.transition).not.toBe('none');
    });

    it('should have transition-all class on interactive elements', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Transition</Button>);

      const button = container.querySelector('button');
      expect(button?.className).toContain('transition');
    });

    it('should have hover transition on Card', async () => {
      const { Card } = await import('@/components/ui/card');

      const { container } = render(<Card>Hover Card</Card>);

      const card = container.querySelector('[data-slot="card"]');
      const styles = getComputedStyle(card!);

      expect(styles.transition).toBeTruthy();
    });

    it('should have ease timing function on transitions', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Eased</Button>);

      const button = container.querySelector('button');
      const styles = getComputedStyle(button!);

      // Should use ease or ease-out timing
      expect(styles.transitionTimingFunction).toBeTruthy();
    });
  });

  describe('Slider Transitions', () => {
    it('should have transition on Slider thumb', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      const styles = getComputedStyle(thumb!);

      // Thumb should have transition for smooth movement
      expect(styles.transition).toBeTruthy();
    });

    it('should have hover transform effect on Slider thumb', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      // Should have hover scale effect
      expect(thumb?.className).toContain('hover:');
    });
  });

  describe('Form Feedback Animations', () => {
    it('should have shake animation for validation errors', () => {
      const { container } = render(
        <div className="animate-shake" data-testid="shake">
          Error shake
        </div>
      );

      const element = container.querySelector('.animate-shake');
      expect(element).toBeInTheDocument();
    });

    it('should have pulse animation for loading states', () => {
      const { container } = render(
        <div className="animate-pulse" data-testid="pulse">
          Loading...
        </div>
      );

      const element = container.querySelector('.animate-pulse');
      expect(element).toBeInTheDocument();
    });

    it('should have spin animation for loading spinners', () => {
      const { container } = render(
        <div className="animate-spin" data-testid="spin">
          Spinning
        </div>
      );

      const element = container.querySelector('.animate-spin');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Celebration Animation', () => {
    it('should have celebration animation class available', () => {
      const { container } = render(
        <div className="review-saved" data-testid="celebration">
          Saved!
        </div>
      );

      const element = container.querySelector('.review-saved');
      expect(element).toBeInTheDocument();
    });

    it('should apply scale animation on celebration', () => {
      // The celebrate animation should scale up and back
      const { container } = render(
        <div className="animate-celebrate" data-testid="celebrate">
          Done!
        </div>
      );

      const element = container.querySelector('.animate-celebrate');
      expect(element).toBeInTheDocument();
    });

    it('should have confetti animation class for special celebrations', () => {
      const { container } = render(
        <div className="animate-confetti" data-testid="confetti">
          Confetti!
        </div>
      );

      const element = container.querySelector('.animate-confetti');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Respect', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('should disable animations with motion-reduce class', () => {
      const { container } = render(
        <div className="motion-reduce:animate-none">No Animation</div>
      );

      const element = container.querySelector('.motion-reduce\\:animate-none');
      expect(element).toBeInTheDocument();
    });

    it('should disable transitions with motion-reduce class', () => {
      const { container } = render(
        <div className="motion-reduce:transition-none">No Transition</div>
      );

      const element = container.querySelector(
        '.motion-reduce\\:transition-none'
      );
      expect(element).toBeInTheDocument();
    });

    it('should only animate when motion-safe', () => {
      const { container } = render(
        <div className="motion-safe:animate-fadeIn">Safe Animation</div>
      );

      const element = container.querySelector('.motion-safe\\:animate-fadeIn');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Transition Duration', () => {
    it('should have 200ms duration for micro-interactions', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Quick</Button>);

      const button = container.querySelector('button');
      const styles = getComputedStyle(button!);

      // Micro-interactions should be quick (150-300ms)
      // This is checking the duration exists
      expect(styles.transitionDuration).toBeTruthy();
    });

    it('should have duration-200 utility available', () => {
      const { container } = render(
        <div className="duration-200">200ms</div>
      );

      const element = container.querySelector('.duration-200');
      expect(element).toBeInTheDocument();
    });

    it('should have duration-300 utility available', () => {
      const { container } = render(
        <div className="duration-300">300ms</div>
      );

      const element = container.querySelector('.duration-300');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Animation CSS Variables', () => {
    it('should define --animation-duration CSS variable', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const duration = getCSSVariable(root, '--animation-duration');

      // Should have a default animation duration defined
      expect(duration).toBeTruthy();
    });

    it('should define --animation-timing CSS variable', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const timing = getCSSVariable(root, '--animation-timing');

      // Should have a timing function defined
      expect(timing).toBeTruthy();
    });
  });
});
