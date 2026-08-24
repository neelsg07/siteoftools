import React, { useState } from 'react';
import { diffLines, type Change } from 'diff';
import { Play, RotateCcw, Copy, Check, FileJson, Code2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const SAMPLE_A = `{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30,\n  "isActive": true,\n  "roles": ["user", "editor"],\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}`;

const SAMPLE_B = `{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john.doe@example.com",\n  "age": 31,\n  "isActive": false,\n  "roles": ["user", "admin"],\n  "address": {\n    "city": "New York",\n    "zip": "10001",\n    "country": "USA"\n  },\n  "phone": "+1-555-123-4567"\n}`;

export default function JsonDiffTool() {
  const [jsonA, setJsonA] = useState(SAMPLE_A);
  const [jsonB, setJsonB] = useState(SAMPLE_B);
  const [diffResult, setDiffResult] = useState<Change[] | null>(null);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Sidebar Navigation */}
      <aside className="lg:col-span-3 backdrop-blur-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 hidden lg:block shadow-sm transition-colors">
        <div className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase mb-3 px-2">
          Developer Tools
        </div>
        <nav className="space-y-1 text-xs">
          <a href="#" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-sm">
            <span className="flex items-center gap-2"><Code2 size={14} /> JSON Diff</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition">
            <Code2 size={14} /> JSON Formatter
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition">
            <ShieldCheck size={14} /> JSON Validator
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition">
            <FileJson size={14} /> Base64 Encoder / Decoder
          </a>
        </nav>
      </aside>

      {/* Main Diff Editor */}
      <section className="lg:col-span-6 space-y-6">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-2xl transition-colors">
          
          {/* Header & Meta Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-200/70 dark:border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-1">
                <span>Developer</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white font-medium">JSON Diff</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileJson size={18} /> JSON Diff Inspector
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setJsonA(SAMPLE_A); setJsonB(SAMPLE_B); }} 
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 text-xs rounded-lg border border-neutral-200 dark:border-white/10 transition"
              >
                Reset Sample
              </button>
              <button 
                onClick={handleClear} 
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 text-xs rounded-lg border border-neutral-200 dark:border-white/10 transition flex items-center gap-1"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Editors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input A */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">JSON A (Original)</span>
                <span className="text-neutral-500 text-[10px] flex items-center gap-1">
                  {isValidJson(jsonA) ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {isValidJson(jsonA) ? 'Valid' : 'Raw'}
                </span>
              </div>
              <textarea
                value={jsonA}
                onChange={(e) => setJsonA(e.target.value)}
                placeholder="Paste original JSON..."
                className="w-full h-56 p-3 font-mono text-xs bg-white/90 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner"
              />
            </div>

            {/* Input B */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">JSON B (Modified)</span>
                <span className="text-neutral-500 text-[10px] flex items-center gap-1">
                  {isValidJson(jsonB) ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {isValidJson(jsonB) ? 'Valid' : 'Raw'}
                </span>
              </div>
              <textarea
                value={jsonB}
                onChange={(e) => setJsonB(e.target.value)}
                placeholder="Paste modified JSON..."
                className="w-full h-56 p-3 font-mono text-xs bg-white/90 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner"
              />
            </div>
          </div>

          {/* Compare Action */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCompare}
              className="w-full sm:w-auto px-8 py-2.5 bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Play size={14} /> Compare JSON Differences
            </button>
          </div>
        </div>

        {/* Diff Result Container */}
        {diffResult && (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-2xl transition-colors">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-neutral-200/70 dark:border-white/10 text-xs">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">Diff Result</span>
              <button
                onClick={handleCopyDiff}
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition text-xs"
              >
                {copied ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Output'}
              </button>
            </div>

            <div className="font-mono text-xs bg-neutral-950 text-neutral-200 rounded-xl p-4 overflow-x-auto space-y-0.5 max-h-72">
              {diffResult.map((part, index) => {
                const style = part.added
                  ? 'bg-emerald-950/80 text-emerald-300 border-l-2 border-emerald-500 pl-2'
                  : part.removed
                  ? 'bg-rose-950/80 text-rose-300 border-l-2 border-rose-500 pl-2'
                  : 'text-neutral-400 pl-2';
                return (
                  <div key={index} className={`${style} whitespace-pre leading-relaxed`}>
                    {part.added ? '+ ' : part.removed ? '- ' : '  '}{part.value}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Right Column (Info / Documentation) */}
      <aside className="lg:col-span-3 space-y-5">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 text-xs shadow-sm transition-colors">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">About JSON Diff</h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
            Computes differences line by line in your browser.
          </p>
          <div className="space-y-1.5 pt-2 border-t border-neutral-200/70 dark:border-white/10 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Green lines indicate additions (+)
            </div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Red lines indicate removals (-)
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}