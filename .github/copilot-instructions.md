# AI Coding Agent Instructions

## Quick Facts
- React 19 + Vite 7 + SWC; strict TypeScript with `moduleResolution: 'bundler'`, `allowImportingTsExtensions`, and `verbatimModuleSyntax` (type-only imports are mandatory and relative imports often include `.ts/.tsx`).
- Redux Toolkit centralizes state in `src/store.ts`; typed hooks live in `src/hooks.ts`.
- Styling is pure CSS: atmospheric layout in `src/index.css` and component rules in `src/App.css` (glassmorphism cards, badge styles, responsive grid).

## Build & Tooling
- `npm run dev` launches Vite with HMR.
- `npm run build` executes `tsc -b` (type check only) before `vite build`; keep this ordering when creating custom scripts.
- `npm run lint` runs the ESLint flat config (`eslint.config.js`), so add new rules there.
- No unit tests yet; rely on TypeScript + lint.

## Architecture Overview
- `src/main.tsx` mounts `<App />` under `<Provider store={store}>`—all features must be Redux-aware.
- `src/App.tsx` is a simple gate: unauthenticated users see `LoginForm`, authenticated users see `Dashboard`.
- Auth flow (`src/features/auth/authSlice.ts`):
  - Async thunks `loginWithEmail` / `logoutFromSession` call `fakeAuthApi` (see `src/services/firebaseAuth.ts`) to mimic future Firebase Auth.
  - State tracks `user`, `status`, and `error`; reducers expose `setUser` for manual overrides.
- Payments domain (`src/features/payments/paymentsSlice.ts`):
  - Async thunk `loadPayments` fetches from `fakePaymentsApi` (`src/services/firebasePayments.ts`).
  - Local reducers handle `togglePaymentStatus`, `setStatusFilter`, and `setSearchFilter`; logout resets slice via `extraReducers`.
- Shared types live in `src/types/` and must be referenced by UI + services to keep structures consistent.

## UI Patterns
- `LoginForm` dispatches `loginWithEmail` and shows submission state/errors inline; note that inputs are not cleared on failure to support validation UX.
- `Dashboard` loads payments lazily once the user is set, memoizes filter results, and renders loading/error placeholders plus metrics cards.
- `PaymentFilters` + `PaymentsList` are stateless; always pass Redux selectors/dispatchers from parent to keep components reusable.

## Firebase Readiness
- `src/services/firebaseAuth.ts` and `src/services/firebasePayments.ts` simulate latency; replace their methods with real Firebase SDK calls later without changing slice APIs.
- When introducing persistence, keep thunks returning plain POJOs so Redux Toolkit serialization checks stay quiet.

## Conventions & Gotchas
- Because of `verbatimModuleSyntax`, always import types with `import type { … }` and avoid mixing value/type symbols in the same import.
- Prefer absolute clarity in reducers—immutability is handled by Immer, but side effects must stay inside thunks/services.
- Keep UI copy in Spanish (current components are localized); match tone when adding new screens.
- No routing yet; if a new view is needed, add it behind Redux state switches until routing is introduced.

## Key Files to Reference
- `src/store.ts` – store configuration, extend reducers here.
- `src/features/auth/*` – login/logout logic and async behavior.
- `src/features/payments/*` – filtering, status toggles, async loading.
- `src/services/*` – mocked backend boundaries; the contract future Firebase modules must honor.
- `src/App.css` / `src/index.css` – global look & feel (Space Grotesk, gradients, card layout) to follow.

Questions or missing details? Let me know which section needs clarification and I’ll iterate.
