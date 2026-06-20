# 6.2 — Análise de Vendas

## Objetivo

Analisar o desempenho comercial do Grupo Nova Era usando SQL avançado e window functions.

## 1. Top 10 Clientes por Receita

```sql
SELECT
    c.nome,
    c.segmento,
    c.uf,
    COUNT(f.id_faturamento) AS qtd_notas,
    SUM(f.valor_liquido) AS receita_total,
    ROUND(AVG(f.valor_liquido), 2) AS ticket_medio
FROM faturamento f
INNER JOIN clientes c ON f.id_cliente = c.id_cliente
GROUP BY c.nome, c.segmento, c.uf
ORDER BY receita_total DESC
LIMIT 10;
```

## 2. Concentração de Receita (Curva ABC)

```sql
WITH receita_clientes AS (
    SELECT
        c.nome,
        SUM(f.valor_liquido) AS receita_total
    FROM faturamento f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
    GROUP BY c.nome
),
total_geral AS (
    SELECT SUM(receita_total) AS total FROM receita_clientes
),
ordenado AS (
    SELECT
        nome,
        receita_total,
        SUM(receita_total) OVER (ORDER BY receita_total DESC) AS acumulado,
        receita_total / (SELECT total FROM total_geral) AS pct
    FROM receita_clientes
)
SELECT
    nome,
    receita_total,
    ROUND(pct * 100, 2) AS percentual,
    ROUND(SUM(pct) OVER (ORDER BY receita_total DESC) * 100, 2) AS percentual_acumulado,
    CASE
        WHEN SUM(pct) OVER (ORDER BY receita_total DESC) <= 0.7 THEN 'A'
        WHEN SUM(pct) OVER (ORDER BY receita_total DESC) <= 0.9 THEN 'B'
        ELSE 'C'
    END AS classificacao
FROM ordenado
ORDER BY receita_total DESC;
```

## 3. Tendência Mensal de Vendas

```sql
SELECT
    strftime('%Y-%m', data_emissao) AS mes,
    COUNT(*) AS qtd_notas,
    SUM(valor_liquido) AS receita,
    ROUND(AVG(valor_liquido), 2) AS ticket_medio,
    LAG(SUM(valor_liquido)) OVER (ORDER BY strftime('%Y-%m', data_emissao)) AS receita_mes_anterior,
    ROUND((SUM(valor_liquido) - LAG(SUM(valor_liquido)) OVER (ORDER BY strftime('%Y-%m', data_emissao)))
        / NULLIF(LAG(SUM(valor_liquido)) OVER (ORDER BY strftime('%Y-%m', data_emissao)), 0) * 100, 2) AS crescimento_percentual
FROM faturamento
GROUP BY mes
ORDER BY mes;
```

## 4. Análise por Segmento

```sql
SELECT
    c.segmento,
    COUNT(DISTINCT c.id_cliente) AS qtd_clientes,
    SUM(f.valor_liquido) AS receita_total,
    ROUND(AVG(f.valor_liquido), 2) AS ticket_medio,
    ROUND(SUM(f.valor_liquido) * 100.0 / SUM(SUM(f.valor_liquido)) OVER (), 2) AS participacao
FROM faturamento f
INNER JOIN clientes c ON f.id_cliente = c.id_cliente
GROUP BY c.segmento
ORDER BY receita_total DESC;
```

## 5. Sazonalidade

```sql
SELECT
    CAST(strftime('%m', data_emissao) AS INTEGER) AS mes_numero,
    CASE CAST(strftime('%m', data_emissao) AS INTEGER)
        WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
        WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
    END AS mes_nome,
    SUM(valor_liquido) AS receita,
    COUNT(*) AS qtd_notas
FROM faturamento
GROUP BY mes_numero
ORDER BY mes_numero;
```

## Insights Esperados

Após executar essas queries, você deve ser capaz de responder:

1. **Quem são os top 3 clientes?** Representam quanto % da receita?
2. **A receita está crescendo?** Qual a taxa de crescimento mensal?
3. **Qual segmento é mais relevante?** E qual tem maior ticket médio?
4. **Há sazonalidade?** Quais meses vendem mais?
5. **A carteira é concentrada ou diversificada?** Qual classe ABC predomina?

## Entregáveis

- Query do ranking de clientes com classificação ABC
- Série histórica mensal com crescimento percentual
- Análise de concentração (qual cliente representa mais de 20%?)
