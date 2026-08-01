import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "クレジット | よっとこ！新庄村",
};

export default function CreditsPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 font-sans text-base leading-relaxed text-neutral-800">
        <h1 className="mb-8 text-center text-2xl font-bold text-balance">
          クレジット
        </h1>

        <p className="mb-10 text-neutral-600 text-pretty">
          本サービスで使用している素材・ツールのライセンス表記です。
        </p>

        {/* 3Dモデル */}
        <section className="mb-10" aria-labelledby="credits-3d-heading">
          <h2
            id="credits-3d-heading"
            className="mb-4 text-xl font-bold text-balance"
          >
            3Dモデル（ひめっこ）
          </h2>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-5">
            <ul className="space-y-2 text-base leading-relaxed">
              <li>
                3Dモデル:
                新庄村のキャラクター「ひめっこ」を原作とし、新庄村の承認を得た3D化案に基づき
                Meshy AI で立体化・改変したもの（CC BY 4.0）
              </li>
              <li>キャラクター「ひめっこ」&copy; 新庄村（原作）</li>
              <li>
                Model created with{" "}
                <a
                  href="https://www.meshy.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Meshy
                  <span className="sr-only">（新しいタブで開く）</span>
                </a>{" "}
                &ndash;{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  CC BY 4.0 License
                  <span className="sr-only">（新しいタブで開く）</span>
                </a>
                <br />
                <span className="pl-4 text-sm text-neutral-500">
                  https://creativecommons.org/licenses/by/4.0/
                </span>
              </li>
              <li>改変: 3D形状・テクスチャを Blender にて修正</li>
            </ul>
          </div>
        </section>

        <hr className="mb-10 border-neutral-200" />

        {/* English */}
        <section
          className="mb-10"
          aria-labelledby="credits-en-heading"
          lang="en"
        >
          <h2
            id="credits-en-heading"
            className="mb-4 text-xl font-bold text-balance"
          >
            Credits (English)
          </h2>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-5">
            <ul className="space-y-2 text-base leading-relaxed">
              <li>
                3D model derived from the character &ldquo;Himekko&rdquo; &copy;
                Shinjo Village, created with Meshy AI based on a 3D adaptation
                plan approved by Shinjo Village (CC BY 4.0)
              </li>
              <li>
                Character &ldquo;Himekko&rdquo; &copy; Shinjo Village (original)
              </li>
              <li>
                Model created with{" "}
                <a
                  href="https://www.meshy.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Meshy
                  <span className="sr-only"> (opens in new tab)</span>
                </a>{" "}
                &ndash;{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  CC BY 4.0 License
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
                <br />
                <span className="pl-4 text-sm text-neutral-500">
                  https://creativecommons.org/licenses/by/4.0/
                </span>
              </li>
              <li>Modified: mesh geometry and textures adjusted in Blender</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
