# Clube do RØI Network

Rede privada dos membros do Clube do RØI. É um web app instalável (PWA): no celular, use "Adicionar à tela inicial", sem loja de aplicativos.

Endereço: https://eventos.v8.ia.br/clubedoroi/

## O que tem
- Feed com publicações (conquistas, cases, oportunidades), curtidas, comentários e compartilhamento.
- Diretório de membros, perfis com empresa, serviços, contatos e indicadores de negócios.
- Conexões, seguidores, interesse em fazer negócio e registro de negócios com confirmação da outra parte.
- Eventos com calendário, destaques e interessados.
- Notificações em tempo real, configurações de privacidade e exportação de dados (LGPD).
- Painel administrativo com papéis e permissões, banners, moderação, negócios, eventos e auditoria.

## Identidade visual
Fundo preto, superfícies de vidro fosco, títulos grandes em caixa alta (Inter Tight), pílulas com borda fina, botão principal branco e barra de navegação flutuante. Nas páginas de perfil e de evento, a imagem da capa tinge o fundo.

## Arquivos
- `index.html`: casca do app, metatags de PWA e fontes.
- `app.css`: identidade visual.
- `app.js`: o app inteiro (rotas, telas e chamadas ao Supabase).
- `vendor/supabase-2.65.0.js`: cliente oficial do Supabase.
- `sw.js`, `manifest.webmanifest`, `icons/`: instalação no celular.

## Backend
Supabase do projeto `fazwyyjgnpcicoicwagn`. A URL e a chave publicável ficam no topo do `app.js`.
Para os links de convite e de redefinição de senha voltarem para o app, inclua `https://eventos.v8.ia.br/clubedoroi/` em Authentication › URL Configuration (Site URL ou Redirect URLs) desse projeto.
