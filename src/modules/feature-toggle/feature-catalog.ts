export const featureCatalog = {
  mensalistas: {
    description: 'Gestao de mensalistas',
    defaultEnabled: false
  },
  comandas: {
    description: 'Gestao de comandas',
    defaultEnabled: true
  },
  vendasAvulsas: {
    description: 'Vendas avulsas',
    defaultEnabled: true
  },
  relatorios: {
    description: 'Relatorios',
    defaultEnabled: false
  },
  usuarios: {
    description: 'Gestao de usuarios',
    defaultEnabled: true
  },
  cadastro: {
    description: 'Cadastro',
    defaultEnabled: true
  },
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
