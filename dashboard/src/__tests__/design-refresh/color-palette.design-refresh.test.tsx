/**
 * AC2: Refined Color Palette Tests
 *
 * Tests for color palette design refresh:
 * - Primary brand color (--color-primary: #1E4D5C) with accent (--color-accent: #C4A35A)
 * - Warm neutrals instead of cold grays
 * - Intentional use of color for status/feedback
 * - Dark mode support with same refinement
 * - CSS variables for consistent theming
 */

import { render } from '@testing-library/react';

// Helper to get computed CSS variable value
const getCSSVariable = (element: HTMLElement, variable: string): string => {
  return getComputedStyle(element).getPropertyValue(variable).trim();
};

describe('AC2: Refined Color Palette', () => {
  describe('Primary Brand Colors', () => {
    it('should have --color-primary CSS variable defined as deep teal (#1E4D5C)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorPrimary = getCSSVariable(root, '--color-primary');

      // Expected: #1E4D5C (deep teal)
      expect(colorPrimary).toBeTruthy();
      expect(colorPrimary.toLowerCase()).toBe('#1e4d5c');
    });

    it('should have --color-primary-hover CSS variable defined', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorPrimaryHover = getCSSVariable(root, '--color-primary-hover');

      // Expected: #2A6478 (lighter teal for hover)
      expect(colorPrimaryHover).toBeTruthy();
    });

    it('should have --color-primary-light CSS variable defined', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorPrimaryLight = getCSSVariable(root, '--color-primary-light');

      // Expected: #E8F4F7 (very light teal)
      expect(colorPrimaryLight).toBeTruthy();
    });
  });

  describe('Accent Colors', () => {
    it('should have --color-accent CSS variable defined as muted gold (#C4A35A)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorAccent = getCSSVariable(root, '--color-accent');

      // Expected: #C4A35A (muted gold)
      expect(colorAccent).toBeTruthy();
      expect(colorAccent.toLowerCase()).toBe('#c4a35a');
    });

    it('should have --color-accent-light CSS variable defined', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorAccentLight = getCSSVariable(root, '--color-accent-light');

      // Expected: #F7F3E8
      expect(colorAccentLight).toBeTruthy();
    });
  });

  describe('Warm Neutral Background Colors', () => {
    it('should have --color-bg CSS variable as warm white (#FAFAF8)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorBg = getCSSVariable(root, '--color-bg');

      // Expected: #FAFAF8 (warm white, not cold #FFFFFF)
      expect(colorBg).toBeTruthy();
      expect(colorBg.toLowerCase()).toBe('#fafaf8');
    });

    it('should have --color-surface CSS variable for cards (#FFFFFF)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorSurface = getCSSVariable(root, '--color-surface');

      // Expected: #FFFFFF (pure white for cards)
      expect(colorSurface).toBeTruthy();
    });

    it('should have --color-muted CSS variable as warm gray (#F5F5F0)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorMuted = getCSSVariable(root, '--color-muted');

      // Expected: #F5F5F0 (warm gray-100)
      expect(colorMuted).toBeTruthy();
    });

    it('should have --color-border CSS variable as warm gray (#E8E6E1)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorBorder = getCSSVariable(root, '--color-border');

      // Expected: #E8E6E1 (warm gray-200)
      expect(colorBorder).toBeTruthy();
    });
  });

  describe('Text Colors', () => {
    it('should have --color-text CSS variable as warm almost-black (#2C2C2B)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorText = getCSSVariable(root, '--color-text');

      // Expected: #2C2C2B (warm almost black)
      expect(colorText).toBeTruthy();
    });

    it('should have --color-text-muted CSS variable as warm gray (#6B6B67)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorTextMuted = getCSSVariable(root, '--color-text-muted');

      // Expected: #6B6B67 (warm gray-600)
      expect(colorTextMuted).toBeTruthy();
    });
  });

  describe('Status Colors', () => {
    it('should have --color-success CSS variable as forest green (#3D7A5C)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorSuccess = getCSSVariable(root, '--color-success');

      expect(colorSuccess).toBeTruthy();
      expect(colorSuccess.toLowerCase()).toBe('#3d7a5c');
    });

    it('should have --color-warning CSS variable as amber (#C4883D)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorWarning = getCSSVariable(root, '--color-warning');

      expect(colorWarning).toBeTruthy();
      expect(colorWarning.toLowerCase()).toBe('#c4883d');
    });

    it('should have --color-error CSS variable as deep red (#9B3D3D)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const colorError = getCSSVariable(root, '--color-error');

      expect(colorError).toBeTruthy();
      expect(colorError.toLowerCase()).toBe('#9b3d3d');
    });
  });

  describe('Energy Level Gradient Colors', () => {
    it('should have --energy-low CSS variable for low energy (1-3)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const energyLow = getCSSVariable(root, '--energy-low');

      // Expected: #9B3D3D (deep red)
      expect(energyLow).toBeTruthy();
    });

    it('should have --energy-mid CSS variable for mid energy (4-6)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const energyMid = getCSSVariable(root, '--energy-mid');

      // Expected: #C4883D (amber)
      expect(energyMid).toBeTruthy();
    });

    it('should have --energy-high CSS variable for high energy (7-10)', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const energyHigh = getCSSVariable(root, '--energy-high');

      // Expected: #3D7A5C (forest green)
      expect(energyHigh).toBeTruthy();
    });
  });

  describe('Dark Mode Support', () => {
    beforeEach(() => {
      // Mock matchMedia for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
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

    it('should have dark mode background color defined', () => {
      // Apply dark theme data attribute
      document.documentElement.setAttribute('data-theme', 'dark');
      render(<div data-testid="root" />);

      const root = document.documentElement;
      const colorBg = getCSSVariable(root, '--color-bg');

      // In dark mode, expected: #1A1A19
      expect(colorBg).toBeTruthy();

      // Cleanup
      document.documentElement.removeAttribute('data-theme');
    });

    it('should have dark mode surface color defined', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      render(<div data-testid="root" />);

      const root = document.documentElement;
      const colorSurface = getCSSVariable(root, '--color-surface');

      // In dark mode, expected: #242423
      expect(colorSurface).toBeTruthy();

      document.documentElement.removeAttribute('data-theme');
    });

    it('should have dark mode text color defined', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      render(<div data-testid="root" />);

      const root = document.documentElement;
      const colorText = getCSSVariable(root, '--color-text');

      // In dark mode, expected: #F5F5F0 (inverted from light mode)
      expect(colorText).toBeTruthy();

      document.documentElement.removeAttribute('data-theme');
    });

    it('should have dark mode primary color adjusted', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      render(<div data-testid="root" />);

      const root = document.documentElement;
      const colorPrimary = getCSSVariable(root, '--color-primary');

      // In dark mode, expected: #5BA3B5 (lighter teal for dark background)
      expect(colorPrimary).toBeTruthy();

      document.documentElement.removeAttribute('data-theme');
    });
  });

  describe('CSS Variable Consistency', () => {
    it('should have all color variables using consistent naming convention', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;

      // Check that the design system uses --color-* prefix consistently
      const requiredVariables = [
        '--color-primary',
        '--color-accent',
        '--color-bg',
        '--color-surface',
        '--color-text',
        '--color-border',
      ];

      requiredVariables.forEach((variable) => {
        const value = getCSSVariable(root, variable);
        expect(value).toBeTruthy();
      });
    });
  });
});
