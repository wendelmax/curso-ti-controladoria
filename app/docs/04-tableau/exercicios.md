# 4.6 — Exercícios de Tableau

import TableauExercises from '@site/src/components/TableauExercises';

## Estudos de Caso com Dashboards Reais

Seção com dashboards públicos do Tableau Public para análise financeira.

<TableauExercises />

## Exercícios Conceituais

1. **Qual a diferença entre discrete (azul) e contínuo (verde) no Tableau?**
   - *Resposta:* Discrete (azul) cria cabeçalhos e agrupa dados em categorias. Contínuo (verde) cria eixos e é usado para valores numéricos que podem ser somados ou medidos ao longo de um intervalo.

2. **Quando usar FIXED vs INCLUDE vs EXCLUDE LOD?**
   - *Resposta:* FIXED calcula ignorando todas as dimensões na view. INCLUDE adiciona dimensões ao nível de detalhe. EXCLUDE remove dimensões do nível de detalhe.

3. **Qual gráfico escolher para cada situação financeira?**

   | Situação | Gráfico Recomendado |
   |----------|---------------------|
   | Composição da DRE (receitas vs despesas) | Waterfall (cascata) |
   | Evolução do faturamento por mês | Linha |
   | Comparação de vendas por filial | Barra |
   | Distribuição geográfica de clientes | Mapa |
   | Correlação entre despesas e receitas | Dispersão (scatter) |
   | Ranking de fornecedores por volume | Barra horizontal |

4. **O que é Tableau Calculation e como difere de SQL?**
   - *Resposta:* Table Calculations operam no resultado da query (nível de agregação já calculado), enquanto SQL opera nos dados brutos. Table Calculations são executadas no frontend.

5. **Como criar um parâmetro de data dinâmica no Tableau?**
   - *Resposta:* Cria-se um Parameter do tipo Data, depois usa-se em um Calculated Field que filtra os dados com base no parâmetro. O parâmetro pode ser exposto como controle no dashboard.

## Desafio Prático

Analise o dashboard de DRE incorporado acima e responda:

1. Quais meses tiveram o maior faturamento?
2. Qual centro de custo teve a maior despesa?
3. A margem líquida melhorou ou piorou ao longo do semestre?
