# PABO AWARDS — Guide de mise en ligne (pas à pas)

Ce projet est un **projet neuf et complet** (Next.js 14 + Supabase + CinetPay).
Il remplace entièrement l'ancien : on ne mélange rien avec l'ancien code.

---------------------------------------------------------------------
## ÉTAPE 1 — Supabase (base de données)
---------------------------------------------------------------------
1. Ouvre ton projet Supabase → menu **SQL Editor** → **New query**.
2. **Si tu réutilises l'ancien projet Supabase** (celui qui contient déjà l'ancien site) :
   ouvre le fichier `supabase/00_reset_OPTIONNEL.sql`, copie tout, colle, clique **Run**.
   ⚠️ Cela efface les anciennes tables (anciens candidats/catégories). Les comptes (Authentication) restent.
   *Si tu crées un nouveau projet Supabase, saute cette étape.*
3. Nouvelle requête → colle `supabase/01_schema.sql` → **Run** (doit afficher « Success »).
4. Nouvelle requête → colle `supabase/02_donnees_initiales.sql` → **Run**
   (crée les 3 univers, les 15 catégories, les dates provisoires, Esprit Guerrier / EMPIRE D'OR).
5. **Compte admin** : Supabase → **Authentication → Users → Add user** (e-mail + mot de passe)
   *(si ton compte admin existe déjà, saute cette partie)*.
   Puis ouvre `supabase/03_creer_admin.sql`, remplace `REMPLACEZ-PAR-VOTRE-EMAIL@exemple.com` par ton e-mail, **Run**.
   Tu dois voir 1 ligne avec ton e-mail.
6. Récupère les clés : **Project Settings → API** :
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - clé `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - clé `service_role` (secrète !) → `SUPABASE_SERVICE_ROLE_KEY`

---------------------------------------------------------------------
## ÉTAPE 2 — GitHub (le code)
---------------------------------------------------------------------
Le plus sûr : **un nouveau dépôt propre**.
1. GitHub → **New repository** → nom : `pabo-awards-v2` → Private → Create.
2. **Add file → Upload files**. Décompresse le zip sur ton ordinateur, puis envoie les fichiers
   **en 2 fois** (GitHub accepte 100 fichiers max par envoi) :
   - 1er envoi : le dossier **`app`** (glisse le dossier entier).
   - 2e envoi : **tout le reste** (dossiers `components`, `lib`, `public`, `supabase` + les fichiers
     `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, `middleware.ts`,
     `.gitignore`, `.env.example`, `GUIDE-DEPLOIEMENT.md`).
   - Après chaque envoi : **Commit changes**.
3. Vérifie sur GitHub que tu vois bien à la racine : `app`, `components`, `lib`, `public`, `supabase`, `package.json`, `middleware.ts`…
   (⚠️ `middleware.ts` doit être À LA RACINE, pas dans un dossier.)

---------------------------------------------------------------------
## ÉTAPE 3 — Vercel (mise en ligne)
---------------------------------------------------------------------
Utilise ton bon projet Vercel (celui nommé **pabo**) :
1. Vercel → projet **pabo** → **Settings → Git** → *Disconnect*, puis **Connect Git Repository** → choisis `pabo-awards-v2`
   (branche `main`).
   *(Ou bien : Add New → Project → Import `pabo-awards-v2`.)*
2. **Settings → Environment Variables** : ajoute (pour Production, Preview et Development) :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role |
| `CINETPAY_API_KEY` | ta clé API CinetPay |
| `CINETPAY_SITE_ID` | ton Site ID CinetPay |
| `NEXT_PUBLIC_SITE_URL` | l'adresse du site, **sans « / » final**, ex : `https://pabo.vercel.app` |
| `IP_HASH_SALT` | un long texte au hasard (40 caractères) |

3. **Deployments → Redeploy** (ou fais un nouveau commit). Attends « Ready ».
4. Si le build échoue : copie-moi le message d'erreur exact (les dernières lignes rouges).

---------------------------------------------------------------------
## ÉTAPE 4 — CinetPay
---------------------------------------------------------------------
1. Dans ton back-office CinetPay, récupère **API KEY** et **SITE ID** (étape 3).
2. Vérifie que ton compte CinetPay est **activé** pour : Orange Money, MTN Money, Moov Money, Wave,
   et pour chaque **pays** que tu acceptes (la liste des pays du site : Côte d'Ivoire, Burkina, Mali,
   Sénégal, Togo, Bénin, Niger — tu peux la réduire dans `lib/config.ts` → `COUNTRIES`).
3. Les adresses de notification et de retour sont envoyées **automatiquement** par le site à chaque paiement :
   - notification : `https://TON-SITE/api/cinetpay/notify`
   - retour client : `https://TON-SITE/carte/<n° de transaction>`
   (Si CinetPay te demande une « URL de notification » par défaut dans son tableau de bord, mets la première.)
4. **Test réel** : vote 1 fois (100 FCFA). Tu dois être renvoyé vers CinetPay, payer, puis revenir sur la
   **carte de vote**. Vérifie dans Admin → Transactions que le statut est `confirmed`.
   Si un paiement reste `pending` : Admin → Tableau de bord → **Vérifier les paiements en attente**.

---------------------------------------------------------------------
## ÉTAPE 5 — Administration
---------------------------------------------------------------------
- Adresse : `https://TON-SITE/admin/login` (un seul administrateur : celui de l'étape 1.5).
- Dans l'ordre : **Paramètres** (dates, contact) → **Candidats** (ajouter nom, catégorie, photo, bio) →
  **Actualités** → **Partenaires**.
- Dates provisoires déjà mises : sélections 6 octobre 2026 · **votes 6 novembre 2026** (selon l'affiche) ·
  clôture 6 décembre 2026 · cérémonie 19 décembre 2026. **À corriger dans Paramètres.**
- Pour tester un vote avant le 6 novembre : mets temporairement la date d'ouverture dans le passé (puis remets-la).

---------------------------------------------------------------------
## Logos des moyens de paiement
---------------------------------------------------------------------
Les 4 cartes utilisent des visuels simples (`public/pay/orange.svg`, `mtn.svg`, `moov.svg`, `wave.svg`).
Pour mettre les logos officiels : remplace ces 4 fichiers par les vrais (même nom, format SVG).

## Sécurité en place (sans ralentir le site)
- Les votes ne sont comptés que par le serveur, après relecture du paiement auprès de CinetPay + contrôle du montant.
- Un même paiement ne peut jamais créditer deux fois (verrou en base).
- Le montant est recalculé par le serveur ; le navigateur n'écrit jamais dans la base.
- Les votes ne sont modifiables ni depuis le site, ni depuis l'admin (garde-fou en base).
- Limites anti-abus UNIQUEMENT sur le lancement d'un paiement (pas sur les pages, pas sur l'admin, pas sur CinetPay).
- Admin : connexion obligatoire + autorisation vérifiée à chaque action + journal d'activité.
- En-têtes de sécurité légers (aucun blocage d'API ou de source externe).
