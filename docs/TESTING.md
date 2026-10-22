# Validation guide

Use Node 22. Initial exploration used the host Node 25, then the final emulator matrix was repeated with a temporary Node 22 runtime matching CI/deployment. Java 21 is required for Firestore emulation. No real provider inference is made by automated tests.

- `npm run check`: strict TypeScript, zero-warning lint, calculation/schema, UI confirmation, authenticated record service and subscription/session tests.
- `npm ci --prefix functions && npm run build --prefix functions && npm test --prefix functions`: server provider serialization, invalid response, retry bounds, quota rollover and safety-policy tests with mocked provider responses.
- `npx firebase-tools@14.22.0 emulators:exec --only firestore --project demo-weight-tracker 'npm run test:rules'`: real rule evaluation including owner/cross-user access, unknown fields, quota isolation, legacy compatibility and deletion freeze.
- `npx expo export --platform all`: iOS/Android Hermes bundles and static web build. Does not establish native runtime behavior.

## Callable integration

Run `node scripts/configure-emulators.cjs` to prepare ignored local parameters (AI disabled, dummy secret, no provider inference). Then run `npx firebase-tools@14.22.0 emulators:exec --only auth,firestore,functions --project demo-weight-tracker 'npm run test:functions:integration'`. Functions use local port 5002. These tests verify unauthenticated rejection, disabled AI and confirmed account/subcollection/Auth deletion with stale-token blocking.

## Reproducible browser flow

Start local emulators and seed the synthetic account as described in DEPLOYMENT.md. Install Playwright's Chromium once with `npx playwright install chromium`. Then run `npm run test:e2e` (it starts the Expo web server if needed). Do not point the app at production. The test signs in, checks persisted session reload, adds/edits/deletes historical weight and food, checks dashboard/diary totals, verifies AI consent gating, switches Chinese/English, and captures mobile/tablet/dark screenshots. It intentionally touches only the `demo-weight-tracker` emulator and public fixture credentials. The synthetic fixtures and browser use America/Los_Angeles calendar dates; the historical test entry is two months before the run date.

Browser smoke tests do not prove camera, native storage persistence, permissions, export share sheets, native accessibility, live provider behavior or store readiness. Test those with signed development builds and physical iOS/Android devices. Error/disconnect, DST/midnight and long-history performance need a full manual matrix before beta.
