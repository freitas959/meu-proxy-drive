-- ============================================================================
-- CarrosseIA — bucket de imagens
-- Já aplicado no projeto oqmonbwiwqyxtphrglsg, depois do 01-esquema.sql.
-- ============================================================================

-- Bucket privado: nada é servido sem URL assinada. As capas são conteúdo do
-- usuário e não devem ficar acessíveis por adivinhação de endereço.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'carrosseia',
  'carrosseia',
  false,
  8388608,                                    -- 8 MB por arquivo
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- O caminho de cada arquivo é {usuario_id}/{projeto_id}/{indice}.png, então a
-- primeira pasta identifica o dono. É isso que as políticas conferem.
drop policy if exists carrosseia_ler on storage.objects;
create policy carrosseia_ler on storage.objects
  for select to authenticated
  using (
    bucket_id = 'carrosseia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists carrosseia_enviar on storage.objects;
create policy carrosseia_enviar on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'carrosseia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists carrosseia_substituir on storage.objects;
create policy carrosseia_substituir on storage.objects
  for update to authenticated
  using (
    bucket_id = 'carrosseia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists carrosseia_apagar on storage.objects;
create policy carrosseia_apagar on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'carrosseia'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
