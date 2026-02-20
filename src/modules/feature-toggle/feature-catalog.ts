export const featureCatalog = {
  authV1: {
    description: 'Autenticacao REST V1',
    defaultEnabled: true
  },
  salesModule: {
    description: 'Modulo de vendas',
    defaultEnabled: true
  },
  inventoryModule: {
    description: 'Modulo de estoque',
    defaultEnabled: false
  },
  advancedReports: {
    description: 'Relatorios avancados',
    defaultEnabled: false
  }
} as const;

export type FeatureKey = keyof typeof featureCatalog;
