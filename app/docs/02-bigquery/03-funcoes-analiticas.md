# Funções Analíticas Avançadas no BigQuery

Imagine que você está montando um relatório financeiro no Excel. Você quer:
- O saldo acumulado até cada dia (como um "soma acumulada")
- Comparar a receita deste mês com a do mês passado
- Saber qual cliente está no topo do ranking

No Excel, você faria fórmulas do tipo `=SOMA(A$1:A1)` ou `=B2-B1`. As funções analíticas (também chamadas de **window functions** ou **funções de janela**) fazem exatamente isso — mas dentro do SQL.

## Por que isso importa para você?

Na controladoria, você vive fazendo este tipo de análise:
- "Qual foi o saldo de caixa acumulado no mês?"
- "A receita deste mês cresceu ou caiu em relação ao mês passado?"
- "Quais são os 5 maiores fornecedores?"

Sem funções analíticas, você precisaria de subconsultas complicadas ou planilhas auxiliares. Com elas, uma única consulta SQL resolve.

:::tip "Janela" = visão limitada dos dados
O termo "janela" (window) significa que a função opera sobre um **subconjunto** dos dados, não a tabela inteira. Imagine que você está olhando por uma janela que só mostra alguns registros por vez — mas você pode mover essa janela.
:::

### Estrutura Básica

```sql
função() OVER (
  PARTITION BY coluna1, coluna2   -- "grupo" (ex: por empresa)
  ORDER BY coluna3                 -- "ordem" (ex: por data)
  [ROWS | RANGE BETWEEN ... AND ...] -- "tamanho da janela"
)
```

Traduzindo: "Para cada grupo (empresa), ordenado por data, calcule algo considerando as linhas X até Y."

## 1. ROW_NUMBER — Numerando Lançamentos

Útil para identificar duplicatas ou criar uma sequência dentro de cada grupo.

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

:::note Na prática da controladoria
Use `ROW_NUMBER` para:
- Identificar o primeiro e último lançamento de cada dia
- Detectar duplicatas (quando `ROW_NUMBER > 1` com os mesmos dados)
- Criar números de sequência para conciliação bancária
:::

## 2. LAG e LEAD — Comparando Períodos

**LAG** (atrasado) olha para **trás**. **LEAD** (adiantado) olha para **frente**.

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

:::tip Como LAG e LEAD funcionam na prática
Pense em LAG como "olhar para a linha de cima" e LEAD como "olhar para a linha de baixo". Se você ordenou por mês, LAG(receita) pega a receita do mês anterior. Se você está em janeiro, LAG mostra dezembro. Simples assim.
:::

## 3. SUM OVER — Saldo Acumulado (Running Total)

A função mais útil para fluxo de caixa: o saldo até o momento.

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

:::note Traduzindo
`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` é o jeito formal de dizer: "Desde o início dos dados até a linha atual". É o equivalente a `=SOMA(A$1:A1)` no Excel.
:::

## 4. ARRAY_AGG — Agrupando em Listas para Relatórios

Em vez de ter várias linhas, você junta tudo em uma única lista.

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

## 5. STRING_AGG — Concatenando Texto

Junta textos em uma única célula — ótimo para listar itens de nota fiscal.

```sql
-- Concatenar itens de nota fiscal em uma única linha
SELECT
  nota_fiscal_id,
  STRING_AGG(descricao_item, '; ' ORDER BY sequencia) AS itens_agrupados,
  SUM(valor_item) AS total_nota
FROM `projeto.fiscal.itens_nf`
GROUP BY nota_fiscal_id;
```

## 6. Funções de Data para Fechamento Contábil

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
FROM `projeto.contabilidade.lancamentos`
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

## 8. NTH_VALUE — O 3º Maior Gasto

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

:::note NTILE(4) = 4 grupos (quartis)
- Quartil 1 = top 25% (maiores clientes)
- Quartil 2 = 25% seguintes
- Quartil 3 = 25% seguintes
- Quartil 4 = 25% inferiores (menores clientes)

Útil para classificar clientes por porte (A, B, C, D) ou segmentar fornecedores por volume de compras.
:::

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

## Resumo — Guia Rápido

| Função | Uso em Controladoria | Tradução |
|---|---|---|
| `ROW_NUMBER` | Numerar lançamentos, detectar duplicatas | "Qual é o número deste dentro do grupo?" |
| `LAG` / `LEAD` | Comparação mês a mês, parcelas futuras | "O que veio antes / depois?" |
| `SUM() OVER` | Saldo acumulado, fluxo de caixa | "Soma até aqui" |
| `ARRAY_AGG` | Relatórios agrupados por dia/mês | "Junta tudo numa lista" |
| `STRING_AGG` | Concatenação de itens fiscais | "Junta textos" |
| `DATE_TRUNC` | Fechamento mensal/trimestral | "Arredonda para mês" |
| `DATE_DIFF` | Prazo médio, aging de contas | "Diferença entre datas" |
| `NTILE` | Classificação de clientes por porte | "Divide em grupos iguais" |
| `FIRST_VALUE` / `LAST_VALUE` | Saldo inicial/final do período | "Primeiro e último do grupo" |
