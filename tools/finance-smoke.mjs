import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [productionEnv, vercelConfig, routerSource, navigationSource, authSource, apiClientSource] = await Promise.all([
  read('.env.production'),
  read('vercel.json'),
  read('src/router.tsx'),
  read('src/navigation.ts'),
  read('src/context/AuthContext.tsx'),
  read('src/services/api/apiClient.ts'),
]);

assert.match(productionEnv, /^VITE_API_BASE_URL=https?:\/\/\S+$/m, 'production API base URL is missing');

const vercel = JSON.parse(vercelConfig);
assert.ok(
  vercel.rewrites?.some((rewrite) => rewrite.source === '/(.*)' && rewrite.destination === '/index.html'),
  'SPA rewrite is missing from vercel.json',
);

const screens = [
  'dashboard', 'invoices', 'payments', 'receivables', 'wallets', 'cashbook', 'serviceorders',
  'estatefinance', 'expenses', 'vendors', 'pettycash', 'approvals', 'cashflow', 'payroll',
  'commissions', 'tax', 'journals', 'coa', 'assets', 'reports', 'audit', 'settings',
];
for (const screen of screens) {
  assert.match(routerSource, new RegExp(`\\b${screen}:`), `router mapping is missing ${screen}`);
  assert.match(navigationSource, new RegExp(`\\b${screen}:`), `navigation metadata is missing ${screen}`);
}

assert.match(authSource, /if \(!hasBackendPermissions\) \{\s*return false;/, 'permission checks must fail closed');
assert.doesNotMatch(authSource, /currentRole\.toLowerCase\(\)\.includes\('(cfo|admin)'\)/, 'role labels must not grant superuser access');
assert.doesNotMatch(authSource, /effectiveUser = \(effectiveUser \? \{ \.\.\.effectiveUser, \.\.\.userObj }/, 'token claims must not be merged into the backend profile');

const envIndex = apiClientSource.indexOf('const envUrl');
const storedIndex = apiClientSource.indexOf('const stored');
assert.ok(envIndex >= 0 && storedIndex > envIndex, 'deployment API URL must take precedence over stored browser values');

console.log(`Finance smoke checks passed: ${screens.length} screens, auth fail-closed guard, deployment config, and API URL precedence.`);
