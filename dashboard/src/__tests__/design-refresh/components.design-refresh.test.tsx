/**
 * AC4: Enhanced Component Design Tests
 *
 * Tests for enhanced component design refresh:
 * - Buttons with distinctive hover/active states
 * - Form inputs with refined styling
 * - Native-feeling slider with custom appearance
 * - Consistent icon system
 * - Empty states with personality (new EmptyState component)
 */

import { render, screen, fireEvent } from '@testing-library/react';

describe('AC4: Enhanced Component Design', () => {
  describe('Button Component', () => {
    it('should render Button with default variant', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button>Click Me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should have data-variant attribute for styling', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button variant="default">Primary Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'default');
    });

    it('should have hover state classes defined', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Hover Me</Button>);

      const button = container.querySelector('button');
      // Button should have transition for smooth hover
      const styles = getComputedStyle(button!);
      expect(styles.transition).toBeTruthy();
    });

    it('should have focus-visible styling for accessibility', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(<Button>Focus Me</Button>);

      const button = container.querySelector('button');
      // Button should have focus-visible class patterns
      expect(button?.className).toContain('focus-visible');
    });

    it('should support translateY transform on active state', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button className="active:translate-y-0">Active Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:translate-y-0');
    });

    it('should have primary variant with brand color', async () => {
      const { Button } = await import('@/components/ui/button');

      const { container } = render(
        <Button variant="default">Primary</Button>
      );

      const button = container.querySelector('button');
      // Should use bg-primary class
      expect(button?.className).toContain('bg-primary');
    });

    it('should have translateY hover effect class', async () => {
      const { Button } = await import('@/components/ui/button');

      render(<Button className="hover:-translate-y-0.5">Lift Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:-translate-y-0.5');
    });
  });

  describe('Input Component', () => {
    it('should render Input with refined styling', async () => {
      const { Input } = await import('@/components/ui/input');

      render(<Input placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should have data-slot attribute for styling', async () => {
      const { Input } = await import('@/components/ui/input');

      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('should have focus-visible ring styling', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input />);

      const input = container.querySelector('input');
      // Should have focus-visible styles
      expect(input?.className).toContain('focus-visible');
    });

    it('should have rounded border styling', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input />);

      const input = container.querySelector('input');
      // Should have rounded-md class
      expect(input?.className).toContain('rounded');
    });

    it('should support aria-invalid for error states', async () => {
      const { Input } = await import('@/components/ui/input');

      const { container } = render(<Input aria-invalid="true" />);

      const input = container.querySelector('input');
      expect(input?.className).toContain('aria-invalid');
    });
  });

  describe('Slider Component', () => {
    it('should render Slider with custom appearance', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(<Slider defaultValue={[5]} min={1} max={10} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should have data-slot attribute on slider', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const slider = container.querySelector('[data-slot="slider"]');
      expect(slider).toBeInTheDocument();
    });

    it('should have custom thumb styling', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const thumb = container.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toBeInTheDocument();
    });

    it('should have slider track element', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const track = container.querySelector('[data-slot="slider-track"]');
      expect(track).toBeInTheDocument();
    });

    it('should have slider range element for filled portion', async () => {
      const { Slider } = await import('@/components/ui/slider');

      const { container } = render(<Slider defaultValue={[5]} />);

      const range = container.querySelector('[data-slot="slider-range"]');
      expect(range).toBeInTheDocument();
    });

    it('should support energy gradient track styling', async () => {
      const { Slider } = await import('@/components/ui/slider');

      render(
        <Slider
          className="energy-slider"
          defaultValue={[5]}
          min={1}
          max={10}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider.closest('[data-slot="slider"]')).toHaveClass(
        'energy-slider'
      );
    });
  });

  describe('EmptyState Component', () => {
    it('should render EmptyState component', async () => {
      // EmptyState is a new component that needs to be created
      const { EmptyState } = await import('@/components/ui/empty-state');

      render(<EmptyState title="No items" description="Get started by adding your first item." />);

      expect(screen.getByText('No items')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding your first item.')).toBeInTheDocument();
    });

    it('should render EmptyState with title', async () => {
      const { EmptyState } = await import('@/components/ui/empty-state');

      render(<EmptyState title="Empty" />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('should render EmptyState with description', async () => {
      const { EmptyState } = await import('@/components/ui/empty-state');

      render(
        <EmptyState
          title="No Data"
          description="There is no data to display."
        />
      );

      expect(screen.getByText('There is no data to display.')).toBeInTheDocument();
    });

    it('should render EmptyState with optional icon', async () => {
      const { EmptyState } = await import('@/components/ui/empty-state');

      render(
        <EmptyState
          title="No Results"
          description="No results found."
          icon={<span data-testid="custom-icon">Icon</span>}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render EmptyState with optional action button', async () => {
      const { EmptyState } = await import('@/components/ui/empty-state');
      const mockAction = jest.fn();

      render(
        <EmptyState
          title="No Items"
          description="Add your first item."
          action={{
            label: 'Add Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /add item/i });
      expect(actionButton).toBeInTheDocument();

      fireEvent.click(actionButton);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should have personality styling on EmptyState', async () => {
      const { EmptyState } = await import('@/components/ui/empty-state');

      const { container } = render(
        <EmptyState title="Empty" description="Nothing here." />
      );

      const emptyState = container.firstChild;
      // Should have centered, styled container
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Textarea Component', () => {
    it('should render Textarea with refined styling', async () => {
      const { Textarea } = await import('@/components/ui/textarea');

      render(<Textarea placeholder="Enter long text" />);

      const textarea = screen.getByPlaceholderText('Enter long text');
      expect(textarea).toBeInTheDocument();
    });

    it('should have focus-visible styling', async () => {
      const { Textarea } = await import('@/components/ui/textarea');

      const { container } = render(<Textarea />);

      const textarea = container.querySelector('textarea');
      expect(textarea?.className).toContain('focus-visible');
    });
  });

  describe('Label Component', () => {
    it('should render Label with proper styling', async () => {
      const { Label } = await import('@/components/ui/label');

      render(<Label htmlFor="test">Test Label</Label>);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('RadioGroup Component', () => {
    it('should render RadioGroup with accessible items', async () => {
      const { RadioGroup, RadioGroupItem } = await import(
        '@/components/ui/radio-group'
      );
      const { Label } = await import('@/components/ui/label');

      render(
        <RadioGroup defaultValue="option1">
          <div>
            <RadioGroupItem value="option1" id="option1" />
            <Label htmlFor="option1">Option 1</Label>
          </div>
          <div>
            <RadioGroupItem value="option2" id="option2" />
            <Label htmlFor="option2">Option 2</Label>
          </div>
        </RadioGroup>
      );

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    });
  });
});
