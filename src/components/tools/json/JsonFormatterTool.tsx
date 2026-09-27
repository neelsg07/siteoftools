import React, { useState, useMemo } from 'react';
import { 
  Code2, Check, Copy, RotateCcw, AlertTriangle, 
  Eye, Minimize2, CheckCircle2, ChevronDown, ChevronRight,
  FileCode, Sparkles
} from 'lucide-react';

const SAMPLE_JSON = `{
  "projectName": "SiteOfTools",
  "version": 1.2,
  "isProduction": true,
  "maintainers": [
    {
      "name": "Dev Admin",
      "role": "Lead Architect",
      "active": true
    },
    {
      "name": "Contributor",
      "role": "Frontend Specialist",
      "active": false
    }
  ],
  "configuration": {
    "theme": "dark",
    "edgeHosting": {
      "provider": "Cloudflare Pages",
      "globalCdn": true,
      "cacheTtlSeconds": 3600
    },
    "allowedOrigins": [
      "https://siteoftools.com",
      "http://localhost:4321"
    ]
  },
  "metrics": null
}`;

// Interactive Collapsible Tree Node
function TreeNode({ keyName, value, level = 0 }: { keyName?: string; value: any; level?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const renderValueBadge = (val: any) => {
    if (val === null) return <span className="text-neutral-400 dark:text-neutral-500 italic">null</span>;
    if (typeof val === 'boolean') return <span className="text-amber-600 dark:text-amber-400 font-semibold">{String(val)}</span>;
    if (typeof val === 'number') return <span className="text-blue-600 dark:text-blue-400 font-semibold">{val}</span>;
    if (typeof val === 'string') return <span className="text-emerald-600 dark:text-emerald-400">"{val}"</span>;
    return <span>{String(val)}</span>;
  };

  return (
    <div className="text-xs font-mono select-text" style={{ paddingLeft: `${level * 16}px` }}>
      <div className="flex items-center gap-2 py-1 group hover:bg-black/5 dark:hover:bg-white/5 rounded-md px-1.5 transition-colors">
        {isExpandable ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 transition"
            aria-label={collapsed ? "Expand node" : "Collapse node"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : (
          <span className="w-4 inline-block" />
        )}

        {keyName !== undefined && (
          <span className="text-neutral-800 dark:text-neutral-200 font-bold">
            "{keyName}":
          </span>
        )}

        {isExpandable ? (
          <span className="text-neutral-500 font-medium">
            {isArray ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
          </span>
        ) : (
          renderValueBadge(value)
        )}
      </div>

      {!collapsed && isExpandable && (
        <div className="border-l border-neutral-300 dark:border-neutral-800 ml-2.5 my-0.5">
          {Object.entries(value).map(([k, v]) => (
            <TreeNode key={k} keyName={isArray ? undefined : k} value={v} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [outputMode, setOutputMode] = useState<'prettified' | 'minified' | 'tree'>('prettified');
  const [copied, setCopied] = useState(false);

  // Parsing & validation
  const { parsedData, error, formattedText, minifiedText } = useMemo(() => {
    if (!input.trim()) {
      return { parsedData: null, error: null, formattedText: '', minifiedText: '' };
    }
    try {
      const parsed = JSON.parse(input);
      return {
        parsedData: parsed,
        error: null,
        formattedText: JSON.stringify(parsed, null, indentSize),
        minifiedText: JSON.stringify(parsed),
      };
    } catch (err: any) {
      return {
        parsedData: null,
        error: err.message || 'Invalid JSON syntax',
        formattedText: '',
        minifiedText: '',
      };
    }
  }, [input, indentSize]);

  const activeOutputText = outputMode === 'minified' ? minifiedText : formattedText;

  const handleCopy = () => {
    if (!activeOutputText) return;
    navigator.clipboard.writeText(activeOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span>Developer</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">JSON Formatter</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Code2 size={18} /> JSON Formatter, Validator & Tree Visualizer
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput(SAMPLE_JSON)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition"
            >
              Load Sample
            </button>
            <button
              onClick={() => setInput('')}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        {/* SECTION 1: RAW INPUT (Full Width) */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
            <span>Raw JSON Input</span>
            <span className="text-[10px] lowercase font-normal opacity-75">
              {input.length} characters • {input.split('\n').length} lines
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw, messy, or minified JSON here..."
            className="w-full h-64 p-4 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner leading-relaxed whitespace-pre"
          />
        </div>

        {/* Validation Status Banner */}
        <div className="mb-6">
          {error ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5 font-mono">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Invalid JSON Syntax</span>
                <span className="text-[11px] opacity-90">{error}</span>
              </div>
            </div>
          ) : input.trim() ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 size={16} />
              <span className="font-bold">Valid JSON Structure</span>
            </div>
          ) : null}
        </div>

        {/* PROMINENT PRIMARY VIEW MODE SWITCHER & ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 border border-black/10 dark:border-white/15 text-xs mb-4 transition-colors">
          
          {/* Main View Mode Tabs with Active Selection States */}
          <div className="flex items-center gap-1.5 bg-neutral-200/80 dark:bg-neutral-900/80 p-1 rounded-xl border border-black/5 dark:border-white/5">
            <button
              onClick={() => setOutputMode('prettified')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                outputMode === 'prettified'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Formatted Code
            </button>

            <button
              onClick={() => setOutputMode('minified')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                outputMode === 'minified'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Minimize2 size={14} /> Minified
            </button>

            <button
              onClick={() => setOutputMode('tree')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                outputMode === 'tree'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Eye size={14} /> Tree Visualizer
            </button>
          </div>

          {/* Indent Selector & Copy Action */}
          <div className="flex items-center gap-3">
            {outputMode === 'prettified' && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-[11px] font-medium">Indent:</span>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
            )}

            <button
              onClick={handleCopy}
              disabled={!!error || !input.trim()}
              className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-200 dark:text-neutral-950 dark:hover:bg-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-emerald-500 dark:text-emerald-600" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Result'}
            </button>
          </div>
        </div>

        {/* SECTION 2: FULL-WIDTH OUTPUT CONTAINER */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
            <span>
              {outputMode === 'prettified' && 'Prettified JSON Result'}
              {outputMode === 'minified' && 'Minified Single-Line JSON'}
              {outputMode === 'tree' && 'Interactive Object Hierarchy Tree'}
            </span>
            <span className="text-[10px] lowercase font-normal opacity-75">
              {outputMode !== 'tree' && `${activeOutputText.length} characters`}
            </span>
          </div>

          {outputMode === 'tree' ? (
            <div className="w-full min-h-[350px] max-h-[600px] p-4 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-xl overflow-auto shadow-inner">
              {parsedData ? (
                <TreeNode value={parsedData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs font-mono">
                  <FileCode size={32} className="mb-2 opacity-40" />
                  <span>Fix syntax errors above to render interactive tree.</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={activeOutputText}
              placeholder="Formatted output will display here..."
              className="w-full h-80 p-4 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none resize-y shadow-inner leading-relaxed whitespace-pre"
            />
          )}
        </div>

      </div>
    </div>
  );
}