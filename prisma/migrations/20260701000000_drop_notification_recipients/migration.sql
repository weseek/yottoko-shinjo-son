-- 通知先は環境変数 (NOTIFICATION_RECIPIENTS / SecretManager) で固定化したため、
-- admin で管理していた notification_recipients テーブルを廃止する。
DROP TABLE "notification_recipients";
