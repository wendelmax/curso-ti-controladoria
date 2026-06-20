# 6.3 — DRE Automatizado

## Objetivo

Criar uma Demonstração do Resultado do Exercício (DRE) completamente automatizada em SQL.

## DRE Sintético por Mês

```sql
WITH dre AS (
    SELECT
        d.mes,
        SUM(CASE WHEN d.id_conta IN (35, 36) THEN d.valor ELSE 0 END) AS receita_liquida,
        SUM(CASE WHEN d.id_conta IN (39, 40, 41) THEN d.valor ELSE 0 END) AS custos,
        SUM(CASE WHEN d.id_conta IN (49, 50, 51, 52, 53, 45, 46, 47) THEN d.valor ELSE 0 END) AS despesas_operacionais,
        SUM(CASE WHEN d.id_conta IN (55, 56) THEN d.valor ELSE 0 END) AS despesas_tributarias,
        SUM(CASE WHEN d.id_conta IN (60, 61) THEN d.valor ELSE 0 END) AS despesas_financeiras
    FROM dre_mensal d
    GROUP BY d.mes
)
SELECT
    mes,
    receita_liquida,
    custos,
    receita_liquida - custos AS lucro_bruto,
    ROUND((receita_liquida - custos) * 100.0 / NULLIF(receita_liquida, 0), 2) AS margem_bruta_pct,
    despesas_operacionais,
    despesas_tributarias,
    despesas_financeiras,
    receita_liquida - custos - despesas_operacionais - despesas_tributarias - despesas_financeiras AS resultado_liquido,
    ROUND((receita_liquida - custos - despesas_operacionais - despesas_tributarias - despesas_financeiras)
        * 100.0 / NULLIF(receita_liquida, 0), 2) AS margem_liquida_pct
FROM dre
ORDER BY mes;
```

## DRE Analítica (Junho/2026)

```sql
SELECT
    p.codigo,
    p.descricao,
    p.natureza,
    SUM(CASE WHEN l.debito_credito = 'debito' THEN l.valor ELSE 0 END) AS debito,
    SUM(CASE WHEN l.debito_credito = 'credito' THEN l.valor ELSE 0 END) AS credito,
    SUM(CASE WHEN l.debito_credito = 'credito' THEN l.valor ELSE -l.valor END) AS saldo
FROM lancamentos_contabeis l
INNER JOIN planos_contas p ON l.id_conta = p.id_conta
WHERE l.data_competencia = '2026-06'
GROUP BY p.codigo, p.descricao, p.natureza
ORDER BY p.codigo;
```

## DRE com Comparação Mês Anterior

```sql
WITH dre_analitica AS (
    SELECT
        l.data_competencia,
        p.codigo,
        p.descricao,
        SUM(l.valor) AS valor
    FROM lancamentos_contabeis l
    INNER JOIN planos_contas p ON l.id_conta = p.id_conta
    GROUP BY l.data_competencia, p.codigo, p.descricao
)
SELECT
    a.data_competencia,
    a.codigo,
    a.descricao,
    a.valor AS valor_atual,
    b.valor AS valor_mes_anterior,
    a.valor - b.valor AS variacao,
    ROUND((a.valor - b.valor) * 100.0 / NULLIF(b.valor, 0), 2) AS variacao_pct
FROM dre_analitica a
LEFT JOIN dre_analitica b
    ON a.codigo = b.codigo
    AND a.data_competencia = (
        SELECT MAX(data_competencia) FROM dre_analitica
        WHERE codigo = a.codigo AND data_competencia < a.data_competencia
    )
ORDER BY a.data_competencia, a.codigo;
```

## DRE Projetada (com base na tendência)

```sql
WITH dre_mensal AS (
    SELECT
        d.mes,
        SUM(CASE WHEN d.id_conta IN (35, 36) THEN d.valor ELSE 0 END) AS receita,
        SUM(CASE WHEN d.id_conta IN (39, 40, 41) THEN d.valor ELSE 0 END) AS cpv
    FROM dre_mensal d
    GROUP BY d.mes
),
tendencia AS (
    SELECT
        AVG(receita - cpv) AS media_lucro_bruto,
        AVG(receita) AS media_receita
    FROM dre_mensal
)
SELECT
    'Projeção Próximo Mês' AS descricao,
    ROUND(media_receita * 1.05, 2) AS receita_prevista,
    ROUND(media_lucro_bruto * 1.05, 2) AS lucro_bruto_previsto
FROM tendencia;
```

## Entregáveis

- Query da DRE sintética com todos os meses
- Query da DRE analítica de junho/2026
- Indicadores calculados: margem bruta e líquida por mês
- Análise da evolução das margens ao longo do semestre
