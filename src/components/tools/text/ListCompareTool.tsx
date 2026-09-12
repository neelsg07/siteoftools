import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Copy, Check, RotateCcw, 
  Download, ListFilter, SlidersHorizontal 
} from 'lucide-react';

interface ListState {
  id: string;
  name: string;
  color: string;
  content: string;
}

const DEFAULT_LISTS: ListState[] = [
  {
    id: 'A',
    name: 'List A',
    color: '#3b82f6',
    content: 'apple\nbanana\norange\ngrape\nmango\npeach\nwatermelon',
  },
  {
    id: 'B',
    name: 'List B',
    color: '#10b981',
    content: 'banana\ngrape\npineapple\nstrawberry\nmango\nkiwi',
  },
];

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const LIST_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function ListCompareTool() {
  const [lists, setLists] = useState<ListState[]>(DEFAULT_LISTS);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('intersection-all');
  const [copied, setCopied] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const addList = () => {
    if (lists.length >= 5) return;
    const nextIdx = lists.length;
    const nextLabel = LIST_LABELS[nextIdx];
    setLists([
      ...lists,
      {
        id: nextLabel,
        name: `List ${nextLabel}`,
        color: PALETTE[nextIdx],
        content: '',
      },
    ]);
  };

  const removeList = (id: string) => {
    if (lists.length <= 2) return;
    const updated = lists.filter((l) => l.id !== id);
    setLists(
      updated.map((item, idx) => ({
        ...item,
        id: LIST_LABELS[idx],
        name: `List ${LIST_LABELS[idx]}`,
        color: PALETTE[idx],
      }))
    );
  };

  const updateListContent = (id: string, content: string) => {
    setLists(lists.map((l) => (l.id === id ? { ...l, content } : l)));
  };

  const normalize = (line: string) => {
    let val = trimWhitespace ? line.trim() : line;
    return caseSensitive ? val : val.toLowerCase();
  };

  // Set Calculations
  const analysis = useMemo(() => {
    const parsed = lists.map((l) => {
      const rawLines = l.content.split('\n').filter((x) => x.trim().length > 0);
      const uniqueSet = new Set<string>();
      const duplicates = new Set<string>();

      rawLines.forEach((line) => {
        const item = normalize(line);
        if (uniqueSet.has(item)) duplicates.add(item);
        else uniqueSet.add(item);
      });

      return {
        id: l.id,
        name: l.name,
        color: l.color,
        rawCount: rawLines.length,
        uniqueCount: uniqueSet.size,
        dupes: Array.from(duplicates),
        set: uniqueSet,
      };
    });

    // 1. Universal Intersection (A ∩ B ∩ ...)
    const intersectionAll: string[] = [];
    if (parsed.length > 0) {
      const firstSet = parsed[0].set;
      for (const item of firstSet) {
        if (parsed.every((p) => p.set.has(item))) {
          intersectionAll.push(item);
        }
      }
    }

    // 2. Global Union (A ∪ B ∪ ...)
    const unionSet = new Set<string>();
    parsed.forEach((p) => p.set.forEach((val) => unionSet.add(val)));
    const allUnion = Array.from(unionSet);

    // 3. Pairwise intersections for 3 lists (A ∩ B only, B ∩ C only, A ∩ C only)
    let pairAB: string[] = [];
    let pairBC: string[] = [];
    let pairAC: string[] = [];
    if (parsed.length === 3) {
      const [setA, setB, setC] = [parsed[0].set, parsed[1].set, parsed[2].set];
      pairAB = Array.from(setA).filter(x => setB.has(x) && !setC.has(x));
      pairBC = Array.from(setB).filter(x => setC.has(x) && !setA.has(x));
      pairAC = Array.from(setA).filter(x => setC.has(x) && !setB.has(x));
    }

    // 4. Exclusive per list (A \ others)
    const exclusivePerList = parsed.map((curr) => {
      const exclusive: string[] = [];
      for (const item of curr.set) {
        const appearsInOthers = parsed
          .filter((other) => other.id !== curr.id)
          .some((other) => other.set.has(item));
        if (!appearsInOthers) exclusive.push(item);
      }
      return {
        id: curr.id,
        name: curr.name,
        color: curr.color,
        items: exclusive,
      };
    });

    return {
      parsed,
      intersectionAll,
      allUnion,
      pairAB,
      pairBC,
      pairAC,
      exclusivePerList,
    };
  }, [lists, caseSensitive, trimWhitespace]);

  // Current tab content lookup
  const currentOutputList = useMemo(() => {
    if (activeTab === 'intersection-all') return analysis.intersectionAll;
    if (activeTab === 'all-union') return analysis.allUnion;
    if (activeTab === 'pair-ab') return analysis.pairAB;
    if (activeTab === 'pair-bc') return analysis.pairBC;
    if (activeTab === 'pair-ac') return analysis.pairAC;

    if (activeTab.startsWith('exclusive-')) {
      const targetId = activeTab.replace('exclusive-', '');
      const match = analysis.exclusivePerList.find((e) => e.id === targetId);
      return match ? match.items : [];
    }

    return [];
  }, [activeTab, analysis]);

  // Switch tab and smooth scroll to results
  const selectTabAndScroll = (tabId: string) => {
    setActiveTab(tabId);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOutputList.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentOutputList.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const intersectionLabel = lists.length === 2 
    ? 'A ∩ B (Intersection)' 
    : lists.length === 3 
    ? 'A ∩ B ∩ C (Intersection)' 
    : `In All Lists (${analysis.intersectionAll.length})`;

  const unionLabel = lists.length === 2 
    ? `A ∪ B (Union - ${analysis.allUnion.length})` 
    : `All Combined Union (${analysis.allUnion.length})`;

  return (
    <div className="space-y-6">
      {/* Configuration & Inputs */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span>Text</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">List Compare</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ListFilter size={18} /> Multi-List Comparator & Set Operations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addList}
              disabled={lists.length >= 5}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
                lists.length >= 5
                  ? 'opacity-40 cursor-not-allowed border-black/5 dark:border-white/5'
                  : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm hover:opacity-90'
              }`}
            >
              <Plus size={14} /> Add List ({lists.length}/5)
            </button>
            <button
              onClick={() => setLists(DEFAULT_LISTS)}
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Settings Bar */}
        <div className="flex flex-wrap items-center gap-6 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 border border-black/10 dark:border-white/15 text-xs mb-5 transition-colors">
        <span className="font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <SlidersHorizontal size={13} /> Settings:
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-0 cursor-pointer"
            />
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">Case Sensitive</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="rounded border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-0 cursor-pointer"
            />
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">Trim Whitespaces</span>
        </label>
        </div>

        {/* Input Lists Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${lists.length >= 3 ? 'lg:grid-cols-3' : ''} ${lists.length >= 4 ? 'xl:grid-cols-4' : ''} gap-4`}>
          {lists.map((item) => {
            const meta = analysis.parsed.find((p) => p.id === item.id);
            return (
              <div key={item.id} className="space-y-1.5 flex flex-col">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: item.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[10px]">
                      {meta?.uniqueCount ?? 0} unique
                    </span>
                    {lists.length > 2 && (
                      <button
                        onClick={() => removeList(item.id)}
                        className="text-neutral-400 hover:text-rose-500 transition"
                        title="Remove list"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={item.content}
                  onChange={(e) => updateListContent(item.id, e.target.value)}
                  placeholder={`Paste ${item.name} lines here...`}
                  className="w-full h-64 p-3.5 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Venn Diagram with Clickable Hotspots */}
      {lists.length <= 3 && (
        <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
          <div className="flex justify-between items-center pb-2 mb-3 border-b border-black/10 dark:border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Interactive Venn Diagram (Click any area to inspect)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Real-time Set View</span>
          </div>

          <div className="flex justify-center p-2">
            {lists.length === 2 ? (
              <svg viewBox="0 0 400 200" className="w-full max-w-sm h-auto select-none font-mono">
                {/* Circle A */}
                <circle cx="150" cy="100" r="75" fill="#3b82f6" fillOpacity={activeTab === 'exclusive-A' ? 0.45 : 0.2} stroke="#3b82f6" strokeWidth={activeTab === 'exclusive-A' ? 2.5 : 1.5} />
                {/* Circle B */}
                <circle cx="250" cy="100" r="75" fill="#10b981" fillOpacity={activeTab === 'exclusive-B' ? 0.45 : 0.2} stroke="#10b981" strokeWidth={activeTab === 'exclusive-B' ? 2.5 : 1.5} />

                {/* Clickable Zone: Only A */}
                <g onClick={() => selectTabAndScroll('exclusive-A')} className="cursor-pointer group">
                  <circle cx="110" cy="100" r="32" fill="transparent" />
                  <text x="110" y="98" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-sm font-bold group-hover:underline">
                    {analysis.exclusivePerList[0]?.items.length ?? 0}
                  </text>
                  <text x="110" y="116" textAnchor="middle" className="fill-neutral-500 text-[10px] font-medium">Only A</text>
                </g>

                {/* Clickable Zone: Only B */}
                <g onClick={() => selectTabAndScroll('exclusive-B')} className="cursor-pointer group">
                  <circle cx="290" cy="100" r="32" fill="transparent" />
                  <text x="290" y="98" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-sm font-bold group-hover:underline">
                    {analysis.exclusivePerList[1]?.items.length ?? 0}
                  </text>
                  <text x="290" y="116" textAnchor="middle" className="fill-neutral-500 text-[10px] font-medium">Only B</text>
                </g>

                {/* Clickable Zone: Intersection A ∩ B */}
                <g onClick={() => selectTabAndScroll('intersection-all')} className="cursor-pointer group">
                  <ellipse cx="200" cy="100" rx="25" ry="50" fill="transparent" />
                  <text x="200" y="98" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-sm font-bold group-hover:underline">
                    {analysis.intersectionAll.length}
                  </text>
                  <text x="200" y="116" textAnchor="middle" className="fill-neutral-500 text-[10px] font-medium">A ∩ B</text>
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 400 280" className="w-full max-w-sm h-auto select-none font-mono">
                {/* 3 Circles */}
                <circle cx="160" cy="120" r="70" fill="#3b82f6" fillOpacity={activeTab === 'exclusive-A' ? 0.45 : 0.2} stroke="#3b82f6" strokeWidth={activeTab === 'exclusive-A' ? 2.5 : 1.5} />
                <circle cx="240" cy="120" r="70" fill="#10b981" fillOpacity={activeTab === 'exclusive-B' ? 0.45 : 0.2} stroke="#10b981" strokeWidth={activeTab === 'exclusive-B' ? 2.5 : 1.5} />
                <circle cx="200" cy="180" r="70" fill="#f59e0b" fillOpacity={activeTab === 'exclusive-C' ? 0.45 : 0.2} stroke="#f59e0b" strokeWidth={activeTab === 'exclusive-C' ? 2.5 : 1.5} />

                {/* Center: A ∩ B ∩ C */}
                <g onClick={() => selectTabAndScroll('intersection-all')} className="cursor-pointer group">
                  <circle cx="200" cy="142" r="18" fill="transparent" />
                  <text x="200" y="142" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-xs font-bold group-hover:underline">
                    {analysis.intersectionAll.length}
                  </text>
                  <text x="200" y="153" textAnchor="middle" className="fill-neutral-400 text-[7.5px]">All 3</text>
                </g>

                {/* Exclusive A */}
                <g onClick={() => selectTabAndScroll('exclusive-A')} className="cursor-pointer group">
                  <circle cx="125" cy="105" r="24" fill="transparent" />
                  <text x="125" y="103" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-[11px] font-bold group-hover:underline">
                    {analysis.exclusivePerList[0]?.items.length ?? 0}
                  </text>
                  <text x="125" y="117" textAnchor="middle" className="fill-neutral-500 text-[8.5px]">Only A</text>
                </g>

                {/* Exclusive B */}
                <g onClick={() => selectTabAndScroll('exclusive-B')} className="cursor-pointer group">
                  <circle cx="275" cy="105" r="24" fill="transparent" />
                  <text x="275" y="103" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-[11px] font-bold group-hover:underline">
                    {analysis.exclusivePerList[1]?.items.length ?? 0}
                  </text>
                  <text x="275" y="117" textAnchor="middle" className="fill-neutral-500 text-[8.5px]">Only B</text>
                </g>

                {/* Exclusive C */}
                <g onClick={() => selectTabAndScroll('exclusive-C')} className="cursor-pointer group">
                  <circle cx="200" cy="225" r="24" fill="transparent" />
                  <text x="200" y="223" textAnchor="middle" className="fill-neutral-900 dark:fill-white text-[11px] font-bold group-hover:underline">
                    {analysis.exclusivePerList[2]?.items.length ?? 0}
                  </text>
                  <text x="200" y="237" textAnchor="middle" className="fill-neutral-500 text-[8.5px]">Only C</text>
                </g>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Comparison Results Section */}
      <div ref={resultsRef} className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        
        {/* Results Tab Bar */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10 gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Intersection Tab */}
            <button
              onClick={() => setActiveTab('intersection-all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                activeTab === 'intersection-all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-black/5 dark:border-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              {intersectionLabel} ({analysis.intersectionAll.length})
            </button>

            {/* 2. Union Tab (A ∪ B) */}
            <button
              onClick={() => setActiveTab('all-union')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                activeTab === 'all-union'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-black/5 dark:border-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              {unionLabel}
            </button>

            {/* 3. Exclusive Tabs (Only A, Only B...) */}
            {analysis.exclusivePerList.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveTab(`exclusive-${ex.id}`)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  activeTab === `exclusive-${ex.id}`
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-black/5 dark:border-white/5 hover:text-black dark:hover:text-white'
                }`}
              >
                Only {ex.name} ({ex.items.length})
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1.5"
            >
              <Download size={13} /> Export .txt
            </button>
          </div>
        </div>

        {/* Result Items Canvas */}
        <div className="bg-neutral-50 dark:bg-neutral-950 border border-black/5 dark:border-white/10 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto">
          {currentOutputList.length === 0 ? (
            <span className="text-neutral-400 italic">No matching lines found for this operation.</span>
          ) : (
            <div className="space-y-1">
              {currentOutputList.map((val, i) => (
                <div key={i} className="text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors">
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}