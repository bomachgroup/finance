import { describe, expect, it } from 'vitest';
import { getFinanceErrorKind } from './financeErrorState';

describe('finance error state classification', () => {
  it('classifies authorization failures as forbidden', () => {
    expect(getFinanceErrorKind(403)).toBe('forbidden');
  });

  it('keeps an expired session distinct from a forbidden page', () => {
    expect(getFinanceErrorKind(401)).toBe('unauthorized');
  });

  it('classifies a missing finance capability as unsupported', () => {
    expect(getFinanceErrorKind(404)).toBe('unsupported');
  });

  it('classifies server and transport failures as network errors', () => {
    expect(getFinanceErrorKind(503)).toBe('network');
    expect(getFinanceErrorKind(0)).toBe('network');
  });
});
