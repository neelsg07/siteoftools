import React, { useState } from 'react';
import { diffLines, type Change } from 'diff';
import { 
  Play, RotateCcw, Copy, Check, FileJson, Share2, 
  Bookmark, Code2, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle 
} from 'lucide-react';

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
      
      {/* --- LEFT SIDEBAR (Developer Tools Directory) --- */}
      <aside className="lg:col-span-3 backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-4 hidden lg:block">
        <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3 px-2">
          Developer Tools
        </div>
        <nav className="space-y-1 text-xs">
          <a href="#" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10 text-white font-medium">
            <span className="flex items-center gap-2"><Code2 size={14} className="text-emerald-400" /> JSON Diff</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
            <Code2 size={14} /> JSON Formatter
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
            <ShieldCheck size={14} /> JSON Validator
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
            <FileJson size={14} /> Base64 Encoder / Decoder
          </a>
        </nav>
      </aside>

      {/* --- CENTER MAIN TOOL WORKSPACE --- */}
      <section className="lg:col-span-6 space-y-6">
        <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-2xl p-5 shadow-2xl">
          
          {/* Header & Meta Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                <span>Developer Tools</span> <span>&gt;</span> <span class="text-slate-200">JSON Diff</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileJson size={18} className="text-emerald-400" /> JSON Diff Inspector
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setJsonA(SAMPLE_A); setJsonB(SAMPLE_B); }} 
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-lg border border-white/10 transition"
              >
                Reset Sample
              </button>
              <button 
                onClick={handleClear} 
                className="px-2.5 py-1.5 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs rounded-lg border border-white/10 transition flex items-center gap-1"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Editors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left JSON Panel */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-300">JSON A (Original)</span>
                <span className={isValidJson(jsonA) ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
                  {isValidJson(jsonA) ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {isValidJson(jsonA) ? 'Valid' : 'Raw Text'}
                </span>
              </div>
              <textarea
                value={jsonA}
                onChange={(e) => setJsonA(e.target.value)}
                placeholder="Paste original JSON..."
                className="w-full h-56 p-3 font-mono text-xs bg-slate-950/80 text-emerald-300 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y"
              />
            </div>

            {/* Right JSON Panel */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-300">JSON B (Modified)</span>
                <span className={isValidJson(jsonB) ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
                  {isValidJson(jsonB) ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {isValidJson(jsonB) ? 'Valid' : 'Raw Text'}
                </span>
              </div>
              <textarea
                value={jsonB}
                onChange={(e) => setJsonB(e.target.value)}
                placeholder="Paste modified JSON..."
                className="w-full h-56 p-3 font-mono text-xs bg-slate-950/80 text-emerald-300 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-y"
              />
            </div>
          </div>

          {/* Run Action */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCompare}
              className="w-full sm:w-auto px-8 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Play size={14} /> Compare JSON Differences
            </button>
          </div>
        </div>

        {/* Diff Inspection Result Container */}
        {diffResult && (
          <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Diff Result</span>
              <button
                onClick={handleCopyDiff}
                className="text-slate-300 hover:text-white flex items-center gap-1.5 transition text-xs"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied to Clipboard' : 'Copy Output'}
              </button>
            </div>

            <div className="font-mono text-xs bg-slate-950/90 rounded-xl p-4 overflow-x-auto space-y-0.5 max-h-72">
              {diffResult.map((part, index) => {
                const style = part.added
                  ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500 pl-2'
                  : part.removed
                  ? 'bg-rose-500/15 text-rose-300 border-l-2 border-rose-500 pl-2'
                  : 'text-slate-400 pl-2';
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

      {/* --- RIGHT SIDEBAR (About, Info & Future Ad Slot) --- */}
      <aside className="lg:col-span-3 space-y-5">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-xs">
          <h3 className="font-semibold text-white mb-2">About JSON Diff</h3>
          <p className="text-slate-400 leading-relaxed mb-3">
            This tool computes semantic and line-level changes between two payloads. All comparison operations execute locally in your browser.
          </p>
          <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Green lines indicate additions (+)
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Red lines indicate removals (-)
            </div>
          </div>
        </div>

        {/* Future AdSense / Promotion Container */}
        <div className="border border-dashed border-white/15 rounded-2xl p-6 text-center text-slate-500 text-xs">
          <span className="block font-mono text-[10px] uppercase text-slate-600 mb-1">Advertisement</span>
          Reserved Ad Space (300x250)
        </div>
      </aside>

    </div>
  );
}