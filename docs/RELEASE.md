# Beta release gates

Status: **not approved for public beta or store release**. No production deploy, store submission or paid resource was created.

## Completed in this branch
- [x] Preserve existing Expo app, Firebase account model and legacy record paths.
- [x] Five-tab design system, dark mode, functioning weight/food CRUD, trends, templates, goals and data export.
- [x] Remove client AI credential use; server request validation, quota and confirmation flow.
- [x] Per-user rules and emulator isolation tests; app/session/component and provider tests.
- [x] GitHub Actions checks, EAS profiles, candidate Android identifier, custom vector-source icon/splash assets.
- [x] Compile iOS, Android and web JavaScript bundles locally. This is not native QA.

## Must complete before public beta
- [ ] Resolve or explicitly accept outstanding dependency advisories after an SDK upgrade and regression testing. Do not force npm's proposed incompatible downgrades.
- [ ] Test the production data shapes against staging rules. Old client random-ID weight creation is intentionally incompatible. Back up data, retire old clients and approve rollout.
- [ ] Configure and test real Firebase/Auth, email templates, per-user isolation with two staging accounts, recovery, session restart and network errors.
- [ ] Configure and physically verify the native App Check bridge and token refresh. Test live AI with a configured eligible model, approved budget and non-sensitive fixtures.
- [ ] Test account deletion end-to-end, interruption/retry, tombstone TTL, backups and external retention. Publish a web deletion request URL and support process.
- [ ] Measure full-history listener costs/startup with large datasets; implement pagination/range summaries as necessary. No performance claims are established yet.
- [ ] Review health safety, goal validation, AI adversarial responses, accuracy and consent wording. Automated guards are not clinically validated.
- [ ] Complete onboarding usability tests, accessible chart navigation, keyboard/focus, large text, small screens, tablet, VoiceOver and TalkBack.
- [ ] iOS and Android physical devices: camera permissions/denial, photo orientation and compression, tab navigation, exports, date/DST/time-zone changes, offline/reconnect and auth persistence.
- [ ] Correct dark-mode contrast and Android adaptive-icon/splash checks on devices. Branding/label choice “Forma” requires name/trademark availability review.
- [ ] Approve legal drafts, operator/contact details, retention/region, international transfers and intended markets; publish privacy/terms URLs and link them in-app before account creation.
- [ ] Decide whether crash reporting is needed; if enabled, configure consent, redaction and retention. No crash vendor SDK is silently enabled.
- [ ] Verify EAS project ownership, app identifiers, signing, platform SDK/target requirements and signed preview builds. No signed binary exists yet.

## Store preparation
Apple requires in-app account deletion when account creation is offered. Supply current privacy disclosures, support/privacy URLs, accurate health claims, permission explanations, review access and screenshots of the actual app. Review [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) and [account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

Google Play requires a Health apps declaration, including testing tracks. Complete the current Data Safety form, health declaration, privacy policy, external deletion pathway, reviewer access and any account-specific testing requirements. Recheck current target API, developer verification, closed-test and account eligibility requirements in the console; do not assume one fixed test quota applies to every account. [Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291) and [developer policies](https://support.google.com/googleplay/android-developer/answer/18258653).

## Dependency snapshot
Baseline install: 49 advisories including 3 critical. Compatible fixes eliminated critical advisories; new test tooling changes the total advisory count, so counts are not directly comparable. See `VALIDATION.md` for final counts. Remaining high advisories include SDK/build/test transitive dependencies; server dependencies have separate moderate advisories. Do not call this production secure until triaged. `npm audit fix --force` proposes incompatible stack changes and was not used.

## Rollback
Keep previous client build and rules snapshots. Roll back a staged UI release if needed, but never restore a client with an exposed provider key. Rules rollback must preserve user isolation. No migration means no data rollback script is necessary. Recover failed deletions according to operator procedure; never restore deleted private data without the user's request and a reviewed legal basis.
