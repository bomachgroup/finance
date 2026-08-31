export function money(value: number): string {
  const n = Number(value || 0);

  if (n >= 1_000_000_000) {
    return `\u20a6${(n / 1_000_000_000).toFixed(1)}B`;
  }

  if (n >= 1_000_000) {
    return `\u20a6${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  }

  return `\u20a6${n.toLocaleString('en-NG')}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
