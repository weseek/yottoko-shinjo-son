"use client";

import { useEffect, useRef } from "react";

const CDN_URL =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

export interface HiddenArViewerProps {
  src: string;
  scale?: number;
  onReady: (el: HTMLElement) => void;
}

export default function HiddenArViewer({
  src,
  scale = 1,
  onReady,
}: HiddenArViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = CDN_URL;
      document.head.appendChild(script);
    }
    customElements.whenDefined("model-viewer").then(() => {
      const el = wrapperRef.current?.firstElementChild as HTMLElement | null;
      if (el) onReady(el);
    });
  }, [onReady]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/*
        ar-modes は左から優先で AR モードを選ぶ。Android では先頭が webxr だと
        WebXR モードで起動するが、WebXR には撮影(スクリーンショット)ボタンが無い。
        記念撮影が目的なので、撮影 UI を持つ scene-viewer を優先し webxr は使わない。
        iOS は quick-look が撮影機能を持つ。
        参考: https://github.com/google/model-viewer/issues/1589
      */}
      {/* @ts-expect-error: model-viewer is a Web Component */}
      <model-viewer
        src={src}
        ar
        ar-modes="scene-viewer quick-look"
        ar-scale="fixed"
        scale={`${scale} ${scale} ${scale}`}
        style={{ width: "1px", height: "1px" }}
      />
    </div>
  );
}
