import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowRightLeft, Clock, Copy, Check, Calendar, 
  Search, ChevronDown, Sparkles, Globe, RotateCcw 
} from 'lucide-react';

export interface TimezoneItem {
  tz: string;             // Valid IANA string
  code: string;           // 3-4 char abbreviation: IST, EST/EDT, PST/PDT, etc.
  name: string;           // Descriptive name with major cities
  offsetMinutes: number;  // Standard offset in minutes
}

export const CURATED_TIMEZONES: TimezoneItem[] = [
  { tz: 'Etc/GMT+12', code: 'IDLW', name: 'International Date Line West', offsetMinutes: -720 },
  { tz: 'Pacific/Pago_Pago', code: 'SST', name: 'Samoa, Pago Pago', offsetMinutes: -660 },
  { tz: 'Pacific/Honolulu', code: 'HST', name: 'Hawaii, Honolulu', offsetMinutes: -600 },
  { tz: 'America/Anchorage', code: 'AKST/AKDT', name: 'Alaska, Anchorage', offsetMinutes: -540 },
  { tz: 'America/Los_Angeles', code: 'PST/PDT', name: 'Pacific Time (US/Canada), Los Angeles, Vancouver, Seattle', offsetMinutes: -480 },
  { tz: 'America/Denver', code: 'MST/MDT', name: 'Mountain Time (US/Canada), Denver, Phoenix, Calgary', offsetMinutes: -420 },
  { tz: 'America/Chicago', code: 'CST/CDT', name: 'Central Time (US/Canada), Chicago, Dallas, Mexico City', offsetMinutes: -360 },
  { tz: 'America/New_York', code: 'EST/EDT', name: 'Eastern Time (US/Canada), New York, Toronto, Miami, Atlanta', offsetMinutes: -300 },
  { tz: 'America/Halifax', code: 'AST/ADT', name: 'Atlantic Time, Halifax', offsetMinutes: -240 },
  { tz: 'America/St_Johns', code: 'NST/NDT', name: 'Newfoundland, St. Johns', offsetMinutes: -210 },
  { tz: 'America/Sao_Paulo', code: 'BRT', name: 'Brasília, São Paulo, Rio de Janeiro', offsetMinutes: -180 },
  { tz: 'America/Buenos_Aires', code: 'ART', name: 'Argentina, Buenos Aires', offsetMinutes: -180 },
  { tz: 'Atlantic/Azores', code: 'AZOT', name: 'Azores, Ponta Delgada', offsetMinutes: -60 },
  { tz: 'UTC', code: 'UTC/GMT', name: 'Coordinated Universal Time, London (Winter), Dublin, Lisbon', offsetMinutes: 0 },
  { tz: 'Europe/London', code: 'GMT/BST', name: 'London, British Summer Time, Belfast', offsetMinutes: 0 },
  { tz: 'Europe/Paris', code: 'CET/CEST', name: 'Central European Time, Paris, Berlin, Rome, Madrid, Amsterdam', offsetMinutes: 60 },
  { tz: 'Europe/Athens', code: 'EET/EEST', name: 'Eastern European Time, Athens, Cairo, Kyiv, Bucharest, Helsinki', offsetMinutes: 120 },
  { tz: 'Europe/Moscow', code: 'MSK', name: 'Moscow, Saint Petersburg', offsetMinutes: 180 },
  { tz: 'Asia/Riyadh', code: 'AST', name: 'Arabia Standard Time, Riyadh, Kuwait, Doha', offsetMinutes: 180 },
  { tz: 'Asia/Tehran', code: 'IRST', name: 'Iran Standard Time, Tehran', offsetMinutes: 210 },
  { tz: 'Asia/Dubai', code: 'GST', name: 'Gulf Standard Time, Dubai, Abu Dhabi, Muscat', offsetMinutes: 240 },
  { tz: 'Asia/Kabul', code: 'AFT', name: 'Afghanistan, Kabul', offsetMinutes: 270 },
  { tz: 'Asia/Karachi', code: 'PKT', name: 'Pakistan Standard Time, Karachi, Islamabad, Tashkent', offsetMinutes: 300 },
  { tz: 'Asia/Kolkata', code: 'IST', name: 'India Standard Time, Kolkata, Mumbai, Delhi, Bengaluru, Colombo', offsetMinutes: 330 },
  { tz: 'Asia/Kathmandu', code: 'NPT', name: 'Nepal Time, Kathmandu', offsetMinutes: 345 },
  { tz: 'Asia/Dhaka', code: 'BST', name: 'Bangladesh Standard Time, Dhaka, Almaty', offsetMinutes: 360 },
  { tz: 'Asia/Yangon', code: 'MMT', name: 'Myanmar, Yangon', offsetMinutes: 390 },
  { tz: 'Asia/Bangkok', code: 'ICT', name: 'Indochina Time, Bangkok, Jakarta, Hanoi', offsetMinutes: 420 },
  { tz: 'Asia/Singapore', code: 'SGT', name: 'Singapore Standard Time, Singapore, Kuala Lumpur', offsetMinutes: 480 },
  { tz: 'Asia/Hong_Kong', code: 'HKT', name: 'Hong Kong Time, Hong Kong', offsetMinutes: 480 },
  { tz: 'Asia/Shanghai', code: 'CST', name: 'China Standard Time, Beijing, Shanghai', offsetMinutes: 480 },
  { tz: 'Australia/Perth', code: 'AWST', name: 'Australian Western Time, Perth', offsetMinutes: 480 },
  { tz: 'Asia/Tokyo', code: 'JST', name: 'Japan Standard Time, Tokyo, Osaka', offsetMinutes: 540 },
  { tz: 'Asia/Seoul', code: 'KST', name: 'Korea Standard Time, Seoul', offsetMinutes: 540 },
  { tz: 'Australia/Darwin', code: 'ACST', name: 'Australian Central Time, Darwin, Adelaide', offsetMinutes: 570 },
  { tz: 'Australia/Sydney', code: 'AEST/AEDT', name: 'Australian Eastern Time, Sydney, Melbourne, Canberra', offsetMinutes: 600 },
  { tz: 'Australia/Brisbane', code: 'AEST', name: 'Brisbane, Queensland', offsetMinutes: 600 },
  { tz: 'Pacific/Auckland', code: 'NZST/NZDT', name: 'New Zealand Time, Auckland, Wellington', offsetMinutes: 720 },
  { tz: 'Pacific/Fiji', code: 'FJT', name: 'Fiji, Suva', offsetMinutes: 720 },
  { tz: 'Pacific/Tongatapu', code: 'TOT', name: 'Tonga, Nukuʻalofa', offsetMinutes: 780 }
];

