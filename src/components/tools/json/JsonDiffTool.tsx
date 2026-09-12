import React, { useState } from 'react';
import { diffLines, type Change } from 'diff';
import { 
  Play, RotateCcw, Copy, Check, FileJson, 
  CheckCircle2, AlertCircle, Columns, AlignJustify 
} from 'lucide-react';

const SAMPLE_A = `{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30,\n  "isActive": true,\n  "roles": ["user", "editor"],\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}`;

const SAMPLE_B = `{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john.doe@example.com",\n  "age": 31,\n  "isActive": false,\n  "roles": ["user", "admin"],\n  "address": {\n    "city": "New York",\n    "zip": "10001",\n    "country": "USA"\n  },\n  "phone": "+1-555-123-4567"\n}`;

interface SideDiffLine {
  left?: { text: string; type: 'removed' | 'unchanged' };
  right?: { text: string; type: 'added' | 'unchanged' };
}

export default function JsonDiffTool() {
  const [jsonA, setJsonA] = useState(SAMPLE_A);
  const [jsonB, setJsonB] = useState(SAMPLE_B);
  const [diffResult, setDiffResult] = useState<Change[] | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);

  const isValidJson = (val: string) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  };

  const handleCompare = () => {
    try {
      const formattedA = JSON.stringify(JSON.parse(jsonA), null, 2);
      const formattedB = JSON.stringify(JSON.parse(jsonB), null, 2);
      setJsonA(formattedA);
      setJsonB(formattedB);
      setDiffResult(diffLines(formattedA, formattedB));
    } catch {
      setDiffResult(diffLines(jsonA, jsonB));
    }
  };

  const handleClear = () => {
    setJsonA('');
    setJsonB('');
    setDiffResult(null);
  };

  const handleCopyDiff = () => {
    if (!diffResult) return;
    const text = diffResult.map(p => (p.added ? '+ ' : p.removed ? '- ' : '  ') + p.value).join('');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildSideBySideLines = (): SideDiffLine[] => {
    if (!diffResult) return [];
    const rows: SideDiffLine[] = [];
    let i = 0;

    while (i < diffResult.length) {
      const part = diffResult[i];
      const nextPart = diffResult[i + 1];

      if (part.removed && nextPart?.added) {
        const removedLines = part.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || _ !== '');
        const addedLines = nextPart.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || _ !== '');
        const max = Math.max(removedLines.length, addedLines.length);

        for (let j = 0; j < max; j++) {
          rows.push({
            left: removedLines[j] !== undefined ? { text: removedLines[j], type: 'removed' } : undefined,
            right: addedLines[j] !== undefined ? { text: addedLines[j], type: 'added' } : undefined
          });
        }
        i += 2;
      } else if (part.removed) {
        const lines = part.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || _ !== '');
        lines.forEach(line => rows.push({ left: { text: line, type: 'removed' } }));
        i += 1;
      } else if (part.added) {
        const lines = part.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || _ !== '');
        lines.forEach(line => rows.push({ right: { text: line, type: 'added' } }));
        i += 1;
      } else {
        const lines = part.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || _ !== '');
        lines.forEach(line => rows.push({
          left: { text: line, type: 'unchanged' },
          right: { text: line, type: 'unchanged' }
        }));
        i += 1;
      }
    }
    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Editor Card */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">JSON Diff</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileJson size={18} /> JSON Diff Inspector
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setJsonA(SAMPLE_A); setJsonB(SAMPLE_B); }} 
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition"
            >
              Reset Sample
            </button>
            <button 
              onClick={handleClear} 
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">JSON A (Original)</span>
              <span className="text-neutral-500 text-[10px] flex items-center gap-1">
                {isValidJson(jsonA) ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-amber-500" />}
                {isValidJson(jsonA) ? 'Valid' : 'Raw'}
              </span>
            </div>
            <textarea
              value={jsonA}
              onChange={(e) => setJsonA(e.target.value)}
              placeholder="Paste original JSON..."
              className="w-full h-56 p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">JSON B (Modified)</span>
              <span className="text-neutral-500 text-[10px] flex items-center gap-1">
                {isValidJson(jsonB) ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-amber-500" />}
                {isValidJson(jsonB) ? 'Valid' : 'Raw'}
              </span>
            </div>
            <textarea
              value={jsonB}
              onChange={(e) => setJsonB(e.target.value)}
              placeholder="Paste modified JSON..."
              className="w-full h-56 p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCompare}
            className="w-full sm:w-auto px-8 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Play size={14} /> Compare JSON Differences
          </button>
        </div>
      </div>

      {/* Diff Result Card */}
      {diffResult && (
        <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
          <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-black/10 dark:border-white/10 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">Diff Result</span>
              
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-black/5 dark:border-white/10 text-[11px]">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition ${
                    viewMode === 'side-by-side'
                      ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Columns size={12} /> Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('unified')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition ${
                    viewMode === 'unified'
                      ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <AlignJustify size={12} /> Unified
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyDiff}
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 font-medium transition text-xs"
            >
              {copied ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>
          </div>

          <div className="font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/5 dark:border-white/10 rounded-xl p-3 overflow-x-auto max-h-96">
            {viewMode === 'unified' ? (
              <div className="space-y-0.5">
                {diffResult.map((part, index) => {
                  const style = part.added
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-500 pl-2'
                    : part.removed
                    ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-l-2 border-rose-500 pl-2'
                    : 'text-neutral-600 dark:text-neutral-400 pl-2';
                  return (
                    <div key={index} className={`${style} whitespace-pre leading-relaxed`}>
                      {part.added ? '+ ' : part.removed ? '- ' : '  '}{part.value}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10">
                <div className="pr-2 space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 pb-1 border-b border-black/5 dark:border-white/5 mb-1">Left (Original)</div>
                  {buildSideBySideLines().map((row, index) => (
                    <div
                      key={index}
                      className={`whitespace-pre leading-relaxed px-1 rounded-sm ${
                        row.left?.type === 'removed'
                          ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-l-2 border-rose-500'
                          : row.left ? 'text-neutral-600 dark:text-neutral-400' : 'opacity-0'
                      }`}
                    >
                      {row.left ? `${row.left.type === 'removed' ? '- ' : '  '}${row.left.text}` : ' '}
                    </div>
                  ))}
                </div>

                <div className="pl-2 space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 pb-1 border-b border-black/5 dark:border-white/5 mb-1">Right (Modified)</div>
                  {buildSideBySideLines().map((row, index) => (
                    <div
                      key={index}
                      className={`whitespace-pre leading-relaxed px-1 rounded-sm ${
                        row.right?.type === 'added'
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-500'
                          : row.right ? 'text-neutral-600 dark:text-neutral-400' : 'opacity-0'
                      }`}
                    >
                      {row.right ? `${row.right.type === 'added' ? '+ ' : '  '}${row.right.text}` : ' '}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}