ALTER TABLE "tenants"
  ADD COLUMN "documentNormalized" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT;

CREATE UNIQUE INDEX "tenants_documentNormalized_key"
ON "tenants"("documentNormalized");
