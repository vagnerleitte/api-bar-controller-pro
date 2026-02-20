export const tenantParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['tenantId'],
  properties: {
    tenantId: { type: 'string', minLength: 1 }
  }
} as const;

export const tenantFeatureParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['tenantId', 'featureKey'],
  properties: {
    tenantId: { type: 'string', minLength: 1 },
    featureKey: { type: 'string', minLength: 1 }
  }
} as const;

export const updateTenantFeatureBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['enabled'],
  properties: {
    enabled: { type: 'boolean' }
  }
} as const;
