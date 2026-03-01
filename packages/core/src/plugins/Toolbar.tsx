import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isElementNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ToolbarItem, ToolbarItemType } from '../types/toolbar';

// Default color palette
export const defaultColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000',
  '#008000', '#000080', '#808000', '#800080', '#008080',
];

// Get label for toolbar item
export function getToolbarLabel(type: ToolbarItemType): string {
  const labels: Record<ToolbarItemType, string> = {
    undo: '↶',
    redo: '↷',
    divider: '',
    bold: 'B',
    italic: 'I',
    underline: 'U',
    strikethrough: 'S',
    heading1: 'H1',
    heading2: 'H2',
    heading3: 'H3',
    heading4: 'H4',
    heading5: 'H5',
    heading6: 'H6',
    paragraph: 'P',
    alignLeft: '⬅',
    alignCenter: '⬌',
    alignRight: '➡',
    alignJustify: '⬌',
    textColor: 'A',
    backgroundColor: '⬛',
    fullscreen: '⛶',
    headingDropdown: 'Normal',
    link: '🔗',
  };
  return labels[type] || type;
}

function Divider() {
  return (
    <div
      className="luxe-toolbar-divider"
      style={{
        width: '1px',
        height: '24px',
        margin: '0 4px',
      }}
    />
  );
}

interface ToolbarButtonProps {
  item: ToolbarItem;
  active?: boolean;
  disabled?: boolean;
  onAction: (item: ToolbarItem, color?: string, headingType?: string) => void;
  currentBlockType?: string;
}

function ColorPicker({ 
  item, 
  onAction 
}: { 
  item: ToolbarItem; 
  onAction: (item: ToolbarItem, color?: string, headingType?: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const colors = item.colors || defaultColors;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  if (item.color) {
    // Single color button
    return (
      <button
        onClick={() => onAction(item, item.color!)}
        title={`${item.type === 'textColor' ? 'Text' : 'Background'} Color: ${item.color}`}
        className="luxe-toolbar-select-btn"
        style={{
          padding: '6px 12px',
          background: item.type === 'backgroundColor' ? item.color : undefined,
          color: item.type === 'textColor' ? item.color : undefined,
          borderRadius: '4px',
          minWidth: '40px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.icon || getToolbarLabel(item.type)}
      </button>
    );
  }

  // Color picker with palette
  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        title={`${item.type === 'textColor' ? 'Text' : 'Background'} Color`}
        className="luxe-toolbar-select-btn"
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          minWidth: '40px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {item.icon || (
          <span style={{
            display: 'block',
            width: '20px',
            height: '20px',
            background: item.type === 'backgroundColor'
              ? 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)'
              : 'currentColor',
            backgroundSize: item.type === 'backgroundColor' ? '8px 8px' : 'auto',
            backgroundPosition: item.type === 'backgroundColor' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto',
          }}>
            {item.type === 'textColor' && (
              <span style={{ fontSize: '12px' }}>A</span>
            )}
          </span>
        )}
        <span style={{ marginLeft: '4px', fontSize: '10px' }}>▼</span>
      </button>
      {showPicker && (
        <div
          className="luxe-toolbar-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            borderRadius: '6px',
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '160px',
          }}
        >
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                onAction(item, color);
                setShowPicker(false);
              }}
              title={color}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: item.type === 'textColor' ? `3px solid ${color}` : '1px solid #e5e7eb',
                background: item.type === 'backgroundColor' ? color : 'white',
                color: item.type === 'textColor' ? '#000' : 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                position: 'relative',
              }}
            >
              {item.type === 'textColor' && (
                <span style={{ 
                  color: color, 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  lineHeight: '1',
                }}>A</span>
              )}
              {item.type === 'backgroundColor' && color === '#ffffff' && (
                <span style={{ 
                  color: '#000', 
                  fontSize: '10px',
                  border: '1px solid #ccc',
                  width: '12px',
                  height: '12px',
                  display: 'block',
                }}>□</span>
              )}
            </button>
          ))}
          <input
            type="color"
            onChange={(e) => {
              onAction(item, e.target.value);
              setShowPicker(false);
            }}
            className="luxe-toolbar-input"
            style={{
              gridColumn: '1 / -1',
              width: '100%',
              height: '32px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
        </div>
      )}
    </div>
  );
}

