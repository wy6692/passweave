# Security Policy

## Architectural Guarantees

PassWeave is architected as a strictly client-side, zero-network static application:

1. **Outbound Network Lockdown**: Production bundles set `Content-Security-Policy` with `connect-src 'none'` and `form-action 'none'`. No telemetry, analytics, remote fonts, or API endpoints are contacted at any time.
2. **Local-Only Workspace Persistence**: Pattern configurations and custom site lists are stored exclusively in the local browser (`localStorage` under `passweave:workspace:v1`) for session continuity and can be wiped at any time via the in-app Reset action. No workspace state is ever transmitted externally or encoded into URL query parameters.
3. **Sanitized Exports**: Blueprint exports (`.png` and `.md`) strip user-supplied anchor strings and substitute structural placeholders alongside a synthetic `example.com` walkthrough. This invariant is enforced by automated unit tests in `src/core/__tests__/weaver.test.ts`.

## Reporting a Vulnerability

If you discover a security issue—such as a CSP bypass, accidental persistent storage of anchor inputs, DOM XSS in custom site parsing, or a flaw in the adversarial audit heuristics—please report it privately via GitHub Security Advisories (`Security` -> `Report a vulnerability`) rather than opening a public issue.

Please include:
- A minimal reproduction sequence or input payload;
- Affected commit SHA or release tag;
- Expected vs. actual behavior.

We aim to acknowledge reports within 72 hours and publish a fix and advisory once verified.
