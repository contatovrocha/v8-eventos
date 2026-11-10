# Padrão das páginas V8 (vendas, captura e quiz)

Vale para toda página nova ou refeita neste repositório e nos demais da V8.

## Primeira dobra no celular (obrigatório)

Vale para qualquer celular, não só o iPhone 11. Referência principal: iPhone 11 no Safari, área visível de 414×715 px. Pior caso: 360×640.

- **Página de vendas:** a primeira dobra mostra, sem rolar, nesta ordem:
  1. Foto do expert
  2. Headline
  3. Subheadline (curta, 2 a 3 linhas)
  4. Botão de ação
  5. Valor ("Acesso por apenas R$ X" ou "Ingressos a partir de R$ X")
  6. Data, formato ou local (lista curta com ícones)
- **Quiz:** a foto do expert também fica no topo (faixa compacta, com degradê). Logo abaixo, a primeira pergunta com todas as opções visíveis sem rolar. Regra geral: a foto do expert é sempre o primeiro elemento da página, em qualquer tipo de página.
- No celular, a foto do expert fica no topo, atrás da headline, com degradê para o fundo. O botão ocupa a largura toda.
- Antes de publicar, confira com Playwright (`isMobile: true`) em 360×640, 375×667, 390×664, 414×715 e 412×780: o último item da dobra (o último item da lista de data e local na página de vendas, a última opção no quiz) termina acima da altura da tela, e não há rolagem horizontal.
- Para caber nas telas baixas, use uma regra `@media (max-width:600px) and (max-height:700px)` que reduz a foto, os espaçamentos e as fontes, sem tirar nenhum dos itens obrigatórios. Exemplo em `lp02/index.html`.

Referência visual: a página "O Novo Contrato" (imersão online, R$ 19,90), com foto, headline, subheadline, botão, valor e a lista de data, formato, vagas e acesso, tudo na primeira tela.

## Datas e dia da semana (obrigatório)

Toda vez que uma data de evento mudar em página, criativo, mensagem ou planejamento:

- Confira o dia da semana no calendário do ano certo antes de escrever (ex.: `python3 -c "import datetime;print(datetime.date(2026,12,11).weekday())"`, 0 = segunda). Nunca copie o dia da semana da data anterior.
- Troque juntos a data curta (11/12), a data por extenso (11 de dezembro), o dia da semana (sexta), o `EVENT_DATE` do script e as datas dos criativos.
- Depois, procure no arquivo a data e o mês antigos para garantir que não sobrou nenhum.
