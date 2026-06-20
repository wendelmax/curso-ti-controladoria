# 5.7 — Exercícios de IA Aplicada

import TFjsPredictor from '@site/src/components/TFjsPredictor';

## Prática: Previsão de Fluxo de Caixa com Machine Learning

O componente abaixo treina um modelo de regressão linear no navegador usando TensorFlow.js.
Os dados são do faturamento mensal do Grupo Nova Era (janeiro a junho de 2026).

<TFjsPredictor />

## Exercícios Conceituais

1. **Qual a diferença entre regressão e classificação?**
   - *Resposta:* Regressão prevê valores contínuos (ex: faturamento de R$ 500k). Classificação prevê categorias (ex: "cliente inadimplente" ou "não").

2. **O que significa overfitting e como evitar?**
   - *Resposta:* Overfitting ocorre quando o modelo decora os dados de treino mas não generaliza. Para evitar: mais dados, menos épocas, regularização (L1/L2), validação cruzada.

3. **Qual métrica usar para cada problema?**

   | Problema | Métrica |
   |----------|---------|
   | Regressão (prever valor) | MAE, RMSE, R² |
   | Classificação binária | Acurácia, Precisão, Recall, F1, AUC-ROC |
   | Clusterização | Silhouette Score, Inércia |
   | Séries temporais | MAPE, MAE, RMSE |

4. **O que é detecção de anomalias e como aplicar na controladoria?**
   - *Resposta:* Identificar padrões incomuns nos dados. Aplicações: detecção de pagamentos duplicados, fraudes em notas fiscais, desvios em despesas, variações atípicas no fluxo de caixa.

5. **Como o BigQuery ML pode ajudar na análise financeira?**
   - *Resposta:* Permite criar e executar modelos ML diretamente no data warehouse com SQL. Modelos disponíveis: regressão linear (previsão de vendas), ARIMA (séries temporais), K-means (clusterização de clientes), classificadores (detecção de fraudes).

6. **O que são features e labels no contexto de ML?**
   - *Resposta:* Features são as variáveis de entrada (ex: mês, despesas, número de clientes). Label é o valor que queremos prever (ex: faturamento do próximo mês).

7. **Cite 3 aplicações práticas de IA na controladoria:**
   - *Resposta:* (1) Previsão de fluxo de caixa com séries temporais, (2) Detecção automática de anomalias em despesas, (3) Classificação de fornecedores por risco de inadimplência.
