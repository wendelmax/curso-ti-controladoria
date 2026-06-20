# 1.7 — Casos Financeiros Práticos

Case studies reais que você vai enfrentar no dia-a-dia da controladoria.

## Case 1: Conciliação Bancária

Comparar lançamentos contábeis com extratos (simulados):

```sql
WITH lancamentos_banco AS (
    SELECT
        strftime('%Y-%m', data_lancamento) AS mes,
        SUM(CASE WHEN debito_credito = 'debito' THEN valor ELSE 0 END) AS total_debito,
        SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END) AS total_credito
    FROM lancamentos_contabeis
    WHERE id_conta = 5  -- Banco Conta Movimento
    GROUP BY mes
)
SELECT
    mes,
    total_debito,
    total_credito,
    total_debito - total_credito AS saldo_lancado
FROM lancamentos_banco
ORDER BY mes;
```

## Case 2: DRE Analítica

Demonstração do Resultado do mês de junho/2026:

```sql
SELECT
    p.codigo,
    p.descricao,
    SUM(l.valor) AS valor
FROM lancamentos_contabeis l
INNER JOIN planos_contas p ON l.id_conta = p.id_conta
WHERE strftime('%Y-%m', l.data_competencia) = '2026-06'
GROUP BY p.codigo, p.descricao
ORDER BY p.codigo;
```

## Case 3: Fluxo de Caixa Projetado

Contas a receber vs contas a pagar nos próximos 30, 60, 90 dias:

```sql
WITH receber AS (
    SELECT
        CASE
            WHEN data_vencimento BETWEEN '2026-06-01' AND '2026-06-30' THEN 'Ate 30 dias'
            WHEN data_vencimento BETWEEN '2026-07-01' AND '2026-07-31' THEN '31 a 60 dias'
            ELSE 'Acima de 60 dias'
        END AS faixa,
        SUM(valor) AS total_receber
    FROM contas_receber
    WHERE status = 'aberto'
    GROUP BY faixa
),
pagar AS (
    SELECT
        CASE
            WHEN data_vencimento BETWEEN '2026-06-01' AND '2026-06-30' THEN 'Ate 30 dias'
            WHEN data_vencimento BETWEEN '2026-07-01' AND '2026-07-31' THEN '31 a 60 dias'
            ELSE 'Acima de 60 dias'
        END AS faixa,
        SUM(valor) AS total_pagar
    FROM contas_pagar
    WHERE status = 'aberto'
    GROUP BY faixa
)
SELECT
    r.faixa,
    r.total_receber,
    p.total_pagar,
    r.total_receber - p.total_pagar AS saldo_projetado
FROM receber r
LEFT JOIN pagar p ON r.faixa = p.faixa
ORDER BY r.faixa;
```

## Case 4: Aging de Contas a Receber

Antiguidade de saldos:

```sql
SELECT
    c.nome AS cliente,
    cr.valor,
    cr.data_vencimento,
    JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) AS dias_vencido,
    CASE
        WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 0 THEN 'A Vencer'
        WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 30 THEN '1-30 dias'
        WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 60 THEN '31-60 dias'
        WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 90 THEN '61-90 dias'
        ELSE 'Acima de 90 dias'
    END AS faixa_aging
FROM contas_receber cr
INNER JOIN clientes c ON cr.id_cliente = c.id_cliente
WHERE cr.status = 'aberto'
ORDER BY dias_vencido DESC;
```

## Case 5: Margem Bruta por Produto/Serviço

```sql
SELECT
    produto_servico,
    COUNT(*) AS qtd_vendas,
    SUM(valor_total) AS receita_bruta,
    SUM(valor_liquido) AS receita_liquida,
    ROUND((SUM(valor_liquido) - SUM(valor_total) * 0.6) / SUM(valor_liquido) * 100, 2) AS margem_estimada
FROM faturamento
GROUP BY produto_servico
ORDER BY margem_estimada DESC;
```

## Case 6: Débito e Crédito por Conta

Partidas dobradas resumidas:

```sql
SELECT
    p.codigo,
    p.descricao,
    SUM(CASE WHEN l.debito_credito = 'debito' THEN l.valor ELSE 0 END) AS total_debito,
    SUM(CASE WHEN l.debito_credito = 'credito' THEN l.valor ELSE 0 END) AS total_credito,
    SUM(CASE WHEN l.debito_credito = 'debito' THEN l.valor ELSE -l.valor END) AS saldo
FROM lancamentos_contabeis l
INNER JOIN planos_contas p ON l.id_conta = p.id_conta
WHERE l.data_competencia = '2026-06'
GROUP BY p.codigo, p.descricao
HAVING saldo <> 0
ORDER BY p.codigo;
```

## Exercícios Finais

1. Crie uma conciliação entre contas_pagar e lancamentos_contabeis para o mês de maio
2. Monte um demonstrativo de resultado (DRE) completo com: receita líquida, CPV, lucro bruto, despesas, resultado líquido
3. Calcule o prazo médio de recebimento por cliente
4. Faça uma análise de concentração de faturamento (qual cliente representa quantos % do total)
5. Crie um relatório de inadimplência: clientes com contas em aberto vencidas há mais de 30 dias

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="case-1"
  prompt="Crie um aging de contas a receber. Mostre nome do cliente, valor, dias vencido e faixa (A Vencer / Vencido). Use a data de referência '2026-06-30'."
  hint="Use CASE WHEN com JULIANDAY para calcular dias"
  table="contas_receber"
  expectedSql="SELECT c.nome AS cliente, cr.valor, cr.data_vencimento, CAST(JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) AS INTEGER) AS dias_vencido, CASE WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 0 THEN 'A Vencer' ELSE 'Vencido' END AS faixa FROM contas_receber cr INNER JOIN clientes c ON cr.id_cliente = c.id_cliente WHERE cr.status = 'aberto' ORDER BY dias_vencido DESC"
/>

<SqlExercicio
  id="case-2"
  prompt="Calcule a margem bruta percentual de cada produto/serviço vendido. Mostre produto_servico, receita_liquida e margem. A margem é (valor_liquido / valor_total * 100)."
  hint="AVG(valor_liquido / valor_total * 100) agrupado por produto_servico"
  table="faturamento"
  expectedSql="SELECT produto_servico, SUM(valor_liquido) AS receita_liquida, ROUND(AVG(valor_liquido * 100.0 / valor_total), 2) AS margem_percentual FROM faturamento GROUP BY produto_servico ORDER BY margem_percentual DESC"
/>
