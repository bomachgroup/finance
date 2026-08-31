# Finance Backend Verification - Remaining Issues

Last verified: 2026-08-28
Environment: `https://bomachauthtest.bgbot.app`

The requests below were made directly against the test API while authenticated as the full-access test administrator. The original `FOR UPDATE cannot be applied to the nullable side of an outer join` error no longer occurs.

## 1. Expense approval still fails

Endpoint:

- `POST /api/v1/finance/expenses/6/approve`

Request body: none, as documented by OpenAPI.

Observed response:

```json
{"detail":"Invalid request"}
```

HTTP status: `400`

The source expense is pending and has a valid `finance_account_id`. A follow-up `GET /api/v1/finance/expenses/6` confirmed that its status remains `pending`.

## 2. Expense rejection still fails

Endpoint:

- `POST /api/v1/finance/expenses/7/reject`

The request used the current OpenAPI schema:

```json
{"rejection_reason":"QA verification of the repaired rejection workflow"}
```

Observed response:

```json
{"detail":"Invalid request"}
```

HTTP status: `400`

A follow-up `GET /api/v1/finance/expenses/7` confirmed that its status remains `pending`.

## 3. Wallet type enum is missing from OpenAPI

Endpoint:

- `POST /api/v1/finance/wallets`

The OpenAPI schema defines `wallet_type` as a generic string but does not publish the allowed values. The HTML prototype contains four wallet labels, which map to these backend values:

- General Client Wallet: `client` (verified `201` without a service order)
- Project Wallet: `project`
- Property Wallet: `property`
- Restricted Project Wallet: `restricted_project`

The last three values are accepted by the backend validator but require a linked service order:

```json
{"detail":"{'service_order': ['This wallet type requires a linked service order.']}"}
```

Please publish these values as an OpenAPI enum and document the service-order requirement for project, property, and restricted-project wallets. The frontend has been aligned to this mapping.

## 4. Fixed asset creation is blocked by approval state

Endpoint:

- `POST /api/v1/finance/fixed-assets`

The earlier SQL failure is resolved. The endpoint now returns this business validation message for a pending capital-expenditure expense:

```json
{"detail":"['Fixed assets require a paid capital-expenditure Expense.']"}
```

This is expected validation, but a successful fixed-asset creation cannot be verified until the expense approval workflow works.

## Verified resolved workflows

- `POST /api/v1/finance/accounts` returned `201`; the new account appears in `GET /api/v1/finance/accounts`.
- `POST /api/v1/finance/vendors` returned `201`.
- `POST /api/v1/finance/journals` returned `201`.

## Suggested backend follow-up

1. Return a specific validation error from the approval and rejection handlers instead of the generic `Invalid request` response, and add integration tests that assert the expense state changes.
2. Publish wallet-type choices in the OpenAPI schema and document the required service-order relationship for project wallets.
3. After approval works, run the fixed-asset flow end to end: capital expense, approval, payment, then fixed-asset creation.

## Backend readiness requirements

The frontend now fails closed when role/permission data is unavailable and no longer treats a decoded token payload as an authenticated profile. The backend must still enforce the same rules on every protected endpoint; frontend navigation is not an authorization boundary.

- Ensure `/auth/me` returns the authenticated profile or a clear `401`, never a successful empty response.
- Enforce role and object-level permissions server-side for finance pages and mutations.
- Add integration coverage for unauthorized users, approval by the expense creator, approval by another authorized user, rejection, and state transitions.
