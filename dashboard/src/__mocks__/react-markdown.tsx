import React from 'react';

interface ComponentOverrides {
  h1?: React.ComponentType<{ children: React.ReactNode }>;
  h2?: React.ComponentType<{ children: React.ReactNode }>;
  h3?: React.ComponentType<{ children: React.ReactNode }>;
  h4?: React.ComponentType<{ children: React.ReactNode }>;
  h5?: React.ComponentType<{ children: React.ReactNode }>;
  h6?: React.ComponentType<{ children: React.ReactNode }>;
}

interface ReactMarkdownProps {
  children: string;
  remarkPlugins?: unknown[];
  components?: ComponentOverrides;
}

/**
 * Mock ReactMarkdown component for Jest tests
 * Renders markdown content using basic HTML transformation
 * Supports components prop for heading overrides
 */
const ReactMarkdown = ({ children, components }: ReactMarkdownProps) => {
  // Parse markdown content and render as HTML elements
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  const processText = (text: string): React.ReactNode => {
    // Process emphasis and strong
    const result: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Bold
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    let lastIndex = 0;
    const boldParts: React.ReactNode[] = [];

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        boldParts.push(remaining.slice(lastIndex, match.index));
      }
      boldParts.push(<strong key={`bold-${key++}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      boldParts.push(remaining.slice(lastIndex));
    }

    // If bold was found, process the parts for italic
    if (boldParts.length > 0) {
      remaining = '';
      boldParts.forEach(part => {
        if (typeof part === 'string') {
          remaining += part;
        } else {
          result.push(part);
        }
      });
    }

    // Italic
    const italicRegex = /\*(.+?)\*/g;
    lastIndex = 0;

    while ((match = italicRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        result.push(remaining.slice(lastIndex, match.index));
      }
      result.push(<em key={`em-${key++}`}>{match[1]}</em>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      result.push(remaining.slice(lastIndex));
    }

    if (result.length === 0) {
      return text;
    }

    return <>{result}</>;
  };

  const processLinks = (text: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    let key = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(processText(text.slice(lastIndex, match.index)));
      }
      parts.push(
        <a key={`link-${key++}`} href={match[2]}>
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(processText(text.slice(lastIndex)));
    }

    return parts.length > 0 ? <>{parts}</> : processText(text);
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
      listItems = [];
    }
    inList = false;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(<table key={`table-${elements.length}`}><tbody>{tableRows}</tbody></table>);
      tableRows = [];
    }
    inTable = false;
  };

  const flushBlockquote = () => {
    if (blockquoteContent.length > 0) {
      elements.push(
        <blockquote key={`bq-${elements.length}`}>
          {blockquoteContent.join(' ')}
        </blockquote>
      );
      blockquoteContent = [];
    }
    inBlockquote = false;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Empty line - flush current block
    if (!trimmedLine) {
      flushList();
      flushTable();
      flushBlockquote();
      return;
    }

    // Heading
    if (trimmedLine.startsWith('#')) {
      flushList();
      flushTable();
      flushBlockquote();
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const CustomComponent = components?.[HeadingTag];

        if (CustomComponent) {
          elements.push(
            <CustomComponent key={`h-${index}`}>{processLinks(text)}</CustomComponent>
          );
        } else {
          elements.push(
            React.createElement(HeadingTag, { key: `h-${index}` }, processLinks(text))
          );
        }
      }
      return;
    }

    // Blockquote
    if (trimmedLine.startsWith('>')) {
      flushList();
      flushTable();
      inBlockquote = true;
      blockquoteContent.push(trimmedLine.slice(1).trim());
      return;
    }

    // Continue blockquote
    if (inBlockquote) {
      blockquoteContent.push(trimmedLine);
      return;
    }

    // List item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushTable();
      flushBlockquote();
      inList = true;
      const text = trimmedLine.slice(2);
      listItems.push(<li key={`li-${index}`}>{processLinks(text)}</li>);
      return;
    }

    // Table row
    if (trimmedLine.includes('|')) {
      flushList();
      flushBlockquote();

      // Skip separator row
      if (trimmedLine.match(/^\|?[-|:\s]+\|?$/)) {
        return;
      }

      inTable = true;
      const cells = trimmedLine
        .split('|')
        .map(c => c.trim())
        .filter(c => c);
      tableRows.push(
        <tr key={`tr-${index}`}>
          {cells.map((cell, cellIndex) => (
            <td key={`td-${index}-${cellIndex}`}>{processLinks(cell)}</td>
          ))}
        </tr>
      );
      return;
    }

    // Horizontal rule
    if (trimmedLine.match(/^[-*_]{3,}$/)) {
      flushList();
      flushTable();
      flushBlockquote();
      elements.push(<hr key={`hr-${index}`} />);
      return;
    }

    // Regular paragraph
    flushList();
    flushTable();
    flushBlockquote();
    elements.push(<p key={`p-${index}`}>{processLinks(trimmedLine)}</p>);
  });

  // Flush remaining blocks
  flushList();
  flushTable();
  flushBlockquote();

  return <div data-testid="markdown-content">{elements}</div>;
};

export default ReactMarkdown;
