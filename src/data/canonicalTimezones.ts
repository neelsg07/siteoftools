export interface CanonicalTimezone {
  id: string; // Valid IANA identifier for the browser engine
  label: string; // User-facing clean label
  offsetStr: string; // e.g. "UTC+05:30"
  offsetMinutes: number; // For sorting west to east (-720 to +840)
  abbr: string; // e.g. "IST", "EST", "CET"
}

export const CANONICAL_TIMEZONES: CanonicalTimezone[] = [
  { id: 'Etc/GMT+12', label: '(UTC-12:00) Baker Island, Howland Island', offsetStr: 'UTC-12:00', offsetMinutes: -720, abbr: 'AoE' },
  { id: 'Pacific/Pago_Pago', label: '(UTC-11:00) American Samoa, Niue', offsetStr: 'UTC-11:00', offsetMinutes: -660, abbr: 'SST' },
  { id: 'Pacific/Honolulu', label: '(UTC-10:00) Hawaii Standard Time (HST)', offsetStr: 'UTC-10:00', offsetMinutes: -600, abbr: 'HST' },
  { id: 'Pacific/Marquesas', label: '(UTC-09:30) Marquesas Islands', offsetStr: 'UTC-09:30', offsetMinutes: -570, abbr: 'MART' },
  { id: 'America/Anchorage', label: '(UTC-09:00) Alaska Time (AKST/AKDT)', offsetStr: 'UTC-09:00', offsetMinutes: -540, abbr: 'AKST' },
  { id: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (PST/PDT) — Los Angeles, Vancouver', offsetStr: 'UTC-08:00', offsetMinutes: -480, abbr: 'PT' },
  { id: 'America/Denver', label: '(UTC-07:00) Mountain Time (MST/MDT) — Denver, Phoenix', offsetStr: 'UTC-07:00', offsetMinutes: -420, abbr: 'MT' },
  { id: 'America/Chicago', label: '(UTC-06:00) Central Time (CST/CDT) — Chicago, Mexico City', offsetStr: 'UTC-06:00', offsetMinutes: -360, abbr: 'CT' },
  { id: 'America/New_York', label: '(UTC-05:00) Eastern Time (EST/EDT) — New York, Toronto', offsetStr: 'UTC-05:00', offsetMinutes: -300, abbr: 'ET' },
  { id: 'America/Halifax', label: '(UTC-04:00) Atlantic Time (AST/ADT) — Halifax, Santiago', offsetStr: 'UTC-04:00', offsetMinutes: -240, abbr: 'AT' },
  { id: 'America/St_Johns', label: '(UTC-03:30) Newfoundland Time — St. John\'s', offsetStr: 'UTC-03:30', offsetMinutes: -210, abbr: 'NST' },
  { id: 'America/Sao_Paulo', label: '(UTC-03:00) Brazil, Buenos Aires, Greenland', offsetStr: 'UTC-03:00', offsetMinutes: -180, abbr: 'BRT' },
  { id: 'America/Noronha', label: '(UTC-02:00) Fernando de Noronha, South Georgia', offsetStr: 'UTC-02:00', offsetMinutes: -120, abbr: 'FNT' },
  { id: 'Atlantic/Cape_Verde', label: '(UTC-01:00) Cape Verde, Azores', offsetStr: 'UTC-01:00', offsetMinutes: -60, abbr: 'CVT' },
  { id: 'UTC', label: '(UTC±00:00) Coordinated Universal Time / GMT — London, Dublin', offsetStr: 'UTC+00:00', offsetMinutes: 0, abbr: 'UTC' },
  { id: 'Europe/Paris', label: '(UTC+01:00) Central European Time (CET/CEST) — Paris, Berlin, Rome', offsetStr: 'UTC+01:00', offsetMinutes: 60, abbr: 'CET' },
  { id: 'Europe/Athens', label: '(UTC+02:00) Eastern European Time (EET/EEST) — Athens, Cairo, Kyiv', offsetStr: 'UTC+02:00', offsetMinutes: 120, abbr: 'EET' },
  { id: 'Europe/Moscow', label: '(UTC+03:00) Moscow, Istanbul, Riyadh, Nairobi', offsetStr: 'UTC+03:00', offsetMinutes: 180, abbr: 'MSK' },
  { id: 'Asia/Tehran', label: '(UTC+03:30) Iran Standard Time — Tehran', offsetStr: 'UTC+03:30', offsetMinutes: 210, abbr: 'IRST' },
  { id: 'Asia/Dubai', label: '(UTC+04:00) Gulf Standard Time — Dubai, Baku', offsetStr: 'UTC+04:00', offsetMinutes: 240, abbr: 'GST' },
  { id: 'Asia/Kabul', label: '(UTC+04:30) Afghanistan Time — Kabul', offsetStr: 'UTC+04:30', offsetMinutes: 270, abbr: 'AFT' },
  { id: 'Asia/Karachi', label: '(UTC+05:00) Pakistan, Tashkent, Maldives', offsetStr: 'UTC+05:00', offsetMinutes: 300, abbr: 'PKT' },
  { id: 'Asia/Kolkata', label: '(UTC+05:30) India Standard Time (IST) — New Delhi, Mumbai, Colombo', offsetStr: 'UTC+05:30', offsetMinutes: 330, abbr: 'IST' },
  { id: 'Asia/Kathmandu', label: '(UTC+05:45) Nepal Time — Kathmandu', offsetStr: 'UTC+05:45', offsetMinutes: 345, abbr: 'NPT' },
  { id: 'Asia/Dhaka', label: '(UTC+06:00) Bangladesh, Almaty, Omsk', offsetStr: 'UTC+06:00', offsetMinutes: 360, abbr: 'BST' },
  { id: 'Asia/Yangon', label: '(UTC+06:30) Myanmar Time — Yangon, Cocos', offsetStr: 'UTC+06:30', offsetMinutes: 390, abbr: 'MMT' },
  { id: 'Asia/Bangkok', label: '(UTC+07:00) Indochina Time — Bangkok, Jakarta, Hanoi', offsetStr: 'UTC+07:00', offsetMinutes: 420, abbr: 'ICT' },
  { id: 'Asia/Shanghai', label: '(UTC+08:00) China, Singapore, Hong Kong, Perth', offsetStr: 'UTC+08:00', offsetMinutes: 480, abbr: 'CST' },
  { id: 'Australia/Eucla', label: '(UTC+08:45) Central Western Standard Time — Eucla', offsetStr: 'UTC+08:45', offsetMinutes: 525, abbr: 'ACWST' },
  { id: 'Asia/Tokyo', label: '(UTC+09:00) Japan & Korea Standard Time — Tokyo, Seoul', offsetStr: 'UTC+09:00', offsetMinutes: 540, abbr: 'JST' },
  { id: 'Australia/Darwin', label: '(UTC+09:30) Australian Central Standard Time (ACST) — Darwin, Adelaide', offsetStr: 'UTC+09:30', offsetMinutes: 570, abbr: 'ACST' },
  { id: 'Australia/Sydney', label: '(UTC+10:00) Australian Eastern Time (AEST) — Sydney, Melbourne, Brisbane', offsetStr: 'UTC+10:00', offsetMinutes: 600, abbr: 'AEST' },
  { id: 'Australia/Lord_Howe', label: '(UTC+10:30) Lord Howe Island', offsetStr: 'UTC+10:30', offsetMinutes: 630, abbr: 'LHST' },
  { id: 'Pacific/Guadalcanal', label: '(UTC+11:00) Solomon Islands, New Caledonia', offsetStr: 'UTC+11:00', offsetMinutes: 660, abbr: 'SBT' },
  { id: 'Pacific/Auckland', label: '(UTC+12:00) New Zealand Standard Time (NZST) — Auckland, Fiji', offsetStr: 'UTC+12:00', offsetMinutes: 720, abbr: 'NZST' },
  { id: 'Pacific/Chatham', label: '(UTC+12:45) Chatham Islands', offsetStr: 'UTC+12:45', offsetMinutes: 765, abbr: 'CHAST' },
  { id: 'Pacific/Tongatapu', label: '(UTC+13:00) Tonga, Phoenix Islands, Samoa', offsetStr: 'UTC+13:00', offsetMinutes: 780, abbr: 'TOT' },
  { id: 'Pacific/Kiritimati', label: '(UTC+14:00) Line Islands — Kiritimati', offsetStr: 'UTC+14:00', offsetMinutes: 840, abbr: 'LINT' },
];