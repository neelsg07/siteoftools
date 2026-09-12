import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Globe, Clock, Search, Plus, Trash2, Check, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CityMarker {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
}

// Visually calibrated to perfectly overlap "world-map-outline.png" on a 1000x540 canvas
const GLOBAL_CITIES: CityMarker[] = [
  // North America
  { id: 'America/Anchorage', name: 'Anchorage', country: 'USA', x: 85, y: 100 },
  { id: 'America/Vancouver', name: 'Vancouver', country: 'Canada', x: 140, y: 140 },
  { id: 'America/Los_Angeles', name: 'Los Angeles', country: 'USA', x: 150, y: 190 },
  { id: 'America/Denver', name: 'Denver', country: 'USA', x: 190, y: 175 },
  { id: 'America/Chicago', name: 'Chicago', country: 'USA', x: 240, y: 170 },
  { id: 'America/Toronto', name: 'Toronto', country: 'Canada', x: 260, y: 165 },
  { id: 'America/New_York', name: 'New York', country: 'USA', x: 275, y: 175 },
  { id: 'America/Mexico_City', name: 'Mexico City', country: 'Mexico', x: 200, y: 240 },
  { id: 'America/Panama', name: 'Panama City', country: 'Panama', x: 260, y: 265 },
  { id: 'Pacific/Honolulu', name: 'Honolulu', country: 'USA', x: 50, y: 240 },

  // South America
  { id: 'America/Bogota', name: 'Bogota', country: 'Colombia', x: 275, y: 290 },
  { id: 'America/Lima', name: 'Lima', country: 'Peru', x: 270, y: 345 },
  { id: 'America/Santiago', name: 'Santiago', country: 'Chile', x: 285, y: 425 },
  { id: 'America/Buenos_Aires', name: 'Buenos Aires', country: 'Argentina', x: 315, y: 420 },
  { id: 'America/Sao_Paulo', name: 'São Paulo', country: 'Brazil', x: 345, y: 375 },

  // Europe & UK
  { id: 'Atlantic/Reykjavik', name: 'Reykjavik', country: 'Iceland', x: 420, y: 100 },
  { id: 'Europe/London', name: 'London', country: 'UK', x: 475, y: 150 },
  { id: 'Europe/Madrid', name: 'Madrid', country: 'Spain', x: 465, y: 185 },
  { id: 'Europe/Paris', name: 'Paris', country: 'France', x: 485, y: 165 },
  { id: 'Europe/Berlin', name: 'Berlin', country: 'Germany', x: 510, y: 150 },
  { id: 'Europe/Rome', name: 'Rome', country: 'Italy', x: 515, y: 185 },
  { id: 'Europe/Stockholm', name: 'Stockholm', country: 'Sweden', x: 525, y: 115 },
  { id: 'Europe/Athens', name: 'Athens', country: 'Greece', x: 545, y: 195 },
  { id: 'Europe/Kyiv', name: 'Kyiv', country: 'Ukraine', x: 560, y: 145 },
  { id: 'Europe/Istanbul', name: 'Istanbul', country: 'Turkey', x: 565, y: 185 },
  { id: 'Europe/Moscow', name: 'Moscow', country: 'Russia', x: 590, y: 125 },

  // Africa & Middle East
  { id: 'Africa/Casablanca', name: 'Casablanca', country: 'Morocco', x: 450, y: 210 },
  { id: 'Africa/Lagos', name: 'Lagos', country: 'Nigeria', x: 490, y: 300 },
  { id: 'Africa/Cairo', name: 'Cairo', country: 'Egypt', x: 555, y: 225 },
  { id: 'Africa/Nairobi', name: 'Nairobi', country: 'Kenya', x: 580, y: 310 },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', country: 'South Africa', x: 545, y: 420 },
  { id: 'Asia/Riyadh', name: 'Riyadh', country: 'Saudi Arabia', x: 600, y: 245 },
  { id: 'Asia/Dubai', name: 'Dubai', country: 'UAE', x: 625, y: 235 },
  { id: 'Asia/Tehran', name: 'Tehran', country: 'Iran', x: 615, y: 195 },

  // Asia & Oceania
  { id: 'Asia/Karachi', name: 'Karachi', country: 'Pakistan', x: 660, y: 235 },
  { id: 'Asia/Kolkata', name: 'Kolkata / Delhi', country: 'India', x: 710, y: 245 },
  { id: 'Asia/Dhaka', name: 'Dhaka', country: 'Bangladesh', x: 735, y: 240 },
  { id: 'Asia/Bangkok', name: 'Bangkok', country: 'Thailand', x: 755, y: 275 },
  { id: 'Asia/Singapore', name: 'Singapore', country: 'Singapore', x: 765, y: 315 },
  { id: 'Asia/Hong_Kong', name: 'Hong Kong', country: 'Hong Kong', x: 800, y: 240 },
  { id: 'Asia/Shanghai', name: 'Shanghai / Beijing', country: 'China', x: 820, y: 210 },
  { id: 'Asia/Seoul', name: 'Seoul', country: 'South Korea', x: 840, y: 195 },
  { id: 'Asia/Tokyo', name: 'Tokyo', country: 'Japan', x: 865, y: 190 },
  { id: 'Australia/Perth', name: 'Perth', country: 'Australia', x: 805, y: 415 },
  { id: 'Australia/Sydney', name: 'Sydney', country: 'Australia', x: 885, y: 435 },
  { id: 'Pacific/Auckland', name: 'Auckland', country: 'New Zealand', x: 945, y: 465 }
];

