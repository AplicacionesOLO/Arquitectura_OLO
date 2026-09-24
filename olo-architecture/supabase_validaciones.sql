-- Validación de procesos y pasos (historial: solo se agregan filas; el estado
-- vigente de cada paso/proceso es su fila más reciente).
--  · paso = índice del paso en la ficha (0…n-1); null = el proceso completo.
--  · texto_paso guarda el texto validado: si la ficha cambia después, la
--    validación queda "desactualizada" y hay que revisarla de nuevo.
create table if not exists public.procesos_validaciones (
  id              bigserial primary key,
  codigo          text not null,
  paso            int,
  estado          text not null check (estado in ('validado','corregir')),
  comentario      text,
  correccion      text,
  texto_paso      text,
  validado_por    uuid,
  validado_nombre text,
  created_at      timestamptz not null default now()
);
create index if not exists procesos_validaciones_codigo_idx on public.procesos_validaciones (codigo, paso, created_at desc);

-- Quién valida lo pone la base (no el navegador)
create or replace function public.procesos_validaciones_autor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.validado_por := auth.uid();
  new.validado_nombre := (select coalesce(nullif(nombre, ''), email) from public.profiles where id = auth.uid());
  new.created_at := now();
  return new;
end $$;
drop trigger if exists procesos_validaciones_autor on public.procesos_validaciones;
create trigger procesos_validaciones_autor before insert on public.procesos_validaciones
  for each row execute function public.procesos_validaciones_autor();

alter table public.procesos_validaciones enable row level security;
drop policy if exists procesos_validaciones_select_authenticated on public.procesos_validaciones;
create policy procesos_validaciones_select_authenticated on public.procesos_validaciones
  for select using (auth.uid() is not null);
drop policy if exists procesos_validaciones_insert_if_editor on public.procesos_validaciones;
create policy procesos_validaciones_insert_if_editor on public.procesos_validaciones
  for insert with check (current_user_role() = any (array['admin','editor']));
