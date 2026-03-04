import React from 'react';
import { LuxeEditor, type ToolbarItem, getEditorJSON, getMarkdownFromJSON, getDOMFromJSON } from 'luxe-edit';

export function Playground() {
  const [showFloatingToolbar, setShowFloatingToolbar] = React.useState(true);
  const [showTopToolbar, setShowTopToolbar] = React.useState(true);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [displayMode, setDisplayMode] = React.useState<'markdown' | 'dom'>('markdown');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const [jsonOutput, setJsonOutput] = React.useState<any>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const markdownOutput = React.useMemo(() => {
    return jsonOutput ? getMarkdownFromJSON(jsonOutput) : '';
  }, [jsonOutput]);

  const domOutput = React.useMemo(() => {
    return jsonOutput ? getDOMFromJSON(jsonOutput) : '';
  }, [jsonOutput]);

  const markdownExampleCode = `import { getMarkdownFromJSON } from 'luxe-edit';

const markdown = getMarkdownFromJSON(savedJson);
console.log(markdown);`;

  const domExampleCode = `import { getDOMFromJSON } from 'luxe-edit';

const html = getDOMFromJSON(savedJson);

// React
<div dangerouslySetInnerHTML={{ __html: html }} />`;

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
          Write in editor, save JSON, and render it as Markdown or DOM in your app
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
              onChange={(editorState) => {
                const json = getEditorJSON(editorState);
                setJsonOutput(json);
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
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              color: '#334155',
              fontSize: '0.95rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 14px'
            }}>
              JSON is the source of truth. Save this JSON in DB/API, then render it as Markdown or DOM when needed.
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: '12px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>JSON Output</h3>
              <JSONView json={jsonOutput} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>Display from JSON</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setDisplayMode('markdown')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: displayMode === 'markdown' ? '#3b82f6' : '#fff',
                      color: displayMode === 'markdown' ? '#fff' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: displayMode === 'markdown' ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setDisplayMode('dom')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: displayMode === 'dom' ? '#3b82f6' : '#fff',
                      color: displayMode === 'dom' ? '#fff' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: displayMode === 'dom' ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    DOM
                  </button>
                </div>
              </div>

              {displayMode === 'markdown' ? (
                <DisplayExample
                  title="Markdown View"
                  output={markdownOutput}
                  emptyText="(empty - start typing to generate markdown from JSON)"
                  code={markdownExampleCode}
                />
              ) : (
                <DisplayExample
                  title="DOM View (HTML string)"
                  output={domOutput}
                  emptyText="(empty - start typing to generate DOM/HTML from JSON)"
                  code={domExampleCode}
                />
              )}
            </div>
          </div>
        </div>
      </div>
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

function DisplayExample({
  title,
  output,
  emptyText,
  code,
}: {
  title: string;
  output: string;
  emptyText: string;
  code: string;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
      <div>
        <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{title}</div>
        <div style={{
          background: '#1e293b',
          padding: '14px',
          borderRadius: '8px',
          minHeight: '120px',
          maxHeight: '180px',
          overflow: 'auto',
          color: '#fff',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          fontSize: '0.8rem'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4' }}>
            {output || emptyText}
          </pre>
        </div>
      </div>
      <div>
        <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Example Code</div>
        <div style={{
          background: '#0f172a',
          padding: '14px',
          borderRadius: '8px',
          overflow: 'auto',
          color: '#e2e8f0',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          fontSize: '0.8rem'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4' }}>{code}</pre>
        </div>
      </div>
    </div>
  );
}
