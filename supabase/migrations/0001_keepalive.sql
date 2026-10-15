-- BROUILLON NON TESTÉ contre un vrai projet Supabase.
-- À exécuter à la main dans l'éditeur SQL de Supabase (voir docs/03-guide-demarrage.md).
--
-- But : une table minuscule, lisible publiquement, qui sert uniquement à
-- recevoir une requête de lecture toutes les quelques jours (keepalive.yml).
-- Elle ne contient aucune donnée personnelle.

create table if not exists public.keepalive (
  id integer primary key,
  note text not null default 'ping'
);

insert into public.keepalive (id) values (1)
on conflict (id) do nothing;

-- Sécurité : RLS activé, lecture seule autorisée pour le rôle public "anon".
alter table public.keepalive enable row level security;

drop policy if exists "keepalive_lecture_publique" on public.keepalive;
create policy "keepalive_lecture_publique"
  on public.keepalive
  for select
  to anon
  using (true);

-- Aucune politique d'écriture : personne ne peut modifier cette table
-- depuis le navigateur.
