const fs = require("node:fs");
for (const [path, content] of [
  [
    "functions/.env.local",
    "AI_ENABLED=false\nAI_MODEL=nvidia/nemotron-3.5-super-vl:free\n",
  ],
  [
    "functions/.secret.local",
    "OPENROUTER_API_KEY=local-emulator-placeholder\n",
  ],
]) {
  if (!fs.existsSync(path)) fs.writeFileSync(path, content, { mode: 0o600 });
}
console.log(
  "Local-only emulator defaults prepared; existing files preserved. No real provider secret is configured.",
);
