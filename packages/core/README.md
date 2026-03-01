# luxe-edit

A beautiful, customizable rich text editor for React built on [Lexical](https://lexical.dev/) with customizable toolbars and floating toolbar support.

**[Live Demo →](https://luxe-tools.github.io/luxe-edit/)**

## Installation

```bash
npm install luxe-edit
# or
yarn add luxe-edit
# or
pnpm add luxe-edit
```

## Quick Start

```tsx
import { LuxeEditor } from 'luxe-edit';
import 'luxe-edit/index.css';

function App() {
  return <LuxeEditor initialConfig={{ namespace: 'MyEditor' }} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialConfig` | `Partial<InitialConfigType>` | required | Lexical editor config (namespace, theme, etc.) |
| `initialJSON` | `any` | — | Pre-load editor with saved JSON state |
| `showToolbar` | `boolean` | `true` | Show/hide the top toolbar |
| `showFloatingToolbar` | `boolean` | `true` | Show/hide the floating selection toolbar |
| `toolbarItems` | `ToolbarItem[]` | see below | Customize top toolbar buttons |
| `floatingToolbarItems` | `ToolbarItem[]` | same as `toolbarItems` | Customize floating toolbar buttons |
| `onChange` | `(editorState, editor) => void` | — | Called whenever the editor content changes |
| `ignoreInitialChange` | `boolean` | `true` | Skip `onChange` on initial mount |
| `children` | `ReactNode` | — | Render extra Lexical plugins inside the composer |

## Toolbar Items

The `toolbarItems` and `floatingToolbarItems` props accept an array of `ToolbarItem` objects.

```ts
type ToolbarItemType =
  | 'undo' | 'redo' | 'divider'
  | 'bold' | 'italic' | 'underline' | 'strikethrough'
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
  | 'paragraph' | 'headingDropdown'
  | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'
  | 'textColor' | 'backgroundColor'
  | 'link' | 'fullscreen';

interface ToolbarItem {
  type: ToolbarItemType;
  label?: string;        // Custom label
  icon?: React.ReactNode; // Custom icon
  color?: string;        // Default color for textColor/backgroundColor (e.g. '#ff0000')
  colors?: string[];     // Custom color palette for color picker
}
```

**Default toolbar:**

```ts
const defaultToolbarItems = [
  { type: 'undo' },
  { type: 'redo' },
  { type: 'divider' },
  { type: 'bold' },
  { type: 'italic' },
  { type: 'underline' },
  { type: 'strikethrough' },
  { type: 'divider' },
  { type: 'headingDropdown' },
  { type: 'divider' },
  { type: 'link' },
];
```

## Examples

### Save and restore content

```tsx
import { useState } from 'react';
import { LuxeEditor, getEditorJSON } from 'luxe-edit';
import 'luxe-edit/index.css';

function App() {
  const [savedJSON, setSavedJSON] = useState(null);

  return (
    <>
      <LuxeEditor
        initialConfig={{ namespace: 'MyEditor' }}
        initialJSON={savedJSON}
        onChange={(editorState) => {
          setSavedJSON(getEditorJSON(editorState));
        }}
      />
      <button onClick={() => console.log(savedJSON)}>Log JSON</button>
    </>
  );
}
```

### Custom toolbar

```tsx
<LuxeEditor
  initialConfig={{ namespace: 'MyEditor' }}
  toolbarItems={[
    { type: 'bold' },
    { type: 'italic' },
    { type: 'divider' },
    { type: 'textColor', colors: ['#000000', '#ef4444', '#3b82f6'] },
    { type: 'headingDropdown' },
    { type: 'fullscreen' },
  ]}
/>
```

### Disable floating toolbar

```tsx
<LuxeEditor
  initialConfig={{ namespace: 'MyEditor' }}
  showFloatingToolbar={false}
/>
```

### Get plain text or markdown

```tsx
import { getEditorText, getEditorFormattedText } from 'luxe-edit';

onChange={(editorState) => {
  const plain = getEditorText(editorState);        // Plain text
  const markdown = getEditorFormattedText(editorState); // Markdown-style text
}}
```

## Utility Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getEditorJSON` | `(editorState) => any` | Serialized JSON — store in a database and reload with `initialJSON` |
| `getEditorText` | `(editorState) => string` | Plain text content |
| `getEditorFormattedText` | `(editorState) => string` | Markdown-formatted text |
| `getEditorDOM` | `(editor) => string` | Raw HTML from the editor DOM |
| `getEditorTree` | `(json) => any` | Debug tree structure from JSON |

## License

MIT
