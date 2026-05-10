-- Exemple de taula per Supabase (ajusta noms / RLS al teu projecte).
-- El client fa: .from('distribucio_linies').select('*').eq('route_id', rutaId)

create table if not exists public.distribucio_linies (
  id bigint generated always as identity primary key,
  route_id text not null,
  parada_index int not null,
  producte_id text not null,
  producte_nom text,
  material_id text,
  material_nom text,
  quantitat numeric not null check (quantitat > 0),
  unitat text not null,
  pes_kg_per_unitat numeric not null check (pes_kg_per_unitat > 0)
);

create index if not exists distribucio_linies_route_id_idx on public.distribucio_linies (route_id);

alter table public.distribucio_linies enable row level security;

-- Permís de lectura pública amb anon key (hackathon; restringeix en producció).
drop policy if exists "distribucio_linies_select_anon" on public.distribucio_linies;
create policy "distribucio_linies_select_anon"
  on public.distribucio_linies
  for select
  to anon
  using (true);
