#!/usr/bin/env node
/**
 * check-public-release.mjs
 *
 * 公開に際しての無害化チェック。
 * リポジトリに残留している社内情報・デバッグ用コードを検出する。
 *
 * 検出ルール:
 *   - internal-redmine-url       : 社内 Redmine の URL
 *   - internal-hardcoded-url     : 社内ドメイン (weseek.co.jp) の URL
 *   - internal-email             : 社内メールアドレス (@weseek.co.jp)
 *   - internal-org-identifier    : 社内固有の識別子 (weseek-<name> 形式。GCP プロジェクト ID 等)
 *   - internal-service-account   : GCP サービスアカウント (プロジェクト番号が露出する)
 *   - internal-gcs-bucket        : 本番 GCS バケット名のハードコード
 *   - hardcoded-localhost        : localhost のハードコード（ソース内の文字列リテラル）
 *   - debug-console-log          : console.log / console.debug の残留（ソースのみ）
 *
 * Usage:
 *   node scripts/check-public-release.mjs
 *   node scripts/check-public-release.mjs --fix-hints   # 修正ヒントも表示する
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/**
 * 走査対象。ディレクトリは再帰的に、ファイルは単体で検査する。
 * ディレクトリ配下は EXTENSIONS に一致するファイルのみを見る。
 */
const SCAN_TARGETS = [
  "src",
  ".kiro",
  ".github",
  "prisma",
  "scripts",
  "next.config.ts",
  "cloudbuild.yaml",
  "Dockerfile",
  "docker-compose.yml",
  "entrypoint.sh",
  "README.md",
  ".env.example",
  ".env.development",
  ".env.demo",
  ".env.production",
];

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mjs",
  ".js",
  ".md",
  ".yaml",
  ".yml",
  ".sh",
];

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".next",
  ".open-next",
  "dist",
  "src/generated",
]);

// このスクリプト自身は検出パターンを定義上含むため対象外にする。
const SELF = relative(ROOT, fileURLToPath(import.meta.url));

const SHOW_FIX_HINTS = process.argv.includes("--fix-hints");

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * アプリ本体のソースだけに適用したいルール用の判定。
 * prisma/ や scripts/ の CLI は進捗表示のために console 出力するのが正しく、
 * localhost もコマンドの既定値として書いてよいので対象から外す。
 */
const isAppSource = (rel) =>
  rel.startsWith("src/") && (rel.endsWith(".ts") || rel.endsWith(".tsx"));

/**
 * @type {Array<{
 *   id: string;
 *   desc: string;
 *   pattern: RegExp;
 *   hint: string;
 *   appliesTo?: (rel: string) => boolean;
 * }>}
 */
