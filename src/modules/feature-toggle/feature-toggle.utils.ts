import { FeatureKey, featureCatalog } from './feature-catalog';

const parseBool = (value: string): boolean | null => {
  const normalized = value.trim().toLowerCase();
  if (['on', 'true', '1', 'enabled'].includes(normalized)) return true;
  if (['off', 'false', '0', 'disabled'].includes(normalized)) return false;
  return null;
};

export const parseFeatureFlagsEnv = (input: string | undefined): Partial<Record<FeatureKey, boolean>> => {
  if (!input || !input.trim()) return {};

  const result: Partial<Record<FeatureKey, boolean>> = {};

  for (const pair of input.split(',')) {
    const [rawKey, rawValue] = pair.split(':');
    if (!rawKey || !rawValue) continue;

    const key = rawKey.trim() as FeatureKey;
    if (!(key in featureCatalog)) continue;

    const parsed = parseBool(rawValue);
    if (parsed === null) continue;

    result[key] = parsed;
  }

  return result;
};
