-- ⚠️ ATENÇÃO: Execute este script no SQL Editor do Supabase Dashboard
-- Isso corrige ERROS DE LOGIN, CADASTRO e PERMISSÕES.

-- 1. Recarregar cache do Schema (Vital para corrigir erro PGRST204)
NOTIFY pgrst, 'reload schema';

-- 2. Garantir que a coluna 'plan' existe (Evita erro de coluna não encontrada)
ALTER TABLE "public"."tenants" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'FREE';

-- 3. Permitir que novos usuários criem suas lojas (Tenants)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."tenants";

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."tenants" 
FOR INSERT TO "authenticated" 
WITH CHECK (true);

-- 3.1 Permitir LEITURA (Necessário para retornar o ID da loja criada)
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON "public"."tenants";

CREATE POLICY "Enable select for authenticated users only" 
ON "public"."tenants" 
FOR SELECT TO "authenticated" 
USING (true);

-- 4. Garantir permissões na tabela Profiles
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."profiles";

CREATE POLICY "Enable insert for users based on user_id" 
ON "public"."profiles" 
FOR INSERT TO "authenticated" 
WITH CHECK (auth.uid() = id);

-- 5. Verificar se funcionou
SELECT * FROM information_schema.tables WHERE table_name = 'tenants';

