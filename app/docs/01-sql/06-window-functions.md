# 1.6 — Window Functions (Funções Janela)

Window functions realizam cálculos **através de um conjunto de linhas relacionadas** sem agrupar os resultados.

São essenciais para: saldos acumulados, rankings, médias móveis, comparações período-a-período.

## Sintaxe Básica

```sql
função() OVER (
    PARTITION BY coluna1   -- "quebrar" em grupos
    ORDER BY coluna2        -- ordem dentro do grupo
)
```

## ROW_NUMBER — Numerando linhas

### Exemplo 1: Ranking de clientes por faturamento

```sql
SELECT
    c.nome,
    SUM(f.valor_liquido) AS total_vendas,
    ROW_NUMBER() OVER (ORDER BY SUM(f.valor_liquido) DESC) AS ranking
FROM faturamento f
INNER JOIN clientes c ON f.id_cliente = c.id_cliente
GROUP BY c.nome;
```

## RANK e DENSE_RANK

```sql
SELECT
    c.nome,
    SUM(f.valor_liquido) AS total_vendas,
    RANK() OVER (ORDER BY SUM(f.valor_liquido) DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY SUM(f.valor_liquido) DESC) AS dense_rank
FROM faturamento f
INNER JOIN clientes c ON f.id_cliente = c.id_cliente
GROUP BY c.nome;
```

- `RANK`: pula números em empates (1, 1, 3)
- `DENSE_RANK`: não pula (1, 1, 2)

## SUM() OVER — Acumulando valores

### Exemplo 2: Faturamento acumulado mês a mês

```sql
WITH fat_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        SUM(valor_liquido) AS receita
    FROM faturamento
    GROUP BY mes
)
SELECT
    mes,
    receita,
    SUM(receita) OVER (ORDER BY mes) AS receita_acumulada
FROM fat_mensal;
```

### Exemplo 3: Saldo de contas a receber ao longo do tempo

```sql
SELECT
    data_vencimento,
    valor,
    SUM(valor) OVER (ORDER BY data_vencimento) AS saldo_acumulado
FROM contas_receber
WHERE status = 'aberto'
ORDER BY data_vencimento;
```

## PARTITION BY — Agrupando dentro da window

### Exemplo 4: Ranking dentro de cada mês

```sql
WITH fat_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        c.nome AS cliente,
        SUM(f.valor_liquido) AS total
    FROM faturamento f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
    GROUP BY mes, c.nome
)
SELECT
    mes,
    cliente,
    total,
    ROW_NUMBER() OVER (PARTITION BY mes ORDER BY total DESC) AS pos_mes
FROM fat_mensal;
```

## LAG e LEAD — Período anterior/seguinte

### Exemplo 5: Comparação mês a mês

```sql
WITH fat_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        SUM(valor_liquido) AS receita
    FROM faturamento
    GROUP BY mes
)
SELECT
    mes,
    receita,
    LAG(receita) OVER (ORDER BY mes) AS receita_mes_anterior,
    receita - LAG(receita) OVER (ORDER BY mes) AS variacao,
    ROUND((receita - LAG(receita) OVER (ORDER BY mes)) / 
          LAG(receita) OVER (ORDER BY mes) * 100, 2) AS variacao_percentual
FROM fat_mensal;
```

## AVG() OVER — Média móvel

```sql
SELECT
    mes,
    receita,
    AVG(receita) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS media_movel_3meses
FROM fat_mensal;
```

## Exercícios Práticos

1. Crie um ranking de fornecedores por total de contas a pagar
2. Calcule o faturamento acumulado mês a mês com saldo final
3. Para cada funcionário, mostre o salário e a diferença para a média do departamento
4. Liste as despesas mensais com variação percentual em relação ao mês anterior
5. Crie uma query que mostre o saldo de caixa projetado (contas_receber - contas_pagar) ao longo do tempo

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="win-1"
  prompt="Crie um ranking de clientes por total de vendas (use ROW_NUMBER). Mostre nome, total_vendas e ranking."
  hint="ROW_NUMBER() OVER (ORDER BY SUM(valor_liquido) DESC)"
  table="faturamento"
  expectedSql="SELECT c.nome, SUM(f.valor_liquido) AS total_vendas, ROW_NUMBER() OVER (ORDER BY SUM(f.valor_liquido) DESC) AS ranking FROM faturamento f INNER JOIN clientes c ON f.id_cliente = c.id_cliente GROUP BY c.nome"
/>

<SqlExercicio
  id="win-2"
  prompt="Calcule o faturamento acumulado (YTD) mês a mês. Mostre mes, receita e receita_acumulada."
  hint="SUM(receita) OVER (ORDER BY mes) com CTE mensal"
  table="faturamento"
  expectedSql="WITH fat_mensal AS (SELECT strftime('%Y-%m', data_emissao) AS mes, SUM(valor_liquido) AS receita FROM faturamento GROUP BY mes) SELECT mes, receita, SUM(receita) OVER (ORDER BY mes) AS receita_acumulada FROM fat_mensal"
/>
