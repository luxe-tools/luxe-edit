import { EditorState, createEditor, ParagraphNode, TextNode } from 'lexical';
import { $getRoot, $isElementNode, $isTextNode } from 'lexical';
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';

/**
 * Get the editor content as JSON
 */
export function getEditorJSON(editorState: EditorState): any {
  return editorState.toJSON();
}

/**
 * Get the editor content as plain text
 */
export function getEditorText(editorState: EditorState): string {
  let text = '';
  editorState.read(() => {
    const root = $getRoot();
    text = root.getTextContent();
  });
  return text;
}

/**
 * Format a text node with markdown syntax
 */
function formatTextNode(text: string, format: number): string {
  // Lexical format flags (bitwise):
  // Bold: 1 (0b0001 = 1)
  // Italic: 2 (0b0010 = 2)
  // Underline: 4 (0b0100 = 4)
  // Strikethrough: 8 (0b1000 = 8)
  
  const isBold = (format & 1) !== 0;
  const isItalic = (format & 2) !== 0;
  const isUnderline = (format & 4) !== 0;
  const isStrikethrough = (format & 8) !== 0;
  
  // Handle bold + italic combination first (***text***)
  if (isBold && isItalic) {
    text = `***${text}***`;
  } else if (isBold) {
    text = `**${text}**`;
  } else if (isItalic) {
    text = `*${text}*`;
  }
  
  // Apply underline (wraps around bold/italic)
  if (isUnderline) {
    text = `__${text}__`;
  }
  
  // Apply strikethrough (outermost)
  if (isStrikethrough) {
    text = `~~${text}~~`;
  }
  
  return text;
}

function formatNodeToMarkdown(node: any): string {
  let result = '';

  if ($isHeadingNode(node)) {
    const tag = node.getTag(); // h1, h2, h3, etc.
    const level = parseInt(tag.replace('h', ''));
    const hashes = '#'.repeat(level);

    const headingChildren = node.getChildren();
    let headingText = '';

    for (const child of headingChildren) {
      if ($isTextNode(child)) {
        headingText += formatTextNode(child.getTextContent(), child.getFormat());
      } else if ($isElementNode(child)) {
        headingText += formatNodeToMarkdown(child);
      }
    }

    result += `${hashes} ${headingText}\n\n`;
  } else if ($isElementNode(node)) {
    const elementChildren = node.getChildren();
    let nodeText = '';

    for (const child of elementChildren) {
      if ($isTextNode(child)) {
        nodeText += formatTextNode(child.getTextContent(), child.getFormat());
      } else if ($isElementNode(child)) {
        nodeText += formatNodeToMarkdown(child);
      }
    }

    const nodeType = node.getType();
    if (nodeType === 'paragraph') {
      result += nodeText + '\n\n';
    } else {
      result += nodeText;
    }
  } else if ($isTextNode(node)) {
    result += formatTextNode(node.getTextContent(), node.getFormat());
  }

  return result;
}

function getMarkdownFromEditorState(editorState: EditorState): string {
  let formattedText = '';

  editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    for (const child of children) {
      formattedText += formatNodeToMarkdown(child);
    }
  });

  return formattedText.trim();
}

/**
 * Get the editor content as formatted text (preserves headings and formatting)
 */
export function getEditorFormattedText(editorState: EditorState): string {
  return getMarkdownFromEditorState(editorState);
}

/**
 * Get DOM HTML from editor instance
 */
export function getEditorDOM(editor: any): string {
  if (!editor) return '';
  
  try {
    const rootElement = editor.getRootElement();
    if (!rootElement) return '';
    
    // Lexical's editor root element contains the contentEditable div
    // The structure is typically: rootElement > div[contenteditable="true"] > content
    const contentEditable = rootElement.querySelector('[contenteditable="true"]');
    
    if (contentEditable) {
      // Get the innerHTML of the contentEditable element
      const html = contentEditable.innerHTML || '';
      // Clean up empty content
      return html.trim() || '';
    }
    
    // Fallback: check if root element itself is contentEditable
    if (rootElement.hasAttribute('contenteditable') && rootElement.getAttribute('contenteditable') === 'true') {
      return rootElement.innerHTML || '';
    }
    
    // Another fallback: get all direct children that aren't toolbars
    const children = Array.from(rootElement.children).filter((child: any) => {
      // Skip toolbars and other non-content elements
      const id = child.id || '';
      const className = child.className || '';
      return !id.includes('toolbar') && !className.includes('toolbar');
    });
    
    if (children.length > 0) {
      // Find the contentEditable child
      for (const child of children) {
        if ((child as HTMLElement).hasAttribute('contenteditable')) {
          return (child as HTMLElement).innerHTML || '';
        }
      }
      // If no contentEditable found, return first child's HTML
      return (children[0] as HTMLElement).innerHTML || '';
    }
    
    // Last resort: return root element's innerHTML
    return rootElement.innerHTML || '';
  } catch (error) {
    console.error('Error getting editor DOM:', error);
    return '';
  }
}

