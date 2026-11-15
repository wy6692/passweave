# Contributing to PassWeave

Contributions that improve usability, accessibility, localization accuracy, or adversarial audit heuristics are welcome.

## Design Constraints

Before submitting a pull request, please keep these repository invariants in mind:

1. **Zero Network I/O**: Do not introduce external runtime requests (remote fonts, CDN assets, analytics scripts, or API calls). Production builds must continue passing the `connect-src 'none'` CSP verification step in CI.
2. **Minimal Runtime Dependencies**: Keep `dependencies` in `package.json` lean so security reviewers can audit the dependency tree quickly.
3. **Human Computability**: Any new site-token transform added to `src/core/transforms.ts` must remain mentally computable by a human in under 4 seconds without paper or a calculator, and must define deterministic behavior for short (`x.com`) and numeric (`163.com`) domains.
4. **No Persistent Secret Storage**: Never persist `PatternSpec` anchor strings to browser storage or URL hashes.

## Local Workflow

```bash
pnpm install
pnpm dev
```

Before opening a pull request, ensure all checks pass locally:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Commit Style

Use concise, imperative commit messages following Conventional Commits where practical (for example, `feat(core): handle multi-part .co.uk suffixes`, `fix(audit): tighten prefix ratio threshold`).
