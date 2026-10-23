# Validation record — 21 October 2026 (America/Los_Angeles)

Local synthetic-data verification; no production project, live paid inference, signing account or store publication was used.

| Check | Result |
| --- | --- |
| TypeScript app | Pass |
| Lint with max-warnings=0 | Pass |
| App unit/component/session/attestation tests | 49 passed |
| Provider/quotas/policy server tests | 10 passed |
| Real Firestore emulator rule tests | 17 passed |
| Callable Auth/disabled-AI/deletion integration | 3 passed |
| Browser mobile CRUD/session/language/theme/consent flow | 1 passed |
| Expo SDK dependency compatibility | Pass |
| Server TypeScript compilation | Pass |
| iOS Hermes / Android Hermes / static web export | All pass |
| Physical iOS/Android runtime | Not run |
| Native App Check real attestation and token refresh | Not run; credentials/signed device build required |
| Live OpenRouter estimates/vision | Not run; approved provider configuration required |
| Signed EAS binaries | Not created |
| Remote GitHub Actions | Inspect PR checks; local equivalents passed |

Total: 80 automated test cases/flows across five validation layers. These are not 80 device tests or a whole-app coverage claim. Initial tests used host Node 25; final app/server tests, security/callable/browser emulator matrix and platform exports were repeated using Node 22. Java 21 was downloaded to temporary storage for local emulation. CI specifies Node 22 and Java 21.

A prior focused coverage run covered shared domain schemas/calculations at 100% of lines; service coverage was lower. That measurement excludes most UI and backend code and is not a production-readiness assertion. No startup/performance improvements are claimed without baseline measurements.

## Dependency audit
Final root npm audit: **56 findings (48 high, 8 moderate, 0 critical)**. Functions: **9 moderate, 0 high/critical**. Counts include inherited and newly introduced dev-tool transitive dependencies and are not directly comparable to the 49-finding original install. Compatible fixes and explicit transport/CSS overrides were applied; no forced SDK downgrade was accepted. Remaining findings require dependency/SDK triage before public beta. Re-run `npm audit` for current advisory details rather than relying on this snapshot indefinitely.

## Visual review
`docs/screenshots` contains actual mobile web light/dark and wider dark captures of synthetic local data. Dashboard, diary and progress screenshots were visually inspected. The development indicator may appear; these are portfolio engineering previews, not store-ready native screenshots. Screenshot waits verify data has loaded before capture. The app uses original editable vector branding in `assets/branding/forma.svg`.

## Known limits
Full-history subscriptions are not performance-tested at scale. Starter food portions are approximate, not a verified catalog. Native modules are type-checked/bundled and tested with mocks; only device builds can establish native integration correctness. AI safety controls are not comprehensive or clinically validated. Legal drafts and deployment gates are documented in RELEASE.md. Production data and credentials remain unchanged.
