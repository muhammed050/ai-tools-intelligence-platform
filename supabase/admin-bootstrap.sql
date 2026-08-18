update public.profiles p set role='admin',updated_at=now() from auth.users u where p.id=u.id and u.email='dakarlem050@gmail.com';
