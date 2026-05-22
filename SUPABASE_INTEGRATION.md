# Integração do EcoSmart com Supabase

Este projeto já tem uma API Django em funcionamento. Portanto, a migração mais simples e segura é usar o Supabase como banco PostgreSQL em nuvem, mantendo o React chamando a API Django por `src/lib/api.ts`.

Assim você não precisa reescrever as telas para usar `@supabase/supabase-js` agora. O Django continua cuidando de login, permissões, serializers e regras de negócio; o Supabase entra como banco remoto.

## O que mudou no código

- `settings.py` agora aceita `DATABASE_URL`, formato comum no Supabase.
- `settings.py` também aceita `POSTGRES_SSLMODE=require`, necessário para conexão em nuvem.
- `.env.example` documenta as variáveis para SQLite local, Postgres local e Supabase.

## Passo a passo

### 1. Criar o projeto no Supabase

No painel do Supabase:

1. Crie um projeto.
2. Vá em **Project Settings > Database**.
3. Copie a connection string PostgreSQL.
4. Substitua `[YOUR-PASSWORD]` pela senha do banco.

Use preferencialmente uma URL neste formato:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

Também funciona com variáveis separadas:

```env
DATABASE_ENGINE=postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SUA_SENHA
POSTGRES_HOST=db.SEU_PROJECT_REF.supabase.co
POSTGRES_PORT=5432
POSTGRES_SSLMODE=require
```

Se `DATABASE_URL` estiver definida, ela tem prioridade.

### 2. Configurar o `.env`

Copie o exemplo:

```bash
cp .env.example .env
```

Depois ajuste o `.env` com as credenciais do Supabase.

Para frontend local, mantenha:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Criar as tabelas no Supabase

Como este projeto usa Django models em `ecosmart/models.py`, não é necessário criar as tabelas manualmente pelo SQL Editor.

Ative o ambiente virtual antes de rodar comandos Django:

```bash
source .venv/bin/activate
```

Rode:

```bash
python manage.py migrate
```

O Django vai criar no Supabase as tabelas do app, como:

- `ecosmart_usuario`
- `ecosmart_tiporesiduo`
- `ecosmart_instituicao`
- `ecosmart_usuarioinstituicao`
- `ecosmart_pontocoleta`
- `ecosmart_descarte`
- `ecosmart_pedidocoleta`
- `ecosmart_conteudoeducativo`

### 4. Popular dados de teste

Para criar os usuários e dados iniciais:

```bash
python manage.py seed_db
```

### 5. Rodar o projeto

Backend:

```bash
python manage.py runserver
```

Frontend:

```bash
npm run dev
```

O frontend continua chamando o Django pela URL configurada em `VITE_API_URL`.

## Migrar dados do SQLite local para Supabase

Se você já tem dados no `db.sqlite3`, faça um dump antes de trocar o `.env` para Supabase:

```bash
python manage.py dumpdata ecosmart --indent 2 > ecosmart-data.json
```

Depois configure o `.env` para Supabase, rode as migrations e importe:

```bash
python manage.py migrate
python manage.py loaddata ecosmart-data.json
```

Se houver conflitos de dados duplicados, especialmente e-mails ou CNPJs únicos, limpe o banco remoto ou ajuste o arquivo antes de importar.

## Supabase Auth e RLS

Neste momento o projeto não usa Supabase Auth diretamente. Ele usa a tabela `ecosmart_usuario`, senha com hash do Django e token próprio gerado em `ecosmart/auth.py`.

Por isso, não habilite Row Level Security esperando que `auth.uid()` proteja essas tabelas: as consultas são feitas pelo backend Django, não pelo cliente Supabase no navegador.

Se no futuro você quiser trocar para Supabase Auth direto no React, aí sim será uma migração maior:

- instalar `@supabase/supabase-js`;
- criar `src/lib/supabase.ts`;
- reescrever `AuthContext.tsx`;
- adaptar IDs de usuário para UUID;
- criar políticas RLS;
- substituir chamadas de `apiFetch` por queries Supabase ou Edge Functions.

Para o código atual, a troca recomendada é: Django API + Supabase PostgreSQL.

## Checklist

- [ ] Criar projeto no Supabase.
- [ ] Copiar connection string PostgreSQL.
- [ ] Configurar `.env` com `DATABASE_URL` ou `POSTGRES_*`.
- [ ] Garantir `sslmode=require`.
- [ ] Rodar `python manage.py migrate`.
- [ ] Rodar `python manage.py seed_db` ou importar dados existentes.
- [ ] Rodar backend e frontend.
- [ ] Testar login, cadastro, descartes, pedidos e painéis.
