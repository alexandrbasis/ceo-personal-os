import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
}));

// DOM-specific mocks - only run in browser/jsdom environment
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Inject CSS variables for design refresh tests
  // These mirror the values defined in globals.css
  const style = document.createElement('style');
  style.textContent = `
    :root {
      /* Typography - Font Families */
      --font-display: 'Fraunces', serif;
      --font-body: 'Source Sans Pro', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Typography - Line Heights */
      --line-height-heading: 1.2;
      --line-height-body: 1.6;

      /* Typography - Letter Spacing */
      --letter-spacing-heading: -0.02em;
      --letter-spacing-body: 0;

      /* Color Palette - Warm Neutrals */
      --color-bg: #FAFAF8;
      --color-surface: #FFFFFF;
      --color-muted: #F5F5F0;
      --color-border: #E8E6E1;
      --color-text: #2C2C2B;
      --color-text-muted: #6B6B67;

      /* Color Palette - Primary (Deep Teal) */
      --color-primary: #1E4D5C;
      --color-primary-hover: #2A6478;
      --color-primary-light: #E8F4F7;

      /* Color Palette - Accent (Muted Gold) */
      --color-accent: #C4A35A;
      --color-accent-light: #F7F3E8;

      /* Color Palette - Status Colors */
      --color-success: #3D7A5C;
      --color-warning: #C4883D;
      --color-error: #9B3D3D;

      /* Energy Level Gradient */
      --energy-low: #9B3D3D;
      --energy-mid: #C4883D;
      --energy-high: #3D7A5C;
    }

    /* Dark Mode Color Palette */
    [data-theme="dark"] {
      --color-bg: #1A1A19;
      --color-surface: #242423;
      --color-muted: #2E2E2C;
      --color-border: #3D3D3A;
      --color-text: #F5F5F0;
      --color-text-muted: #A3A39E;

      --color-primary: #5BA3B5;
      --color-primary-hover: #7BBCCC;
    }
  `;
  document.head.appendChild(style);
}

// Mock ResizeObserver (works in both environments)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
