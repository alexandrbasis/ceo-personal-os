import '@testing-library/jest-dom';

// Extend toHaveValue to properly support asymmetric matchers
// This fixes compatibility issues with Jest 30 + jest-dom 6.x
const originalToHaveValue = expect.extend ? null : undefined;

expect.extend({
  toHaveValue(element, expected) {
    const value = element.value;

    // Handle asymmetric matchers (like expect.stringContaining)
    if (expected && typeof expected.asymmetricMatch === 'function') {
      const pass = expected.asymmetricMatch(value);
      return {
        pass,
        message: () =>
          pass
            ? `expected element not to have value matching ${expected.toString()}, but received: ${value}`
            : `expected element to have value matching ${expected.toString()}, but received: ${value}`,
      };
    }

    // Fall back to original behavior for non-asymmetric matchers
    const pass = value === expected;
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have value ${expected}`
          : `expected element to have value ${expected}, but received: ${value}`,
    };
  },
});

// Mock next/navigation with a singleton router mock
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter() {
    return mockRouter;
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

// Reset router mocks before each test
beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
});

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

    /* Visual Texture and Depth - Background Texture */
    .page-background {
      background-color: var(--color-bg);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-blend-mode: soft-light;
      background-size: 200px 200px;
    }

    /* Shadow Utilities for Elevation Layers */
    .shadow-sm {
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02);
    }

    .shadow-md {
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    }

    .shadow-lg {
      box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04);
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

    /* Motion and Micro-interactions (AC6) */
    :root {
      --animation-duration: 0.3s;
      --animation-timing: ease-out;
    }

    /* Animation Utility Classes */
    .animate-fadeInUp {
      animation: fadeInUp var(--animation-duration) var(--animation-timing);
      animation-fill-mode: both;
    }

    .animate-fadeIn {
      animation: fadeIn var(--animation-duration) var(--animation-timing);
      animation-fill-mode: both;
    }

    .animate-slideIn {
      animation: slideIn var(--animation-duration) var(--animation-timing);
      animation-fill-mode: both;
    }

    .animate-celebrate {
      animation: celebrate 0.3s var(--animation-timing);
    }

    .animate-shake {
      animation: shake 0.5s var(--animation-timing);
    }

    .animate-confetti {
      animation: confetti 0.6s var(--animation-timing);
    }

    .review-saved {
      animation: celebrate 0.3s var(--animation-timing);
    }

    .duration-200 {
      transition-duration: 200ms;
    }

    .duration-300 {
      transition-duration: 300ms;
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
