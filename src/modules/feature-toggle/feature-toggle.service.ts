import { prisma } from '../../shared/prisma';
import { env } from '../../config/env';
import { FeatureKey, featureCatalog } from './feature-catalog';
import { parseFeatureFlagsEnv } from './feature-toggle.utils';

const envOverrides = parseFeatureFlagsEnv(env.FEATURE_FLAGS);

const getBaseValue = (feature: FeatureKey): boolean => {
  if (typeof envOverrides[feature] === 'boolean') {
    return envOverrides[feature] as boolean;
  }
  return featureCatalog[feature].defaultEnabled;
};

export const isFeatureEnabled = async (feature: FeatureKey, tenantId: string): Promise<boolean> => {
  const override = await prisma.tenantFeatureToggle.findUnique({
    where: {
      tenantId_featureKey: {
        tenantId,
        featureKey: feature
      }
    }
  });

  if (override) return override.enabled;
  return getBaseValue(feature);
};

export const listTenantFeatures = async (tenantId: string) => {
  const overrides = await prisma.tenantFeatureToggle.findMany({
    where: { tenantId }
  });

  const byKey = new Map(overrides.map((item) => [item.featureKey as FeatureKey, item.enabled]));

  return (Object.keys(featureCatalog) as FeatureKey[]).map((key) => {
    const override = byKey.get(key);
    const enabled = typeof override === 'boolean' ? override : getBaseValue(key);

    return {
      key,
      enabled,
      source: typeof override === 'boolean' ? 'tenant' as const : (typeof envOverrides[key] === 'boolean' ? 'env' as const : 'default' as const),
      description: featureCatalog[key].description
    };
  });
};

export const isFeatureKey = (value: string): value is FeatureKey => {
  return value in featureCatalog;
};

export const setTenantFeatureOverride = async (
  tenantId: string,
  featureKey: FeatureKey,
  enabled: boolean
) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return { statusCode: 404 as const, message: 'Tenant não encontrado' };
  }

  await prisma.tenantFeatureToggle.upsert({
    where: {
      tenantId_featureKey: {
        tenantId,
        featureKey
      }
    },
    update: { enabled },
    create: {
      tenantId,
      featureKey,
      enabled
    }
  });

  const resolved = await listTenantFeatures(tenantId);
  const current = resolved.find((item) => item.key === featureKey);

  return {
    statusCode: 200 as const,
    data: {
      tenantId,
      feature: current
    }
  };
};
