-- Promote the primary site administrator after the Auth account exists.
-- Safe to run more than once.
update public.profiles p
set role='admin',
    updated_at=now()
from auth.users u
where p.id=u.id
  and lower(u.email)=lower('dakarlem050@gmail.com');

-- If the profile trigger did not create a row for any reason, create it now.
insert into public.profiles(id, role, full_name, display_name)
select u.id, 'admin', 'Muhammed Dakarli', 'Muhammed Dakarli'
from auth.users u
where lower(u.email)=lower('dakarlem050@gmail.com')
  and not exists (select 1 from public.profiles p where p.id=u.id);
