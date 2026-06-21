# 5.5 — BigQuery ML: Modelos Preditivos em SQL

> 🎂 **Analogia**: Sabe quando você faz um bolo? Você pode:
> - Separar todos os ingredientes, usar batedeira, forno, medir temperatura... (isso é fazer ML com Python)
> - **Ou** comprar uma mistura pronta: só adicionar água e levar ao forno (isso é BigQuery ML)
>
> BigQuery ML é a **mistura pronta** do machine learning. Você já sabe o ingrediente principal (SQL), e o forno já está quente (o BigQuery). É só adicionar os dados e esperar o modelo ficar pronto.

:::note A grande virada de chave
Até pouco tempo atrás, fazer machine learning exigia:
1. Saber Python 🐍
2. Configurar servidores 🖥️
3. Exportar dados do banco 📤
4. Instalar bibliotecas 📦
5. Virar especialista em estatística 🧮

Com BigQuery ML, você faz tudo com:
```sql
CREATE MODEL ... OPTIONS(model_type='LINEAR_REG') AS SELECT ...
```
**Se você sabe SELECT, você sabe criar modelos. Ponto.**
:::

## 🎯 Por que isso importa para você?

Porque você já é **90% do caminho**. Você já sabe SQL. Você já tem os dados no BigQuery. O que falta (criar o modelo) é uma extensão natural do que você já faz.

- Você já sabe SQL — **curva de aprendizado zero**
- Os dados **não saem do BigQuery** (segurança e governança)
- Modelos rodam em **escala de petabytes** (sem travamentos)
- Integração nativa com **Looker e planilhas**

## Modelos Suportados

| Modelo | Tipo | Uso Financeiro |
|--------|------|---------------|
| `LINEAR_REG` | Regressão | Prever fluxo de caixa |
| `LOGISTIC_REG` | Classificação | Risco de inadimplência |
| `ARIMA_PLUS` | Séries Temporais | Previsão de receitas |
| `KMEANS` | Clusterização | Segmentação de clientes |
| `BOOSTED_TREE` | Classificação/Regressão | Score de crédito |
| `DNN` | Deep Learning | Detecção de fraudes |

:::tip Só para ficar claro: o que é cada modelo?
- **LINEAR_REG** → Regressão linear → "Prever um número" (ex: quanto de receita?)
- **LOGISTIC_REG** → Regressão logística → "Classificar sim/não" (ex: vai pagar ou não?)
- **ARIMA_PLUS** → Séries temporais → "Prever ao longo do tempo" (ex: fluxo de caixa mensal)
- **KMEANS** → Clusterização → "Agrupar similares" (ex: clientes por perfil)
- **BOOSTED_TREE** → Árvores de decisão → "Classificação/regressão avançada" (ex: score de crédito)

Não se preocupe em decorar. Na prática, você vai usar **LINEAR_REG** e **ARIMA_PLUS** em 80% dos casos financeiros.
:::

## Exemplo 1: Previsão de Inadimplência

### Criando o modelo

```sql
CREATE MODEL `projeto.analise_credito.modelo_inadimplencia`
OPTIONS(
    model_type='LOGISTIC_REG',
    input_label_cols=['inadimplente'],
    auto_class_weights=TRUE
) AS
SELECT
    c.id_cliente,
    COUNT(f.id_faturamento) AS qtd_compras,
    AVG(f.valor_liquido) AS ticket_medio,
    SUM(f.valor_liquido) AS total_gasto,
    DATE_DIFF('2026-07-01', MAX(f.data_emissao)) AS dias_ultima_compra,
    COUNT(CASE WHEN cr.status = 'aberto' THEN 1 END) AS contas_abertas,
    SUM(CASE WHEN cr.status = 'aberto' THEN cr.valor ELSE 0 END) AS saldo_devedor,
    CASE WHEN MAX(cr.status) = 'aberto' THEN 1 ELSE 0 END AS inadimplente
FROM clientes c
LEFT JOIN faturamento f ON c.id_cliente = f.id_cliente
LEFT JOIN contas_receber cr ON c.id_cliente = cr.id_cliente
GROUP BY c.id_cliente;
```

### Avaliando o modelo

```sql
SELECT *
FROM ML.EVALUATE(MODEL `projeto.analise_credito.modelo_inadimplencia`);
```

Resultado esperado:
```
accuracy, precision, recall, f1_score, log_loss, roc_auc
0.87, 0.82, 0.79, 0.80, 0.35, 0.91
```

