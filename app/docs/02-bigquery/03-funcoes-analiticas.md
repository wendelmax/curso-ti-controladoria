# Funções Analíticas Avançadas no BigQuery

## WINDOW Functions

Funções de janela são essenciais para relatórios financeiros, como saldos acumulados, comparações período-a-período e rankeamentos.

### Estrutura Básica

```sql
função() OVER (
  PARTITION BY coluna1, coluna2
  ORDER BY coluna3
  [ROWS | RANGE BETWEEN ... AND ...]
)
```

## 1. ROW_NUMBER — Sequenciamento de Lançamentos

```sql
-- Numerar lançamentos por empresa em ordem cronológica
SELECT
  empresa,
  data_lancamento,
  valor,
  ROW_NUMBER() OVER (
    PARTITION BY empresa
    ORDER BY data_lancamento, hora_lancamento
  ) AS sequencia_lancamento
FROM `projeto.contabilidade.razao`;
```

## 2. LAG e LEAD — Comparação entre Períodos

```sql
-- Variação mensal de receita (comparação com mês anterior)
WITH receita_mensal AS (
  SELECT
    DATE_TRUNC(data_faturamento, MONTH) AS mes,
    SUM(valor) AS receita
  FROM `projeto.financeiro.faturas`
  GROUP BY mes
)
SELECT
  mes,
  receita,
  LAG(receita) OVER (ORDER BY mes) AS receita_mes_anterior,
  receita - LAG(receita) OVER (ORDER BY mes) AS variacao_reais,
  ROUND(
    (receita - LAG(receita) OVER (ORDER BY mes))
    / NULLIF(LAG(receita) OVER (ORDER BY mes), 0) * 100,
    2
  ) AS variacao_percentual
FROM receita_mensal
ORDER BY mes;

-- LEAD: próxima parcela prevista
SELECT
  contrato_id,
  data_vencimento,
  valor_parcela,
  LEAD(valor_parcela) OVER (
    PARTITION BY contrato_id ORDER BY data_vencimento
  ) AS proxima_parcela
FROM `projeto.financeiro.parcelas`;
```

## 3. SUM OVER — Saldo Acumulado (Running Total)

```sql
-- Saldo de caixa acumulado por dia
SELECT
  data_movimento,
  tipo_movimento,
  valor,
  SUM(CASE
    WHEN tipo_movimento = 'entrada' THEN valor
    WHEN tipo_movimento = 'saida' THEN -valor
  END) OVER (
    ORDER BY data_movimento, hora_movimento
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS saldo_acumulado
FROM `projeto.financeiro.caixa`
ORDER BY data_movimento, hora_movimento;
```

## 4. ARRAY_AGG — Agregação em Lista para Relatórios

```sql
-- Agrupar lançamentos do dia em um array (relatório de diário)
SELECT
  data_lancamento,
  ARRAY_AGG(
    STRUCT(conta_contabil, historico, valor)
    ORDER BY conta_contabil
  ) AS lancamentos_dia
FROM `projeto.contabilidade.lancamentos`
GROUP BY data_lancamento;

-- ARRAY_AGG com limite (top 5 maiores lançamentos por mês)
SELECT
  mes,
  ARRAY_AGG(
    STRUCT(valor, historico)
    ORDER BY valor DESC
    LIMIT 5
  ) AS top5_lancamentos
FROM `projeto.contabilidade.lancamentos`
GROUP BY mes;
```

## 5. STRING_AGG — Concatenação de Texto para Notas Fiscais

```sql
-- Concatenar itens de nota fiscal em uma única linha
SELECT
  nota_fiscal_id,
  STRING_AGG(descricao_item, '; ' ORDER BY sequencia) AS itens_agrupados,
  SUM(valor_item) AS total_nota
FROM `projeto.fiscal.itens_nf`
GROUP BY nota_fiscal_id;
```

## 6. Funções de Data e Timestamp para Fechamento

