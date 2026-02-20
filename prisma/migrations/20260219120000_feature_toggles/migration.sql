-- CreateTable
CREATE TABLE "feature_toggles" (
    "key" TEXT NOT NULL,
    "description" TEXT,
    "defaultEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_toggles_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "tenant_feature_toggles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_feature_toggles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_feature_toggles_tenantId_featureKey_key" ON "tenant_feature_toggles"("tenantId", "featureKey");

-- CreateIndex
CREATE INDEX "tenant_feature_toggles_featureKey_idx" ON "tenant_feature_toggles"("featureKey");

-- AddForeignKey
ALTER TABLE "tenant_feature_toggles" ADD CONSTRAINT "tenant_feature_toggles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_toggles" ADD CONSTRAINT "tenant_feature_toggles_featureKey_fkey" FOREIGN KEY ("featureKey") REFERENCES "feature_toggles"("key") ON DELETE CASCADE ON UPDATE CASCADE;
