import React, { useState, useMemo, useRef } from 'react';
import { 
  Lock, Unlock, Copy, Check, RotateCcw, ArrowRightLeft, 
  Upload, Download, FileText, Image as ImageIcon 
} from 'lucide-react';

type TextEncoding = 'utf-8' | 'hex' | 'iso-8859-1' | 'utf-16le' | 'utf-16be';

const ENCODING_OPTIONS: { id: TextEncoding; label: string }[] = [
  { id: 'utf-8', label: 'UTF-8 (Standard Web)' },
  { id: 'hex', label: 'Hex (Raw Byte Dump)' },
  { id: 'iso-8859-1', label: 'Latin-1 / ASCII (ISO-8859-1)' },
  { id: 'utf-16le', label: 'UTF-16LE (Windows / PowerShell)' },
  { id: 'utf-16be', label: 'UTF-16BE (Java / Network Big-Endian)' },
];

function bytesToBinaryString(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return binary;
}

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [input, setInput] = useState<string>('Hello, SiteOfTools! 🚀 High-performance utilities.');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [selectedEncoding, setSelectedEncoding] = useState<TextEncoding>('utf-8');
  const [copied, setCopied] = useState<boolean>(false);
  
  const [fileData, setFileData] = useState<{ 
    name: string; 
    size: string; 
    type: string; 
    base64: string 
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encodeToBase64 = (rawStr: string, encoding: TextEncoding, isUrlSafe: boolean) => {
    try {
      if (!rawStr) return { output: '', error: null };
      let bytes: Uint8Array;

      if (encoding === 'hex') {
        const cleanHex = rawStr.replace(/[^0-9a-fA-F]/g, '');
        if (cleanHex.length === 0) return { output: '', error: null };
        if (cleanHex.length % 2 !== 0) {
          return { output: '', error: 'Hex string must contain an even number of characters.' };
        }
        bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
          bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
        }
      } else if (encoding === 'utf-16le') {
        const buf = new ArrayBuffer(rawStr.length * 2);
        const view = new DataView(buf);
        for (let i = 0; i < rawStr.length; i++) {
          view.setUint16(i * 2, rawStr.charCodeAt(i), true);
        }
        bytes = new Uint8Array(buf);
      } else if (encoding === 'utf-16be') {
        const buf = new ArrayBuffer(rawStr.length * 2);
        const view = new DataView(buf);
        for (let i = 0; i < rawStr.length; i++) {
          view.setUint16(i * 2, rawStr.charCodeAt(i), false);
        }
        bytes = new Uint8Array(buf);
      } else if (encoding === 'iso-8859-1') {
        bytes = new Uint8Array(rawStr.length);
        for (let i = 0; i < rawStr.length; i++) {
          bytes[i] = rawStr.charCodeAt(i) & 0xff;
        }
      } else {
        bytes = new TextEncoder().encode(rawStr);
      }

      const binaryStr = bytesToBinaryString(bytes);
      let b64 = window.btoa(binaryStr);

      if (isUrlSafe) {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }

      return { output: b64, error: null };
    } catch (err: any) {
      return { output: '', error: err?.message || 'Encoding failed' };
    }
  };

  const decodeFromBase64 = (b64Str: string, encoding: TextEncoding) => {
    try {
      const clean = b64Str.trim();
      if (!clean) return { output: '', error: null };

      let normalized = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (normalized.length % 4 !== 0) {
        normalized += '=';
      }

      const binString = window.atob(normalized);
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
      }

      if (encoding === 'hex') {
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
        return { output: hex, error: null };
      }

      const decoder = new TextDecoder(encoding, { fatal: true });
      return { output: decoder.decode(bytes), error: null };
    } catch (err: any) {
      return { 
        output: '', 
        error: `Invalid Base64 string or incompatible charset (${encoding.toUpperCase()}).` 
      };
    }
  };

  const { resultText, conversionError } = useMemo(() => {
    if (!input.trim()) return { resultText: '', conversionError: null };

    if (mode === 'encode') {
      const { output, error } = encodeToBase64(input, selectedEncoding, urlSafe);
      return { resultText: output, conversionError: error };
    } else {
      const { output, error } = decodeFromBase64(input, selectedEncoding);
      return { resultText: output, conversionError: error };
    }
  }, [input, mode, selectedEncoding, urlSafe]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (resultText && !conversionError) {
      setInput(resultText);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      const sizeKB = (file.size / 1024).toFixed(2);
      setFileData({
        name: file.name,
        size: `${sizeKB} KB`,
        type: file.type || 'application/octet-stream',
        base64: b64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xl transition-colors space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-semibold mb-1">
              <a href="/" className="hover:underline">Home</a> <span>&gt;</span> <span>Security</span> <span>&gt;</span> <span className="text-neutral-900 dark:text-white">Base64 Tool</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock size={18} /> Base64 Encoder & Decoder
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInput('');
                setFileData(null);
              }}
              className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 transition flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        {/* ROW 1: Mode Switcher (Text vs File) & Main Encode/Decode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-black/5 dark:border-white/10 font-medium text-xs">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText size={14} /> Text String
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'file'
                  ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <ImageIcon size={14} /> File to Base64
            </button>
          </div>

          {/* Prominent Encode / Decode Switcher */}
          {activeTab === 'text' && (
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-black/5 dark:border-white/10 text-xs font-medium">
              <button
                onClick={() => setMode('encode')}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  mode === 'encode'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Lock size={13} /> Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  mode === 'decode'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Unlock size={13} /> Decode
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: Options Shelf (Charset Dropdown & URL-Safe Checkbox) */}
        {activeTab === 'text' && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 border border-black/10 dark:border-white/15 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-neutral-500 font-semibold text-[11px]">
                {mode === 'encode' ? 'Input Encoding:' : 'Output Encoding:'}
              </span>
              <select
                value={selectedEncoding}
                onChange={(e) => setSelectedEncoding(e.target.value as TextEncoding)}
                className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                {ENCODING_OPTIONS.map((enc) => (
                  <option key={enc.id} value={enc.id}>
                    {enc.label}
                  </option>
                ))}
              </select>
            </div>

            {mode === 'encode' && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded border-neutral-400 dark:border-neutral-600 text-neutral-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                  URL-Safe Variant (<code className="font-mono text-[11px]">-</code> and <code className="font-mono text-[11px]">_</code>)
                </span>
              </label>
            )}
          </div>
        )}

        {/* TAB 1: TEXT ENCODER & DECODER */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            
            {/* Input Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="font-bold text-neutral-500 uppercase tracking-wider">
                  {mode === 'encode' 
                    ? `Input Content (${selectedEncoding.toUpperCase()})` 
                    : 'Base64 Input String'}
                </span>
                <span className="text-neutral-400 font-sans text-[10px]">
                  {input.length} characters
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'encode' 
                    ? selectedEncoding === 'hex' 
                      ? 'Enter hex digits (e.g., 48 65 6c 6c 6f)...'
                      : 'Type or paste plaintext to encode...' 
                    : 'Paste Base64 characters to decode...'
                }
                className="w-full h-44 p-3.5 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y shadow-inner leading-relaxed"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 transition flex items-center gap-1.5 shadow-xs"
                title="Swap input and output"
              >
                <ArrowRightLeft size={13} /> Swap (Encode ⇄ Decode)
              </button>
            </div>

            {/* Output Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="font-bold text-neutral-500 uppercase tracking-wider">
                  {mode === 'encode' 
                    ? 'Base64 Encoded Result' 
                    : `Decoded Output (${selectedEncoding.toUpperCase()})`}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(resultText)}
                    disabled={!resultText || !!conversionError}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition disabled:opacity-40"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(resultText, mode === 'encode' ? 'encoded-base64.txt' : 'decoded-output.txt')}
                    disabled={!resultText || !!conversionError}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition disabled:opacity-40"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {conversionError ? (
                <div className="w-full h-44 p-3.5 font-mono text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-center">
                  {conversionError}
                </div>
              ) : (
                <textarea
                  readOnly
                  value={resultText}
                  placeholder="Converted output will appear here automatically..."
                  className="w-full h-44 p-3.5 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none resize-y shadow-inner leading-relaxed"
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FILE TO BASE64 */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black/15 dark:border-white/15 rounded-xl p-8 text-center cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition space-y-3"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <Upload size={20} />
              </div>
              <div>
                <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                  Click to select or drag & drop any file
                </span>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Convert images, SVGs, documents, and icons into Base64 Data URI strings 100% in-browser.
                </span>
              </div>
            </div>

            {fileData && (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white block">{fileData.name}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">{fileData.size} • {fileData.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(fileData.base64)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-semibold transition flex items-center gap-1"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy Data URI'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                    Base64 Data URI Output
                  </span>
                  <textarea
                    readOnly
                    value={fileData.base64}
                    className="w-full h-36 p-3.5 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-black/10 dark:border-white/15 rounded-xl focus:outline-none resize-y shadow-inner leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}