### Prevendo com novos dados

```sql
SELECT
    c.nome,
    resultado.predicted_inadimplente AS score_risco,
    resultado.probabilidade
FROM ML.PREDICT(
    MODEL `projeto.analise_credito.modelo_inadimplencia`,
    (
        SELECT 5 AS qtd_compras, 32000 AS ticket_medio, 160000 AS total_gasto,
               45 AS dias_ultima_compra, 2 AS contas_abertas, 15000 AS saldo_devedor
    )
) AS resultado;
```

## Exemplo 2: Previsão de Receitas (ARIMA)

```sql
CREATE MODEL `projeto.previsao_receitas.modelo_arima`
OPTIONS(
    model_type='ARIMA_PLUS',
    time_series_timestamp_col='data_ref',
    time_series_data_col='receita',
    time_series_id_col='produto',
    horizonte=3,
    auto_arima=TRUE
) AS
SELECT
    PARSE_DATE('%Y-%m', mes || '-01') AS data_ref,
    produto_servico AS produto,
    SUM(valor_liquido) AS receita
FROM faturamento
GROUP BY mes, produto_servico;
```

```sql
SELECT *
FROM ML.FORECAST(
    MODEL `projeto.previsao_receitas.modelo_arima`,
    STRUCT(6 AS horizonte, 0.95 AS confidence_level)
);
```

## Exemplo 3: Clusterização de Clientes

```sql
CREATE MODEL `projeto.segmentacao.modelo_kmeans`
OPTIONS(
    model_type='KMEANS',
    num_clusters=4,
    standardize_features=TRUE
) AS
SELECT
    id_cliente,
    total_gasto,
    frequencia_compras,
    ticket_medio,
    dias_ultima_compra
FROM (
    SELECT
        c.id_cliente,
        SUM(f.valor_liquido) AS total_gasto,
        COUNT(f.id_faturamento) AS frequencia_compras,
        AVG(f.valor_liquido) AS ticket_medio,
        DATE_DIFF('2026-07-01', MAX(f.data_emissao)) AS dias_ultima_compra
    FROM clientes c
    JOIN faturamento f ON c.id_cliente = f.id_cliente
    GROUP BY c.id_cliente
);
```

### Visualizando clusters

```sql
SELECT * FROM ML.CENTROIDS(
    MODEL `projeto.segmentacao.modelo_kmeans`
);
```

## Boas Práticas no BQML

1. **Dados de treino**: Use 70-80% dos dados históricos
2. **Dados de teste**: Reserve 20-30% para avaliação
3. **Evite data leakage**: Não use informações do futuro para prever o passado
4. **Balanceamento**: Se classes são desbalanceadas (poucas fraudes), use `auto_class_weights`
5. **Feature engineering**: Quanto melhores as features, melhor o modelo

## Limitações do BQML

- Modelos mais simples que frameworks dedicados (PyTorch, XGBoost)
- Limitado a dados tabulares (não processa imagens diretamente)
- Custo por processamento (bytes processados)
- Feature engineering mais limitada que Python

## 🎯 Resumo do Capítulo

| Conceito | Em português claro |
|----------|-------------------|
| **BigQuery ML (BQML)** | Crie modelos de ML usando SQL que você já conhece |
| **CREATE MODEL** | Comando SQL que "ensina" o modelo com seus dados |
| **ML.PREDICT / ML.FORECAST** | Funções que usam o modelo treinado para fazer previsões |
| **ML.EVALUATE** | Função que mostra as notas do modelo (acurácia, precisão, etc.) |

> 💡 **Mentalidade**: BQML transforma "Ai, ML é muito complicado" em "É só mais um SELECT".
> Seus dados já estão no BigQuery. Você já sabe SQL. **Só falta criar o modelo.** Literalmente uma linha de comando.

## Exercício

1. Crie um modelo de regressão linear no BQML para prever despesas futuras baseado em dados históricos
2. Calcule as métricas de avaliação do modelo
3. Use ML.PREDICT para prever despesas do próximo mês
4. Compare: qual conta contábil tem a previsão mais precisa? Qual a menos precisa?

:::warning Data Leakage — o erro mais comum
"Data leakage" é quando você **sem querer** usa informações do futuro para treinar um modelo que deveria prever o futuro. Exemplo: treinar o modelo para prever inadimplência usando dados de "se o cliente pagou" (que só existe depois do período que você quer prever). Sempre verifique: "essa informação estaria disponível na hora da previsão?"
:::
