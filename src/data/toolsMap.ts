// src/data/toolsMap.ts

export type ToolCategory = 'Developer' | 'Text' | 'Data' | 'Date & Time' | 'Math' | 'Converter';

export interface ToolMetadata {
  id: string;
  name: string;
  href: string;
  category: ToolCategory;
  description: string;
  icon?: string;
  status: 'ready' | 'coming-soon';
}

// 1. Centralized Source of Truth (Key-Value Registry)
export const TOOL_REGISTRY: Record<string, ToolMetadata> = {
  'json-diff': {
    id: 'json-diff',
    name: 'JSON Diff',
    href: '/json-diff',
    category: 'Developer',
    description: 'Compare two JSON objects side-by-side and highlight additions, removals, and changes.',
    icon: '{ }',
    status: 'ready',
  },
  // Inside src/data/toolsMap.ts -> TOOL_REGISTRY:
  'json-formatter': {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    href: '/json-formatter',
    category: 'Developer',
    description: 'Format, validate, minify, and interactively visualize JSON trees online. 100% in-browser with zero server tracking.',
    icon: '✨',
    status: 'ready',
  },
  'json-validator': {
    id: 'json-validator',
    name: 'JSON Validator',
    href: '/json-validator',
    category: 'Developer',
    description: 'Verify syntax rules and locate structural errors in JSON payloads.',
    icon: '🛡️',
    status: 'coming-soon',
  },
  'base64-tool': {
    id: 'base64-tool',
    name: 'Base64 Encoder & Decoder',
    href: '/base64-tool',
    category: 'Converter',
    description: 'Encode and decode Base64 strings and files with full UTF-8 character support, URL-safe variants, and zero server uploads.',
    icon: '🔒',
    status: 'ready',
  },
  // Inside src/data/toolsMap.ts -> TOOL_REGISTRY:
  'epoch-converter': {
    id: 'epoch-converter',
    name: 'Epoch & Unix Timestamp Converter',
    href: '/epoch-converter',
    category: 'Date & Time',
    description: 'Convert Unix epoch timestamps to human-readable UTC and local dates with auto-detection for seconds and milliseconds.',
    icon: '⏱️',
    status: 'ready',
  },
  // Inside src/data/toolsMap.ts -> TOOL_REGISTRY:
  'timezone-converter': {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    href: '/timezone-converter',
    category: 'Date & Time',
    description: 'Convert dates and times between any global timezones with smart timestamp auto-detection and standard format presets.',
    icon: '🌐',
    status: 'ready',
  },
  'list-compare': {
    id: 'list-compare',
    name: 'List Compare',
    href: '/list-compare',
    category: 'Text',
    description: 'Find common items, duplicates, unique entries between two lists.',
    icon: '📋',
    status: 'ready',
  },
  'unit-converter': {
    id: 'unit-converter',
    name: 'Unit Converter',
    href: '/unit-converter',
    category: 'Math',
    description: 'Convert storage bytes, CSS units, and time.',
    icon: '⇄',
    status: 'coming-soon',
  },
  'world-time': {
    id: 'world-time',
    name: 'World Time Map',
    href: '/world-time',
    category: 'Date & Time',
    description: 'Interactive global timezone map with live multi-city synchronization and UTC offsets.',
    icon: '🌐',
    status: 'ready',
  },
  'text-diff': {
    id: 'text-diff',
    name: 'Text Diff Checker',
    href: '/text-diff',
    category: 'Text',
    description: 'Compare two text files or code snippets and view line-by-line additions and deletions.',
    icon: '📄',
    status: 'ready',
    },
};

// 2. JavaScript Map instance for .get() operations
export const toolsMap = new Map<string, ToolMetadata>(
  Object.entries(TOOL_REGISTRY)
);

// 3. Helper Functions
export function getToolLink(toolId: string): string {
  return toolsMap.get(toolId)?.href ?? '#';
}

export function getTool(toolId: string): ToolMetadata | undefined {
  return toolsMap.get(toolId);
}

export function getRelatedTools(toolIds: string[]): ToolMetadata[] {
  return toolIds
    .map((id) => toolsMap.get(id))
    .filter((tool): tool is ToolMetadata => Boolean(tool));
}