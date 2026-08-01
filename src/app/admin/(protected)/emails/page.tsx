import { env } from "@/env";
import { formatJstDateTime } from "@/lib/format-date";
import Link from "next/link";
import { notFound } from "next/navigation";

type EmailEntry = {
  filename: string;
  to: string[];
  from: string;
  subject: string;
  sentAt: string;
};

async function getEmails(): Promise<EmailEntry[]> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const dir = path.join(process.cwd(), "tmp", "emails");

  try {
    const files = await fs.readdir(dir);
    const jsonFiles = files
      .filter((f) => f.endsWith(".json"))
      .sort()
      .reverse();

    const emails: EmailEntry[] = [];
    for (const file of jsonFiles) {
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf-8");
        const data = JSON.parse(raw);
        emails.push({ filename: file, ...data });
      } catch {
        // skip malformed files
      }
    }
    return emails;
  } catch {
    return [];
  }
}

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  if (env.APP_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const emails = await getEmails();
  const selected = params.file
    ? emails.find((e) => e.filename === params.file)
    : emails[0];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* サイドバー: メール一覧 */}
      <aside
        style={{
          width: "360px",
          borderRight: "1px solid #e5e5e5",
          overflow: "auto",
          backgroundColor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
            Dev Emails
          </h1>
          <span
            style={{
              fontSize: "12px",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontWeight: 600,
            }}
          >
            {emails.length} 件
          </span>
        </div>

        {emails.length === 0 ? (
          <p style={{ padding: "20px", color: "#999", fontSize: "14px" }}>
            メールはまだありません。申込を行うとここに表示されます。
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {emails.map((email) => {
              const isSelected = selected?.filename === email.filename;
              return (
                <li key={email.filename}>
                  <Link
                    href={`/admin/emails?file=${email.filename}`}
                    style={{
                      display: "block",
                      padding: "12px 20px",
                      textDecoration: "none",
                      borderBottom: "1px solid #eee",
                      backgroundColor: isSelected ? "#e0e7ff" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1e1c19",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {email.subject}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      To: {email.to.join(", ")}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#aaa",
                        marginTop: "2px",
                      }}
                    >
                      {formatJstDateTime(email.sentAt)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e5e5" }}>
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "#6366f1",
              textDecoration: "none",
            }}
          >
            Dev Portal に戻る
          </Link>
        </div>
      </aside>

      {/* メインエリア: メールプレビュー */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selected ? (
          <>
            <header
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e5e5",
                backgroundColor: "#fff",
              }}
            >
              <h2
                style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700 }}
              >
                {selected.subject}
              </h2>
              <div style={{ fontSize: "13px", color: "#666" }}>
                <span>From: {selected.from}</span>
                <span style={{ margin: "0 12px" }}>|</span>
                <span>To: {selected.to.join(", ")}</span>
                <span style={{ margin: "0 12px" }}>|</span>
                <span>{formatJstDateTime(selected.sentAt)}</span>
              </div>
            </header>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <iframe
                src={`/api/admin/emails/${encodeURIComponent(selected.filename)}`}
                title="Email preview"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            メールを選択してください
          </div>
        )}
      </main>
    </div>
  );
}
