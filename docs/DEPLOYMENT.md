# Local development and deployment

Nothing in this branch deploys infrastructure, changes production credentials, distributes signed binaries or publishes to stores automatically.

## Safe local demo
Use Node 22 and Java 21. Copy `.env.example` to ignored `.env` and set:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=demo-not-a-secret
EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-weight-tracker
EXPO_PUBLIC_FIREBASE_APP_ID=demo-app
EXPO_PUBLIC_USE_EMULATORS=true
EXPO_PUBLIC_EMULATOR_HOST=127.0.0.1
```

Start emulators, seed synthetic data, and open the app:

```sh
npm ci
npm ci --prefix functions
npm run build --prefix functions
npx firebase-tools@14.22.0 emulators:start --only auth,firestore --project demo-weight-tracker
# separate terminals:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seed-demo.cjs
npm run web
```

Synthetic account is `preview@example.test` / `Preview-only-2026`. These are public demo-only fixtures, never production credentials. The script hardcodes the demo project and localhost emulators. Use Android emulator host `10.0.2.2`; a physical device needs your computer's LAN IP and reachable local ports. Do not expose the emulator publicly. Remove `.env` or set emulator flag false before using a real Firebase project; the emulator flag only works in development bundles.

## Existing Firebase project
1. Back up production data and inspect deployed rules manually. Select a staging project first; never paste production credentials into chat.
2. Enable email/password Auth, authorized web domains and email action templates. Put Firebase WEB config in local/EAS public environment variables. Firebase web identifiers are not admin secrets.
3. New rules retain reads/edits of old records but reject old random-ID weight creation. Stage with this client; retire incompatible clients before production rules rollout. Confirm all legacy record shapes and data exports. No automatic migration is provided.
4. Only after owner approval, run `npx firebase-tools@14.22.0 deploy --only firestore:rules,firestore:indexes --project YOUR_STAGING_PROJECT`. Validate with two real staging accounts before any production rollout.

## Server functions (cost/credentials approval required)
Functions use Node 22 and `us-central1`. Firebase may require Blaze billing; do not enable it without approval. Choose geography before storing new data.

```sh
npm ci --prefix functions
npm run build --prefix functions
npx firebase-tools@14.22.0 functions:secrets:set OPENROUTER_API_KEY --project YOUR_STAGING_PROJECT
```

Set non-secret params in ignored `functions/.env.YOUR_STAGING_PROJECT`:

```dotenv
AI_ENABLED=false
AI_MODEL=nvidia/nemotron-3.5-super-vl:free
```

After approval, deploy with `npx firebase-tools@14.22.0 deploy --only functions --project YOUR_STAGING_PROJECT`. Confirm compatible privacy-filtered route and limits with non-sensitive fixtures, configure provider key credit limits and billing alerts, then explicitly set `AI_ENABLED=true` and redeploy. Deploy deletion even if AI stays disabled. No provider key is needed to use tracking; a secret binding is needed to deploy the AI function. `functions/lib` includes shared schema output and is generated before deployment.

Enable Firestore TTL on `expiresAt` for `_accountBlocks` (temporary UID tombstones, two-hour expiry) and `_aiQuota`. Deletion tombstones intentionally block stale tokens until expiry; TTL cleanup may be delayed. Inspect failure logs without logging request bodies and exercise partial-deletion retry. Set infrastructure log retention and backup retention to match the reviewed privacy policy.

Register web App Check and set its public reCAPTCHA site key before production AI tests. Native attestation code is implemented but requires matching native Firebase configuration files, `EXPO_PUBLIC_NATIVE_APP_CHECK_ENABLED=true`, provider registration, and a rebuilt development client; see [AI notes](AI.md). Verify email and sign in again to refresh claims. Never loosen production App Check to make testing pass.

## EAS builds
`eas.json` defines development, internal preview and production profiles; `expo-dev-client` supports development builds. Existing iOS identifier is retained; Android candidate identifier is `com.weir0210.weighttracker`. Verify ownership/collision and account choice before registration. No EAS project ID or signing credentials are invented.

With owner approval and account setup:

```sh
npx eas-cli login
npx eas-cli init
npx eas-cli build:configure
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios
```

These actions can create signing credentials and consume build quotas; they have not been executed. Use separate Firebase projects in development/preview/production EAS environments. Do not set provider keys in EAS public variables. Build preview APK for Android internal testing; iOS ad hoc requires registered devices and developer signing. Production submission is a separate approval.

References: [EAS setup](https://docs.expo.dev/build/setup/), [internal distribution](https://docs.expo.dev/build/internal-distribution/), [app signing](https://docs.expo.dev/app-signing/app-credentials/).
