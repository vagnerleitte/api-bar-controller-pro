export const registerBodySchema = {
  type: 'object',
  required: ['personName', 'establishmentName', 'document', 'address', 'phone', 'password'],
  additionalProperties: false,
  properties: {
    personName: { type: 'string', minLength: 1, maxLength: 120 },
    establishmentName: { type: 'string', minLength: 1, maxLength: 120 },
    document: { type: 'string', minLength: 11, maxLength: 18 },
    address: { type: 'string', minLength: 1, maxLength: 255 },
    email: { type: 'string', format: 'email', minLength: 5, maxLength: 255 },
    phone: { type: 'string', minLength: 8, maxLength: 20 },
    password: { type: 'string', minLength: 6, maxLength: 100 }
  }
} as const;

export const loginBodySchema = {
  type: 'object',
  required: ['cpf', 'password'],
  additionalProperties: false,
  properties: {
    cpf: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 }
  }
} as const;

export const refreshBodySchema = {
  type: 'object',
  required: ['refreshToken'],
  additionalProperties: false,
  properties: {
    refreshToken: { type: 'string', minLength: 1 }
  }
} as const;

export const logoutBodySchema = refreshBodySchema;
