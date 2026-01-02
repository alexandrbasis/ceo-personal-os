/**
 * Mock remark-gfm plugin for Jest tests
 * Returns a no-op function since our mock ReactMarkdown handles GFM internally
 */
const remarkGfm = () => () => {};

export default remarkGfm;
