"use client";

import { useEffect, useState } from "react";

const CDN_URL =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

export interface ModelViewerProps {
  src: string;
  alt?: string;
  cameraOrbit?: string;
}

export default function ModelViewer({
  src,
  alt = "ひめっこ 3D モデル",
  cameraOrbit = "0deg 75deg 105%",
}: ModelViewerProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = CDN_URL;
      document.head.appendChild(script);
    }
    customElements.whenDefined("model-viewer").then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-neutral-100)] text-base text-[var(--color-neutral-500)] leading-[1.5]">
        3D モデルを読み込み中…
      </div>
    );
  }

  return (
    // @ts-expect-error: model-viewer is a Web Component, not a standard HTML element
    <model-viewer
      src={src}
      alt={alt}
      camera-controls
      disable-zoom
      disable-pan
      auto-rotate
      camera-orbit={cameraOrbit}
      shadow-intensity="1.5"
      environment-image="neutral"
      exposure="1.1"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background:
          "linear-gradient(180deg, #f5edd6 0%, #e8dcc0 40%, #d4c9a8 100%)",
      }}
    />
  );
}
