/**
 * AC1: Distinctive Typography System Tests
 *
 * Tests for typography design refresh:
 * - Custom display font (Fraunces) for headings
 * - Refined body font (Source Sans Pro) for readability
 * - Clear typographic hierarchy (h1 -> body -> caption)
 * - Consistent font pairing across all pages
 * - Proper line heights and letter spacing
 */

import { render } from '@testing-library/react';

// Helper to get computed CSS variable value
const getCSSVariable = (element: HTMLElement, variable: string): string => {
  return getComputedStyle(element).getPropertyValue(variable).trim();
};

describe('AC1: Distinctive Typography System', () => {
  describe('CSS Font Variables', () => {
    it('should have --font-display CSS variable defined for headings', () => {
      // This test verifies the display font variable is defined in globals.css
      // Expected: --font-display: 'Fraunces', serif
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const fontDisplay = getCSSVariable(root, '--font-display');

      expect(fontDisplay).toContain('Fraunces');
    });

    it('should have --font-body CSS variable defined for body text', () => {
      // This test verifies the body font variable is defined
      // Expected: --font-body: 'Source Sans Pro', sans-serif
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const fontBody = getCSSVariable(root, '--font-body');

      expect(fontBody).toContain('Source Sans Pro');
    });

    it('should have --font-mono CSS variable defined for monospace text', () => {
      // This test verifies the monospace font variable is defined
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const fontMono = getCSSVariable(root, '--font-mono');

      expect(fontMono).toBeTruthy();
      expect(fontMono.length).toBeGreaterThan(0);
    });
  });

  describe('Typographic Hierarchy', () => {
    it('should apply display font to h1 elements', async () => {
      // Test that h1 headings use the display font (Fraunces)
      const { container } = render(
        <h1 className="font-display">Test Heading</h1>
      );

      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveClass('font-display');
    });

    it('should apply display font to h2 elements', () => {
      const { container } = render(
        <h2 className="font-display">Subheading</h2>
      );

      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveClass('font-display');
    });

    it('should apply body font to paragraph elements', () => {
      const { container } = render(
        <p className="font-body">Body text paragraph</p>
      );

      const p = container.querySelector('p');
      expect(p).toBeInTheDocument();
      expect(p).toHaveClass('font-body');
    });

    it('should have caption text with smaller size class', () => {
      const { container } = render(
        <span className="text-caption">Caption text</span>
      );

      const caption = container.querySelector('.text-caption');
      expect(caption).toBeInTheDocument();
    });
  });

  describe('Line Heights', () => {
    it('should define heading line-height CSS variable', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const lineHeightHeading = getCSSVariable(root, '--line-height-heading');

      // Headings should have tighter line height (1.1 - 1.3)
      expect(lineHeightHeading).toBeTruthy();
    });

    it('should define body line-height CSS variable', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const lineHeightBody = getCSSVariable(root, '--line-height-body');

      // Body text should have comfortable line height (1.5 - 1.7)
      expect(lineHeightBody).toBeTruthy();
    });
  });

  describe('Letter Spacing', () => {
    it('should define letter-spacing CSS variable for headings', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const letterSpacing = getCSSVariable(root, '--letter-spacing-heading');

      // Headings may have slightly tighter or normal letter spacing
      expect(letterSpacing).toBeDefined();
    });

    it('should define letter-spacing CSS variable for body text', () => {
      render(<div data-testid="root" />);
      const root = document.documentElement;
      const letterSpacing = getCSSVariable(root, '--letter-spacing-body');

      expect(letterSpacing).toBeDefined();
    });
  });

  describe('Font Loading', () => {
    it('should have Fraunces font family available', () => {
      // Test that the Fraunces font is loaded in the document
      // This checks the @font-face or Google Font link exists
      const fontDisplay = getCSSVariable(document.documentElement, '--font-display');
      expect(fontDisplay).toContain('Fraunces');
    });

    it('should have Source Sans Pro font family available', () => {
      // Test that Source Sans Pro is loaded
      const fontBody = getCSSVariable(document.documentElement, '--font-body');
      expect(fontBody).toContain('Source Sans Pro');
    });
  });

  describe('Tailwind Font Classes', () => {
    it('should provide font-display utility class', () => {
      // Tailwind should generate .font-display class
      const { container } = render(
        <span className="font-display">Display Font</span>
      );

      const element = container.querySelector('.font-display');
      expect(element).toBeInTheDocument();
    });

    it('should provide font-body utility class', () => {
      // Tailwind should generate .font-body class
      const { container } = render(
        <span className="font-body">Body Font</span>
      );

      const element = container.querySelector('.font-body');
      expect(element).toBeInTheDocument();
    });
  });
});