export default function WorldTime() {
  const [selectedTz, setSelectedTz] = useState<string>('Asia/Kolkata');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [pinnedZones, setPinnedZones] = useState<string[]>([
    'Asia/Kolkata',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo'
  ]);
  const [now, setNow] = useState<Date>(new Date());

  // Zoom & Pan Engine
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trackpad 2-finger zoom & wheel handler
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setScale(prev => Math.min(Math.max(prev * zoomFactor, 1), 4));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale === 1) return;
    const maxX = (scale - 1) * 350;
    const maxY = (scale - 1) * 175;
    const nextX = Math.min(Math.max(e.clientX - dragStart.current.x, -maxX), maxX);
    const nextY = Math.min(Math.max(e.clientY - dragStart.current.y, -maxY), maxY);
    setPosition({ x: nextX, y: nextY });
  }, [isDragging, scale]);

  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const allTimezones = useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf('timeZone') as string[];
    } catch {
      return GLOBAL_CITIES.map(c => c.id);
    }
  }, []);

  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return allTimezones.slice(0, 45);
    return allTimezones
      .filter(tz => tz.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 45);
  }, [searchQuery, allTimezones]);

  const formatTime = (tz: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(now);
    } catch {
      return '--:--:--';
    }
  };

  const formatDate = (tz: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(now);
    } catch {
      return 'Invalid Date';
    }
  };

  const getUtcOffsetString = (tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      }).formatToParts(now);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : 'UTC';
    } catch {
      return 'UTC';
    }
  };

  const togglePin = (tz: string) => {
    if (pinnedZones.includes(tz)) {
      setPinnedZones(pinnedZones.filter(z => z !== tz));
    } else {
      setPinnedZones([...pinnedZones, tz]);
    }
  };

  const activeCity = GLOBAL_CITIES.find(c => c.id === selectedTz);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 540;

    let closestCity = GLOBAL_CITIES[0];
    let minDistance = Infinity;

    GLOBAL_CITIES.forEach(city => {
      const d = Math.hypot(city.x - clickX, city.y - clickY);
      if (d < minDistance) {
        minDistance = d;
        closestCity = city;
      }
    });

    setSelectedTz(closestCity.id);
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-black/10 dark:border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span>Date & Time</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">World Time</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Globe size={18} /> World Time & Timezone Explorer
            </h1>
          </div>

          <div className="relative w-full md:w-80" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search timezone (e.g. Kolkata, Sydney)..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1 text-xs divide-y divide-black/5 dark:divide-white/5">
                {filteredTimezones.map((tz) => (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => {
                      setSelectedTz(tz);
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200 flex justify-between items-center transition"
                  >
                    <span className="truncate">{tz}</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">{getUtcOffsetString(tz)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Zone Display Card */}
        <div className="bg-neutral-50 dark:bg-neutral-950 border border-black/5 dark:border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-inner">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-neutral-500" />
              <span className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white font-mono">{selectedTz}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold">
                {getUtcOffsetString(selectedTz)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">{formatDate(selectedTz)}</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-black/5 dark:border-white/5">
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight block">
                {formatTime(selectedTz)}
              </span>
            </div>
            <button
              onClick={() => togglePin(selectedTz)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                pinnedZones.includes(selectedTz)
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {pinnedZones.includes(selectedTz) ? <Check size={14} /> : <Plus size={14} />}
              {pinnedZones.includes(selectedTz) ? 'Pinned' : 'Pin'}
            </button>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            <span>Pinch / Scroll to Zoom • Click any location</span>
            <span>Scale: {Math.round(scale * 100)}%</span>
          </div>

          <div 
            ref={mapContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 aspect-[2/1.08] w-full shadow-inner cursor-grab active:cursor-grabbing"
          >
            {/* Canvas Transformation Node */}
            <div 
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
              className="w-full h-full relative"
            >
              
              {/* Image Base Layer (The uploaded map) */}
              <img
                src="/images/world-map-outline.png"
                alt="World Map Grid"
                className="absolute inset-0 w-full h-full object-fill opacity-75 dark:opacity-40 dark:invert pointer-events-none select-none"
              />

              <svg 
                viewBox="0 0 1000 540" 
                className="absolute inset-0 w-full h-full select-none cursor-crosshair"
                onClick={handleMapClick}
              >
                {/* 24 Longitude UTC Meridian Lines (Calibrated for the new image) */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const x = i * (1000 / 24);
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="540"
                      stroke="rgba(0, 0, 0, 0.05)"
                      className="dark:stroke-white/5"
                      strokeWidth="0.75"
                      strokeDasharray="2 4"
                    />
                  );
                })}

                {/* Highlight Strip for Selected Timezone */}
                {activeCity && (
                  <rect
                    x={activeCity.x - 20.8}
                    y="0"
                    width="41.6"
                    height="540"
                    className="fill-black/5 dark:fill-white/10 stroke-black/10 dark:stroke-white/20 pointer-events-none transition-all duration-300"
                    strokeWidth="1"
                  />
                )}

                {/* City Markers and Labels */}
                {GLOBAL_CITIES.map((city) => {
                  const isSelected = selectedTz === city.id;
                  
                  return (
                    <g
                      key={city.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTz(city.id);
                      }}
                      className="cursor-pointer group"
                    >
                      <circle cx={city.x} cy={city.y} r={16 / scale} fill="transparent" />

                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={(isSelected ? 5.5 : 3.5) / Math.sqrt(scale)}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? 'fill-emerald-600 dark:fill-emerald-400 stroke-2 stroke-white dark:stroke-neutral-900 shadow-xl'
                            : 'fill-neutral-600 dark:fill-neutral-400 hover:fill-emerald-600 dark:hover:fill-emerald-400'
                        }`}
                      />

                      <text
                        x={city.x}
                        y={city.y - (8 / Math.sqrt(scale))}
                        fontSize={Math.max(8 / Math.sqrt(scale), 5.5)}
                        textAnchor="middle"
                        className={`font-mono select-none transition-all pointer-events-none ${
                          isSelected
                            ? 'fill-neutral-900 dark:fill-white font-bold'
                            : 'fill-neutral-600 dark:fill-neutral-400 opacity-80 group-hover:opacity-100 group-hover:fill-neutral-900 dark:group-hover:fill-white'
                        }`}
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Floating Zoom Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/80 dark:bg-black/60 backdrop-blur-md p-1 rounded-xl border border-black/10 dark:border-white/15 text-neutral-800 dark:text-white shadow-lg">
              <button
                type="button"
                onClick={() => setScale(prev => Math.min(prev + 0.3, 4))}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/20 rounded-lg transition"
                aria-label="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setScale(prev => Math.max(prev - 0.3, 1))}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/20 rounded-lg transition"
                aria-label="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              {scale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/20 rounded-lg transition text-xs font-mono"
                  aria-label="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Pinned World Clocks */}
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock size={16} /> Pinned World Clocks ({pinnedZones.length})
          </h2>
          <span className="text-[11px] text-neutral-500 font-mono">Live synchronization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pinnedZones.map((tz) => (
            <div
              key={tz}
              onClick={() => setSelectedTz(tz)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedTz === tz
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-md'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-xs block font-mono truncate max-w-[130px]">{tz.split('/')[1]?.replace(/_/g, ' ') || tz}</span>
                  <span className="text-[10px] opacity-70 block">{getUtcOffsetString(tz)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(tz);
                  }}
                  className="opacity-50 hover:opacity-100 transition p-1"
                  aria-label="Remove clock"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div>
                <div className="text-lg font-bold font-mono tracking-tight">{formatTime(tz)}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{formatDate(tz)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}