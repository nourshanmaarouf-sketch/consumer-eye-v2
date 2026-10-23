// الألوان والظلال المأخوذة من التصميم الأصلي (Google Stitch)
export const C = {
  bg: '#FDFBF7',
  text: '#181c1b',
  dark: '#0D231D',
  dark2: '#1A3A30',
  darker: '#07140F',
  accent: '#C5A059',
  gold: '#C5A059',
  goldSoft: '#F5EEDD',
  green: '#2d6a4f',
  greenSoft: '#F5EEDD',
  mint: '#a8cfbc',
  mint2: '#c4ecd7',
  border: '#ECE6D8',
  white: '#ffffff',
  red: '#ba1a1a',
  g50: '#f9fafb',
  g100: '#f3f4f6',
  g200: '#e5e7eb',
  g300: '#d1d5db',
  g400: '#9ca3af',
  g500: '#6b7280',
  g600: '#4b5563',
  g700: '#374151',
  g800: '#1f2937',
  g900: '#111827',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald200: '#a7f3d0',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065f46',
  red50: '#fef2f2',
  red100: '#fee2e2',
  red200: '#fecaca',
  red600: '#dc2626',
  red700: '#b91c1c',
  amber50: '#fffbeb',
  amber200: '#fde68a',
  amber600: '#d97706',
  amber700: '#b45309',
  amber800: '#92400e',
  infoBg: '#f0fdf4',
  infoBorder: '#bbf7d0',
  infoText: '#166534',
};

export const shadow = {
  elevation: 1,
  shadowColor: '#000000',
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
};

// الخط الرسمي الموحّد: Tajawal (واضح ورسمي ويدعم العربية بالكامل)
export const F = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
};

// يحوّل fontWeight إلى اسم الخط المناسب (أندرويد يحتاج اسم خط لكل وزن)
export function fontFor(weight) {
  const w = String(weight || '400');
  if (w === '700' || w === 'bold' || w === '800' || w === '900') return F.bold;
  if (w === '500' || w === '600') return F.medium;
  return F.regular;
}
