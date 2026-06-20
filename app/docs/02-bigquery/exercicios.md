# 2.6 — Exercícios Práticos de BigQuery

import SqlExercicio from '@site/src/components/SqlExercicio';

Os exercícios abaixo usam o mesmo banco do curso, simulando queries do BigQuery com funções compatíveis com SQL.js.

## Nível 1 — Diferenças de SQL

<SqlExercicio
  id="bq-1"
  prompt="**Funções de Data no BigQuery** — Em BigQuery usamos DATE_TRUNC, EXTRACT, FORMAT_DATE. Escreva uma query que liste data, ano e mês de cada nota fiscal de saída. Use EXTRACT(YEAR FROM data_emissao) e EXTRACT(MONTH FROM data_emissao)."
  hint="SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'Saída' LIMIT 10"
  expectedSql="SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'Saída' LIMIT 10"
  table="notas_fiscais"
/>

<SqlExercicio
  id="bq-2"
  prompt="**Funções de String** — Em BigQuery usamos CONCAT, LOWER, UPPER, TRIM. Liste o nome da empresa em maiúsculas e o nome do regime tributário, concatenados com ' - '."
  hint="SELECT UPPER(nome) || ' - ' || regime_tributario AS empresa_regime FROM empresas"
  expectedSql="SELECT UPPER(nome) || ' - ' || regime_tributario AS empresa_regime FROM empresas"
  table="empresas"
/>

<SqlExercicio
  id="bq-3"
  prompt="**Arrays e UNNEST** — BigQuery suporta arrays com UNNEST. Embora SQL.js não tenha arrays, simule com UNION ALL: crie uma consulta que retorne o nome do produto e 'Vendas' como categoria para produtos, UNION ALL com 'Serviços' como categoria para serviços."
  hint="SELECT nome, 'Vendas' AS categoria FROM produtos WHERE tipo = 'Produto' UNION ALL SELECT nome, 'Serviços' AS categoria FROM produtos WHERE tipo = 'Serviço'"
  expectedSql="SELECT nome, 'Vendas' AS categoria FROM produtos WHERE tipo = 'Produto' UNION ALL SELECT nome, 'Serviços' AS categoria FROM produtos WHERE tipo = 'Serviço'"
  table="produtos"
/>

## Nível 2 — Particionamento e Clustering

<SqlExercicio
  id="bq-4"
  prompt="**Simulação de Particionamento** — Em BigQuery, particionar por data reduz custos. Simule uma consulta otimizada: calcule o total de contas a pagar apenas do mês de abril de 2026, filtrando pela data de vencimento."
  hint="SELECT SUM(valor) AS total FROM contas_pagar WHERE vencimento BETWEEN '2026-04-01' AND '2026-04-30'"
  expectedSql="SELECT SUM(valor) AS total FROM contas_pagar WHERE vencimento BETWEEN '2026-04-01' AND '2026-04-30'"
  table="contas_pagar"
/>

<SqlExercicio
  id="bq-5"
  prompt="**GROUP BY com ROLLUP** — BigQuery suporta GROUP BY ROLLUP para subtotais. SQL.js não tem ROLLUP, mas podemos simular com GROUP BY. Calcule o total de faturamento por empresa, com subtotais por mês (use STRFTIME para extrair mês da data)."
  hint="SELECT e.nome AS empresa, CAST(STRFTIME('%m', f.data) AS INTEGER) AS mes, SUM(f.valor) AS total FROM faturamento f JOIN empresas e ON f.empresa_id = e.id GROUP BY e.nome, mes ORDER BY e.nome, mes"
  expectedSql="SELECT e.nome AS empresa, CAST(STRFTIME('%m', f.data) AS INTEGER) AS mes, SUM(f.valor) AS total FROM faturamento f JOIN empresas e ON f.empresa_id = e.id GROUP BY e.nome, mes ORDER BY e.nome, mes"
  table="faturamento"
/>

## Nível 3 — Funções Analíticas (Window Functions)

<SqlExercicio
  id="bq-6"
  prompt="**ROW_NUMBER com PARTITION BY** — Em BigQuery, ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) é essencial. Crie um ranking de clientes por total de compras: para cada cliente, mostre o total gasto e sua posição no ranking (do maior para o menor)."
  hint="SELECT c.nome, SUM(COALESCE(nf.valor_total, 0)) AS total_gasto, ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.valor_total, 0)) DESC) AS ranking FROM clientes c LEFT JOIN notas_fiscais nf ON c.id = nf.cliente_id AND nf.tipo = 'Saída' GROUP BY c.nome ORDER BY ranking"
  expectedSql="SELECT c.nome, SUM(COALESCE(nf.valor_total, 0)) AS total_gasto, ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.valor_total, 0)) DESC) AS ranking FROM clientes c LEFT JOIN notas_fiscais nf ON c.id = nf.cliente_id AND nf.tipo = 'Saída' GROUP BY c.nome ORDER BY ranking"
  table="clientes, notas_fiscais"
/>

<SqlExercicio
  id="bq-7"
  prompt="**LAG para Comparação Mês a Mês** — Use LAG() para comparar o faturamento de cada mês com o mês anterior. Extraia o mês e ano da data e some o valor do faturamento agrupado por mês."
  hint="SELECT STRFTIME('%Y-%m', data) AS mes, SUM(valor) AS faturamento, LAG(SUM(valor)) OVER (ORDER BY STRFTIME('%Y-%m', data)) AS mes_anterior, SUM(valor) - LAG(SUM(valor)) OVER (ORDER BY STRFTIME('%Y-%m', data)) AS variacao FROM faturamento GROUP BY mes ORDER BY mes"
  expectedSql="SELECT STRFTIME('%Y-%m', data) AS mes, SUM(valor) AS faturamento, LAG(SUM(valor)) OVER (ORDER BY STRFTIME('%Y-%m', data)) AS mes_anterior, SUM(valor) - LAG(SUM(valor)) OVER (ORDER BY STRFTIME('%Y-%m', data)) AS variacao FROM faturamento GROUP BY mes ORDER BY mes"
  table="faturamento"
/>

<SqlExercicio
  id="bq-8"
  prompt="**DENSE_RANK para Categorizar Clientes** — Use DENSE_RANK para classificar fornecedores em categorias por volume de contas a pagar. Mostre nome do fornecedor, total de contas e categoria (1 = maior volume)."
  hint="SELECT f.nome, SUM(cp.valor) AS total_contas, DENSE_RANK() OVER (ORDER BY SUM(cp.valor) DESC) AS categoria FROM fornecedores f JOIN contas_pagar cp ON f.id = cp.fornecedor_id GROUP BY f.nome ORDER BY categoria"
  expectedSql="SELECT f.nome, SUM(cp.valor) AS total_contas, DENSE_RANK() OVER (ORDER BY SUM(cp.valor) DESC) AS categoria FROM fornecedores f JOIN contas_pagar cp ON f.id = cp.fornecedor_id GROUP BY f.nome ORDER BY categoria"
  table="fornecedores, contas_pagar"
/>
