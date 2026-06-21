# 1.7 — Casos Financeiros Práticos

:::tip Imagine que...
Chegou sexta-feira, 17h, e o CFO aparece na sua mesa: "Preciso do fluxo de caixa projetado para os próximos 90 dias até segunda-feira de manhã."

Sem SQL, você passaria o fim de semana extraindo relatórios do ERP, juntando planilhas, conferindo PROCVs e rezando para não errar nenhuma fórmula.

Com SQL, você escreve uma query, executa em 2 segundos, e o relatório está pronto. Este módulo te dá exatamente esses poderes.
:::

:::note Por que isso importa para você?
Cada case aqui é um problema que você **já enfrentou ou vai enfrentar** na controladoria: conciliação, DRE, fluxo de caixa, aging de recebíveis, margem por produto. A diferença é que agora você vai aprender a resolver tudo em SQL — mais rápido, sem erros de fórmula, e sem depender de ninguém.

Não precisa entender tudo de primeira. Veja o problema, leia a query, tente executar no playground. A prática vai fazer o resto.
:::

Cada case abaixo mostra um problema real seguido da solução em SQL. Tente entender **o problema primeiro**, depois veja como o SQL resolve.

## Case 1: Conciliação Bancária

:::note O problema
O auditor quer saber: o saldo da conta "Banco Conta Movimento" nos lançamentos contábeis é o mesmo do extrato bancário? Sem SQL, você somaria manualmente débitos e créditos no Excel. Com SQL, a query abaixo faz isso em segundos para todos os meses de uma vez.
:::

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

:::note O problema
Chegou o fechamento do mês e a diretoria quer a DRE (Demonstração do Resultado do Exercício) completa. No ERP, você teria que gerar um relatório específico. Com SQL, você monta a DRE exatamente como precisa: contas, valores, período.
:::

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

:::note O problema
O CFO quer saber: vamos ter caixa para pagar as contas nos próximos 90 dias? Você precisa projetar entradas (contas a receber) vs saídas (contas a pagar) por faixa de vencimento. No Excel, você faria tabelas dinâmicas separadas e depois juntaria com PROCV. No SQL, tudo numa query só.
:::

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

:::note O problema
O relatório de aging mostra quais clientes estão com contas em atraso e há quanto tempo. Essencial para cobrança e provisionamento de devedores duvidosos. No Excel, você calcularia com `HOJE() - data_vencimento` e classificaria com `SE`. No SQL, usamos `JULIANDAY` e `CASE`.
:::

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

## Para fixar

- Todos os cases usam conceitos que você já aprendeu: SELECT, WHERE, GROUP BY, JOIN, CTE, CASE WHEN
- A diferença é que agora você está **combinando** esses conceitos para resolver problemas reais
- No começo parece difícil, mas com prática cada query fica mais natural — como montar uma fórmula contábil

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
