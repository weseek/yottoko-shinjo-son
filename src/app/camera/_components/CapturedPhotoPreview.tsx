"use client";

import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";
import type { CaptureResult } from "@/lib/ar/types";
import { useCallback, useEffect, useState } from "react";

const SHARE_TEXT =
  "新庄村に遊びにきたよ！あなたも自宅でひめっ子と撮影してみよう";

/**
 * Web Share API によるファイル共有がサポートされているか判定する
 *
 * 以下をすべて満たす場合のみ true を返す:
 *  1. `navigator.share` が関数として存在する
 *  2. `navigator.canShare` が関数として存在する
 *  3. `navigator.canShare({ files: [<テスト用 PNG>] })` が true を返す
 */
function canShare(nav: Pick<Navigator, "share" | "canShare">): boolean {
  if (typeof nav.share !== "function") return false;
  if (typeof nav.canShare !== "function") return false;
  try {
    const testFile = new File([""], "test.png", { type: "image/png" });
    return nav.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export interface CapturedPhotoPreviewProps {
  captureResult: CaptureResult;
  onRetake: () => void;
}

/**
 * 代替AR撮影体験の撮影結果プレビュー(保存/シェア/撮り直し)。
 *
 * スポット撮影ページに存在した`PhotoPreview.tsx`(マーカーレス化に伴い削除済み)と
 * 同等のUI・挙動を、本spec(自宅撮影の代替AR撮影体験)の範囲内に再実装したもの。
 */
export default function CapturedPhotoPreview({
  captureResult,
  onRetake,
}: CapturedPhotoPreviewProps) {
  const fileName = `arcana-ar-${captureResult.capturedAt.getTime()}.png`;

  // 保存: Web Share API でファイル共有できる場合はネイティブシェアシート経由（iOS 写真アプリに保存可）
  // そうでなければ従来のダウンロード
  const handleSave = useCallback(async () => {
    try {
      const res = await fetch(captureResult.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title: "AR記念撮影 - よっとこ！新庄村",
          files: [file],
        });
        return;
      }
    } catch {
      // share がキャンセル/失敗した場合はダウンロードにフォールバック
    }

    // プログラム的なダウンロード（a 要素を生成して click）
    const link = document.createElement("a");
    link.href = captureResult.dataUrl;
    link.download = fileName;
    link.click();
  }, [captureResult.dataUrl, fileName]);

  const handleShare = useCallback(async () => {
    try {
      const res = await fetch(captureResult.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, {
        type: "image/png",
      });

      await navigator.share({
        title: "AR記念撮影 - よっとこ！新庄村",
        files: [file],
        text: SHARE_TEXT,
        // シェア対象はこのアプリ自身なので、実行時の origin をそのまま使う。
        // NEXT_PUBLIC_* はビルド時にバンドルへ焼き込まれ実行時の注入では差し替わらないため、
        // 公開 URL を設定値として持たせるとデプロイ先ごとに再ビルドが必要になる。
        url: window.location.origin,
      });
    } catch {
      // ユーザーがシェアをキャンセルした場合は無視
    }
  }, [captureResult.dataUrl, fileName]);

  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    setShareSupported(canShare(navigator));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100dvh",
        backgroundColor: "var(--color-neutral-800)",
        padding: "16px",
      }}
    >
      {/* プレビュー画像 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <img
          src={captureResult.dataUrl}
          alt="AR撮影写真のプレビュー"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 12,
            boxShadow: "var(--shadow-xl)",
          }}
        />
      </div>

      {/* アクションボタン */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          marginBottom: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* 保存ボタン */}
        <button
          type="button"
          onClick={handleSave}
          aria-label="写真を保存する"
          className={buttonClassName("standard", "px-7 py-3.5 gap-2")}
        >
          <Icon name="download" width={20} height={20} />
          保存
        </button>

        {/* シェアボタン（Web Share API 対応時のみ） */}
        {shareSupported && (
          <button
            type="button"
            onClick={handleShare}
            aria-label="写真をシェアする"
            className={buttonClassName("standard", "px-7 py-3.5 gap-2")}
          >
            <Icon name="share" width={20} height={20} />
            シェア
          </button>
        )}

        {/* 撮り直しボタン */}
        <button
          type="button"
          onClick={onRetake}
          aria-label="撮り直す"
          className={buttonClassName("outline", "px-7 py-3.5")}
        >
          撮り直す
        </button>
      </div>
    </div>
  );
}
