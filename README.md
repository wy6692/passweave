<p align="center">
  <img src="./docs/assets/banner.svg" alt="PassWeave" width="100%" />
</p>

<p align="center">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

PassWeave is a zero-network, static browser workbench for designing human-computable password patterns that resist credential stuffing and naive suffix inference.

Most password reuse happens where password managers are inconvenient or unavailable: unmanaged workstations, air-gapped terminals, vault master credentials, or everyday users who default to `MyPass123` or `MyPass_sitename`. PassWeave provides a structured visual environment to compose a deterministic 3-second mental grammar, audit it against differential leak heuristics, practice blind recall, and export a sanitized reference sheet containing zero secret material.

## Core Mechanics

### 1. Three-Tier Blast Radius Isolation

Plaintext and unsalted hash leaks disproportionately originate from small forums and throwaway signups. PassWeave enforces strict separation across three risk tiers so low-trust breaches never expose samples of your primary pattern:

| Tier | Scope | Credential Strategy |
| :--- | :--- | :--- |
| **Tier 1 — Core Vault** | Primary email, banking, payments, password vault master | Dedicated anchor phrase + mandatory WebAuthn / TOTP 2FA |
| **Tier 2 — Standard** | Everyday developer, social, shopping, and media accounts | Primary woven mental pattern |
| **Tier 3 — Untrusted** | Throwaway signups, small forums, one-off downloads | Static, unrelated decoy password (zero shared substrings) |

### 2. Canonical Site Naming

Mental password formulas commonly fail months later due to naming ambiguity (forgetting whether a site was encoded as `mail.google.com`, `google`, or `gmail`). PassWeave standardizes on one of two deterministic conventions:

- **Registrable Domain Core**: Always extract the label immediately preceding the public suffix (`accounts.google.com` -> `google`, `mail.sina.com.cn` -> `sina`).
- **Two-Syllable Phonetic Initials**: Read the two-character Chinese service name and take its initials (`淘宝` -> `tb`, `微信` -> `wx`).

### 3. Non-Linear Token Transforms & Weave Topologies

Appending literal site names (`Cedar_github`) is trivially reversed by automated suffix strippers. PassWeave transforms the site identifier into a compact token and weaves it into a split personal anchor:

| Transform | Rule | `github` | `taobao` | `163` |
| :--- | :--- | :--- | :--- | :--- |
| **Consonant Pair + Vowel Count** | First 2 consonants (TitleCase, pad `x`) + vowel count; numeric uses `N` + 2 digits | `Gt2` | `Tb4` | `N16` |
| **First + Length + Last** | 1st char uppercase + character length + last char lowercase | `G6b` | `T6o` | `133` |
| **Alphabet +1 Shift** | First 2 chars shifted forward by 1 (`z` -> `a`, `9` -> `0`) | `Hj` | `Ub` | `27` |
| **Outer Edge Pair** | 1st char uppercase + last char lowercase | `Gb` | `To` | `13` |

Assembled with **Split-Anchor Inlay** (`Cedar#Gt2!84`) or **Mirrored Token Split** (`G#Cedar:t284`), the variable site token neither exposes dictionary domain substrings nor leaves a uniform static prefix in alphabetically sorted breach dumps.

## Workbench Architecture

1. **Breach Trace (`01`)**: Side-by-side trace comparing credential stuffing against single shared passwords, naive suffix concatenation, and tiered non-linear weaving.
2. **Pattern Workbench (`02`)**: Interactive rule composer with decoy sandbox words pre-filled, step-by-step mental recall trace, and a cross-platform output matrix supporting custom URLs.
3. **Adversarial Audit (`03`)**: Two-sample plaintext differential inspector evaluating lexical leakage, prefix clustering, locus dispersion, tier isolation, enterprise character-class compliance, and recall latency.
4. **Recall Drill & Blueprint (`04`)**: Timed blind-typing verification and offline `Canvas` PNG / Markdown blueprint export with personal anchors stripped.

## Threat Model & Non-Goals

- **Password managers remain the primary recommendation.** Whenever a device supports Bitwarden, 1Password, or KeePassXC backed by randomly generated 20+ character secrets and Passkeys/2FA, use a vault.
- **Intended scope.** PassWeave targets scenarios where human recall is required: memorizing strong root passwords, logging in on restricted or shared hardware without vault access, or replacing widespread password reuse for users unwilling to adopt a vault.
- **Cryptanalytic boundary.** A human-computable mental rule is not a cryptographic PRF (unlike HMAC/PBKDF2 tools such as LessPass, which require a calculator on every login). If an adversary obtains multiple plaintext Tier-2 passwords belonging to the same user and performs manual human-pattern analysis, the underlying structure may eventually be inferred. For this reason, Tier-3 untrusted sites must use an unrelated static decoy, and Tier-1 critical accounts must use a separate anchor paired with 2FA.

## Privacy & Verifiable Offline Runtime

- **Engine-enforced zero network I/O**: Production builds embed a strict `Content-Security-Policy` (`default-src 'self'; connect-src 'none'; form-action 'none'`), blocking `fetch`, `XMLHttpRequest`, WebSockets, and beacons at the browser engine layer.
- **Volatile state only**: Anchor inputs reside solely in React component memory and are discarded when the tab closes. `localStorage` stores only `passweave:theme` and `passweave:locale`.
- **Minimal dependency surface**: Only three runtime packages (`react`, `react-dom`, `lucide-react`). Zero analytics, telemetry, or external font requests.

## Development

Requires Node.js 20+ and `pnpm`.

```bash
# Install dependencies
pnpm install

# Start local dev server
pnpm dev

# Run unit tests (Vitest)
pnpm test

# Run ESLint & strict TypeScript checks
pnpm lint
pnpm typecheck

# Build static zero-network bundle into dist/
pnpm build
```

## Project Layout

```text
src/
├── core/                  # Pure, UI-agnostic TypeScript engine
│   ├── types.ts           # Domain types and audit contracts
│   ├── sites.ts           # Registrable domain parser & service aliases
│   ├── transforms.ts      # Deterministic site-token extractors
│   ├── weaver.ts          # Multi-tier password assembly & mental trace
│   ├── auditor.ts         # Differential leak & compliance heuristics
│   ├── presets.ts         # Curated blueprints & decoy vocabularies
│   ├── blueprintCard.ts   # Zero-secret Markdown & 2x Canvas renderer
│   └── __tests__/         # Unit & privacy-invariant tests
├── components/            # 4-stage interactive workbench UI
├── i18n/                  # English & Simplified Chinese catalogs
└── hooks/                 # Theme management
```

## License

Released under the [MIT License](./LICENSE).