/**
 * Convert JSON to tree structure for display
 */
export function getEditorTree(json: any): any {
  if (!json || !json.root) return null;
  
  const buildTree = (node: any, depth: number = 0): any => {
    if (!node) return null;
    
    const nodeType = node.type || 'unknown';
    const key = node.key || '';
    const children = node.children || [];
    
    const treeNode: any = {
      type: nodeType,
      key: key,
      depth: depth,
      children: []
    };
    
    // Add node-specific properties
    if (node.tag) treeNode.tag = node.tag;
    if (node.format !== undefined) treeNode.format = node.format;
    if (node.text) treeNode.text = node.text.substring(0, 50) + (node.text.length > 50 ? '...' : '');
    if (node.style) treeNode.style = node.style;
    if (node.indent) treeNode.indent = node.indent;
    if (node.direction) treeNode.direction = node.direction;
    
    // Recursively build children
    if (Array.isArray(children)) {
      treeNode.children = children.map((child: any) => buildTree(child, depth + 1)).filter(Boolean);
    }
    
    return treeNode;
  };
  
  return buildTree(json.root);
}

const headlessNodes = [HeadingNode, ParagraphNode, TextNode, LinkNode, AutoLinkNode];

function createHeadlessEditor() {
  return createEditor({
    namespace: 'luxe-headless',
    nodes: headlessNodes,
    onError: () => {},
  });
}

/**
 * Extract plain text from a stored Lexical JSON object.
 * No editor instance or DOM required — works anywhere (server, utility, etc.)
 */
export function getTextFromJSON(json: any): string {
  if (!json) return '';
  try {
    const editor = createHeadlessEditor();
    const editorState = editor.parseEditorState(json);
    let text = '';
    editorState.read(() => {
      text = $getRoot().getTextContent();
    });
    return text;
  } catch {
    return '';
  }
}

function serializeNodeToHTML(node: any): string {
  if (!node) return '';

  if (node.type === 'text') {
    let text = node.text || '';
    const format: number = node.format || 0;
    if ((format & 8) !== 0) text = `<s>${text}</s>`;
    if ((format & 4) !== 0) text = `<u>${text}</u>`;
    if ((format & 2) !== 0) text = `<em>${text}</em>`;
    if ((format & 1) !== 0) text = `<strong>${text}</strong>`;
    return text;
  }

  if (node.type === 'linebreak') {
    return '<br>';
  }

  const children: string = (node.children || [])
    .map((child: any) => serializeNodeToHTML(child))
    .join('');

  if (node.type === 'heading') {
    const tag = node.tag || 'h1';
    return `<${tag}>${children}</${tag}>`;
  }

  if (node.type === 'paragraph') {
    return `<p>${children}</p>`;
  }

  if (node.type === 'link' || node.type === 'autolink') {
    const href = node.url || '#';
    const target = node.target ? ` target="${node.target}"` : '';
    const rel = node.rel ? ` rel="${node.rel}"` : '';
    return `<a href="${href}"${target}${rel}>${children}</a>`;
  }

  if (node.type === 'root') {
    return children;
  }

  // generic fallback: unknown nodes pass through their children
  return children;
}

/**
 * Convert a stored Lexical JSON object to an HTML string.
 * Useful for rendering editor content in read-only views without mounting the editor.
 * Note: runs in a browser-like environment; on the server use a DOM shim (e.g. jsdom).
 */
export function getHTMLFromJSON(json: any): string {
  if (!json) return '';
  try {
    if (json.root) {
      return serializeNodeToHTML(json.root);
    }
    const editor = createHeadlessEditor();
    const editorState = editor.parseEditorState(json);
    let html = '';
    editorState.read(() => {
      html = $generateHtmlFromNodes(editor, null);
    });
    return html;
  } catch {
    return '';
  }
}

/**
 * Convert a stored Lexical JSON object to markdown-style text.
 * This is the JSON-first equivalent of getEditorFormattedText.
 */
export function getMarkdownFromJSON(json: any): string {
  if (!json) return '';
  try {
    const editor = createHeadlessEditor();
    const editorState = editor.parseEditorState(json);
    return getMarkdownFromEditorState(editorState);
  } catch {
    return '';
  }
}

/**
 * Alias for getHTMLFromJSON for teams that prefer DOM wording.
 */
export function getDOMFromJSON(json: any): string {
  return getHTMLFromJSON(json);
}
