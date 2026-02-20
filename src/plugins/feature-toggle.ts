import fp from 'fastify-plugin';
import { FeatureKey } from '../modules/feature-toggle/feature-catalog';
import { isFeatureEnabled } from '../modules/feature-toggle/feature-toggle.service';

declare module 'fastify' {
  interface FastifyInstance {
    featureToggle: {
      isEnabled: (feature: FeatureKey, tenantId: string) => Promise<boolean>;
    };
  }
}

export const featureTogglePlugin = fp(async (app) => {
  app.decorate('featureToggle', {
    isEnabled: isFeatureEnabled
  });
});