const FORMAT_PRESETS = [
  { label: 'Standard 12-Hour (e.g. Sep 20, 2026, 2:30 PM IST)', id: 'readable12' },
  { label: 'Standard 24-Hour (e.g. 20 Sep 2026, 14:30:00 IST)', id: 'readable24' },
  { label: 'ISO 8601 Extended (YYYY-MM-DDTHH:mm:ss)', id: 'iso' },
  { label: 'RFC 2822 / HTTP Format (Sun, 20 Sep 2026 14:30:00)', id: 'rfc' },
  { label: 'SQL Datetime (YYYY-MM-DD HH:mm:ss)', id: 'sql' },
];

function formatOffsetMinutes(mins: number): string {
  const sign = mins >= 0 ? '+' : '-';
  const abs = Math.abs(mins);
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

// Searchable Dropdown Combobox Component
function TimezoneSelect({
  label,
  value,
  onChange,
  localIana,
}: {
  label: string;
  value: string;
  onChange: (tz: string) => void;
  localIana: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedItem = CURATED_TIMEZONES.find(t => t.tz === value) || {
    tz: value,
    code: 'LOC',
    name: value,
    offsetMinutes: 0
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return CURATED_TIMEZONES;
    const q = search.toLowerCase();
    return CURATED_TIMEZONES.filter(t => 
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.tz.toLowerCase().includes(q) ||
      formatOffsetMinutes(t.offsetMinutes).toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 text-left text-xs font-mono bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl flex items-center justify-between shadow-xs hover:border-black/30 dark:hover:border-white/30 transition"
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-bold text-[10px] text-neutral-800 dark:text-neutral-200">
            {selectedItem.code}
          </span>
          <span className="font-bold text-neutral-900 dark:text-white truncate">
            {formatOffsetMinutes(selectedItem.offsetMinutes)}
          </span>
          <span className="text-neutral-500 truncate hidden sm:inline">
            ({selectedItem.name.split(',')[0]})
          </span>
          {selectedItem.tz === localIana && (
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-semibold">
              (You)
            </span>
          )}
        </div>
        <ChevronDown size={14} className="text-neutral-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-black/5 dark:border-white/10 relative">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code (IST, PST, EDT), city (New York, London)..."
              className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
            />
            <Search size={12} className="absolute left-4 top-3 text-neutral-400" />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-black/5 dark:divide-white/5 max-h-60 p-1">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-neutral-400 font-mono">
                No matching timezones found.
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.tz}
                  type="button"
                  onClick={() => {
                    onChange(t.tz);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition ${
                    t.tz === value
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-16 shrink-0 font-bold text-[10px] tracking-tight">
                      [{t.code}]
                    </span>
                    <span className="shrink-0 font-semibold opacity-80">
                      {formatOffsetMinutes(t.offsetMinutes)}
                    </span>
                    <span className="truncate opacity-90 text-[11px]">
                      {t.name}
                    </span>
                  </div>
                  {t.tz === localIana && (
                    <span className="text-[10px] font-sans font-bold text-emerald-500 shrink-0">
                      Your Local
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimezoneConverterTool() {
  const [localIana, setLocalIana] = useState<string>('UTC');
  const [sourceTz, setSourceTz] = useState<string>('Asia/Kolkata');
  const [targetTz, setTargetTz] = useState<string>('America/New_York');
  const [selectedFormat, setSelectedFormat] = useState<string>('readable12');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Date and Time Pickers
  const now = new Date();
  const [dateStr, setDateStr] = useState<string>(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [timeStr, setTimeStr] = useState<string>(() => {
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${min}:${s}`;
  });

  // Quick Paste Popover / Input
  const [quickPasteInput, setQuickPasteInput] = useState<string>('');
  const [showQuickPaste, setShowQuickPaste] = useState<boolean>(false);

  // Fix: Accurately match browser timezone on mount (supporting aliases like Asia/Calcutta -> Asia/Kolkata)
  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setLocalIana(userTz);

      // Match exact IANA or equivalent offset match
      let exact = CURATED_TIMEZONES.find(t => t.tz === userTz);
      if (!exact) {
        // Resolve Calcutta -> Kolkata alias
        if (userTz.includes('Calcutta')) exact = CURATED_TIMEZONES.find(t => t.tz === 'Asia/Kolkata');
        else {
          const userOffset = -new Date().getTimezoneOffset();
          exact = CURATED_TIMEZONES.find(t => t.offsetMinutes === userOffset);
        }
      }

      const activeTz = exact ? exact.tz : userTz;
      setSourceTz(activeTz);

      if (activeTz === 'America/New_York') {
        setTargetTz('Europe/London');
      } else {
        setTargetTz('America/New_York');
      }
    } catch {
      setLocalIana('UTC');
      setSourceTz('UTC');
      setTargetTz('America/New_York');
    }
  }, []);

  // Compute Epoch Timestamp relative to selected Source Timezone
  const epochTimestamp = useMemo(() => {
    try {
      if (!dateStr || !timeStr) return null;
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);

      if (!year || !month || !day) return null;

      // Create naive ISO string
      const isoLike = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      const naive = new Date(isoLike);
      if (isNaN(naive.getTime())) return null;

      // Adjust to source timezone offset
      const utcDate = new Date(naive.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(naive.toLocaleString('en-US', { timeZone: sourceTz }));
      const diff = utcDate.getTime() - tzDate.getTime();

      return naive.getTime() + diff;
    } catch {
      return null;
    }
  }, [dateStr, timeStr, sourceTz]);

  // Handle Quick Paste Parser
  const handleApplyPastedTimestamp = () => {
    const raw = quickPasteInput.trim();
    if (!raw) return;

    let targetDate: Date | null = null;

    // 1. Numeric epoch check (seconds or ms)
    if (/^\d{10,13}$/.test(raw)) {
      const num = Number(raw);
      targetDate = new Date(raw.length <= 11 ? num * 1000 : num);
    } else {
      // 2. Standard string formats (ISO, RFC, SQL)
      const parsed = Date.parse(raw);
      if (!isNaN(parsed)) {
        targetDate = new Date(parsed);
      }
    }

    if (targetDate && !isNaN(targetDate.getTime())) {
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      setDateStr(`${y}-${m}-${d}`);

      const h = String(targetDate.getHours()).padStart(2, '0');
      const min = String(targetDate.getMinutes()).padStart(2, '0');
      const sec = String(targetDate.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${min}:${sec}`);

      setShowQuickPaste(false);
      setQuickPasteInput('');
    }
  };

  // Format Helper for Results
  const formatResult = (epochMs: number, tz: string, formatId: string): string => {
    const d = new Date(epochMs);
    try {
      switch (formatId) {
        case 'readable12':
          return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
          }).format(d);

        case 'readable24':
          return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short'
          }).format(d);

        case 'iso': {
          const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).formatToParts(d);
          const getVal = (type: string) => parts.find(p => p.type === type)?.value || '00';
          return `${getVal('year')}-${getVal('month')}-${getVal('day')}T${getVal('hour')}:${getVal('minute')}:${getVal('second')}`;
        }

        case 'rfc':
          return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short'
          }).format(d);

        case 'sql': {
          const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).formatToParts(d);
          const getVal = (type: string) => parts.find(p => p.type === type)?.value || '00';
          return `${getVal('year')}-${getVal('month')}-${getVal('day')} ${getVal('hour')}:${getVal('minute')}:${getVal('second')}`;
        }

        default:
          return d.toLocaleString('en-US', { timeZone: tz });
      }
    } catch {
      return 'Invalid conversion';
    }
  };

  const tzOffsetDifference = useMemo(() => {
    if (!epochTimestamp) return '';
    try {
      const d = new Date(epochTimestamp);
      const getOffsetMinutes = (tz: string) => {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(d);
        const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT0';
        const match = offsetStr.match(/GMT([+-])(\d+)(?::(\d+))?/);
        if (!match) return 0;
        const sign = match[1] === '-' ? -1 : 1;
        const hours = parseInt(match[2], 10);
        const mins = match[3] ? parseInt(match[3], 10) : 0;
        return sign * (hours * 60 + mins);
      };

      const diffMin = getOffsetMinutes(targetTz) - getOffsetMinutes(sourceTz);
      const diffHours = diffMin / 60;
      if (diffHours === 0) return 'Same time';
      const sign = diffHours > 0 ? '+' : '';
      return `${sign}${diffHours} hrs ${diffHours > 0 ? 'ahead' : 'behind'}`;
    } catch {
      return '';
    }
  }, [epochTimestamp, sourceTz, targetTz]);

  const swapTimezones = () => {
    setSourceTz(targetTz);
    setTargetTz(sourceTz);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const setNow = () => {
    const current = new Date();
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setDateStr(`${y}-${m}-${d}`);

    const h = String(current.getHours()).padStart(2, '0');
    const min = String(current.getMinutes()).padStart(2, '0');
    const sec = String(current.getSeconds()).padStart(2, '0');
    setTimeStr(`${h}:${min}:${sec}`);
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors space-y-5">
        
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span>Date & Time</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">Timezone Converter</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Globe size={18} /> Global Timezone Converter
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickPaste(!showQuickPaste)}
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition"
            >
              Paste Any Timestamp
            </button>
            <button
              onClick={setNow}
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition flex items-center gap-1"
            >
              <Clock size={12} /> Set to Now
            </button>
          </div>
        </div>

        {/* Quick Paste Modal / Drawer */}
        {showQuickPaste && (
          <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800/90 rounded-xl border border-black/10 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              Paste ISO 8601, RFC 2822, SQL datetime, or Epoch:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickPasteInput}
                onChange={(e) => setQuickPasteInput(e.target.value)}
                placeholder="e.g. 2026-09-20T14:30:00 or 1774021832"
                className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-lg focus:outline-none"
              />
              <button
                onClick={handleApplyPastedTimestamp}
                className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold rounded-lg shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* TIMEZONE SELECTORS WITH AUTOCOMPLETE SEARCH */}
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-start">
          <div className="sm:col-span-5">
            <TimezoneSelect
              label="From Timezone"
              value={sourceTz}
              onChange={setSourceTz}
              localIana={localIana}
            />
          </div>

          <div className="sm:col-span-1 flex justify-center pt-6">
            <button
              onClick={swapTimezones}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 transition shadow-xs"
              title="Swap From and To timezones"
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>

          <div className="sm:col-span-5">
            <TimezoneSelect
              label="To Timezone"
              value={targetTz}
              onChange={setTargetTz}
              localIana={localIana}
            />
          </div>
        </div>

        {/* INPUT COMPONENT PICKERS */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
            Select Date & Time (in Source Timezone)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-neutral-400 font-mono block mb-1">Calendar Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-xl text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 font-mono block mb-1">Time (24-Hour HH:MM:SS)</label>
              <input
                type="time"
                step="1"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-xl text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* CONVERSION DISPLAY CARDS */}
        {epochTimestamp !== null ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Time Display */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-black/5 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                  Original Source ({sourceTz})
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-200 block">
                  {formatResult(epochTimestamp, sourceTz, selectedFormat)}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono block">
                  UTC: {new Date(epochTimestamp).toUTCString()}
                </span>
              </div>

              {/* Target Converted Time Display */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Target Time ({targetTz})
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatResult(epochTimestamp, targetTz, selectedFormat), 'target-time')}
                      className="text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition"
                      title="Copy converted time"
                    >
                      {copiedKey === 'target-time' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white block mt-0.5">
                    {formatResult(epochTimestamp, targetTz, selectedFormat)}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium block">
                  {tzOffsetDifference ? `Variance: ${tzOffsetDifference}` : ''}
                </span>
              </div>
            </div>

            {/* Standard Formats Preset Toolbar */}
            <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles size={13} /> Display Format Presets:
                </span>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  {FORMAT_PRESETS.map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2.5 rounded-lg border border-black/5 dark:border-white/5 font-mono text-xs">
                <span className="text-neutral-800 dark:text-neutral-200 truncate pr-2">
                  {formatResult(epochTimestamp, targetTz, selectedFormat)}
                </span>
                <button
                  onClick={() => copyToClipboard(formatResult(epochTimestamp, targetTz, selectedFormat), 'preset-fmt')}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-neutral-500 transition"
                  title="Copy formatted result"
                >
                  {copiedKey === 'preset-fmt' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}