import React from 'react';

export function Docs() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: '#1e293b' }}>
          Documentation
        </h1>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>JSON-First Flow</h2>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>
              LuxeEdit is designed so your source of truth is JSON. Save editor output as JSON,
              then render it anywhere as Markdown or DOM/HTML using helper functions.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Installation</h2>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
{`npm install luxe-edit
# or
yarn add luxe-edit
# or
pnpm add luxe-edit`}
            </pre>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Save JSON Output</h2>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem', overflow: 'auto' }}>
{`import { useState } from 'react';
import { LuxeEditor, getEditorJSON } from 'luxe-edit';
import 'luxe-edit/index.css';

function App() {
  const [savedJson, setSavedJson] = useState(null);

  return (
    <LuxeEditor 
      initialConfig={{ namespace: 'MyEditor', theme: {} }}
      onChange={(editorState) => {
        setSavedJson(getEditorJSON(editorState));
      }}
    />
  );
}`}
            </pre>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Render Markdown from JSON</h2>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem', overflow: 'auto' }}>
{`import { getMarkdownFromJSON } from 'luxe-edit';

function MarkdownPreview({ savedJson }: { savedJson: any }) {
  const markdown = getMarkdownFromJSON(savedJson);

  return <pre>{markdown}</pre>;
}`}
            </pre>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Render DOM/HTML from JSON</h2>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem', overflow: 'auto' }}>
{`import { getDOMFromJSON } from 'luxe-edit';

function HtmlPreview({ savedJson }: { savedJson: any }) {
  const html = getDOMFromJSON(savedJson);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}`}
            </pre>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Core Props</h2>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1e293b' }}>LuxeEditorProps</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>initialConfig</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>Partial&lt;InitialConfigType&gt; - Lexical editor configuration</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>onChange</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>(editorState, editor) =&gt; void - Handle updates and save JSON</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>showToolbar</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>boolean (default: true) - Show top toolbar</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>showFloatingToolbar</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>boolean (default: true) - Show floating toolbar</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>editable</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>boolean (default: true) - Enable editing or set read-only mode</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>toolbarItems</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>ToolbarItem[] - Custom toolbar items</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>floatingToolbarItems</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>ToolbarItem[] - Custom floating toolbar items</span>
              </li>
              <li style={{ marginBottom: '12px', padding: '12px', background: '#fff', borderRadius: '6px' }}>
                <code style={{ color: '#3b82f6', fontWeight: 'bold' }}>colorScheme</code>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>'light' | 'dark' - Built-in editor color mode</span>
              </li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Theme</h2>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1e293b' }}>Built-in Light/Dark Mode</h3>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem', overflow: 'auto' }}>
{`<LuxeEditor
  initialConfig={{ namespace: 'MyEditor', theme: {} }}
  colorScheme="dark"
/>

// or

<LuxeEditor
  initialConfig={{ namespace: 'MyEditor', theme: {} }}
  colorScheme="light"
/>`}
            </pre>
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1e293b' }}>Custom Lexical Theme Classes</h3>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ margin: 0, color: '#fff', fontSize: '0.9rem', overflow: 'auto' }}>
{`<LuxeEditor
  initialConfig={{
    namespace: 'MyEditor',
    theme: {
      text: {
        bold: 'my-bold-class',
        italic: 'my-italic-class',
      },
      heading: {
        h1: 'my-h1-class',
        h2: 'my-h2-class',
      },
    },
  }}
/>`}
            </pre>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>
              Tip: <strong>colorScheme</strong> controls built-in editor colors, while <strong>initialConfig.theme</strong>
              controls Lexical class mapping for content nodes.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1e293b' }}>Toolbar Items</h2>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>
              Available toolbar item types:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {['undo', 'redo', 'bold', 'italic', 'underline', 'strikethrough', 'heading1', 'heading2', 'heading3', 'headingDropdown', 'link', 'textColor', 'backgroundColor', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'fullscreen', 'divider'].map((item) => (
                <code key={item} style={{ 
                  padding: '8px 12px', 
                  background: '#fff', 
                  borderRadius: '4px',
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  {item}
                </code>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

