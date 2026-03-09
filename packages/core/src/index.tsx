import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ParagraphNode, TextNode, EditorState, LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FloatingToolbarPlugin } from './plugins/FloatingToolbarPlugin';
import { Toolbar } from './plugins/Toolbar';

// Export types and components
export { FloatingToolbarPlugin } from './plugins/FloatingToolbarPlugin';
export { Toolbar } from './plugins/Toolbar';
export { getEditorJSON, getEditorText, getEditorFormattedText, getEditorDOM, getEditorTree, getTextFromJSON, getHTMLFromJSON, getMarkdownFromJSON, getDOMFromJSON } from './utils';
export type { ToolbarItem } from './types/toolbar';
export type { ToolbarItemType } from './types/toolbar';

// Define a default theme using CSS variables for easy customization
const defaultTheme = {
  paragraph: 'luxe-paragraph',
  heading: {
    h1: 'luxe-heading-h1',
    h2: 'luxe-heading-h2',
    h3: 'luxe-heading-h3',
    h4: 'luxe-heading-h4',
    h5: 'luxe-heading-h5',
    h6: 'luxe-heading-h6',
  },
  text: {
    bold: 'luxe-bold',
    italic: 'luxe-italic',
    underline: 'luxe-underline',
    strikethrough: 'luxe-strikethrough',
  }
};

import type { ToolbarItem } from './types/toolbar';

export interface LuxeEditorProps {
  initialConfig: Partial<InitialConfigType>;
  /**
   * Optional initial editor content as a serialized Lexical editor state (JSON).
   * This is ideal for loading content from a database for editing.
   */
  initialJSON?: any;
  showFloatingToolbar?: boolean;
  showToolbar?: boolean;
  editable?: boolean; // Enable or disable editor editing mode
  toolbarItems?: ToolbarItem[];
  floatingToolbarItems?: ToolbarItem[]; // Separate items for floating toolbar (optional)
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  ignoreInitialChange?: boolean; // Skip onChange on initial mount (default: true)
  colorScheme?: 'light' | 'dark'; // Color scheme for the editor
  children?: React.ReactNode;
}

function OnChangeHandler({ onChange, ignoreInitialChange }: { onChange: (editorState: EditorState, editor: LexicalEditor) => void; ignoreInitialChange: boolean }) {
  const [editor] = useLexicalComposerContext();
  const isInitialChangeRef = React.useRef(true);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState, prevEditorState }) => {
      if (ignoreInitialChange && isInitialChangeRef.current && prevEditorState.isEmpty()) {
        isInitialChangeRef.current = false;
        return;
      }
      isInitialChangeRef.current = false;
      onChange(editorState, editor);
    });
  }, [editor, onChange, ignoreInitialChange]);

  return null;
}

function InitialJSONHandler({ initialJSON }: { initialJSON: any }) {
  const [editor] = useLexicalComposerContext();
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!initialJSON || hasInitializedRef.current) return;
    try {
      const editorState = editor.parseEditorState(initialJSON);
      editor.setEditorState(editorState);
      hasInitializedRef.current = true;
    } catch (error) {
      console.error('LuxeEditor: Failed to parse initialJSON', error);
    }
  }, [editor, initialJSON]);

  return null;
}

function EditableHandler({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return null;
}

export function LuxeEditor({
  initialConfig,
  initialJSON,
  showFloatingToolbar = true,
  showToolbar = true,
  editable = true,
  toolbarItems,
  floatingToolbarItems,
  onChange,
  ignoreInitialChange = true,
  colorScheme,
  children
}: LuxeEditorProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  // Default nodes for rich text editing
  const defaultNodes = [
    HeadingNode,
    ParagraphNode,
    TextNode,
    LinkNode,
    AutoLinkNode,
  ];

  // Merge theme with user's theme if provided
  const mergedTheme = initialConfig.theme 
    ? { ...defaultTheme, ...initialConfig.theme }
    : defaultTheme;

  // Extract theme from initialConfig to avoid override
  const { theme: _, ...restInitialConfig } = initialConfig;
  
  // Get user's onUpdate if provided (it's not in the type but can be passed)
  const userOnUpdate = (restInitialConfig as any).onUpdate;


  const config = {
    namespace: 'LuxeEditor',
    theme: mergedTheme,
    nodes: defaultNodes,
    editable,
    onError: (error: Error) => console.error(error),
    onUpdate: userOnUpdate,
    ...restInitialConfig,
  };

  // Default toolbar items if none provided
  const defaultToolbarItems: ToolbarItem[] = [
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
  const items = toolbarItems || defaultToolbarItems;

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <LexicalComposer initialConfig={config}>
      <div className={`luxe-editor-container ${isFullscreen ? 'luxe-editor-fullscreen' : ''}`} data-luxe-theme={colorScheme}>
        {showToolbar && editable && items && items.length > 0 && (
          <Toolbar items={items} onFullscreenToggle={toggleFullscreen} isFullscreen={isFullscreen} />
        )}
        <RichTextPlugin
          contentEditable={<ContentEditable className="luxe-input" />}
          placeholder={<div className="luxe-placeholder">Start writing...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <EditableHandler editable={editable} />
        {onChange && <OnChangeHandler onChange={onChange} ignoreInitialChange={ignoreInitialChange} />}
        {initialJSON && <InitialJSONHandler initialJSON={initialJSON} />}
        {showFloatingToolbar && editable && (
          <FloatingToolbarPlugin
            enabled={true}
            items={floatingToolbarItems || items}
            colorScheme={colorScheme}
          />
        )}
        {children}
      </div>
    </LexicalComposer>
  );
}