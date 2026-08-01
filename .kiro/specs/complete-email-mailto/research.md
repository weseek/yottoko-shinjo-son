# リサーチ & 設計判断ノート

---

## Summary

- **Feature**: `complete-email-mailto`
- **Discovery Scope**: Simple Addition（既存 Server Component への UI 拡張）
- **Key Findings**:
  - `mailto:` リンクは純粋な HTML アンカータグのため、Client Component 不要・新規依存ライブラリ不要
  - 完了画面の Server Component がすでに必要なデータ（title, id, startDate, endDate, entryName）をすべて保持しており、追加の DB クエリは不要
  - URI 構築は標準組み込みの `encodeURIComponent` のみで完結する

---

## Research Log

### mailto: URI の仕様と挙動

- **Context**: サーバー側メール送信なしでユーザーのメールアプリを起動する方法の調査
- **Sources Consulted**: RFC 6068（mailto URI スキーム）、MDN Web Docs
- **Findings**:
  - `mailto:?subject=...&body=...` 形式で件名・本文を事前入力できる
  - `to` フィールドを空にすることで、宛先はユーザーが自分で入力する形にできる
  - 件名・本文はすべて `encodeURIComponent` で URL エンコードが必要
  - スマートフォン（iOS/Android）では標準メールアプリが開く。PC では設定されたデフォルトメールクライアントが起動する
  - JavaScript 不使用・サーバー通信なし・完全クライアント側処理
- **Implications**: Client Component への変換は不要。`<a href="mailto:...">` を Server Component 内に直接記述できる

### 既存コードの統合ポイント分析

- **Context**: 変更対象ファイルと影響範囲の特定
- **Sources Consulted**: `src/app/entries/[cancelToken]/complete/page.tsx`
- **Findings**:
  - 完了画面は `async` Server Component。cancelToken で Entry を取得し、`activity`（title, id, startDate, endDate）と `entryName` を取得済み
  - `activity` が `null` の場合（未公開・存在しない）はボタン非表示とすることで要件 1.2/1.3 を満たせる
  - 既存スタイルパターン：Tailwind + `[var(--color-xxx)]` 任意値、`min-h-12`（48px タッチターゲット）
  - 変更ファイルは `page.tsx` 1ファイルのみ
- **Implications**: 新規ファイル・新規コンポーネント・DB スキーマ変更はすべて不要

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Server Component インライン | `buildMailtoHref` 純粋関数を `page.tsx` に追加し、`<a>` タグを直接描画 | ファイル追加なし・シンプル・JS 不要 | 関数が長くなれば可読性低下（今回は短い） | **採用** |
| Client Component 分離 | `MailtoButton` を `"use client"` コンポーネントとして切り出す | 再利用性あり | 不要な複雑性・hydration コスト | 不採用：ユーザー操作（state/effect）が不要なため |
| Server Action 経由 | ボタン押下で Server Action を呼び出し mailto URI を生成 | — | サーバーラウンドトリップが発生・過剰設計 | 不採用 |

---

## Design Decisions

### Decision: Client Component を使わず Server Component のまま実装する

- **Context**: `mailto:` リンクにはクリック時の JS 処理が不要
- **Alternatives Considered**:
  1. `"use client"` の Client Component に変換 — state/effect が不要なのに hydration コストが発生
  2. Server Component のまま `<a>` タグを追加 — 追加コスト一切なし
- **Selected Approach**: Server Component 内に `buildMailtoHref` 純粋関数を追加し、`<a href={href}>` を直接描画
- **Rationale**: `mailto:` リンクはブラウザネイティブの機能であり JavaScript 不要。Steering の「Server Component + Prisma 直接呼び出し」原則に沿う
- **Trade-offs**: 再利用性は低いが、この機能は完了画面専用であり抽象化不要
- **Follow-up**: iOS/Android で実機確認推奨

### Decision: `to` フィールドを空にする

- **Context**: 要件 2.4「宛先はユーザー自身がメールアプリ内で入力する」
- **Selected Approach**: `mailto:?subject=...&body=...`（`to` なし）
- **Rationale**: メールアドレスをサーバーに送らない方針（要件 3）との整合性を保つ。宛先を空にすることでユーザーが自分宛に送るか判断できる

---

## Risks & Mitigations

- **メールアプリ未設定（PC）** — 一部 PC 環境でデフォルトメールクライアントが未設定の場合、ボタンが機能しない。補足テキスト「メールアプリが開きます」で事前に伝える（要件 4.5）
- **本文の文字数制限** — mailto の URL 長は OS/ブラウザにより上限が異なるが、今回の本文は数百文字程度であり問題なし
- **文字化け** — `encodeURIComponent` で適切にエンコードすることで日本語の文字化けを防ぐ

---

## References

- RFC 6068: The 'mailto' URI Scheme
- MDN Web Docs: mailto links
