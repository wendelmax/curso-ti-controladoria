# 1.8 — Exercícios de SQL

Resolva todos os exercícios usando o **SQL Playground**.

## Nível 1 — Fundamentos e Filtros

1. Liste todas as empresas com seus respectivos regimes tributários
2. Mostre os 10 primeiros lançamentos contábeis da tabela `lancamentos_contabeis`
3. Exiba os funcionários do departamento Financeiro com salário > 10.000
4. Encontre fornecedores do tipo 'Matéria-Prima' em São Paulo
5. Liste as contas do plano de contas de natureza 'credora'
6. Mostre clientes cujo nome contenha 'Distribuidora' ou 'S.A.'

## Nível 2 — Agregações

7. Calcule o total de contas a pagar por fornecedor
8. Qual o valor médio das notas fiscais de saída?
9. Quantas contas a receber estão em aberto vs recebidas?
10. Qual o total de salários pagos por mês (folha_pagamento)?
11. Total de impostos a recolher por tipo de imposto
12. Qual o faturamento total de cada produto/serviço?

## Nível 3 — JOINs

13. Liste as contas a pagar com nome do fornecedor e centro de custo
14. Mostre as notas fiscais de saída com o nome do cliente e tipo de imposto
15. Para cada funcionário, mostre o total de salários recebidos (jan-jun)
16. Relacione lançamentos contábeis com plano de contas e centro de custo
17. Mostre todos os clientes com o total de suas compras (inclusive quem não comprou)

## Nível 4 — Window Functions e CTEs

18. Crie um ranking mensal dos 3 clientes que mais compraram
19. Calcule o faturamento acumulado mês a mês (YTD)
20. Mostre a variação percentual de despesas mês a mês
21. Liste os funcionários com o maior salário de cada departamento
22. Calcule a média móvel de faturamento dos últimos 2 meses

## Nível 5 — Cases

23. Monte a DRE completa de junho/2026 (receitas, custos, despesas, resultado)
24. Crie o aging de contas a pagar em aberto (faixas: a vencer, 1-30, 31-60, 61-90, 90+)
25. Faça uma análise de margem bruta por cliente
26. Calcule o fluxo de caixa livre (recebimentos - pagamentos) por mês
27. Encontre discrepâncias entre contas_pagar e lancamentos_contabeis
28. Determine a concentração de receita por cliente (% do total)

## Desafio Final

Crie uma query que retorne um **dashboard executivo** em uma única consulta:
- Mês
- Receita total
- CPV
- Lucro Bruto
- Margem Bruta (%)
- Despesas Operacionais
- Resultado Líquido
- Saldo de Caixa (contas_receber abertos - contas_pagar abertos)

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo1" title={quizes.modulo1.title} questions={quizes.modulo1.questions} />
