import React from 'react';
import { LuxeEditor, type ToolbarItem, getEditorText, getEditorJSON, getEditorDOM, getEditorTree, getHTMLFromJSON } from 'luxe-edit';
import type { LexicalEditor } from 'lexical';

export function Playground() {
  const [showFloatingToolbar, setShowFloatingToolbar] = React.useState(true);
  const [showTopToolbar, setShowTopToolbar] = React.useState(true);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = React.useState<'tree' | 'dom' | 'json' | 'html'>('tree');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const [editorInstance, setEditorInstance] = React.useState<LexicalEditor | null>(null);
  const [editorContent, setEditorContent] = React.useState({
    json: null as any,
    tree: null as any,
    dom: '',
    html: '',
    wordCount: 0,
    charCount: 0
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update DOM when switching to DOM view or when editor instance changes
  React.useEffect(() => {
    if (viewMode === 'dom' && editorInstance) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const dom = getEditorDOM(editorInstance);
        setEditorContent(prev => ({
          ...prev,
          dom
        }));
      });
    }
  }, [viewMode, editorInstance]);

  const toolbarItems: ToolbarItem[] = [
    { type: 'undo' },
    { type: 'redo' },
    { type: 'divider' },
    { type: 'bold' },
    { type: 'italic' },
    { type: 'underline' },
    { type: 'strikethrough' },
    { type: 'divider' },
    { type: 'textColor' },
    { type: 'backgroundColor' },
    { type: 'headingDropdown' },
    { type: 'divider' },
    { type: 'link' },
    { type: 'divider' },
    { type: 'alignLeft' },
    { type: 'alignCenter' },
    { type: 'alignRight' },
    { type: 'alignJustify' },
    { type: 'divider' },
    { type: 'fullscreen' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto 32px auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Playground
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b', 
          margin: 0
        }}>
          Try out LuxeEdit and see the output in real-time
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto 24px auto',
        padding: '16px', 
        background: '#fff', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showTopToolbar} 
            onChange={(e) => setShowTopToolbar(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: '#475569', fontWeight: 500 }}>Top Toolbar</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showFloatingToolbar}
            onChange={(e) => setShowFloatingToolbar(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: '#475569', fontWeight: 500 }}>Floating Toolbar</span>
        </label>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#475569', fontWeight: 500 }}>Theme:</span>
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '6px',
            padding: '3px',
            gap: '3px',
          }}>
            <button
              onClick={() => setColorScheme('light')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                background: colorScheme === 'light' ? '#fff' : 'transparent',
                color: colorScheme === 'light' ? '#1e293b' : '#64748b',
                cursor: 'pointer',
                fontWeight: colorScheme === 'light' ? 600 : 400,
                fontSize: '0.85rem',
                boxShadow: colorScheme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setColorScheme('dark')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                background: colorScheme === 'dark' ? '#1e293b' : 'transparent',
                color: colorScheme === 'dark' ? '#f8fafc' : '#64748b',
                cursor: 'pointer',
                fontWeight: colorScheme === 'dark' ? 600 : 400,
                fontSize: '0.85rem',
              }}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Section - Editor */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 250px)',
          minHeight: '600px'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✏️</span> Editor
            </h2>
          </div>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px'
          }}>
            <LuxeEditor
              initialConfig={{
                namespace: 'LuxePlayground',
                theme: {}
              }}
              showToolbar={showTopToolbar}
              showFloatingToolbar={showFloatingToolbar}
              toolbarItems={toolbarItems}
              colorScheme={colorScheme}
              onChange={(editorState, editor) => {
                const plainText = getEditorText(editorState);
                const json = getEditorJSON(editorState);
                const tree = getEditorTree(json);
                const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
                
                if (editor) {
                  setEditorInstance(editor);
                }
                
                // Update DOM asynchronously to ensure it's ready
                const updateDOM = () => {
                  if (editor) {
                    requestAnimationFrame(() => {
                      const dom = getEditorDOM(editor);
                      setEditorContent(prev => ({
                        ...prev,
                        dom
                      }));
                    });
                  }
                };
                
                setEditorContent({
                  json,
                  tree,
                  dom: '', // Will be updated asynchronously
                  html: getHTMLFromJSON(json),
                  wordCount: words.length,
                  charCount: plainText.length
                });
                
                updateDOM();
              }}
            />
          </div>
        </div>

        {/* Right Section - Output View */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 250px)',
          minHeight: '600px'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📊</span> Output
            </h2>
            
            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              gap: '4px',
              background: '#fff',
              padding: '4px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => setViewMode('tree')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'tree' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'tree' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'tree' ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                🌳 Tree
              </button>
              <button
                onClick={() => setViewMode('dom')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'dom' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'dom' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'dom' ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                🏗️ DOM
              </button>
              <button
                onClick={() => setViewMode('json')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'json' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'json' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'json' ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                🔧 JSON
              </button>
              <button
                onClick={() => setViewMode('html')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'html' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'html' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'html' ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                🌐 HTML
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Words</div>
                <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {editorContent.wordCount}
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Characters</div>
                <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {editorContent.charCount}
                </div>
              </div>
            </div>

            {/* Content Display */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {viewMode === 'tree' ? (
                <TreeView tree={editorContent.tree} />
              ) : viewMode === 'dom' ? (
                <DOMView dom={editorContent.dom} />
              ) : viewMode === 'html' ? (
                <HTMLView html={editorContent.html} />
              ) : (
                <JSONView json={editorContent.json} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree View Component
function TreeView({ tree }: { tree: any }) {
  const renderTreeNode = (node: any, depth: number = 0): React.ReactNode => {
    if (!node) return null;
    
    const indent = depth * 20;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.key || Math.random()} style={{ marginLeft: `${indent}px` }}>
        <div style={{
          padding: '4px 8px',
          margin: '2px 0',
          background: depth === 0 ? '#1e40af' : depth % 2 === 0 ? '#1e293b' : '#334155',
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#fff',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {hasChildren && (
            <span style={{ color: '#60a5fa' }}>▼</span>
          )}
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>{node.type}</span>
          {node.tag && (
            <span style={{ color: '#34d399' }}>&lt;{node.tag}&gt;</span>
          )}
          {node.text && (
            <span style={{ color: '#e5e7eb', opacity: 0.8 }}>"{node.text}"</span>
          )}
          {node.format !== undefined && node.format > 0 && (
            <span style={{ color: '#a78bfa', fontSize: '0.75rem' }}>
              format: {node.format}
            </span>
          )}
          {node.key && (
            <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
              ({node.key.substring(0, 8)}...)
            </span>
          )}
        </div>
        {hasChildren && (
          <div style={{ marginLeft: '8px' }}>
            {node.children.map((child: any, index: number) => 
              renderTreeNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div style={{
      background: '#0f172a',
      padding: '20px',
      borderRadius: '8px',
      flex: 1,
      overflow: 'auto',
      fontSize: '0.85rem',
      color: '#fff',
      fontFamily: 'Monaco, Menlo, "Courier New", monospace'
    }}>
      {tree ? (
        renderTreeNode(tree)
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
          (empty - start typing to see tree structure)
        </div>
      )}
    </div>
  );
}

// DOM View Component
function DOMView({ dom }: { dom: string }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: '20px',
      borderRadius: '8px',
      flex: 1,
      overflow: 'auto',
      fontSize: '0.85rem',
      color: '#fff',
      fontFamily: 'Monaco, Menlo, "Courier New", monospace'
    }}>
      {dom ? (
        <pre style={{ 
          margin: 0, 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          lineHeight: '1.5'
        }}>
          {dom}
        </pre>
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
          (empty - start typing to see DOM output)
        </div>
      )}
    </div>
  );
}

// HTML View Component
function HTMLView({ html }: { html: string }) {
  const [tab, setTab] = React.useState<'preview' | 'source'>('preview');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['preview', 'source'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: tab === t ? '#3b82f6' : '#fff',
              color: tab === t ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'preview' ? '👁 Preview' : '📄 Source'}
          </button>
        ))}
      </div>

      {tab === 'preview' ? (
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: '#1e293b',
        }}>
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
              (empty — start typing to see rendered HTML)
            </div>
          )}
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          background: '#1e293b',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#7dd3fc',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
            {html || '(empty — start typing to see HTML source)'}
          </pre>
        </div>
      )}
    </div>
  );
}

// JSON View Component
function JSONView({ json }: { json: any }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: '20px',
      borderRadius: '8px',
      flex: 1,
      overflow: 'auto',
      fontSize: '0.85rem',
      color: '#fff',
      fontFamily: 'Monaco, Menlo, "Courier New", monospace'
    }}>
      <pre style={{ 
        margin: 0, 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        lineHeight: '1.5'
      }}>
        {json ? JSON.stringify(json, null, 2) : '(empty - start typing to see JSON output)'}
      </pre>
    </div>
  );
}
