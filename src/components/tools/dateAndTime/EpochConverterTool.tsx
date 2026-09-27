import React, { useState, useEffect } from 'react';
import { 
  Clock, Copy, Check, Play, Pause, RotateCcw, 
  Calendar, ArrowRight, ArrowDown, Globe, Sparkles 
} from 'lucide-react';

export default function EpochConverterTool() {
  // Live ticker state
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isTickerRunning, setIsTickerRunning] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [localTzName, setLocalTzName] = useState<string>('Local Time');

  // CONVERTER 1: Epoch -> Date
  const [epochInput, setEpochInput] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [epochResult, setEpochResult] = useState<{
    utcStr: string;
    localStr: string;
    relativeStr: string;
    detectedUnit: string;
    isoStr: string;
  } | null>(null);
  const [epochError, setEpochError] = useState<string | null>(null);

  // CONVERTER 2: Human Date -> Epoch
  const nowInitial = new Date();
  const [dateParts, setDateParts] = useState({
    year: nowInitial.getFullYear(),
    month: nowInitial.getMonth() + 1,
    day: nowInitial.getDate(),
    hours: nowInitial.getHours(),
    minutes: nowInitial.getMinutes(),
    seconds: nowInitial.getSeconds(),
    isUtc: false,
  });
  const [dateResult, setDateResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);

  useEffect(() => {
    try {
      setLocalTzName(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Browser Time');
    } catch {
      setLocalTzName('Local Browser Time');
    }
  }, []);

  // Live epoch counter
  useEffect(() => {
    if (!isTickerRunning) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTickerRunning]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper: Relative time string
  const getRelativeTime = (targetDate: Date) => {
    const diffMs = targetDate.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    const diffDays = Math.round(diffHour / 24);
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
    const diffMonths = Math.round(diffDays / 30);
    if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
    return rtf.format(Math.round(diffDays / 365), 'year');
  };

  // Action: Convert Epoch to Date
  const handleConvertEpochToDate = () => {
    const clean = epochInput.trim();
    if (!clean || isNaN(Number(clean))) {
      setEpochError('Please enter a valid numeric Unix timestamp.');
      setEpochResult(null);
      return;
    }

    const num = Number(clean);
    let resolvedMs = num;
    let unitDesc = 'seconds';

    // Auto-detect seconds vs milliseconds
    if (clean.length <= 11) {
      resolvedMs = num * 1000;
      unitDesc = 'seconds (assumed 10-digit)';
    } else if (clean.length <= 14) {
      resolvedMs = num;
      unitDesc = 'milliseconds (assumed 13-digit)';
    } else {
      // Microseconds or nanoseconds fallback
      resolvedMs = Math.floor(num / 1000);
      unitDesc = 'microseconds (auto-divided by 1000)';
    }

    const d = new Date(resolvedMs);
    if (isNaN(d.getTime())) {
      setEpochError('Timestamp out of valid date range.');
      setEpochResult(null);
      return;
    }

    setEpochError(null);
    setEpochResult({
      utcStr: d.toUTCString(),
      localStr: d.toString(),
      relativeStr: getRelativeTime(d),
      detectedUnit: unitDesc,
      isoStr: d.toISOString(),
    });
  };

  // Initial conversion on first mount
  useEffect(() => {
    handleConvertEpochToDate();
    handleConvertDateToEpoch();
  }, []);

  // Action: Convert Date to Epoch
  const handleConvertDateToEpoch = () => {
    const { year, month, day, hours, minutes, seconds, isUtc } = dateParts;
    let d: Date;

    if (isUtc) {
      d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    } else {
      d = new Date(year, month - 1, day, hours, minutes, seconds);
    }

    if (isNaN(d.getTime())) {
      setDateResult(null);
      return;
    }

    setDateResult({
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    });
  };

  const handleSetDateToNow = () => {
    const now = new Date();
    setDateParts({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      isUtc: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. CURRENT TIMESTAMP CLOCK (EpochConverter Header Style) */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                Current Unix Epoch Time
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isTickerRunning 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {isTickerRunning ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-neutral-900 dark:text-white tracking-tight">
                {currentEpoch}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copyToClipboard(String(currentEpoch), 'current-epoch')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm transition flex items-center gap-1.5"
            >
              {copiedKey === 'current-epoch' ? <Check size={14} className="text-emerald-500 dark:text-emerald-600" /> : <Copy size={14} />}
              {copiedKey === 'current-epoch' ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={() => {
                setEpochInput(String(currentEpoch));
                setTimeout(() => handleConvertEpochToDate(), 10);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 transition"
            >
              Paste to Converter
            </button>

            <button
              onClick={() => setIsTickerRunning(!isTickerRunning)}
              className="p-2 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 transition"
              title={isTickerRunning ? 'Pause clock' : 'Resume clock'}
            >
              {isTickerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONVERTER 1: EPOCH TO HUMAN DATE */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors space-y-4">
        <div className="border-b border-black/10 dark:border-white/10 pb-3">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock size={16} /> Convert Epoch to Human Date
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Enter a timestamp in seconds or milliseconds and click Convert.
          </p>
        </div>

        {/* Input Row with Big Convert Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConvertEpochToDate()}
              placeholder="e.g. 1774021832 or 1774021832000"
              className="w-full px-4 py-2.5 font-mono text-sm bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-inner"
            />
          </div>

          <button
            onClick={handleConvertEpochToDate}
            className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
          >
            Timestamp to Human date <ArrowRight size={14} />
          </button>
        </div>

        {epochError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-mono">
            {epochError}
          </div>
        )}

        {/* Conversion Result Table */}
        {epochResult && (
          <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden text-xs font-mono divide-y divide-black/5 dark:divide-white/5 bg-neutral-50 dark:bg-neutral-950/60 mt-4">
            
            {/* Unit detection */}
            <div className="p-3 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
              <span className="font-bold text-neutral-500">Unit detected:</span>
              <span className="text-neutral-900 dark:text-neutral-200">{epochResult.detectedUnit}</span>
            </div>

            {/* GMT / UTC */}
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-neutral-500 shrink-0">GMT / UTC:</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-900 dark:text-white font-semibold break-all">{epochResult.utcStr}</span>
                <button
                  onClick={() => copyToClipboard(epochResult.utcStr, 'utc-res')}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-neutral-400 hover:text-black dark:hover:text-white"
                  title="Copy UTC string"
                >
                  {copiedKey === 'utc-res' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Your Local Time Zone */}
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-500/[0.04]">
              <div className="shrink-0">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                  Your time zone:
                </span>
                <span className="text-[10px] text-neutral-400 font-sans">{localTzName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-900 dark:text-white font-bold break-all">{epochResult.localStr}</span>
                <button
                  onClick={() => copyToClipboard(epochResult.localStr, 'local-res')}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-neutral-400 hover:text-black dark:hover:text-white"
                  title="Copy local string"
                >
                  {copiedKey === 'local-res' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Relative Time */}
            <div className="p-3 flex justify-between items-center">
              <span className="font-bold text-neutral-500">Relative:</span>
              <span className="text-neutral-800 dark:text-neutral-200 capitalize">{epochResult.relativeStr}</span>
            </div>

            {/* ISO 8601 */}
            <div className="p-3 flex justify-between items-center">
              <span className="font-bold text-neutral-500">ISO 8601:</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-800 dark:text-neutral-200">{epochResult.isoStr}</span>
                <button
                  onClick={() => copyToClipboard(epochResult.isoStr, 'iso-res')}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  {copiedKey === 'iso-res' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CONVERTER 2: HUMAN DATE TO EPOCH TIMESTAMP */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors space-y-4">
        <div className="border-b border-black/10 dark:border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar size={16} /> Convert Human Date to Epoch
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Specify year, month, day, and time to generate epoch timestamps.
            </p>
          </div>

          <button
            onClick={() => {
              handleSetDateToNow();
              setTimeout(() => handleConvertDateToEpoch(), 10);
            }}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 transition self-start sm:self-auto"
          >
            Set to Current Time
          </button>
        </div>

        {/* Input Form Row (EpochConverter date grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono">
          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Year</label>
            <input
              type="number"
              value={dateParts.year}
              onChange={(e) => setDateParts({ ...dateParts, year: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Month (1-12)</label>
            <input
              type="number"
              min={1}
              max={12}
              value={dateParts.month}
              onChange={(e) => setDateParts({ ...dateParts, month: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Day (1-31)</label>
            <input
              type="number"
              min={1}
              max={31}
              value={dateParts.day}
              onChange={(e) => setDateParts({ ...dateParts, day: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Hour (0-23)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={dateParts.hours}
              onChange={(e) => setDateParts({ ...dateParts, hours: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Min (0-59)</label>
            <input
              type="number"
              min={0}
              max={59}
              value={dateParts.minutes}
              onChange={(e) => setDateParts({ ...dateParts, minutes: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Sec (0-59)</label>
            <input
              type="number"
              min={0}
              max={59}
              value={dateParts.seconds}
              onChange={(e) => setDateParts({ ...dateParts, seconds: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        {/* Timezone Switch & Convert Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">
              <input
                type="radio"
                name="dateTz"
                checked={!dateParts.isUtc}
                onChange={() => setDateParts({ ...dateParts, isUtc: false })}
                className="text-neutral-900 focus:ring-0"
              />
              Local Time ({localTzName})
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">
              <input
                type="radio"
                name="dateTz"
                checked={dateParts.isUtc}
                onChange={() => setDateParts({ ...dateParts, isUtc: true })}
                className="text-neutral-900 focus:ring-0"
              />
              GMT / UTC
            </label>
          </div>

          <button
            onClick={handleConvertDateToEpoch}
            className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            Human date to Timestamp <ArrowRight size={14} />
          </button>
        </div>

        {/* Date to Epoch Output Cards */}
        {dateResult && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                  Epoch in Seconds
                </span>
                <span className="font-mono text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                  {dateResult.seconds}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(String(dateResult.seconds), 'res-sec')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-1"
              >
                {copiedKey === 'res-sec' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedKey === 'res-sec' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                  Epoch in Milliseconds
                </span>
                <span className="font-mono text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                  {dateResult.milliseconds}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(String(dateResult.milliseconds), 'res-ms')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-1"
              >
                {copiedKey === 'res-ms' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedKey === 'res-ms' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}