/**
 * Fuzzy search helper for scoring and matching text queries.
 */
export function fuzzyMatch(
  query: string,
  target: string,
): { match: boolean; score: number; indices: number[] } {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  if (!q) return { match: true, score: 1, indices: [] };
  if (!t) return { match: false, score: 0, indices: [] };

  // Exact substring match gives high score
  const exactIdx = t.indexOf(q);
  if (exactIdx !== -1) {
    const indices = Array.from({ length: q.length }, (_, i) => exactIdx + i);
    return { match: true, score: 0.9 + (1 / (exactIdx + 1)) * 0.1, indices };
  }

  // Character-by-character sequential match
  let qIdx = 0;
  let tIdx = 0;
  const indices: number[] = [];
  let score = 0;
  let consecutive = 0;

  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      indices.push(tIdx);
      consecutive++;
      score += 1 + consecutive * 0.5;
      qIdx++;
    } else {
      consecutive = 0;
    }
    tIdx++;
  }

  const match = qIdx === q.length;
  const normalizedScore = match ? score / (q.length * 2) : 0;

  return { match, score: normalizedScore, indices };
}
