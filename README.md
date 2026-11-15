<p align="center">
  <img src="./docs/assets/banner.svg" alt="PassWeave" width="100%" />
</p>

<p align="center">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

PassWeave helps you design a consistent, memorable password rule so every site gets a distinct password without relying on trivial suffixes like `MyPass_github`.

## How It Works

1. **Extract a canonical site name**: Either the main domain word (`accounts.google.com` -> `google`) or a two-letter phonetic code (`Taobao` -> `tb`).
2. **Compress it non-linearly**: Turn the site name into a short code that hides the literal domain word—for example, taking the first two consonants plus vowel count (`github` -> `Gt2`, `taobao` -> `Tb4`).
3. **Weave it into a fixed word**: Place the site code inside or across your base word (`Cedar#Gt2!84` or `G#Cedar:t284`).
4. **Separate account tiers**:
   - **Critical** (email, banking, vault master): use a separate base word + 2FA.
   - **Everyday** (social, dev, shopping): use your primary pattern.
   - **Throwaway** (small forums, one-off signups): use a single unrelated password so database leaks never expose samples of your pattern.

## Scope & Security Notes

- Whenever a device supports a password manager (Bitwarden, 1Password, KeePassXC) with randomly generated secrets and Passkeys/2FA, prefer a password manager.
- PassWeave is meant for vault master passwords, shared or restricted machines where extensions cannot be installed, and helping people move away from password reuse.
- A human-computable rule is not a cryptographic hash function. If multiple everyday passwords leak in plaintext, a motivated analyst could eventually infer the rule—which is why throwaway sites must stay isolated and critical accounts must use a separate base word with 2FA.
- Production builds enforce `Content-Security-Policy: connect-src 'none'`. Inputs stay in memory only, and exported reference cards omit your base words.

## Development

Requires Node.js 20+ and `pnpm`.

```bash
pnpm install
pnpm dev
```

Run checks and build static assets:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## License

[MIT](./LICENSE)
