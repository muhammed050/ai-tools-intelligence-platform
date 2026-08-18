-- Replace YOUR_ADMIN_EMAIL with the email of the account you intentionally want to promote.
update public.profiles p set role='admin',updated_at=now() from auth.users u where p.id=u.id and u.email='YOUR_ADMIN_EMAIL';
