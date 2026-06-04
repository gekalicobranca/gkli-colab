insert into gkli_flex.colaboradores (
  id,
  nome,
  email,
  auth_user_id,
  status,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  initcap(replace(split_part(users.email, '@', 1), '.', ' ')),
  users.email,
  users.id,
  'ativo',
  now(),
  now()
from auth.users
where users.email in (
  'camila.paganini@gekali.com.br',
  'danielle.lima@gekali.com.br',
  'fanny.paganini@gekali.com.br',
  'edi.neves@gekali.com.br',
  'julio.baia@gekali.com.br'
)
on conflict (email)
do update set
  nome = excluded.nome,
  auth_user_id = excluded.auth_user_id,
  status = 'ativo',
  updated_at = now();
