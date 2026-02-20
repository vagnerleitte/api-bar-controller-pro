# API Bar Controller Pro - Auth V1 + Feature Toggle + Tenants

API inicial de autenticação REST com isolamento lógico por tenant e estrutura de feature toggle.

## Stack
- Node.js + TypeScript
- Fastify
- PostgreSQL
- Prisma
- Argon2
- JWT (access token curto) + refresh token rotativo (hasheado)

## Estrutura de pastas
- `src/config`: env e configuração
- `src/plugins`: CORS, JWT, rate limit, feature toggle plugin
- `src/modules/auth`: rotas, controller, service, middleware e utilitários de auth
- `src/modules/feature-toggle`: catálogo, service, middleware guard e rotas
- `src/shared`: cliente Prisma
- `prisma/schema.prisma`: modelo de dados
- `prisma/migrations`: migrations SQL
- `prisma/seed.ts`: seed mínimo
- `docs/auth-flow.curl`: fluxo de teste
- `docs/openapi-auth-v1.yaml`: contrato OpenAPI da auth

## Setup rápido
1. Copie `.env.example` para `.env`.
2. Ajuste `DATABASE_URL` e segredos.
3. Instale dependências:
   - `npm install`
4. Gere cliente Prisma e aplique migration:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
5. Rode seed:
   - `npm run prisma:seed`
6. Suba API em dev:
   - `npm run dev`

## Setup com Docker
1. Suba tudo:
   - `docker compose up -d --build`
2. API:
   - `http://localhost:3002`
3. Swagger:
   - `http://localhost:3002/docs`
4. Prisma Studio:
   - `http://localhost:5555`
5. Parar tudo:
   - `docker compose down`

Observações:
- O banco já é criado automaticamente com `POSTGRES_DB=bar_controller_pro`.
- A API roda migrations + seed ao iniciar o container.

## Seed padrão
- Tenant: `Bar Demo`
- ID do estabelecimento (tenantId): `11111111-1111-1111-1111-111111111111`
- Usuário admin:
  - CPF (apenas referência do cadastro): `12345678901`
  - Senha: `Admin@123`

## Endpoints de auth
- `POST /auth/register`
  - body: `{ personName, establishmentName, document, address, email?, phone, password }`
  - cria tenant + usuário admin e já retorna `user + tokens`
- `POST /auth/login`
  - body: `{ establishmentId, password }`
  - retorna: `user + tokens`
- `POST /auth/refresh`
  - body: `{ refreshToken }`
  - retorna: `tenantId + tokens` (com rotação de refresh)
- `POST /auth/logout`
  - body: `{ refreshToken }`
  - retorna: `204`
- `GET /auth/me`
  - header: `Authorization: Bearer <accessToken>`
  - retorna usuário autenticado

## Endpoints de tenants (backoffice)
- `GET /admin/tenants`
  - protegido por JWT + role `admin`
  - lista tenants
- `GET /admin/tenants/:tenantId`
  - protegido por JWT + role `admin`
  - detalha tenant
- `POST /admin/tenants`
  - protegido por JWT + role `admin`
  - body: `{ "name": "Bar Centro" }`
  - cria tenant
- `PATCH /admin/tenants/:tenantId`
  - protegido por JWT + role `admin`
  - body: `{ "name": "Novo Nome" }`
  - atualiza nome do tenant

## Feature Toggle (novo)
### Como funciona
- Catálogo em código: `src/modules/feature-toggle/feature-catalog.ts`
- Valor base por feature:
  - primeiro tenta override via env (`FEATURE_FLAGS`)
  - se não existir, usa `defaultEnabled` do catálogo
- Override por tenant no banco em `tenant_feature_toggles`
- Guard reutilizável para rota: `requireFeature('featureKey')`

### Endpoints de feature
- `GET /features/me`
  - protegido por JWT
  - retorna todas as features resolvidas para o tenant logado (`source: default | env | tenant`)
- `GET /features/advanced-reports/ping`
  - exemplo de rota protegida por `requireFeature('advancedReports')`
- `GET /admin/tenants/:tenantId/features`
  - protegido por JWT + role `admin`
  - lista features resolvidas de qualquer tenant (uso de backoffice)
- `PUT /admin/tenants/:tenantId/features/:featureKey`
  - protegido por JWT + role `admin`
  - body: `{ "enabled": true|false }`
  - faz override por tenant em `tenant_feature_toggles`

### Configuração por env
- Variável: `FEATURE_FLAGS`
- Formato: `key:on|off,key2:on|off`
- Exemplo:
  - `FEATURE_FLAGS=salesModule:on,inventoryModule:off,advancedReports:on`

### Override por tenant
- Tabela: `tenant_feature_toggles`
- Chave única: `(tenantId, featureKey)`
- Se existir linha para o tenant, ela sobrescreve env/default.

## Regras de segurança implementadas
- Login por ID do estabelecimento + senha
- Usuário inativo bloqueado (`403`)
- `passwordHash` nunca retorna na API
- refresh token salvo apenas como hash no banco
- validação de tenant em sessão (`tenantId` no JWT e comparação com banco)
- rate limit em `/auth/login`
- CORS configurável por env
- mensagens padrão:
  - `400` payload inválido
  - `401` credenciais/token inválido
  - `403` usuário inativo / feature bloqueada
  - `429` rate limit
  - `500` erro interno

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`
- `npm run prisma:seed`

## Teste do fluxo completo
Use os comandos em `docs/auth-flow.curl`.
