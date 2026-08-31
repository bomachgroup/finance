const replacements: Array<[string, string]> = [
  ['â‚¦', '\u20a6'],
  ['â†’', '\u2192'],
  ['â€”', '\u2014'],
  ['â€“', '\u2013'],
  ['Â·', '\u00b7'],
  ['Ã—', '\u00d7'],
  ['Â', ''],
];

export function normalizeText(value: string): string {
  return replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
}

export function normalizeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return normalizeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDeep(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeDeep(item)]),
    ) as T;
  }

  return value;
}
