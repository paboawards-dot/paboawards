-- =====================================================================
--  PABO AWARDS — RÉINITIALISATION (OPTIONNEL, DESTRUCTIF)
--  À exécuter UNIQUEMENT si vous réutilisez l'ancien projet Supabase.
--  Cela SUPPRIME toutes les anciennes tables du site (candidats, votes,
--  catégories, etc.). Les comptes (Authentication > Users) sont conservés.
--  Si vous créez un NOUVEAU projet Supabase : n'exécutez PAS ce fichier.
-- =====================================================================

-- anciennes règles d'accès au stockage "media"
do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects'
             and (policyname ilike '%media%')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