const RULES = [
  {
    id: "internal-redmine-url",
    desc: "社内 Redmine の URL が残留している",
    pattern: /redmine\.weseek\.co\.jp/,
    hint: "コメント・ドキュメント・JSX から Redmine URL を削除してください。",
  },
  {
    id: "internal-hardcoded-url",
    desc: "社内ドメイン (weseek.co.jp) の URL が残留している",
    pattern: /https?:\/\/[a-z0-9.-]*weseek\.co\.jp/i,
    hint: "環境変数へ切り出すか、ドキュメントならプレースホルダーへ置き換えてください。",
  },
  {
    id: "internal-email",
    desc: "社内メールアドレスが残留している",
    pattern: /[A-Za-z0-9._%+-]+@weseek\.co\.jp/i,
    hint: "環境変数へ切り出すか、example.com のプレースホルダーへ置き換えてください。",
  },
  {
    id: "internal-org-identifier",
    desc: "社内固有の識別子 (weseek-<name>) が残留している",
    pattern: /\bweseek-[a-z0-9-]+/i,
    hint: "GCP プロジェクト ID などはプレースホルダー (<GCP_PROJECT_ID>) へ置き換えてください。",
  },
  {
    id: "internal-service-account",
    desc: "GCP サービスアカウント（プロジェクト番号が露出する）が残留している",
    pattern: /\d{6,}-compute@developer\.gserviceaccount\.com/,
    hint: "<PROJECT_NUMBER>-compute@developer.gserviceaccount.com へ置き換えてください。",
  },
  {
    id: "internal-gcs-bucket",
    desc: "本番 GCS バケット名がハードコードされている",
    pattern: /yottoko-uploads/,
    hint: "GCS_BUCKET 環境変数から組み立ててください。",
  },
  {
    id: "hardcoded-localhost",
    desc: "localhost がハードコードされている（文字列リテラル内）",
    pattern: /["'`][^"'`]*localhost[^"'`]*["'`]/,
    hint: "環境変数に切り出してください。",
    appliesTo: isAppSource,
  },
  {
    id: "debug-console-log",
    desc: "console.log / console.debug が残留している",
    pattern: /\bconsole\.(log|debug)\s*\(/,
    hint: "デバッグ用の console.log / console.debug を削除してください。",
    appliesTo: isAppSource,
  },
];

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

/**
 * @param {string} dir 絶対パス
 * @returns {string[]} 絶対パスの配列
 */
function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (statSync(full).isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry) && !EXCLUDE_DIRS.has(rel)) {
        results.push(...walkFiles(full));
      }
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

/** SCAN_TARGETS を展開して検査対象ファイル（ROOT 相対）の一覧を作る */
function collectFiles() {
  const files = new Set();
  for (const target of SCAN_TARGETS) {
    const full = join(ROOT, target);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      // 対象が存在しない構成もあり得るので、無い場合は黙って飛ばす
      continue;
    }
    if (stat.isDirectory()) {
      for (const f of walkFiles(full)) files.add(relative(ROOT, f));
    } else {
      files.add(relative(ROOT, full));
    }
  }
  files.delete(SELF);
  return [...files].sort();
}

// ---------------------------------------------------------------------------
// Checker
// ---------------------------------------------------------------------------

/**
 * @param {string} rel ROOT 相対パス
 * @returns {{ ruleId: string; desc: string; lines: number[]; hint: string }[]}
 */
function checkFile(rel) {
  const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
  const violations = [];

  for (const rule of RULES) {
    if (rule.appliesTo && !rule.appliesTo(rel)) continue;

    const matchedLines = [];
    lines.forEach((line, idx) => {
      if (rule.pattern.test(line)) matchedLines.push(idx + 1);
    });

    if (matchedLines.length > 0) {
      violations.push({
        ruleId: rule.id,
        desc: rule.desc,
        lines: matchedLines,
        hint: rule.hint,
      });
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const targets = collectFiles();

/** @type {Map<string, ReturnType<typeof checkFile>>} */
const report = new Map();

for (const rel of targets) {
  const violations = checkFile(rel);
  if (violations.length > 0) report.set(rel, violations);
}

if (report.size === 0) {
  console.info(
    `✅ 公開前の無害化チェックに問題はありませんでした（${targets.length} ファイルを検査）。`,
  );
  process.exit(0);
}

console.info(
  `\n⚠️  ${report.size} 件のファイルに公開前の無害化が必要な箇所が見つかりました:\n`,
);

let totalViolations = 0;

for (const [file, violations] of report) {
  console.info(`📄 ${file}`);
  for (const v of violations) {
    totalViolations++;
    console.info(
      `   [${v.ruleId}] ${v.desc} (line${v.lines.length > 1 ? "s" : ""} ${v.lines.join(", ")})`,
    );
    if (SHOW_FIX_HINTS) console.info(`   💡 ${v.hint}`);
  }
  console.info();
}

console.info(
  `合計: ${report.size} ファイルで ${totalViolations} 件の問題が見つかりました。`,
);
if (!SHOW_FIX_HINTS) {
  console.info("--fix-hints オプションを付けると修正ヒントも表示されます。");
}

process.exit(1);