```sql
-- DATE_TRUNC: agrupar por mês/trimestre/ano
SELECT
  DATE_TRUNC(data_lancamento, MONTH) AS competencia,
  SUM(valor) AS total
FROM `projeto.contabilidade.lancamentos`
GROUP BY competencia;

-- DATE_DIFF: prazo médio de recebimento
SELECT
  cliente_id,
  AVG(DATE_DIFF(data_recebimento, data_emissao, DAY)) AS prazo_medio_dias
FROM `projeto.financeiro.contas_receber`
WHERE data_recebimento IS NOT NULL
GROUP BY cliente_id;

-- FORMAT_TIMESTAMP: labels para relatórios mensais
SELECT
  FORMAT_TIMESTAMP('%Y-%m', data_lancamento) AS mes_label,
  FORMAT_TIMESTAMP('%B %Y', data_lancamento) AS mes_extenso,
  SUM(valor) AS total
FROM `projeto.contabilidade.lancamentos`
GROUP BY mes_label, mes_extenso
ORDER BY mes_label;

-- Último dia do mês (útil para fechamento)
SELECT
  LAST_DAY(data_lancamento) AS ultimo_dia_mes,
  SUM(valor) AS total
FROM `projeto.contabilidade.lanzamentos`
GROUP BY ultimo_dia_mes;
```

## 7. FIRST_VALUE / LAST_VALUE — Saldo Inicial e Final

```sql
-- Saldo no início e fim de cada mês
SELECT
  empresa,
  DATE_TRUNC(data_movimento, MONTH) AS mes,
  FIRST_VALUE(saldo) OVER (
    PARTITION BY empresa, DATE_TRUNC(data_movimento, MONTH)
    ORDER BY data_movimento
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS saldo_inicial,
  LAST_VALUE(saldo) OVER (
    PARTITION BY empresa, DATE_TRUNC(data_movimento, MONTH)
    ORDER BY data_movimento
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS saldo_final
FROM `projeto.financeiro.saldos_diarios`;
```

## 8. NTH_VALUE — k-ésimo Valor (Ex.: 3º maior gasto)

```sql
SELECT
  centro_custo,
  NTH_VALUE(valor, 3) OVER (
    PARTITION BY centro_custo
    ORDER BY valor DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS terceiro_maior_gasto
FROM `projeto.contabilidade.despesas`
QUALIFY terceiro_maior_gasto IS NOT NULL;
```

## 9. PERCENT_RANK e NTILE — Distribuição Percentual

```sql
-- Classificar clientes por faixa de faturamento (quartis)
SELECT
  cliente_id,
  SUM(faturamento) AS total_faturamento,
  NTILE(4) OVER (ORDER BY SUM(faturamento) DESC) AS quartil
FROM `projeto.financeiro.faturamento_cliente`
GROUP BY cliente_id;
```

## 10. Funções Condicionais para Análise Fiscal

```sql
-- IF e NULLIF para evitar divisão por zero
SELECT
  mes,
  SUM(receita) AS receita_total,
  SUM(custo) AS custo_total,
  IF(
    SUM(receita) > 0,
    ROUND((SUM(receita) - SUM(custo)) / SUM(receita) * 100, 2),
    NULL
  ) AS margem_percentual
FROM `projeto.contabilidade.dre_mensal`
GROUP BY mes;

-- COALESCE para preencher valores nulos em balanços
SELECT
  conta,
  COALESCE(saldo_2024, 0) AS saldo_2024,
  COALESCE(saldo_2025, 0) AS saldo_2025
FROM `projeto.contabilidade.balanco_comparativo`;
```

## Resumo

| Função | Uso em Controllership |
|--------|----------------------|
| `ROW_NUMBER` | Numerar lançamentos, identificar duplicatas |
| `LAG` / `LEAD` | Comparação mês a mês, parcelas futuras |
| `SUM() OVER` | Saldo acumulado, fluxo de caixa |
| `ARRAY_AGG` | Relatórios agrupados por dia/mês |
| `STRING_AGG` | Concatenação de itens fiscais |
| `DATE_TRUNC` | Fechamento mensal/trimestral |
| `DATE_DIFF` | Prazo médio, aging |
| `NTILE` | Classificação de clientes por porte |
| `FIRST_VALUE` / `LAST_VALUE` | Saldo inicial/final do período |
