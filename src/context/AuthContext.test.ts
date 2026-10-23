import { describe, expect, it } from 'vitest';
import { hasFinancePermission } from './AuthContext';

describe('Finance page authorization', () => {
  it('does not grant page access from a default CFO role without backend grants', () => {
    expect(hasFinancePermission('dashboard', 'view', {})).toBe(false);
  });

  it('allows a page only when its backend permission is present', () => {
    expect(
      hasFinancePermission('dashboard', 'view', {
        finance_dashboard: ['view'],
      }),
    ).toBe(true);
  });
});
