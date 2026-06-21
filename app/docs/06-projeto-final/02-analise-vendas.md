# 6.2 — Análise de Vendas

> 📊 **Analogia do Dia**  
> Lembra quando você faz a análise de rentabilidade por cliente no fechamento do mês?  
> "Quem são os maiores clientes? Quanto cada um representa? Está concentrado demais?"
>
> **É exatamente isso que você vai fazer aqui** — mas com SQL, em segundos, sem precisar montar tabela dinâmica no Excel.

---

## Objetivo

Analisar o desempenho comercial do Grupo Nova Era usando SQL avançado — especialmente as **window functions** (funções de janela).

:::note Por que isso importa para você?

Na controladoria, você precisa responder perguntas como:

- "A receita está crescendo ou caindo?" → **Tendência mensal**
- "Quanto cada cliente representa?" → **Curva ABC de clientes**
- "Tem sazonalidade?" → **Comparação mês a mês**
- "Qual segmento dá mais lucro?" → **Análise por segmento**

Essas perguntas são as mesmas de sempre. A diferença é que agora você responde com **uma query em vez de horas de Excel**.
:::

## 🤔 "Window Function"? O que é isso?

**Window function** (função de janela) é uma ferramenta do SQL que **enxerga além da linha atual**.

Imagine que você está analisando uma planilha de vendas por mês. Com window functions, você pode:
- Calcular o **acumulado** até a linha atual
- Comparar com o **mês anterior** (LAG)
- Calcular a **participação percentual** de cada cliente no total

Sem window functions, você precisaria de consultas complicadas e subqueries. Com elas, **é uma linha de código**.

Pense assim: **Excel com função SUM, mas sem precisar arrastar a fórmula**.

---

## 1. Top 10 Clientes por Receita

**O que faz:** Mostra os 10 clientes que mais compraram, com segmento, estado, quantidade de notas e ticket médio.

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

:::tip Sempre confira se faz sentido!
Depois de rodar, pergunte: "Esse cliente realmente é o maior? O ticket médio está coerente?" Nunca confie cegamente no dado. Use seu conhecimento de negócio para validar.
:::

## 2. Concentração de Receita — Curva ABC

**O que faz:** Classifica os clientes em A (70% da receita), B (20%) e C (10%). Essencial para saber **se sua carteira é concentrada ou diversificada**.

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

:::warning Cuidado com a Curva ABC
Se seus top 3 clientes são classe A, **você tem risco de concentração**. Se um deles for embora, sua receita cai 30%+. Isso é um alerta importante para a diretoria!
:::

## 3. Tendência Mensal de Vendas

**O que faz:** Mostra a receita mês a mês com crescimento percentual. **A famosa "série histórica"** que você apresenta na reunião de diretoria.

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

> 💡 **Dica de ouro:** A função `LAG()` é como dizer: "me mostre o valor da LINHA ANTERIOR". É o equivalente a pegar a célula de cima numa planilha.

## 4. Análise por Segmento

**O que faz:** Agrupa os clientes por segmento (Indústria, Saúde, Comércio) e mostra qual segmento contribui mais.

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

**O que faz:** Descobre se tem meses que vendem mais que outros. Essencial para planejamento de fluxo de caixa.

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

---

## Insights Esperados — O Que Responder?

Após executar essas queries, você deve ser capaz de responder:

1. **Quem são os top 3 clientes?** Representam quanto % da receita?
2. **A receita está crescendo?** Qual a taxa de crescimento mensal?
3. **Qual segmento é mais relevante?** E qual tem maior ticket médio?
4. **Há sazonalidade?** Quais meses vendem mais?
5. **A carteira é concentrada ou diversificada?** Qual classe ABC predomina?

:::note Como apresentar esses insights?
Na sua apresentação final (etapa 6), você vai usar esses números para contar uma história:
- "Nossa receita cresceu X% no semestre"
- "Mas estamos concentrados em Y clientes — risco a monitorar"
- "O segmento de saúde tem a maior margem — oportunidade de expansão"
:::

## Entregáveis

- Query do ranking de clientes com classificação ABC
- Série histórica mensal com crescimento percentual
- Análise de concentração (qual cliente representa mais de 20%?)

## Resumo do Capítulo

- ✅ **Window functions** = funções que "enxergam além" da linha atual no SQL
- ✅ **Curva ABC** = 70/20/10 — classifique clientes por importância
- ✅ **LAG()** = compara com o mês anterior (como célula de cima no Excel)
- ✅ **Sazonalidade** = identificar meses fortes e fracos para planejar fluxo
