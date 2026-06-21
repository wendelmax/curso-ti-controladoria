# 6.3 — DRE Automatizado

> 📑 **Analogia do Dia**  
> Você sabe como é: todo mês, a mesma rotina. Pegar saldos do sistema contábil, jogar no Excel, montar a DRE linha por linha, conferir se fechou, calcular margens...
>
> **Agora imagine que isso tudo é feito em 1 segundo com uma única query.**  
> Não é mágica. É SQL.
>
> E o melhor: no mês que vem, você roda a mesma query e a DRE já sai pronta. **Sem remontar planilha, sem arrastar fórmula, sem risco de erro.**

---

## Objetivo

Criar uma **Demonstração do Resultado do Exercício (DRE)** completamente automatizada em SQL.

:::note Por que isso importa para você?

A DRE é **o relatório mais importante da controladoria**. É o que a diretoria olha primeiro.

Com SQL:
- **Você não precisa mais montar manualmente** — a query monta
- **Margens calculadas automaticamente** — sem risco de erro de fórmula
- **Comparação mês a mês** — um `JOIN` resolve
- **Projeção** — o próprio SQL calcula a tendência

O tempo que você gastava montando, passa a gastar **analisando**.
:::

## 🤔 Entendendo as contas

O banco tem uma tabela `dre_mensal` com lançamentos já classificados por `id_conta`. Cada número é uma conta contábil:

| id_conta | Descrição |
|:--------:|-----------|
| 35, 36 | Receita Líquida |
| 39, 40, 41 | Custos (CPV) |
| 45-53 | Despesas Operacionais |
| 55, 56 | Despesas Tributárias |
| 60, 61 | Despesas Financeiras |

:::tip Você não precisa decorar!
Consulte sempre a tabela `planos_contas` para saber o que cada código significa. É como consultar o plano de contas do seu sistema contábil.
:::

---

## DRE Sintético por Mês — "A DRE Completa"

**O que faz:** Gera a DRE completa de todos os meses com margens calculadas automaticamente.

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

> 💡 Percebeu? A estrutura é **exatamente a mesma DRE que você monta no Excel**:  
> `Receita - Custos = Lucro Bruto → - Despesas = Resultado Líquido`

:::warning Atenção ao NULLIF!
`NULLIF(receita_liquida, 0)` evita o erro de "divisão por zero". Se a receita for zero, em vez de quebrar, o SQL retorna NULL. Isso é **essencial** em relatórios financeiros.
:::

---

## DRE Analítica — "Detalhando um Mês Específico"

**O que faz:** Mostra a DRE em detalhes para junho/2026 — conta por conta, como no seu plano de contas.

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

---

## DRE com Comparação Mês Anterior — "Análise de Variação"

**O que faz:** Compara cada conta da DRE com o mês anterior. É a **análise horizontal** que você faz no fechamento.

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

---

## DRE Projetada — "Para Onde Estamos Indo?"

**O que faz:** Usa a média dos meses anteriores para projetar o próximo mês com crescimento de 5%.

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

## Resumo do Capítulo

- ✅ **DRE automatizada** = mesma estrutura que você já conhece, agora em SQL
- ✅ **CTE `dre`** = a DRE inteira em uma consulta organizada
- ✅ **NULLIF** = proteção contra divisão por zero (essencial em finanças)
- ✅ **Comparação mês anterior** = análise de variação sem Excel
