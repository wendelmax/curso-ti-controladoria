# 5.2 — Previsão de Fluxo de Caixa com ML

## Por que Prever Fluxo de Caixa?

- Empresas com boa previsão de caixa têm **50% menos estresse financeiro**
- ML captura **sazonalidades** que planilhas ignoram
- Modelos aprendem **padrões de pagamento** de cada cliente

## Abordagens de Previsão

### 1. Abordagem Tradicional (Planilha)

```
Próximo mês = Média dos últimos 3 meses
```

Problema: ignora tendências, sazonalidade e comportamento individual.

### 2. ML — Regressão Linear

Usa múltiplas variáveis para prever o valor futuro:

```
FluxoCaixa = a + b1*mes + b2*receita_prevista + b3*contas_pagar + ...
```

### 3. ML — Séries Temporais (ARIMA)

Captura padrões temporais: tendência, sazonalidade, ciclos.

## Estruturando os Dados

### Dados Históricos

Para prever fluxo de caixa, você precisa de:

```sql
-- Histórico de entradas e saídas por mês
SELECT
    strftime('%Y-%m', data_vencimento) AS mes,
    SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END) AS entradas,
    SUM(CASE WHEN tipo = 'pagar' THEN valor ELSE 0 END) AS saidas,
    SUM(CASE WHEN tipo = 'receber' THEN valor ELSE -valor END) AS saldo
FROM (
    SELECT data_vencimento, valor, 'receber' AS tipo
    FROM contas_receber WHERE status = 'recebido'
    UNION ALL
    SELECT data_vencimento, valor, 'pagar' AS tipo
    FROM contas_pagar WHERE status = 'pago'
)
GROUP BY mes
ORDER BY mes;
```

### Features para o Modelo

| Feature | Fonte | Por que usar |
|---------|-------|-------------|
| Mês do ano | Calendário | Sazonalidade (férias, 13º) |
| Dia da semana | Calendário | Padrão de pagamentos |
| Receita prevista | Orçamento | Correlação com entradas |
| Contas a pagar pendentes | ERP | Saídas futuras conhecidas |
| Inadimplência histórica | Contas Receber | % de não pagamento |
| Feriados | Calendário | Dias úteis no mês |

## Exemplo Prático: Previsão com SQL + Regressão

Embora não tenhamos um modelo ML rodando no playground, podemos simular a previsão com uma regressão linear simples em SQL:

```sql
-- Tendência linear de receita mensal
WITH receita_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        SUM(valor_liquido) AS receita
    FROM faturamento
    GROUP BY mes
),
meses_num AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY mes) - 1 AS x,
        receita
    FROM receita_mensal
),
regressao AS (
    SELECT
        AVG(x) AS media_x,
        AVG(receita) AS media_y
    FROM meses_num
),
coeficientes AS (
    SELECT
        SUM((x - media_x) * (receita - media_y)) / 
        SUM((x - media_x) * (x - media_x)) AS inclinacao,
        media_y - (SUM((x - media_x) * (receita - media_y)) / 
        SUM((x - media_x) * (x - media_x))) * media_x AS intercepto
    FROM meses_num, regressao
)
SELECT
    'Previsão Próximo Mês' AS descricao,
    ROUND(intercepto + inclinacao * 6, 2) AS receita_prevista
FROM coeficientes;
```

## Modelos Prontos para Uso

### BigQuery ML — ARIMA_PLUS

```sql
CREATE MODEL `projeto.modelo.previsao_caixa`
OPTIONS(model_type='ARIMA_PLUS',
        time_series_timestamp_col='data_ref',
        time_series_data_col='saldo_caixa')
AS
SELECT data_ref, saldo_caixa FROM historico_caixa;
```

### Previsão com o modelo

```sql
SELECT *
FROM ML.FORECAST(MODEL `projeto.modelo.previsao_caixa`,
                 STRUCT(6 AS horizonte_dias));
```

## Interpretando Resultados

| Métrica | O que significa |
|---------|----------------|
| Predicted | Valor mais provável |
| Prediction Interval (95%) | Faixa onde o valor real deve estar com 95% de confiança |
| Std Deviation | Quanto o modelo "chuta" — baixo = mais confiável |

## Implementação na Prática

Passos para implementar previsão de fluxo de caixa:

1. **Extraia** 2+ anos de dados de contas a receber/pagar
2. **Limpe**: remova duplicatas, trate valores atípicos
3. **Crie features**: dia da semana, mês, trimestre, feriados
4. **Treine** o modelo com 80% dos dados históricos
5. **Teste** com 20% restantes — compare com a abordagem de planilha
6. **Implemente** previsões semanais para 4, 8, 12 semanas à frente

## Exercício

Usando o banco Nova Era, crie uma query que prepare os dados históricos mensais de fluxo de caixa (entradas - saídas) de janeiro a junho de 2026, separando por empresa.
