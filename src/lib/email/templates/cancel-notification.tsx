import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type CancelNotificationProps = {
  activityTitle: string;
  entryName: string;
  cancelDate: string;
};

export function CancelNotificationEmail({
  activityTitle,
  entryName,
  cancelDate,
}: CancelNotificationProps) {
  return (
    <Html lang="ja">
      <Head />
      <Preview>
        キャンセル: {activityTitle} - {entryName}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>申込がキャンセルされました</Heading>
          <Hr style={hrStyle} />
          <Section style={sectionStyle}>
            <Text style={labelStyle}>アクティビティ</Text>
            <Text style={valueStyle}>{activityTitle}</Text>
          </Section>
          <Section style={sectionStyle}>
            <Text style={labelStyle}>申込者名</Text>
            <Text style={valueStyle}>{entryName}</Text>
          </Section>
          <Section style={sectionStyle}>
            <Text style={labelStyle}>キャンセル日時</Text>
            <Text style={valueStyle}>{cancelDate}</Text>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            このメールは よっとこ！新庄村 から自動送信されています。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '"BIZ UDPGothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
  margin: 0,
  padding: "24px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const headingStyle: React.CSSProperties = {
  color: "#1e1c19",
  fontSize: "20px",
  fontWeight: 700,
  margin: "0 0 16px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "16px 0",
};

const sectionStyle: React.CSSProperties = {
  margin: "12px 0",
};

const labelStyle: React.CSSProperties = {
  color: "#6b6b6b",
  fontSize: "13px",
  fontWeight: 600,
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const valueStyle: React.CSSProperties = {
  color: "#1e1c19",
  fontSize: "16px",
  margin: 0,
  whiteSpace: "pre-wrap",
};

const footerStyle: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  margin: 0,
};
