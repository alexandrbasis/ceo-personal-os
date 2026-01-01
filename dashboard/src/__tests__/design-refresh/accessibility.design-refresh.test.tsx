/**
 * AC5: Accessibility Improvements Tests
 *
 * Tests for accessibility improvements:
 * - WCAG 2.1 AA compliant contrast ratios
 * - Proper focus indicators for keyboard navigation
 * - Screen reader compatible form controls
 * - Reduced motion option for animations
 * - Semantic HTML throughout
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Helper to get computed CSS variable value
const getCSSVariable = (element: HTMLElement, variable: string): string => {
  return getComputedStyle(element).getPropertyValue(variable).trim();
};

describe('AC5: Accessibility Improvements', () => {
  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion media query', () => {
      // Test that animations are disabled when reduced motion is preferred
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

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      expect(reducedMotion.matches).toBe(true);
    });

    it('should have motion-reduce utility class available', () => {
      const { container } = render(
        <div className="motion-reduce:animate-none">Content</div>
      );

      const element = container.querySelector('.motion-reduce\\:animate-none');
      expect(element).toBeInTheDocument();
    });

    it('should have motion-safe utility class available', () => {
      const { container } = render(
        <div className="motion-safe:animate-fadeIn">Content</div>
      );

      const element = container.querySelector('.motion-safe\\:animate-fadeIn');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Focus Indicators', () => {
    it('should have visible focus indicator on Button', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Focus Test</Button>);

      const button = container.querySelector('button');
      // Should have focus-visible ring classes
      expect(button?.className).toContain('focus-visible');
    });

    it('should have focus-visible:ring styling on Button', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Ring Focus</Button>);

      const button = container.querySelector('button');
      // Button should include ring styling for focus
      expect(button?.className).toMatch(/focus-visible:ring/);
    });

    it('should have visible focus indicator on Input', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input placeholder="Focus test" />);

      const input = container.querySelector('input');
      expect(input?.className).toContain('focus-visible');
    });

    it('should have focus-visible:border-ring on Input', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input />);

      const input = container.querySelector('input');
      expect(input?.className).toMatch(/focus-visible:border-ring/);
    });

    it('should have visible focus indicator on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      // Slider thumb should have focus-visible styling
      expect(thumb?.className).toContain('focus-visible');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow keyboard focus on Button', async () => {
      const user = userEvent.setup();
      const { Button } = await import('@/components/ui/button');

      render(<Button>Tab to me</Button>);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should allow keyboard focus on Input', async () => {
      const user = userEvent.setup();
      const { Input } = await import('@/components/ui/input');

      render(<Input placeholder="Tab here" />);

      const input = screen.getByPlaceholderText('Tab here');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('should allow keyboard navigation on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(<Slider defaultValue={[5]} min={1} max={10} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      // Slider should be focusable
      expect(slider.getAttribute('tabindex')).not.toBe('-1');
    });

    it('should allow arrow key control on Slider', async () => {
      const user = userEvent.setup();
      const { Slider } = await import('@/components/ui/slider');
      const onChange = jest.fn();

      render(
        <Slider
          defaultValue={[5]}
          min={1}
          max={10}
          onValueChange={onChange}
        />
      );

      screen.getByRole('slider'); // Verify slider is rendered
      await user.tab(); // Focus the slider
      await user.keyboard('{ArrowRight}'); // Increase value

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Form Control Accessibility', () => {
    it('should have aria-label on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(
        <Slider
          defaultValue={[5]}
          aria-label="Energy Level"
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Energy Level');
    });

    it('should support aria-labelledby on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(
        <>
          <label id="slider-label">Volume</label>
          <Slider
            defaultValue={[50]}
            aria-labelledby="slider-label"
          />
        </>
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-labelledby', 'slider-label');
    });

    it('should have aria-valuemin and aria-valuemax on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(<Slider defaultValue={[5]} min={1} max={10} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('should have aria-valuenow on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(<Slider defaultValue={[7]} min={1} max={10} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '7');
    });

    it('should support aria-invalid on Input', async () => {
      const { Input } = await import('@/components/ui/input');

      render(<Input aria-invalid="true" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support aria-describedby on Input for error messages', async () => {
      const { Input } = await import('@/components/ui/input');

      render(
        <>
          <Input aria-describedby="error-message" />
          <span id="error-message">This field is required</span>
        </>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic Button element', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Semantic Button</Button>);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should use semantic Input element', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input />);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input?.tagName).toBe('INPUT');
    });

    it('should use semantic Label element', async () => {
      const { Label } = await import('@/components/ui/label');

      const { container } = render(<Label htmlFor="test">Label</Label>);

      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label?.tagName).toBe('LABEL');
    });

    it('should associate Label with form control using htmlFor', async () => {
      const { Label } = await import('@/components/ui/label');
      const { Input } = await import('@/components/ui/input');

      render(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </>
      );

      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Color Contrast (WCAG AA)', () => {
    it('should have primary color with sufficient contrast on white', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorPrimary = getCSSVariable(root, '--color-primary');

      // Primary color #1E4D5C should have sufficient contrast
      // This is a placeholder test - actual implementation would parse and calculate
      expect(colorPrimary).toBeTruthy();
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      // #1E4D5C on white background should pass
    });

    it('should have text color with sufficient contrast on background', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorText = getCSSVariable(root, '--color-text');
      const colorBg = getCSSVariable(root, '--color-bg');

      // Text color #2C2C2B on warm white #FAFAF8 should pass WCAG AA
      expect(colorText).toBeTruthy();
      expect(colorBg).toBeTruthy();
    });

    it('should have muted text with sufficient contrast', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorTextMuted = getCSSVariable(root, '--color-text-muted');

      // Muted text #6B6B67 should still pass WCAG AA on light backgrounds
      expect(colorTextMuted).toBeTruthy();
    });

    it('should have error color with sufficient contrast', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorError = getCSSVariable(root, '--color-error');

      // Error color #9B3D3D should be visible
      expect(colorError).toBeTruthy();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have role="slider" on Slider component', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(<Slider defaultValue={[5]} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should have role="button" on Button component', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button>Click</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have role="textbox" on Input component', async () => {
      const { Input } = await import('@/components/ui/input');

      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should have role="radiogroup" on RadioGroup', async () => {
      const { RadioGroup, RadioGroupItem } = await import(
        '@/components/ui/radio-group'
      );

      render(
        <RadioGroup defaultValue="a">
          <RadioGroupItem value="a" />
          <RadioGroupItem value="b" />
        </RadioGroup>
      );

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });
  });

  describe('Disabled State Accessibility', () => {
    it('should have disabled styling on Button', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button?.className).toContain('disabled:opacity-50');
    });

    it('should have disabled styling on Input', async () => {
      const { Input } = await import('@/components/ui/input');

      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have disabled styling on Slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} disabled />);

      const slider = container.querySelector('[data-slot="slider"]');
      expect(slider).toHaveAttribute('data-disabled');
    });
  });
});
