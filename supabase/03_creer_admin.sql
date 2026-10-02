-- =====================================================================
--  PABO AWARDS — DÉSIGNER L'UNIQUE ADMINISTRATEUR
--  1) Supabase > Authentication > Users > "Add user" (e-mail + mot de passe)
--     (si le compte existe déjà, passez directement à l'étape 2)
--  2) Remplacez l'e-mail ci-dessous par celui de l'admin, puis exécutez.
-- =====================================================================
insert into public.admin_users (user_id)
select id from auth.users where email = 'REMPLACEZ-PAR-VOTRE-EMAIL@exemple.com'
on conflict do nothing;

-- Vérification : doit afficher 1 ligne
select u.email from public.admin_users a join auth.users u on u.id = a.user_id;
