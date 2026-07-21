select setval(
    pg_get_serial_sequence('public.users', 'id'),
    (select coalesce(max(id), 0) + 1 from public.users),
    false
);
