# 🧪 Laboratório de Prática — BigQuery

import PraticarLab from '@site/src/components/PraticarLab'
import BQPlayground from '@site/src/components/BQPlayground'

## ☁️ Playground BigQuery

Teste queries no estilo BigQuery em tempo real. As funções específicas do BigQuery (EXTRACT, DATE_TRUNC, SAFE_DIVIDE, IF, etc.) são traduzidas automaticamente para SQLite.

<BQPlayground />

<PraticarLab
  moduleId="modulo2"
  titulo="Diferenças de SQL no BigQuery"
  nivel={1}
  exercicios={[
    { id: "bq-1", prompt: "Funções de Data — Liste data, ano e mês de cada nota fiscal de saída. Use EXTRACT(YEAR FROM data_emissao) e EXTRACT(MONTH FROM data_emissao).", hint: "SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'saida' LIMIT 10", table: "notas_fiscais", expectedSql: "SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'saida' LIMIT 10" },
    { id: "bq-2", prompt: "Funções de String — Liste o nome da empresa em maiúsculas e o regime tributário, concatenados com ' - '.", hint: "SELECT UPPER(nome_fantasia) || ' - ' || regime_tributario AS empresa_regime FROM empresas", table: "empresas", expectedSql: "SELECT UPPER(nome_fantasia) || ' - ' || regime_tributario AS empresa_regime FROM empresas" },
    { id: "bq-3", prompt: "Arrays/UNNEST — Simule com UNION ALL: nome do produto e 'Físico' para a categoria 'Industrial', 'Digital' para 'Eletrônico'.", hint: "SELECT nome, 'Físico' AS tipo FROM produtos WHERE categoria = 'Industrial' UNION ALL SELECT nome, 'Digital' AS tipo FROM produtos WHERE categoria = 'Eletrônico'", table: "produtos", expectedSql: "SELECT nome, 'Físico' AS tipo FROM produtos WHERE categoria = 'Industrial' UNION ALL SELECT nome, 'Digital' AS tipo FROM produtos WHERE categoria = 'Eletrônico'" },
  ]}
/>

<PraticarLab
  moduleId="modulo2"
  titulo="Particionamento e Clustering"
  nivel={2}
  exercicios={[
    { id: "bq-4", prompt: "Simule particionamento: total de contas a pagar só de abril/2026 filtrando por data de vencimento.", hint: "SELECT SUM(valor) AS total FROM contas_pagar WHERE data_vencimento BETWEEN '2026-04-01' AND '2026-04-30'", table: "contas_pagar", expectedSql: "SELECT SUM(valor) AS total FROM contas_pagar WHERE data_vencimento BETWEEN '2026-04-01' AND '2026-04-30'" },
    { id: "bq-5", prompt: "GROUP BY com ROLLUP (simulado): total de faturamento por empresa e mês.", hint: "SELECT e.nome_fantasia AS empresa, CAST(STRFTIME('%m', f.data_emissao) AS INTEGER) AS mes, SUM(f.valor_liquido) AS total FROM faturamento f JOIN empresas e ON f.id_empresa = e.id_empresa GROUP BY e.nome_fantasia, mes ORDER BY e.nome_fantasia, mes", table: "faturamento", expectedSql: "SELECT e.nome_fantasia AS empresa, CAST(STRFTIME('%m', f.data_emissao) AS INTEGER) AS mes, SUM(f.valor_liquido) AS total FROM faturamento f JOIN empresas e ON f.id_empresa = e.id_empresa GROUP BY e.nome_fantasia, mes ORDER BY e.nome_fantasia, mes" },
  ]}
/>

<PraticarLab
  moduleId="modulo2"
  titulo="Funções Analíticas"
  nivel={3}
  exercicios={[
    { id: "bq-6", prompt: "ROW_NUMBER com PARTITION BY — Ranking de clientes por total de compras (do maior para o menor).", hint: "ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.base_calculo, 0)) DESC)", table: "clientes, notas_fiscais", expectedSql: "SELECT c.nome, SUM(COALESCE(nf.base_calculo, 0)) AS total_gasto, ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.base_calculo, 0)) DESC) AS ranking FROM clientes c LEFT JOIN notas_fiscais nf ON c.id_cliente = nf.id_cliente_fornecedor AND nf.tipo = 'saida' AND nf.tipo_pessoa = 'cliente' GROUP BY c.nome ORDER BY ranking" },
    { id: "bq-7", prompt: "LAG — Compare faturamento de cada mês com o mês anterior.", hint: "LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao))", table: "faturamento", expectedSql: "SELECT STRFTIME('%Y-%m', data_emissao) AS mes, SUM(valor_liquido) AS faturamento, LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS mes_anterior, SUM(valor_liquido) - LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS variacao FROM faturamento GROUP BY mes ORDER BY mes" },
    { id: "bq-8", prompt: "DENSE_RANK — Classifique fornecedores por volume de contas a pagar.", hint: "DENSE_RANK() OVER (ORDER BY SUM(cp.valor) DESC)", table: "fornecedores, contas_pagar", expectedSql: "SELECT f.nome, SUM(cp.valor) AS total_contas, DENSE_RANK() OVER (ORDER BY SUM(cp.valor) DESC) AS categoria FROM fornecedores f JOIN contas_pagar cp ON f.id_fornecedor = cp.id_fornecedor GROUP BY f.nome ORDER BY categoria" },
  ]}
/>

