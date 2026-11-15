<p align="center">
  <img src="./docs/assets/banner.svg" alt="PassWeave" width="100%" />
</p>

<p align="center">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

PassWeave 用来辅助设计一套好记、不撞库的个人密码规律，让你在不打开密码管理器的情况下也能心算出每个网站不同的密码，同时避开 `固定密码_taobao` 这类一眼就能被猜透的写法。

## 基本思路

1. **统一网站取名**：固定按「网址主词」（`accounts.google.com` -> `google`）或「中文首字母」（`淘宝` -> `tb`）取名，避免半年后自己记混。
2. **做一步简单变形**：不直接拼写网站原词，而是提取简短特征，例如「前两个辅音 + 元音数量」（`github` -> `Gt2`，`taobao` -> `Tb4`）。
3. **穿插进固定词**：把变形后的网站码夹在固定词中间（`Cedar#Gt2!84`），或拆开穿插（`G#Cedar:t284`）。
4. **按风险分三层**：
   - **重要账号**（主邮箱、支付、密码库主密码）：单独换一个专用底词，并开启双重验证（2FA）。
   - **日常账号**（社交、开发、购物）：使用这套规律。
   - **临时小站**（小论坛、临时下载站）：统一用一个完全无关的固定密码，这样即便小网站明文脱库，也不会暴露你的规律样本。

## 适用场景与边界

- 在个人常用设备上，优先推荐使用 Bitwarden、1Password、KeePassXC 等密码管理器生成随机密码并配合通行密钥 / 2FA。
- PassWeave 适合用于构造密码库主密码、在不便安装插件的陌生电脑上盲打登录，或帮助习惯「一套密码走天下」的人建立基本的隔离习惯。
- 人脑能心算的规律不等同于密码学哈希：如果多个日常网站同时明文泄露，人工比对仍有机会反推出结构。因此务必把临时小站隔离开，并为重要账号设置独立底词。
- 构建产物内置 `Content-Security-Policy: connect-src 'none'`，纯本地运行无网络请求；导出的备忘卡不包含你输入的固定底词。

## 本地开发

需要 Node.js 20+ 与 `pnpm`。

```bash
pnpm install
pnpm dev
```

检查与构建：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 开源协议

[MIT](./LICENSE)