function HeadingDropdown({ 
  item, 
  onAction,
  currentBlockType = 'paragraph'
}: { 
  item: ToolbarItem; 
  onAction: (item: ToolbarItem, color?: string, headingType?: string) => void;
  currentBlockType?: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const getCurrentLabel = () => {
    if (currentBlockType === 'paragraph') return 'Normal';
    if (currentBlockType.startsWith('h')) {
      const level = currentBlockType.replace('h', '');
      return `Heading ${level}`;
    }
    return 'Normal';
  };

  const handleHeadingSelect = (headingType: string) => {
    onAction(item, undefined, headingType);
    setShowDropdown(false);
  };

  const headingOptions = [
    { value: 'paragraph', label: 'Normal' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'h4', label: 'Heading 4' },
    { value: 'h5', label: 'Heading 5' },
    { value: 'h6', label: 'Heading 6' },
  ];

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        title="Heading"
        className="luxe-toolbar-select-btn"
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          minWidth: '100px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          fontSize: currentBlockType === 'paragraph' ? '14px' :
                    currentBlockType === 'h1' ? '20px' :
                    currentBlockType === 'h2' ? '18px' :
                    currentBlockType === 'h3' ? '16px' : '14px',
          fontWeight: currentBlockType !== 'paragraph' ? 'bold' : 'normal',
        }}
      >
        <span>{item.label || getCurrentLabel()}</span>
        <span style={{ marginLeft: '8px', fontSize: '10px' }}>▼</span>
      </button>
      {showDropdown && (
        <div
          className="luxe-toolbar-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            borderRadius: '6px',
            padding: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          {headingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleHeadingSelect(option.value)}
              className={`luxe-toolbar-panel-item${currentBlockType === option.value ? ' luxe-active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: option.value === 'paragraph' ? '14px' :
                          option.value === 'h1' ? '20px' :
                          option.value === 'h2' ? '18px' :
                          option.value === 'h3' ? '16px' : '14px',
                fontWeight: option.value !== 'paragraph' ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkDialog({ 
  item, 
  onAction,
  editor
}: { 
  item: ToolbarItem; 
  onAction: (item: ToolbarItem, color?: string, headingType?: string) => void;
  editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [url, setUrl] = useState('');
  const [isLink, setIsLink] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateLinkState = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          let linkParent = null;
          
          // Check if any node in the selection has a link parent
          for (const node of nodes) {
            let current: any = node.getParent();
            while (current !== null) {
              if ($isLinkNode(current)) {
                linkParent = current;
                break;
              }
              current = current.getParent();
            }
            if (linkParent) break;
          }
          
          if (linkParent && $isLinkNode(linkParent)) {
            setIsLink(true);
            setUrl(linkParent.getURL());
          } else {
            setIsLink(false);
            setUrl('');
          }
        } else {
          setIsLink(false);
          setUrl('');
        }
      });
    };

    const unregister = editor.registerUpdateListener(() => {
      updateLinkState();
    });

    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateLinkState();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    updateLinkState();
    return () => {
      unregister();
      unregisterCommand();
    };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowDialog(false);
      }
    };

    if (showDialog) {
      document.addEventListener('mousedown', handleClickOutside);
      // Pre-fill URL if editing existing link
      if (isLink && url) {
        // URL is already set from updateLinkState
      }
      setTimeout(() => inputRef.current?.focus(), 0);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDialog, isLink, url]);

  const handleLink = () => {
    if (!url.trim()) {
      // Remove link if URL is empty
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setShowDialog(false);
      setUrl('');
      return;
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && 
        !normalizedUrl.startsWith('https://') && 
        !normalizedUrl.startsWith('mailto:') &&
        !normalizedUrl.startsWith('#') &&
        !normalizedUrl.startsWith('/')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Dispatch command to toggle/create the link
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, normalizedUrl);
    setShowDialog(false);
    setUrl('');
  };

  const handleRemoveLink = () => {
    // Dispatch command to remove link
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setShowDialog(false);
    setUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLink();
    } else if (e.key === 'Escape') {
      setShowDialog(false);
      setUrl('');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dialogRef}>
      <button
        onClick={() => setShowDialog(!showDialog)}
        title={isLink ? 'Edit Link' : 'Insert Link'}
        className={`luxe-toolbar-btn${isLink ? ' luxe-active' : ''}`}
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          minWidth: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
        }}
      >
        {item.icon || getToolbarLabel(item.type)}
      </button>
      {showDialog && (
        <div
          className="luxe-toolbar-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            borderRadius: '6px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '300px',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="luxe-toolbar-input"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {isLink && (
              <button
                onClick={handleRemoveLink}
                className="luxe-toolbar-select-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#dc2626',
                }}
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setShowDialog(false)}
              className="luxe-toolbar-select-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleLink}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: 'var(--luxe-primary)',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {isLink ? 'Update' : 'Insert'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ item, active = false, disabled = false, onAction, currentBlockType }: ToolbarButtonProps) {
  const isHeading = item.type.startsWith('heading') && item.type !== 'headingDropdown';
  const headingLevel = isHeading ? parseInt(item.type.replace('heading', '')) : null;
  const label = item.label || getToolbarLabel(item.type);

  if (item.type === 'divider') {
    return <Divider />;
  }

  // Heading dropdown
  if (item.type === 'headingDropdown') {
    return <HeadingDropdown item={item} onAction={onAction} currentBlockType={currentBlockType} />;
  }

  // Color picker buttons
  if (item.type === 'textColor' || item.type === 'backgroundColor') {
    return <ColorPicker item={item} onAction={onAction} />;
  }

  // Link button - handled separately in Toolbar component

  return (
    <button
      onClick={() => onAction(item)}
      disabled={disabled}
      title={item.type.charAt(0).toUpperCase() + item.type.slice(1).replace(/([A-Z])/g, ' $1').trim()}
      className={`luxe-toolbar-btn${active ? ' luxe-active' : ''}`}
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
}

interface ToolbarProps {
  items: ToolbarItem[];
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
}

export function Toolbar({ items, onFullscreenToggle, isFullscreen = false }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update block type (heading level)
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        setBlockType(type);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar]);

  const handleToolbarAction = useCallback((item: ToolbarItem, color?: string, headingType?: string) => {
    const { type } = item;

    // Handle fullscreen toggle
    if (type === 'fullscreen') {
      onFullscreenToggle?.();
      return;
    }

    // Handle undo/redo
    if (type === 'undo') {
      editor.dispatchCommand(UNDO_COMMAND, undefined);
      return;
    }
    if (type === 'redo') {
      editor.dispatchCommand(REDO_COMMAND, undefined);
      return;
    }

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

    // Handle alignment commands
    if (type === 'alignLeft') {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      return;
    }
    if (type === 'alignCenter') {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      return;
    }
    if (type === 'alignRight') {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      return;
    }
    if (type === 'alignJustify') {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      return;
    }

    // Handle heading dropdown
    if (type === 'headingDropdown' && headingType) {
      if (headingType === 'paragraph') {
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
      } else {
        const level = headingType as HeadingTagType;
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
      }
      return;
    }

    // Handle individual heading formatting (for backwards compatibility)
    if (type.startsWith('heading') && type !== 'headingDropdown') {
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
  }, [editor, onFullscreenToggle]);

  const getButtonState = (type: ToolbarItemType) => {
    switch (type) {
      case 'undo':
        return { disabled: !canUndo };
      case 'redo':
        return { disabled: !canRedo };
      case 'bold':
        return { active: isBold };
      case 'italic':
        return { active: isItalic };
      case 'underline':
        return { active: isUnderline };
      case 'strikethrough':
        return { active: isStrikethrough };
      case 'fullscreen':
        return { active: isFullscreen };
      case 'heading1':
        return { active: blockType === 'h1' };
      case 'heading2':
        return { active: blockType === 'h2' };
      case 'heading3':
        return { active: blockType === 'h3' };
      case 'heading4':
        return { active: blockType === 'h4' };
      case 'heading5':
        return { active: blockType === 'h5' };
      case 'heading6':
        return { active: blockType === 'h6' };
      case 'paragraph':
        return { active: blockType === 'paragraph' };
      default:
        return {};
    }
  };

  return (
    <div
      className="luxe-toolbar"
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        borderRadius: '8px 8px 0 0',
        padding: '8px',
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, index) => {
        const state = getButtonState(item.type);
        
        // Handle link separately
        if (item.type === 'link') {
          return <LinkDialog key={`${item.type}-${index}`} item={item} onAction={handleToolbarAction} editor={editor} />;
        }
        
        return (
          <ToolbarButton
            key={`${item.type}-${index}`}
            item={item}
            active={state.active}
            disabled={state.disabled}
            onAction={handleToolbarAction}
            currentBlockType={blockType}
          />
        );
      })}
    </div>
  );
}
