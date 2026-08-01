import { env } from "@/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | よっとこ！新庄村",
};

export default function PrivacyPolicyPage() {
  const contactEmail = env.CONTACT_EMAIL;
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 font-sans text-base leading-relaxed text-neutral-800">
        <h1 className="mb-8 text-center text-2xl font-bold">
          プライバシーポリシー
        </h1>

        <p className="mb-4">
          株式会社 WESEEK（以下「当社」といいます）は、当社が提供する Web
          アプリ「よっとこ！新庄村」（以下「本サービス」といいます）における利用者の情報の取扱いについて、本プライバシーポリシー（以下「本ポリシー」といいます）を定めます。
        </p>
        <p className="mb-4">
          本サービスは、岡山県真庭郡新庄村における観光交流の活性化を目的とした実証実験（実証実験期間：2026年6月24日
          ～
          2027年6月23日）として提供されます。本ポリシーは、その期間中における情報の取扱い方針および実証実験終了後の取扱いを明確にすることを目的とします。
        </p>
        <p className="mb-10">
          本サービスは、利用者を識別するための個人情報の取得を原則として行わない設計としています。
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">第1条（基本方針）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>本サービスは、ユーザーアカウントの登録機能を有しません。</li>
            <li>
              本サービスは、利用者を識別するための個人情報（氏名、住所、メールアドレス、電話番号、生年月日、位置情報等）を、本ポリシーで明示する場合を除き取得しません。
            </li>
            <li>
              本サービスは、アクセス解析、広告配信、ターゲティングを目的とした
              Cookie、トラッキング ID、その他の追跡技術を使用しません。
            </li>
            <li>
              当社は、利用者の情報を本ポリシーに定める利用目的の範囲外で利用しません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第2条（AR 撮影機能における情報の取扱い）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>AR 撮影機能は、利用者の端末上でのみ動作します。</li>
            <li>
              カメラの映像、利用者が撮影した画像（以下「撮影画像」といいます）、および撮影に伴って端末上で処理される情報は、当社のサーバーに送信・保存されません。
            </li>
            <li>
              撮影画像は利用者の端末内に生成・保存され、その削除や第三者への共有は利用者ご自身の操作によって行われます。
            </li>
            <li>
              利用者が撮影画像を SNS
              等の外部サービスに共有する場合、当該外部サービスにおける情報の取扱いについては、当該サービス提供者のプライバシーポリシーが適用されます。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第3条（スポット閲覧機能における情報の取扱い）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              利用者がスポットページや交流コンテンツ一覧を閲覧する際、当社は利用者を個別に識別するための情報を取得しません。
            </li>
            <li>
              サーバーは、本サービスの安定運用および障害対応のために、アクセスログ（IP
              アドレス、ユーザーエージェント、アクセス日時、リクエスト URL
              等の通信に伴って一般的に送信される情報）を一時的に記録する場合があります。これらのログは、利用者個人を特定する目的では利用されず、一定期間経過後に自動的に削除されます。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第4条（交流コンテンツ参加申込フォームにおける情報の取扱い）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              利用者が参加申込フォームを任意に利用される場合、当社は以下の情報を取得します。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>お名前またはニックネーム（必須）</li>
                <li>メッセージ（参加にあたっての質問・ひとこと等。任意）</li>
              </ul>
              <p className="mt-2">
                連絡先（メールアドレス・電話番号等）は取得しません。当社および新庄村から申込後に利用者へ折り返し連絡することはありません。申込の控えが必要な場合は、利用者ご自身で画面を保存してください。
              </p>
            </li>
            <li>
              前項により取得した情報（以下「申込情報」といいます）の利用目的は、次のとおりです。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  当該申込に対する主催者（新庄村または村内の事業者・住民等）からの対応・連絡の取り次ぎ
                </li>
                <li>申込状況の管理および対応漏れの防止</li>
              </ul>
            </li>
            <li>
              お名前は、当日の呼び掛けや申込の取り違い防止のための識別目的で取得します。ニックネーム等での入力を妨げません。
            </li>
            <li>
              当社は、申込情報を上記の利用目的の範囲外で利用しません。マーケティング、広告配信、第三者への営業目的での提供は行いません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">第5条（第三者提供）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当社は、申込情報を含むすべての情報について、利用者本人の同意を得ずに第三者に提供することはありません。ただし、次のいずれかに該当する場合はこの限りではありません。
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>法令に基づき開示が求められる場合</li>
                <li>
                  人の生命、身体または財産の保護のために必要であって、本人の同意を得ることが困難である場合
                </li>
                <li>
                  公衆衛生の向上または児童の健全な育成の推進のために特に必要であって、本人の同意を得ることが困難である場合
                </li>
                <li>
                  国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要があって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
                </li>
              </ul>
            </li>
            <li>
              申込情報は、当該交流コンテンツの主催者（新庄村または村内の事業者・住民等）に対し、当該申込への対応に必要な範囲で共有します。これは本サービスの中核機能であり、利用者は本サービスの利用にあたりこれをあらかじめ承諾するものとします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">第6条（業務委託）</h2>
          <p>
            当社は、本サービスの運営に必要な業務の一部（インフラ運用等）を外部の事業者に委託する場合があります。委託先には、個人情報保護法を遵守する事業者を選定し、必要かつ適切な監督を行います。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第7条（Cookie およびその他の技術の利用）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              本サービスは、利用者の行動を追跡する目的での Cookie
              および類似技術、ならびにアクセス解析ツールを使用しません。
            </li>
            <li>
              本サービスの動作に技術的に必要な範囲で Cookie
              等を利用する場合がありますが、これらを利用者の識別や行動履歴の取得に用いることはありません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">第8条（安全管理措置）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当社は、申込情報その他取得した情報の漏えい、滅失、毀損の防止その他の安全管理のために、合理的な技術的・組織的措置を講じます。
            </li>
            <li>
              申込情報は、アクセス制限を行ったデータベース上で管理し、本サービスの運営に必要な権限を有する者のみがアクセスできる状態とします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第9条（開示・訂正・削除等の請求）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              利用者は、当社に対し、ご自身の申込情報について、開示、訂正、追加、削除、利用停止または第三者提供の停止を請求することができます。
            </li>
            <li>
              前項の請求は、末尾「個人情報に関する開示等申請について」に記載の窓口までご連絡ください。当社は、本人確認を行ったうえで、法令に従い遅滞なく対応します。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">
            第10条（実証実験終了後のデータの取扱い）
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              本サービスは前文に定める実証実験期間をもって提供される実証実験であり、実証実験期間の終了後は本サービスの提供を停止します。
            </li>
            <li>
              実証実験期間の終了後、当社が取得した個人情報等は、法令に定める保存義務がある場合を除き、合理的な期間内に削除または復元不可能な形に加工します。
            </li>
            <li>
              統計的処理により個人を特定できない形に加工した情報は、実証実験の効果測定および報告書の作成のため、実証実験期間の終了後も利用することがあります。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">第11条（本ポリシーの変更）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当社は、必要と判断する場合、本ポリシーを変更することがあります。
            </li>
            <li>
              重要な変更を行う場合には、本サービス上または当社の運営するウェブサイトに掲示する方法により、効力発生時期の到来までに周知するものとします。
            </li>
            <li>
              変更後のポリシーは、掲示された時点で効力を生じるものとします。
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-bold">第12条（お問い合わせ）</h2>
          <p>
            本ポリシーおよび個人情報の取扱いに関するお問い合わせは、末尾「個人情報に関する開示等申請について」に記載の窓口までご連絡ください。
          </p>
        </section>

        <hr className="mb-10 border-neutral-300" />

        <section>
          <h2 className="mb-6 text-xl font-bold">
            個人情報に関する開示等申請について
          </h2>
          <p className="mb-6">
            本サービスに関する個人情報の開示、訂正、追加、削除、利用停止、第三者提供の停止その他のご請求については、以下の手続により受け付けます。
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-bold">申請方法</h3>
              <p>
                所定の「個人情報開示等申請書」に必要事項をご記入のうえ、本人確認書類を添付または同封し、下記窓口までメールまたは郵送でご連絡ください。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold">メール窓口</h3>
              <p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-arcana-primary-green underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-arcana-primary-green focus-visible:ring-offset-2"
                >
                  {contactEmail}
                </a>
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold">本人確認書類</h3>
              <p>
                運転免許証、パスポート、マイナンバーカード（個人番号部分を除く）、健康保険証のいずれか
                1 点の写しをご同封ください。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold">手数料</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>開示請求：1,000 円（定額小為替証書を同封してください）</li>
                <li>
                  訂正、追加、削除、利用停止、第三者提供停止のご請求：無料
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-bold">郵送先</h3>
              <address className="not-italic">
                〒169-0051
                <br />
                東京都新宿区西早稲田2-20-15 高田馬場アクセス10F
                <br />
                株式会社WESEEK 個人情報管理責任者 宛
              </address>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
