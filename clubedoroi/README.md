# Clube do ROI — plataforma de membros (web app)

Web app instalável (PWA) para os membros do Clube do ROI. Funciona como aplicativo no celular ("Adicionar à tela inicial"), sem precisar de Play Store ou App Store.

Endereço: https://eventos.v8.ia.br/clubedoroi/

## O que tem
- **Login e várias contas:** cadastro e login por e-mail e senha (e link mágico com Supabase). Dá para manter várias contas no mesmo aparelho e alternar entre elas.
- **Papéis:** membro, mentor e admin.
- **Jornada do membro:** 7 etapas com progresso individual. Algumas são concluídas automaticamente: perfil, encontro, conexões, biblioteca, diagnóstico e plano.
- **Isolamento:** a jornada, os diagnósticos, o plano e as notificações de cada membro são privados, protegidos por RLS no Supabase.
- **Perfil empresarial:** empresa, segmento, faturamento, equipe, cidade, objetivos e foto.
- **Agenda:** eventos, confirmação de presença, lista no celular e calendário mensal no desktop.
- **Comunidade:** diretório com busca e filtros, pedidos de conexão, "minha rede" e mensagens diretas entre conexões.
- **Biblioteca, mentores** (com solicitação de mentoria), **diagnóstico empresarial** (8 áreas), **plano de 90 dias**, **relatórios** e **notificações**.
- **Admin** (`#/admin`): membros e papéis, etapas, eventos, materiais, mentores e solicitações.

## Modos de dados
- **Demonstração** (`config.js` vazio): os dados ficam no navegador (localStorage). Contas de teste:
  - membro: `ricardo@clubedoroi.com.br` / `roi2025`
  - mentora: `mentor@clubedoroi.com.br` / `mentor2025`
  - admin: `admin@clubedoroi.com.br` / `admin2025`
- **Produção (Supabase):**
  1. Crie um projeto no Supabase (região `sa-east-1`).
  2. Rode `supabase/schema.sql` no SQL Editor.
  3. Em Authentication › URL Configuration, coloque `https://eventos.v8.ia.br/clubedoroi/` como Site URL.
  4. Preencha `config.js` com a Project URL e a chave publishable/anon.
  5. Crie sua conta pelo app e promova-a a admin com o comando no fim do `schema.sql`.

## Publicação
GitHub Pages do repositório `v8-eventos`, na pasta `/clubedoroi/`. Todos os caminhos são relativos, então a pasta pode ir para um subdomínio próprio (ex.: `clubedoroi.v8.ia.br`) sem mudar o código.
