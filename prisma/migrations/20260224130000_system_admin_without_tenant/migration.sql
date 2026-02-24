-- Allow internal users (system_admin/backoffice_operator) without tenant binding
ALTER TABLE "users"
  ALTER COLUMN "tenantId" DROP NOT NULL;

ALTER TABLE "refresh_tokens"
  ALTER COLUMN "tenantId" DROP NOT NULL;
