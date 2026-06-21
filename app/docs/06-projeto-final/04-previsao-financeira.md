# 6.4 — Previsão Financeira

> 🔮 **Analogia do Dia**  
> Imagine que você está fazendo o fluxo de caixa projetado para a reunião de diretoria:
> - Você olha o que entrou e saiu nos últimos meses
> - Verifica o que está previsto para entrar (contas a receber)
> - Verifica o que tem a pagar
> - Aplica um "fator de risco" para ser conservador
> - Apresenta: "Diretoria, nosso saldo projetado é R$ X"
>
> **Isso é EXATAMENTE o que você vai fazer aqui** — a diferença é que o SQL calcula tudo em segundos.

---

## Objetivo

Criar projeções financeiras usando SQL. **Nada de Machine Learning complicado** — você vai usar regressão linear, que é basicamente "traçar uma reta" nos dados para prever o futuro.

:::note Por que isso importa para você?

Previsão financeira é **o que a diretoria mais valoriza**. Não basta mostrar o que aconteceu — eles querem saber:

- "Qual vai ser nosso saldo daqui a 30 dias?"
- "Vamos precisar de captação?"
- "Quais clientes podem atrasar?"
- "Qual o cenário mais realista?"

Com SQL, você responde todas essas perguntas **com dados, não com achismo**.
:::

## 🤔 "Regressão Linear"? Machine Learning? Isso é difícil?

**Não.** Regressão linear é simplesmente:

> **"Dados os últimos 6 meses de receita, qual a reta que melhor se ajusta a esses pontos? E onde essa reta chega no mês 7?"**

É o equivalente a pegar 6 pontos num gráfico de dispersão, desenhar uma régua que mais se aproxima deles, e estender a régua para prever o próximo ponto.

**Você já faz isso intuitivamente** quando olha os últimos meses e pensa: "a receita está subindo, então no próximo mês deve ser maior". A regressão linear é só a versão matemática desse raciocínio.

---

## 1. Fluxo de Caixa Realizado (Jan-Jun) — "O Retrovisor"

**O que faz:** Mostra o que realmente aconteceu. Entradas vs. saídas mês a mês. **Essencial antes de projetar.**

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

> 💡 **COALESCE** = "se for nulo, usa 0". É essencial porque pode ser que um mês tenha entrada mas não saída (ou vice-versa).

---

## 2. Projeção de Curto Prazo (30/60 dias) — "O Para-brisa"

**O que faz:** Olha as contas a receber e a pagar que estão em aberto e projeta os próximos 15, 30 e 60 dias.

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

:::caution Projeção ≠ Certeza
Essa projeção assume que **todo mundo vai pagar na data**. A vida real é diferente. Por isso você vai fazer a análise de risco (item 4) e os cenários (item 5) — para ter uma visão mais realista.
:::

---

## 3. Previsão com Regressão Linear — "A Reta que Prevê"

**O que faz:** Calcula a tendência dos últimos meses e projeta o próximo.

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

:::tip Não se assuste com a fórmula!
A matemática parece complexa, mas o conceito é simples:
- **"a"** = inclinação da reta (está subindo ou descendo?)
- **"b"** = ponto de partida
- **"a * 6 + b"** = onde a reta chega no mês 7 (julho)

Você não precisa decorar a fórmula. Entenda o conceito: **o SQL traça uma reta nos dados e prevê o próximo ponto**.
:::

---

## 4. Análise de Risco — "Quem Pode Atrasar?"

**O que faz:** Classifica os clientes com contas abertas por nível de risco de inadimplência.

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

:::warning Risco ALTO = Ação Imediata
Clientes com risco ALTO merecem atenção especial: cobrança reforçada, renegociação, ou até bloqueio de novos pedidos.
:::

---

## 5. Cenários — "Otimista, Realista e Pessimista"

**O que faz:** Aplica diferentes taxas de recebimento para simular cenários.

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

> 💡 **Na prática:** Seu chefe vai perguntar "e se 30% dos clientes atrasarem?". Com essa query, você responde na hora.

---

## Entregáveis

- Fluxo de caixa mensal realizado (jan-jun)
- Projeção de fluxo de caixa para 30 e 60 dias
- Previsão de receita para julho/2026
- Classificação de risco de clientes inadimplentes
- Análise de cenários (otimista, realista, pessimista)

## Resumo do Capítulo

- ✅ **Previsão financeira** = olhar o retrovisor (realizado) + para-brisa (projetado)
- ✅ **Regressão linear** = traçar uma reta nos dados e estender para prever
- ✅ **Análise de risco** = classificar clientes por ALTO/MÉDIO/BAIXO risco
- ✅ **Cenários** = nunca confie em um único número; mostre otimista, realista e pessimista
