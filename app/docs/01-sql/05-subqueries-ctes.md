# 1.5 — Subqueries e CTEs

:::tip Traduzindo para o seu dia a dia
Subquery é como fazer **uma conta de cálculo separada no Excel e usar o resultado em outra fórmula**.

Exemplo: "Quero os funcionários que ganham acima da média". Primeiro você calcula a média (conta 1), depois usa esse valor para filtrar (conta 2). No SQL, você faz as duas contas numa query só — a subquery calcula a média, e a query principal usa esse resultado.

CTE (WITH) é como **rascunhar a conta num papel à parte, dar um nome a ela, e depois usar esse nome na conta final**. Muito mais organizado do que aninhar tudo.
:::

:::note Por que isso importa para você?
Na controladoria, você frequentemente precisa fazer perguntas em dois níveis: primeiro uma conta geral ("qual a média de vendas?") e depois "quem está acima dessa média?". Uma pergunta depende do resultado da outra.

Subqueries e CTEs são exatamente isso: você resolve uma etapa de cada vez, e o resultado de uma vira entrada para a próxima. Como montar uma demonstração financeira passo a passo.
:::

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

Vamos por partes. Primeiro, encontramos o faturamento total de cada cliente:

```sql
SELECT id_cliente, SUM(valor_liquido) AS total
FROM faturamento
GROUP BY id_cliente;
```

Depois, calculamos a média desses totais:

```sql
SELECT AVG(total) FROM (
    SELECT SUM(valor_liquido) AS total
    FROM faturamento
    GROUP BY id_cliente
);
```

Agora, juntamos tudo: clientes cujo faturamento total é maior que essa média:

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

:::note Respira
Sim, essa query tem 3 níveis de aninhamento. É complexa mesmo. Na prática, você usaria **CTEs** (que vamos ver já já) para organizar isso em etapas legíveis. Mas é importante entender que subqueries existem e funcionam assim.
:::

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

:::tip Dica
CTEs são como **pedaços de papel**: você resolve uma parte do problema em cada pedaço, dá um nome a ele, e no final junta tudo. Muito mais fácil de entender e dar manutenção do que subqueries aninhadas.

A mesma query do exemplo anterior, com CTEs:

```sql
WITH fat_por_cliente AS (
    SELECT id_cliente, SUM(valor_liquido) AS total
    FROM faturamento
    GROUP BY id_cliente
),
media_geral AS (
    SELECT AVG(total) AS media FROM fat_por_cliente
)
SELECT c.nome, c.cidade
FROM clientes c
INNER JOIN fat_por_cliente fpc ON c.id_cliente = fpc.id_cliente
WHERE fpc.total > (SELECT media FROM media_geral);
```

Bem mais claro, não?
:::

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

## Para fixar

- **Subquery** = uma consulta dentro de outra (resolve aninhado, como fórmula composta no Excel)
- **CTE (WITH)** = mesma ideia, mas mais organizada: você dá nome a cada etapa
- CTEs são sempre preferíveis para queries complexas — mais fáceis de ler e dar manutenção

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
