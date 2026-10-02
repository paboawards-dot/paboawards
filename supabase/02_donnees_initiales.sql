-- =====================================================================
--  PABO AWARDS — DONNÉES INITIALES (3 univers, 15 catégories, réglages)
--  À exécuter APRÈS 01_schema.sql
-- =====================================================================
insert into public.settings (id, votes_enabled, selections_at, votes_open_at, votes_close_at, ceremony_at,
  vote_unit_price, contact_phone, contact_whatsapp, facebook_url)
values (1, true,
  '2026-10-06 00:00:00+00', '2026-11-06 00:00:00+00',
  '2026-12-06 23:59:59+00', '2026-12-19 18:00:00+00',      -- clôture & cérémonie : dates PROVISOIRES, à régler dans l'admin
  100, '+225 07 18 27 57 97', '2250718275797', null)
on conflict (id) do nothing;

insert into public.universes (slug, name, tagline, color, sort) values
  ('musique-danse',        'Musique & Danse',        'Les voix et les pas qui font vibrer le Bounkani', '#8b5cf6', 1),
  ('digital-medias',       'Digital & Médias',       'Ceux qui font parler le Bounkani en ligne',        '#2f6bff', 2),
  ('culture-evenementiel', 'Culture & Événementiel', 'Les lieux, les sons et les fêtes qui rassemblent', '#ff6a3d', 3)
on conflict (slug) do nothing;

insert into public.categories (slug, name, universe_id, color, emoji, sort)
select v.slug, v.name, u.id, v.color, v.emoji, v.sort
from (values
  ('artiste-masculin',      'Meilleur artiste masculin musicien du PABO Awards',      'musique-danse',        '#8b5cf6', '🎤',  1),
  ('artiste-feminine',      'Meilleure artiste féminine musicienne du PABO Awards',   'musique-danse',        '#ec4899', '🎙️',  2),
  ('artiste-international', 'Meilleur artiste international de l’année',              'musique-danse',        '#06b6d4', '🌍',  3),
  ('danse',                 'Meilleure troupe de danse ou meilleur danseur/chorégraphe','musique-danse',      '#f43f5e', '💃',  4),
  ('revelation',            'Révélation artistique de l’année',                       'musique-danse',        '#fbbf24', '🌟',  5),
  ('talent-emergent',       'Talent émergent du Bounkani',                            'musique-danse',        '#22c55e', '🌱',  6),
  ('tiktok-masculin',       'Meilleur influenceur TikTok masculin de l’année',        'digital-medias',       '#3b82f6', '🤳',  7),
  ('tiktok-feminine',       'Meilleure influenceuse TikTok féminine de l’année',      'digital-medias',       '#d946ef', '💅',  8),
  ('createur-contenu',      'Meilleur créateur de contenu de l’année',                'digital-medias',       '#14b8a6', '🎬',  9),
  ('maquis-bar-discotheque','Meilleur maquis, bar ou discothèque de l’année',         'culture-evenementiel', '#f97316', '🍹', 10),
  ('manager',               'Meilleur manager de bar/artiste de l’année',             'culture-evenementiel', '#ef4444', '🤝', 11),
  ('media-blog',            'Meilleur média/blog de l’année',                         'digital-medias',       '#6366f1', '📰', 12),
  ('dj',                    'Meilleur DJ de l’année',                                 'culture-evenementiel', '#a855f7', '🎧', 13),
  ('photographe',           'Meilleur photographe de l’année',                        'digital-medias',       '#0ea5e9', '📸', 14),
  ('festival',              'Meilleur festival international de l’année',             'culture-evenementiel', '#eab308', '🎪', 15)
) as v(slug, name, universe, color, emoji, sort)
join public.universes u on u.slug = v.universe
on conflict (slug) do nothing;

insert into public.partners (name, role, description, logo_url, sort)
select * from (values
  ('Esprit Guerrier', 'Organisateur', 'Esprit Guerrier présente les PABO Awards, le prix qui célèbre les talents du Bounkani.', '/partners/esprit-guerrier.jpg', 1),
  ('EMPIRE D’OR', 'Partenaire technique', 'En charge de la gestion et de la sécurisation du système de vote et de paiement.', '/partners/empire-dor.jpg', 2)
) as v(name, role, description, logo_url, sort)
where not exists (select 1 from public.partners);

insert into public.news (title, body, images)
select 'Les PABO Awards arrivent !',
       'Lancement des sélections candidats le 6 octobre 2026. Début des votes le 6 novembre 2026. Prépare-toi à soutenir ton artiste du Bounkani !',
       array['/competition/flyer.jpg']
where not exists (select 1 from public.news);
