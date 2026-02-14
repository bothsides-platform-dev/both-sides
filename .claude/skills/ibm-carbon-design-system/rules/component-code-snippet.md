---
title: Code Snippet
impact: HIGH
impactDescription: Incorrect code display reduces readability and breaks copy functionality
tags: component, code-snippet, code, copy
---

# Code Snippet

Variants: inline (within text), single-line (one line), multi-line (code blocks). All include copy-to-clipboard.

## Incorrect

```tsx
function CodeExample({ code }) {
  return (
    <pre style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '16px' }}>
      <code>{code}</code>
    </pre>
  );
}
```
**Why it's wrong**: No copy button. Hardcoded colors. No overflow handling.

## Correct

```tsx
import { CodeSnippet } from '@carbon/react';

<p>Use <CodeSnippet type="inline">npm install</CodeSnippet> to install.</p>

<CodeSnippet type="single">npm install @carbon/react</CodeSnippet>

<CodeSnippet type="multi" feedback="Copied!">
{`import { Button } from '@carbon/react';

function App() {
  return <Button>Click me</Button>;
}`}
</CodeSnippet>
```
**Why it's correct**: Copy-to-clipboard, theme support, overflow handling, "show more" for multi-line.
