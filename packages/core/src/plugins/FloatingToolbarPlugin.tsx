import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, $createParagraphNode, $isElementNode } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ToolbarItem } from '../types/toolbar';
import { getToolbarLabel, defaultColors } from './Toolbar';

interface FloatingToolbarPluginProps {
  enabled?: boolean;
  items?: ToolbarItem[];
  colorScheme?: 'light' | 'dark';
}

// Default floating toolbar items - only essential text formatting
const defaultFloatingToolbarItems: ToolbarItem[] = [
  { type: 'bold' },
  { type: 'italic' },
  { type: 'underline' },
];

// Filter items to only show basic text formatting options suitable for floating toolbar
function filterFloatingToolbarItems(items: ToolbarItem[]): ToolbarItem[] {
  const allowedTypes = ['bold', 'italic', 'underline', 'strikethrough', 'textColor', 'backgroundColor'];
  return items.filter(item => allowedTypes.includes(item.type));
}

export function FloatingToolbarPlugin({
  enabled = true,
  items,
  colorScheme,
}: FloatingToolbarPluginProps) {
  // Use filtered items if provided, otherwise use defaults
  const floatingItems = items 
    ? filterFloatingToolbarItems(items).slice(0, 4) // Limit to max 4 items
    : defaultFloatingToolbarItems;
  const [editor] = useLexicalComposerContext();
  const [coords, setCoords] = useState<{ x: number, y: number } | null>(null);
  const [editorRootElement, setEditorRootElement] = useState<HTMLElement | null>(null);

  // Get the editor's root element
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (rootElement) {
      setEditorRootElement(rootElement);
    }
  }, [editor]);

  const updateToolbar = useCallback(() => {
    if (!editorRootElement) return;

    const domSelection = window.getSelection();
    
    // Check if there's a selection and it's not collapsed
    if (!domSelection || domSelection.rangeCount === 0 || domSelection.isCollapsed) {
      setCoords(null);
      return;
    }

    try {
      const range = domSelection.getRangeAt(0);
      
      // Check if selection is within the editor
      if (!editorRootElement.contains(range.commonAncestorContainer)) {
        setCoords(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      
      // Only show toolbar if selection is valid and visible
      if (rect && rect.width > 0 && rect.height > 0) {
        // Verify Lexical also has a selection
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (selection && $isRangeSelection(selection) && !selection.isCollapsed()) {
            setCoords({ 
              x: rect.left + rect.width / 2, 
              y: rect.top - 40 
            });
          } else {
            setCoords(null);
          }
        });
      } else {
        setCoords(null);
      }
    } catch (e) {
      // Selection might be invalid, hide toolbar
      setCoords(null);
    }
  }, [editor, editorRootElement]);

  useEffect(() => {
    if (!editorRootElement) return;

    // Listen to editor updates
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Small delay to ensure DOM is updated
      setTimeout(() => updateToolbar(), 10);
    });

    return () => {
      removeUpdateListener();
    };
  }, [editor, editorRootElement, updateToolbar]);

  useEffect(() => {
    // Listen to mouse events for selection changes
    const handleMouseUp = () => {
      setTimeout(() => updateToolbar(), 50);
    };

    const handleKeyUp = () => {
      setTimeout(() => updateToolbar(), 50);
    };

    const handleSelectionChange = () => {
      setTimeout(() => updateToolbar(), 50);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateToolbar]);

  const handleToolbarAction = useCallback((item: ToolbarItem, color?: string): void => {
    const { type } = item;

    // Handle color formatting
    if (type === 'textColor' && color) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            color: color,
          });
        }
      });
      return;
    }

    if (type === 'backgroundColor' && color) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'background-color': color,
          });
        }
      });
      return;
    }

    // Handle text formatting commands (bold, italic, underline, strikethrough)
    if (type === 'bold' || type === 'italic' || type === 'underline' || type === 'strikethrough') {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
      return;
    }

    // Handle heading formatting
    if (type.startsWith('heading')) {
      const levelNum = parseInt(type.replace('heading', ''));
      const level = `h${levelNum}` as HeadingTagType;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          let element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
          const elementKey = element.getKey();
          const elementNode = editor.getElementByKey(elementKey);
          
          if (elementNode !== null && $isElementNode(element)) {
            const headingNode = $createHeadingNode(level);
            const children = element.getChildren();
            headingNode.append(...children);
            element.replace(headingNode);
            headingNode.selectEnd();
          }
        }
      });
      return;
    }

    // Handle paragraph formatting
    if (type === 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          let element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
          const elementKey = element.getKey();
          const elementNode = editor.getElementByKey(elementKey);
          
          if (elementNode !== null && $isHeadingNode(element) && $isElementNode(element)) {
            const paragraphNode = $createParagraphNode();
            const children = element.getChildren();
            paragraphNode.append(...children);
            element.replace(paragraphNode);
            paragraphNode.selectEnd();
          }
        }
      });
      return;
    }
  }, [editor]);

  // Early returns after all hooks have been called
  if (!enabled || !floatingItems || floatingItems.length === 0) return null;
  if (!coords) return null;

  return createPortal(
    <div
      className="luxe-floating-toolbar"
      data-luxe-theme={colorScheme}
      style={{
        position: 'fixed',
        top: `${coords.y}px`,
        left: `${coords.x}px`,
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '4px',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      {floatingItems.map((item, index) => {
        const label = item.label || getToolbarLabel(item.type);
        const isHeading = item.type.startsWith('heading');
        const headingLevel = isHeading ? parseInt(item.type.replace('heading', '')) : null;

        // Color buttons in floating toolbar - simplified version
        if (item.type === 'textColor' || item.type === 'backgroundColor') {
          const colors = item.colors || defaultColors.slice(0, 6); // Show 6 colors in floating toolbar
          return (
            <div key={`${item.type}-${index}`} style={{ display: 'flex', gap: '2px' }}>
              {item.color ? (
                <button
                  onClick={() => handleToolbarAction(item, item.color)}
                  title={`${item.type === 'textColor' ? 'Text' : 'Background'} Color`}
                  className="luxe-toolbar-select-btn"
                  style={{
                    padding: '4px 8px',
                    background: item.type === 'backgroundColor' ? item.color : undefined,
                    color: item.type === 'textColor' ? item.color : undefined,
                    borderRadius: '4px',
                    minWidth: '28px',
                    height: '28px',
                  }}
                >
                  {item.type === 'textColor' ? 'A' : '■'}
                </button>
              ) : (
                colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleToolbarAction(item, color)}
                    title={color}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: item.type === 'textColor' ? `3px solid ${color}` : '1px solid #e5e7eb',
                      background: item.type === 'backgroundColor' ? color : undefined,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.type === 'textColor' && (
                      <span style={{ color, fontSize: '12px', fontWeight: 'bold', lineHeight: '1' }}>A</span>
                    )}
                  </button>
                ))
              )}
            </div>
          );
        }

        return (
          <button
            key={`${item.type}-${index}`}
            onClick={() => handleToolbarAction(item)}
            title={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            className="luxe-toolbar-btn"
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontWeight: item.type === 'bold' ? 'bold' : 'normal',
              fontStyle: item.type === 'italic' ? 'italic' : 'normal',
              textDecoration: item.type === 'underline' ? 'underline' : item.type === 'strikethrough' ? 'line-through' : 'none',
              fontSize: headingLevel ? `${18 - headingLevel * 2}px` : '14px',
              minWidth: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
          >
            {item.icon || label}
          </button>
        );
      })}
    </div>,
    document.body
  );
}