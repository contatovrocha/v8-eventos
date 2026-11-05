# Clube do ROI — plataforma de membros (web app)

Web app instalável (PWA) para os membros do Clube do ROI. Funciona como aplicativo no celular ("Adicionar à tela inicial"), sem precisar de Play Store ou App Store.

Endereço: https://eventos.v8.ia.br/clubedoroi/

## O que tem

Segue o documento "Experiência do membro e processo de onboarding".

**Fase 1 (essencial)**
- **Etapa 1, cadastro no jantar** (`Admin › Novo membro`): nome, telefone, e-mail, empresa, responsável pelo relacionamento, data da aquisição e observações.
- **Etapa 2, contato individualizado:** a ficha do membro traz a mensagem de boas-vindas pronta, com os botões *Copiar mensagem*, *Abrir no WhatsApp* e *Gerar acesso*.
- **Etapa 3, primeiro acesso:** login individual, só para e-mails cadastrados pela equipe, seguido da apresentação do clube e da jornada.
- **Etapa 4, formulário de onboarding:** os 5 blocos com as 31 perguntas e a pergunta estratégica dos 90 dias. As respostas são salvas automaticamente, com indicador de progresso.
- **Etapa 5, conclusão:** tela "Você está oficialmente integrado" com o botão *Acessar Grupo VIP*. A entrada pode ser controlada: o membro solicita e a equipe libera.
- **Painel administrativo:** funil por status, alerta de membro parado no processo e todas as respostas.

**Etapas seguintes**
- **Etapa 6, ficha estratégica** (interna): perfil, segmento, porte, desafios, objetivos, oportunidades, conexões sugeridas a partir das respostas, mentores e próximos passos.
- **Etapa 7, reunião estratégica:** agendamento com a pauta do documento. O membro é avisado e a etapa fecha quando a reunião é marcada como realizada.
- **Etapa 8, Meu Plano de Desenvolvimento:** objetivos, prioridades, oportunidades, ações com responsável e prazo, e histórico de evolução.
- **Etapa 9, experiência contínua:** comunidade (liberada após o onboarding), conexões e mensagens, mentores, agenda, biblioteca e relatórios.
- **Equipe:** responsáveis por cada parte do processo (`Admin › Equipe`).

## Modos de dados
- **Demonstração** (`config.js` vazio): os dados ficam no navegador (localStorage). Contas de teste:
  - membro em onboarding (falta o bloco 5): `ricardo@clubedoroi.com.br` / `roi2025`
  - mentora: `mentor@clubedoroi.com.br` / `mentor2025`
  - admin: `admin@clubedoroi.com.br` / `admin2025`
- **Produção (Supabase):**
  1. Crie um projeto no Supabase (região `sa-east-1`).
  2. Rode `supabase/schema.sql` no SQL Editor.
  3. Em Authentication › URL Configuration, coloque `https://eventos.v8.ia.br/clubedoroi/` como Site URL.
  4. Preencha `config.js` com a Project URL e a chave publishable/anon.
  5. Crie sua conta em "Primeiro acesso" (o primeiro usuário é liberado mesmo sem convite) e promova-a a admin com o comando no fim do `schema.sql`. A partir daí, só entra quem a equipe cadastrar em `Admin › Novo membro`.
  6. Em `Admin › Grupo VIP`, cole o link do grupo. No WhatsApp, ative "Aprovar novos participantes" para que ninguém entre sem aprovação, mesmo que o link vaze.

## Publicação
GitHub Pages do repositório `v8-eventos`, na pasta `/clubedoroi/`. Todos os caminhos são relativos, então a pasta pode ir para um subdomínio próprio (ex.: `clubedoroi.v8.ia.br`) sem mudar o código.
