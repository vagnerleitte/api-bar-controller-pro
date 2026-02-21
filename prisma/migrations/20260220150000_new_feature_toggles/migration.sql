INSERT INTO "feature_toggles" ("key", "description", "defaultEnabled", "createdAt", "updatedAt")
VALUES
  ('mensalistas', 'Gestao de mensalistas', false, NOW(), NOW()),
  ('comandas', 'Gestao de comandas', true, NOW(), NOW()),
  ('vendasAvulsas', 'Vendas avulsas', true, NOW(), NOW()),
  ('relatorios', 'Relatorios', false, NOW(), NOW()),
  ('usuarios', 'Gestao de usuarios', true, NOW(), NOW()),
  ('cadastro', 'Cadastro', true, NOW(), NOW())
ON CONFLICT ("key") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "defaultEnabled" = EXCLUDED."defaultEnabled",
  "updatedAt" = NOW();
