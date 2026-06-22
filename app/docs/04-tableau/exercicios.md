# 4.6 — Exercícios de Tableau

> Parabéns por chegar até aqui! 🎉 Agora é hora de **colocar a mão na massa**. Os exercícios abaixo são divididos em dois grupos: os **conceituais** (para fixar a teoria) e os **práticos** (para aplicar no Tableau de verdade). Não pule nenhum — é fazendo que se aprende.

import TableauExercises from '@site/src/components/TableauExercises';
import TableauPlayground from '@site/src/components/TableauPlayground';

## 🎨 Tableau Playground Interativo

Monte visualizações usando os dados do Grupo Nova Era — selecione dimensões (azul/discreto) e medidas (verde/contínuo) como no Tableau, e veja o gráfico renderizar ao vivo.

<TableauPlayground />

## Exercícios Práticos — Estudos de Caso com Dashboards Reais

Antes de construir o seu, analise dashboards públicos do Tableau Public para se inspirar:

<TableauExercises />

## Exercícios Conceituais — "Fixando a Teoria"

:::tip Como usar esta seção
Leia a pergunta, tente responder com suas próprias palavras, **depois** confira a resposta. O esforço de lembrar é o que realmente fixa o aprendizado.
:::

1. **Qual a diferença entre discreto (azul) e contínuo (verde) no Tableau?**

   > *Resposta:* **Discreto (azul)** cria "caixinhas" separadas (cabeçalhos, categorias). Ex: ano vira 2024, 2025, 2026 em colunas separadas. **Contínuo (verde)** cria um eixo numérico contínuo. Ex: meses ao longo de uma linha do tempo. Pense: discreto = separado; contínuo = corrido.

2. **Quando usar FIXED vs INCLUDE vs EXCLUDE LOD?**

   > 🧠 **Dica para lembrar:**
   > - **FIXED** = "fixa o cálculo neste nível, ignora o resto" (ex: total geral da empresa)
   > - **INCLUDE** = "inclui mais detalhe no cálculo" (ex: média por cliente dentro de cada mês)
   > - **EXCLUDE** = "tira uma dimensão do cálculo" (ex: comparar o item com o total)

3. **Qual gráfico escolher para cada situação financeira?**

   | Situação | Gráfico Recomendado | Por quê? |
   |----------|---------------------|----------|
   | Composição da DRE | Waterfall (cascata) | Mostra o "fluxo" de cima a baixo |
   | Evolução do faturamento por mês | Linha | Mostra tendência ao longo do tempo |
   | Comparação de vendas por filial | Barra | Fácil comparar valores lado a lado |
   | Distribuição geográfica | Mapa | Visualiza onde os clientes estão |
   | Despesas por departamento x mês | Heatmap | Cores revelam padrões rapidamente |
   | Ranking de fornecedores | Barra horizontal | Rankings ficam melhores na horizontal |

4. **O que é Table Calculation e como difere de SQL?**

   > *Resposta:* Table Calculation é uma conta que o Tableau faz **depois** do gráfico pronto (no "frontend"). SQL opera nos dados **brutos** (no "backend"). Ex: `RUNNING_SUM` é Table Calculation. `SELECT SUM(valor)` é SQL. Table Calculations são ótimas para análises exploratórias rápidas.

5. **Como criar um parâmetro de data dinâmica no Tableau?**

   > *Resposta:* Crie um Parâmetro do tipo **Data** (ou **Inteiro** para meses). Depois crie um Campo Calculado que usa esse parâmetro como filtro: `[data] >= [Parâmetro Data Início]`. Por fim, exponha o parâmetro no dashboard como controle. Pronto — o usuário escolhe a data e tudo se ajusta.

## 🚀 Desafio Prático — "Teste Final"

:::warning Importante!
Se você não está vendo o dashboard incorporado abaixo, pode ser necessário carregar a página ou usar um navegador mais recente. O componente `TableauExercises` carrega dashboards públicos do Tableau Public.
:::

Analise o dashboard de DRE incorporado no início desta página (componente TableauExercises) e responda:

1. **Quais meses tiveram o maior faturamento?** Identifique o pico de receita no ano.
2. **Qual centro de custo teve a maior despesa?** Dica: olhe o treemap ou o heatmap.
3. **A margem líquida melhorou ou piorou ao longo do semestre?** Compare o primeiro mês com o último.

> 💡 **Resposta extra:** Anote suas respostas em um bloco de notas e compare com um colega de curso. Discutir diferentes interpretações de um mesmo dashboard é um dos melhores exercícios para desenvolver "visão analítica".

---

**Fim dos exercícios — e do Módulo 4!** 👏
