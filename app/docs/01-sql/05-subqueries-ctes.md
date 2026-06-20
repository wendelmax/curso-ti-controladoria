# 1.5 — Subqueries e CTEs

## Subqueries (Subconsultas)

Uma consulta dentro de outra consulta. Pode estar no `WHERE`, `FROM` ou `SELECT`.

### Subquery no WHERE

```sql
SELECT nome, salario
FROM funcionarios
WHERE salario > (
    SELECT AVG(salario) FROM funcionarios
);
```

### Exemplo 1: Clientes com faturamento acima da média

```sql
SELECT nome, cidade
FROM clientes
WHERE id_cliente IN (
    SELECT id_cliente
    FROM faturamento
    GROUP BY id_cliente
    HAVING SUM(valor_liquido) > (
        SELECT AVG(total) FROM (
            SELECT SUM(valor_liquido) AS total
            FROM faturamento
            GROUP BY id_cliente
        )
    )
);
```

### Subquery no FROM (tabela derivada)

```sql
SELECT
    cliente,
    total_vendas
FROM (
    SELECT
        c.nome AS cliente,
        SUM(f.valor_liquido) AS total_vendas
    FROM faturamento f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
    GROUP BY c.nome
)
ORDER BY total_vendas DESC;
```

### Subquery no SELECT

```sql
SELECT
    nome,
    salario,
    (SELECT AVG(salario) FROM funcionarios) AS media_geral,
    salario - (SELECT AVG(salario) FROM funcionarios) AS diferenca_media
FROM funcionarios;
```

## CTEs (Common Table Expressions) — WITH

CTEs tornam queries complexas **legíveis e organizadas**:

```sql
WITH nome_cte AS (
    SELECT colunas FROM tabela WHERE condicao
)
SELECT colunas FROM nome_cte;
```

### Exemplo 2: Top 5 clientes por faturamento

```sql
WITH fat_por_cliente AS (
    SELECT
        c.nome,
        c.uf,
        SUM(f.valor_liquido) AS total_vendas
    FROM faturamento f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
    GROUP BY c.nome, c.uf
)
SELECT *
FROM fat_por_cliente
ORDER BY total_vendas DESC
LIMIT 5;
```

### Exemplo 3: DRE do mês (estilo demonstrativo)

```sql
WITH receitas AS (
    SELECT
        d.mes,
        p.descricao AS conta,
        SUM(d.valor) AS valor
    FROM dre_mensal d
    INNER JOIN planos_contas p ON d.id_conta = p.id_conta
    WHERE p.id_conta IN (35, 36)
    GROUP BY d.mes, p.descricao
),
custos AS (
    SELECT
        d.mes,
        SUM(d.valor) AS total_custos
    FROM dre_mensal d
    WHERE d.id_conta IN (39, 40, 41)
    GROUP BY d.mes
),
despesas AS (
    SELECT
        d.mes,
        SUM(d.valor) AS total_despesas
    FROM dre_mensal d
    WHERE d.id_conta IN (49, 50, 52, 55, 56, 60, 61)
    GROUP BY d.mes
)
SELECT
    r.mes,
    r.conta,
    r.valor,
    c.total_custos,
    d.total_despesas,
    r.valor - c.total_custos - d.total_despesas AS resultado
FROM receitas r
LEFT JOIN custos c ON r.mes = c.mes
LEFT JOIN despesas d ON r.mes = d.mes;
```

### Múltiplas CTEs

```sql
WITH
cte1 AS (SELECT ...),
cte2 AS (SELECT ...)
SELECT * FROM cte1
JOIN cte2 ON ...;
```

## Exercícios Práticos

1. Encontre funcionários com salário acima da média do seu departamento
2. Liste os 3 fornecedores com maior valor total em contas a pagar
3. Calcule o % de cada despesa sobre a receita total do mês (use CTEs)
4. Mostre clientes que nunca faturaram (use LEFT JOIN + IS NULL)
5. Crie uma query que retorne mês, receita total, custo total e margem bruta (%)

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="cte-1"
  prompt="Encontre os funcionários que ganham acima da média salarial de todos os funcionários. Mostre nome, cargo e salario."
  hint="Use subquery: WHERE salario > (SELECT AVG(salario) FROM funcionarios)"
  table="funcionarios"
  expectedSql="SELECT nome, cargo, salario FROM funcionarios WHERE salario > (SELECT AVG(salario) FROM funcionarios)"
/>

<SqlExercicio
  id="cte-2"
  prompt="Use uma CTE para listar o total de vendas por cliente, mostrando o nome do cliente e o total, ordenado do maior total."
  hint="WITH fat_por_cliente AS (SELECT c.nome, SUM(f.valor_liquido) AS total FROM faturamento f JOIN clientes c ON f.id_cliente = c.id_cliente GROUP BY c.nome)"
  table="faturamento"
  expectedSql="WITH fat_por_cliente AS (SELECT c.nome, SUM(f.valor_liquido) AS total FROM faturamento f INNER JOIN clientes c ON f.id_cliente = c.id_cliente GROUP BY c.nome) SELECT * FROM fat_por_cliente ORDER BY total DESC"
/>
