import React from 'react';
import { LuxeEditor, type ToolbarItem, getEditorJSON, getMarkdownFromJSON, getDOMFromJSON } from 'luxe-edit';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLBAR_GROUPS = [
  { label: 'History',    items: ['undo', 'redo'] },
  { label: 'Formatting', items: ['bold', 'italic', 'underline', 'strikethrough'] },
  { label: 'Color',      items: ['textColor', 'backgroundColor'] },
  { label: 'Heading',    items: ['headingDropdown'] },
  { label: 'Link',       items: ['link'] },
  { label: 'Alignment',  items: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'] },
  { label: 'Extra',      items: ['fullscreen'] },
] as const;

type ToolbarGroupItem = (typeof TOOLBAR_GROUPS)[number]['items'][number];

const ALL_TOOLBAR_ITEMS: string[] = TOOLBAR_GROUPS.flatMap(g => [...g.items]);
const FLOATING_OPTIONS = ['bold', 'italic', 'underline', 'strikethrough', 'link'];

const ITEM_LABELS: Record<string, string> = {
  undo: 'Undo',      redo: 'Redo',
  bold: 'Bold',      italic: 'Italic',  underline: 'Underline', strikethrough: 'Strike',
  textColor: 'Text Color', backgroundColor: 'BG Color',
  headingDropdown: 'Heading',
  link: 'Link',
  alignLeft: 'Left',  alignCenter: 'Center', alignRight: 'Right', alignJustify: 'Justify',
  fullscreen: 'Fullscreen',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildToolbarItems(selected: string[]): ToolbarItem[] {
  const result: ToolbarItem[] = [];
  let needDivider = false;
  for (const group of TOOLBAR_GROUPS) {
    const groupItems = group.items.filter(item => selected.includes(item));
    if (!groupItems.length) continue;
    if (needDivider) result.push({ type: 'divider' });
    needDivider = true;
    groupItems.forEach(item => result.push({ type: item as ToolbarGroupItem }));
  }
  return result;
}

function generateImplementationCode(
  selectedToolbar: string[],
  selectedFloating: string[],
  showTop: boolean,
  showFloating: boolean,
  scheme: 'light' | 'dark'
): string {
  const toolbarLines = buildToolbarItems(selectedToolbar)
    .map(i => `  { type: '${i.type}' }`)
    .join(',\n');

  const floatingLines = selectedFloating
    .map(i => `  { type: '${i}' }`)
    .join(',\n');

  return `import { useState } from 'react';
import { LuxeEditor, getEditorJSON } from 'luxe-edit';
import type { ToolbarItem } from 'luxe-edit';
import 'luxe-edit/index.css';

const toolbarItems: ToolbarItem[] = [
${toolbarLines}
];

const floatingToolbarItems: ToolbarItem[] = [
${floatingLines}
];

function App() {
  const [json, setJson] = useState(null);

  return (
    <LuxeEditor
      initialConfig={{ namespace: 'MyEditor', theme: {} }}
      showToolbar={${showTop}}
      showFloatingToolbar={${showFloating}}
      toolbarItems={toolbarItems}
      floatingToolbarItems={floatingToolbarItems}
      colorScheme="${scheme}"
      onChange={(editorState) => {
        setJson(getEditorJSON(editorState));
      }}
    />
  );
}`;
}

const MARKDOWN_CODE = `import { getMarkdownFromJSON } from 'luxe-edit';

// Convert saved JSON → Markdown string
const markdown = getMarkdownFromJSON(savedJson);

// Render as plain text
<pre>{markdown}</pre>

// Or use a Markdown renderer
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{markdown}</ReactMarkdown>`;

const DOM_CODE = `import { getDOMFromJSON } from 'luxe-edit';

// Convert saved JSON → HTML string
const html = getDOMFromJSON(savedJson);

// Render in React
<div dangerouslySetInnerHTML={{ __html: html }} />

// Render in plain JS
document.getElementById('content').innerHTML = html;`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle }: {
  number: number; title: string; subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
        }}>
          {number}
        </div>
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ margin: '0 0 0 42px', color: '#64748b', fontSize: '0.88rem' }}>{subtitle}</p>
      )}
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #0f172a' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 16px', background: '#1e293b',
      }}>
        <span style={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 500 }}>
          {label || 'tsx'}
        </span>
        <button
          onClick={copy}
          style={{
            padding: '3px 10px', borderRadius: '4px', border: '1px solid #334155',
            background: copied ? 'rgba(34,197,94,0.15)' : 'transparent',
            color: copied ? '#22c55e' : '#94a3b8',
            fontSize: '0.72rem', cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '16px 20px',
        background: '#0f172a', color: '#e2e8f0',
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        fontSize: '0.78rem', lineHeight: '1.65',
        overflow: 'auto', maxHeight: '420px',
        whiteSpace: 'pre', wordBreak: 'break-word',
      }}>
        {code}
      </pre>
    </div>
  );
}

