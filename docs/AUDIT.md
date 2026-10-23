# Baseline audit — 21 October 2026

Audited commit `0e0a5ff`; all tracked source, configuration and documentation inspected. No production Firebase project was accessed. Source inspection establishes implementation, not successful device operation.

## Verified baseline
- Expo 54 / React Native 0.81 / React 19 app with three tabs. Baseline TypeScript passes; lint has five warnings.
- Email sign-in and registration implemented; sign-in errors swallowed, reset absent, native persistence not configured explicitly, direct tab navigation unguarded.
- Per-user Firestore paths already used: users/{uid}, weights, foods. No rules or emulator configuration committed; deployed rules unknown.
- Weight add/delete implemented; edit uses iOS-only Alert.prompt. Duplicate check happens only in client memory. Goal is saved on every keystroke. Profile goalWeight and dashboard goal disagree.
- Chart supports week/month, but returns unrelated old entries for empty ranges. Weekly average uses seven records rather than seven calendar days. Progress formula has no starting baseline.
- Diary sums current-day records. Home reads daily.eaten, which diary never updates. No midnight refresh. Reads download entire history. Only five foods in an unsourced lookup. Frequent foods derive only from today.
- TDEE uses Mifflin–St Jeor but always subtracts 500; home uses hardcoded age/height. No maintenance/gain mode, macros, measurements, export, templates or calendar.
- AI text calls OpenRouter directly using EXPO_PUBLIC_OPENROUTER_API_KEY. This exposes any configured provider secret in the bundle. Arbitrary regex selects calories from free text. No photo support, schema, quota, timeout or conversational assistant.
- Partial bilingual strings; hardcoded light colors and fixed chart width. Generic scaffold icons remain.
- No tests, CI, EAS profiles, privacy/terms/deletion flow, or crash reporting. README overstates language persistence and native sessions.
- npm ci reports 49 advisories (3 critical). Audit remediation must preserve SDK compatibility; do not force-upgrade React Native blindly.

## Priority and delivery order
1. P0: remove client provider secret; centralize session/data subscriptions, validate writes, isolate Firestore records, show failures. Preserve collection paths and legacy fields.
2. P1: cohesive adaptive design system; five tabs; dashboard, diary, progress, account; cross-platform editors and accurate calendar metrics.
3. P1: macros, categories, templates, goal settings, export and deletion; adult-only estimated calorie calculator with maintenance support.
4. P1: authenticated server AI, bounded quotas, structured outputs, meal review, image compression and opt-in transfer.
5. P1: unit/component/service/rules tests, CI, dependency fixes and platform bundle checks.
6. P2: beta setup, privacy drafts, release gates, real screenshots and documentation. Device and production verification remain explicit gates.

## Data compatibility
Keep users/{uid}/weights/{legacyId} and foods/{legacyId}. Never migrate or delete existing records automatically. New weights use a date document; a transaction claims a private weightDays date index so concurrent new clients cannot duplicate a date. Existing duplicates remain visible in history and exports; analytics uses one deterministic record per date. Rules cannot prevent old released clients writing random IDs until their write contract is retired. No production deployment is performed by this change.
