# 6.4 — Previsão Financeira

## Objetivo

Criar projeções financeiras usando SQL e fundamentos de Machine Learning.

## 1. Fluxo de Caixa Realizado (Jan-Jun)

```sql
WITH entradas AS (
    SELECT
        strftime('%Y-%m', data_vencimento) AS mes,
        SUM(valor) AS total_entradas
    FROM contas_receber
    WHERE status = 'recebido'
    GROUP BY mes
),
saidas AS (
    SELECT
        strftime('%Y-%m', data_vencimento) AS mes,
        SUM(valor) AS total_saidas
    FROM contas_pagar
    WHERE status = 'pago'
    GROUP BY mes
)
SELECT
    COALESCE(e.mes, s.mes) AS mes,
    COALESCE(e.total_entradas, 0) AS entradas,
    COALESCE(s.total_saidas, 0) AS saidas,
    COALESCE(e.total_entradas, 0) - COALESCE(s.total_saidas, 0) AS saldo_livre
FROM entradas e
FULL OUTER JOIN saidas s ON e.mes = s.mes
ORDER BY mes;
```

## 2. Projeção de Curto Prazo (30/60 dias)

```sql
SELECT
    'A Receber' AS tipo,
    SUM(CASE WHEN data_vencimento <= '2026-07-15' THEN valor ELSE 0 END) AS ate_15_dias,
    SUM(CASE WHEN data_vencimento BETWEEN '2026-07-16' AND '2026-07-31' THEN valor ELSE 0 END) AS ate_30_dias,
    SUM(CASE WHEN data_vencimento BETWEEN '2026-08-01' AND '2026-08-31' THEN valor ELSE 0 END) AS ate_60_dias
FROM contas_receber
WHERE status = 'aberto'
UNION ALL
SELECT
    'A Pagar' AS tipo,
    SUM(CASE WHEN data_vencimento <= '2026-07-15' THEN valor ELSE 0 END),
    SUM(CASE WHEN data_vencimento BETWEEN '2026-07-16' AND '2026-07-31' THEN valor ELSE 0 END),
    SUM(CASE WHEN data_vencimento BETWEEN '2026-08-01' AND '2026-08-31' THEN valor ELSE 0 END)
FROM contas_pagar
WHERE status = 'aberto';
```

## 3. Previsão com Regressão Linear (SQL)

```sql
WITH receita_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        SUM(valor_liquido) AS receita
    FROM faturamento
    GROUP BY mes
),
numeros AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY mes) - 1 AS x,
        receita
    FROM receita_mensal
),
medias AS (
    SELECT AVG(x) AS media_x, AVG(receita) AS media_y FROM numeros
),
coef AS (
    SELECT
        SUM((x - media_x) * (receita - media_y)) / 
        SUM((x - media_x) * (x - media_x)) AS a,
        media_y - (SUM((x - media_x) * (receita - media_y)) / 
        SUM((x - media_x) * (x - media_x))) * media_x AS b
    FROM numeros, medias
)
SELECT
    'Julho/2026' AS mes,
    ROUND(b + a * 6, 2) AS receita_prevista
FROM coef;
```

## 4. Análise de Risco (Probabilidade de Inadimplência)

```sql
SELECT
    c.nome,
    c.segmento,
    SUM(cr.valor) AS saldo_aberto,
    COUNT(cr.id_conta_receber) AS qtd_abertas,
    MAX(JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento)) AS max_dias_atraso,
    CASE
        WHEN SUM(cr.valor) > 50000 OR MAX(JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento)) > 60 THEN 'ALTO'
        WHEN SUM(cr.valor) > 20000 OR MAX(JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento)) > 30 THEN 'MÉDIO'
        ELSE 'BAIXO'
    END AS risco_inadimplencia
FROM contas_receber cr
INNER JOIN clientes c ON cr.id_cliente = c.id_cliente
WHERE cr.status = 'aberto'
GROUP BY c.nome, c.segmento
ORDER BY risco_inadimplencia, saldo_aberto DESC;
```

## 5. Cenários

```sql
WITH base AS (
    SELECT
        SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END) AS saldo_receber,
        SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END) * 0.95 AS cenário_otimista,
        SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END) * 0.85 AS cenário_realista,
        SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END) * 0.70 AS cenário_pessimista
    FROM contas_receber
    UNION ALL
    SELECT
        -SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END),
        -SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END),
        -SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END),
        -SUM(CASE WHEN status = 'aberto' THEN valor ELSE 0 END)
    FROM contas_pagar
)
SELECT
    'Saldo Projetado' AS descricao,
    SUM(otimista) AS saldo_otimista,
    SUM(realista) AS saldo_realista,
    SUM(pessimista) AS saldo_pessimista
FROM (SELECT SUM(cenário_otimista) AS otimista, SUM(cenário_realista) AS realista, SUM(cenário_pessimista) AS pessimista FROM base);
```

## Entregáveis

- Fluxo de caixa mensal realizado (jan-jun)
- Projeção de fluxo de caixa para 30 e 60 dias
- Previsão de receita para julho/2026
- Classificação de risco de clientes inadimplentes
- Análise de cenários (otimista, realista, pessimista)