function Pill({ label, checked, onToggle }: {
  label: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '999px', cursor: 'pointer',
        background: checked ? '#ede9fe' : '#f1f5f9',
        border: `1.5px solid ${checked ? '#7c3aed' : '#e2e8f0'}`,
        color: checked ? '#5b21b6' : '#64748b',
        fontSize: '0.78rem', fontWeight: checked ? 600 : 400,
      }}
    >
      <span style={{ fontSize: '0.65rem' }}>{checked ? '✓' : '+'}</span>
      {label}
    </button>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '36px', height: '20px', borderRadius: '10px',
          background: value ? '#7c3aed' : '#cbd5e1',
          position: 'relative', flexShrink: 0,
        }}
      >
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '3px',
          left: value ? '19px' : '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }} />
      </div>
      <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Playground() {
  const [selectedToolbar, setSelectedToolbar] = React.useState<string[]>(ALL_TOOLBAR_ITEMS);
  const [selectedFloating, setSelectedFloating] = React.useState<string[]>(FLOATING_OPTIONS);
  const [showTopToolbar, setShowTopToolbar]         = React.useState(true);
  const [showFloatingToolbar, setShowFloatingToolbar] = React.useState(true);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [jsonOutput,  setJsonOutput]  = React.useState<any>(null);
  const [outputTab,   setOutputTab]   = React.useState<'markdown' | 'dom'>('markdown');

  const toolbarItems = React.useMemo(
    () => buildToolbarItems(selectedToolbar),
    [selectedToolbar]
  );

  const floatingItems = React.useMemo<ToolbarItem[]>(
    () => selectedFloating.map(item => ({ type: item as ToolbarGroupItem })),
    [selectedFloating]
  );

  const markdownOutput = React.useMemo(
    () => (jsonOutput ? getMarkdownFromJSON(jsonOutput) : ''),
    [jsonOutput]
  );

  const domOutput = React.useMemo(
    () => (jsonOutput ? getDOMFromJSON(jsonOutput) : ''),
    [jsonOutput]
  );

  const implementationCode = React.useMemo(
    () => generateImplementationCode(selectedToolbar, selectedFloating, showTopToolbar, showFloatingToolbar, colorScheme),
    [selectedToolbar, selectedFloating, showTopToolbar, showFloatingToolbar, colorScheme]
  );

  const toggleToolbar = (item: string) =>
    setSelectedToolbar(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  const toggleFloating = (item: string) =>
    setSelectedFloating(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Playground
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
            Configure the editor live, then copy the generated implementation code
          </p>
        </div>

        {/* ── Row 1: Configure + Editor ─────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionHeader
            number={1}
            title="Configure Editor"
            subtitle="Toggle options and select toolbar items — the editor updates live"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Config Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Display Options */}
              <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Display Options
                </div>

                {/* Theme */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginBottom: '7px' }}>Theme</div>
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '7px', padding: '3px', gap: '3px' }}>
                    {(['light', 'dark'] as const).map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        style={{
                          flex: 1, padding: '5px 0', borderRadius: '5px', border: 'none',
                          background: colorScheme === scheme
                            ? (scheme === 'dark' ? '#1e293b' : '#fff')
                            : 'transparent',
                          color: colorScheme === scheme
                            ? (scheme === 'dark' ? '#f8fafc' : '#1e293b')
                            : '#64748b',
                          cursor: 'pointer', fontWeight: colorScheme === scheme ? 700 : 400,
                          fontSize: '0.82rem',
                          boxShadow: colorScheme === scheme ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        {scheme === 'light' ? '☀️ Light' : '🌙 Dark'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar visibility toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Toggle label="Top Toolbar" value={showTopToolbar} onChange={setShowTopToolbar} />
                  <Toggle label="Floating Toolbar" value={showFloatingToolbar} onChange={setShowFloatingToolbar} />
                </div>
              </div>

              {/* Top Toolbar Items */}
              <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Toolbar Items
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedToolbar(ALL_TOOLBAR_ITEMS)}
                      style={{ fontSize: '0.72rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedToolbar([])}
                      style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      None
                    </button>
                  </div>
                </div>

                {TOOLBAR_GROUPS.map(group => (
                  <div key={group.label} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {group.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {group.items.map(item => (
                        <Pill
                          key={item}
                          label={ITEM_LABELS[item] || item}
                          checked={selectedToolbar.includes(item)}
                          onToggle={() => toggleToolbar(item)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Toolbar Items */}
              <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Floating Toolbar
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedFloating(FLOATING_OPTIONS)}
                      style={{ fontSize: '0.72rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedFloating([])}
                      style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      None
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {FLOATING_OPTIONS.map(item => (
                    <Pill
                      key={item}
                      label={ITEM_LABELS[item] || item}
                      checked={selectedFloating.includes(item)}
                      onToggle={() => toggleFloating(item)}
                    />
                  ))}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  Appears when you select text in the editor
                </p>
              </div>
            </div>

            {/* Live Editor */}
            <div style={{
              background: '#fff', borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden', minHeight: '520px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: '12px 18px', borderBottom: '1px solid #f1f5f9',
                background: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Live Editor</span>
              </div>
              <div style={{ flex: 1, padding: '4px' }}>
                <LuxeEditor
                  initialConfig={{ namespace: 'LuxePlayground', theme: {} }}
                  showToolbar={showTopToolbar}
                  showFloatingToolbar={showFloatingToolbar}
                  toolbarItems={toolbarItems}
                  floatingToolbarItems={floatingItems}
                  colorScheme={colorScheme}
                  onChange={(editorState) => {
                    setJsonOutput(getEditorJSON(editorState));
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Implementation Code ─────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionHeader
            number={2}
            title="Implementation Code"
            subtitle="Auto-generated based on your configuration above — copy and paste into your project"
          />
          <CodeBlock code={implementationCode} label="TypeScript · React" />
        </div>

        {/* ── Row 3: Render Content ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionHeader
            number={3}
            title="Render Saved Content"
            subtitle="Save editor JSON to your database, then render it anywhere as Markdown or HTML"
          />

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '20px',
            background: '#f1f5f9', borderRadius: '8px', padding: '4px',
            width: 'fit-content',
          }}>
            {([
              { id: 'markdown', label: '📝 Markdown' },
              { id: 'dom',      label: '🌐 DOM / HTML' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setOutputTab(tab.id)}
                style={{
                  padding: '6px 18px', borderRadius: '6px', border: 'none',
                  background: outputTab === tab.id ? '#fff' : 'transparent',
                  color: outputTab === tab.id ? '#1e293b' : '#64748b',
                  fontWeight: outputTab === tab.id ? 700 : 400,
                  fontSize: '0.85rem', cursor: 'pointer',
                  boxShadow: outputTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview + Code side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Preview */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Preview
              </div>

              {outputTab === 'markdown' ? (
                <div style={{
                  background: '#fff', borderRadius: '10px',
                  border: '1px solid #e2e8f0', padding: '20px', minHeight: '220px',
                }}>
                  {markdownOutput ? (
                    <pre style={{
                      margin: 0, fontFamily: 'Monaco, Menlo, monospace',
                      fontSize: '0.8rem', color: '#334155',
                      whiteSpace: 'pre-wrap', lineHeight: '1.65', wordBreak: 'break-word',
                    }}>
                      {markdownOutput}
                    </pre>
                  ) : (
                    <EmptyState text="Type in the editor above to see Markdown output" />
                  )}
                </div>
              ) : (
                <div style={{
                  background: '#fff', borderRadius: '10px',
                  border: '1px solid #e2e8f0', padding: '20px', minHeight: '220px',
                }}>
                  {domOutput ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: domOutput }}
                      style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.7' }}
                    />
                  ) : (
                    <EmptyState text="Type in the editor above to see rendered HTML output" />
                  )}
                </div>
              )}
            </div>

            {/* Source Code */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Source Code
              </div>
              <CodeBlock
                code={outputTab === 'markdown' ? MARKDOWN_CODE : DOM_CODE}
                label={outputTab === 'markdown' ? 'getMarkdownFromJSON' : 'getDOMFromJSON'}
              />
            </div>
          </div>

          {/* Raw output strip */}
          {(outputTab === 'markdown' ? markdownOutput : domOutput) && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Raw {outputTab === 'markdown' ? 'Markdown' : 'HTML'} String
              </div>
              <CodeBlock
                code={outputTab === 'markdown' ? markdownOutput : domOutput}
                label={outputTab === 'markdown' ? 'markdown output' : 'html output'}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '140px', gap: '8px',
    }}>
      <div style={{ fontSize: '1.5rem', opacity: 0.3 }}>✏️</div>
      <span style={{ color: '#cbd5e1', fontSize: '0.82rem', textAlign: 'center' }}>{text}</span>
    </div>
  );
}
