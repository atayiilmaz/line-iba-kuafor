do $$
declare
  owner_user_id uuid := '89a2d5d1-291a-4e20-938c-3bfb36d723ce';
begin
  if not exists (
    select 1
    from auth.users
    where id = owner_user_id
      and lower(email) = 'lineiba@admin.com'
  ) then
    raise exception 'Expected Line Cadde Auth user was not found; admin authorization was not changed.';
  end if;

  insert into public.admin_profiles (user_id, role, display_name)
  values (owner_user_id, 'owner', 'Line Cadde')
  on conflict (user_id) do update
  set role = excluded.role,
      display_name = excluded.display_name;
end;
$$;
