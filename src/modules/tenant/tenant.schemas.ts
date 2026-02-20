export const tenantParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['tenantId'],
  properties: {
    tenantId: { type: 'string', minLength: 1 }
  }
} as const;

export const createTenantBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 120 }
  }
} as const;

export const updateTenantBodySchema = createTenantBodySchema;
