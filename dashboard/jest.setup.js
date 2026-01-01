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
