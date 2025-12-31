import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string | RegExp): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveStyle(style: Record<string, unknown>): R;
      toContainElement(element: HTMLElement | null): R;
      toBeEmptyDOMElement(): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
    }
  }
}

export {};
