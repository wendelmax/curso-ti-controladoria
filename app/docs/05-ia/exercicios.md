# 5.7 — Exercícios de IA Aplicada

> 🧠 **Não se preocupe em "acertar" tudo**. Estes exercícios existem para **fixar os conceitos** que vimos nos capítulos anteriores. Se uma pergunta te fizer pensar "hmm, entendi, mas como eu explicaria isso para um colega?", já cumpriu seu papel.

import TFjsPredictor from '@site/src/components/TFjsPredictor';

## Prática: Previsão de Fluxo de Caixa com Machine Learning

O componente abaixo treina um modelo de regressão linear no navegador usando TensorFlow.js — **sem instalar nada, sem escrever código**. Os dados são do faturamento mensal do Grupo Nova Era (janeiro a junho de 2026).

:::tip Brinque com o componente!
Mude os valores, veja como o modelo se adapta. É literalmente arrastar controles e ver o resultado. Se você consegue usar um filtro no Excel, consegue usar isso.
:::

<TFjsPredictor />

## Exercícios Conceituais

1. **Qual a diferença entre regressão e classificação?**
   - *Resposta:* **Regressão** prevê **números** (ex: faturamento de R$ 500 mil). **Classificação** prevê **categorias** (ex: "cliente inadimplente" ou "não"). Pense: regressão responde "quanto?", classificação responde "qual?".
   - 📌 *Exemplo prático:* Prever o valor do fluxo de caixa do próximo mês → regressão. Prever se uma despesa é "Material Escritório" ou "Serviços" → classificação.

2. **O que significa overfitting e como evitar?**
   - *Resposta:* Overfitting é quando o modelo **decora** os dados de treino mas não **generaliza** para dados novos. É como um aluno que decora a prova anterior mas não sabe resolver questões novas.
   - **Como evitar:** use mais dados de treino, limite a complexidade do modelo, use validação cruzada (testar em diferentes conjuntos de dados).
   - 📌 *Na controladoria:* Um modelo que classifica 100% das despesas passadas corretamente, mas erra 40% das despesas novas → overfitting clássico.

3. **Qual métrica usar para cada problema?**

   | Problema | Métrica | Em português claro |
   |----------|---------|-------------------|
   | Regressão (prever valor) | MAE, RMSE, R² | "Em média, quanto erramos?" |
   | Classificação binária | Acurácia, Precisão, Recall, F1 | "De cada 100 alertas, quantos estavam certos?" |
   | Clusterização | Silhouette Score | "Os grupos fazem sentido?" |
   | Séries temporais | MAPE, MAE | "Qual o % de erro da previsão?" |

   :::note A métrica mais importante para você
   Para controladoria, **MAE** (Erro Absoluto Médio) é sua amiga: "em média, o modelo erra R$ 5.000 para cima ou para baixo". Isso é algo que você consegue explicar para o CFO. Já métricas como RMSE ou log_loss são mais para cientistas de dados.

4. **O que é detecção de anomalias e como aplicar na controladoria?**
   - *Resposta:* É o processo de **identificar padrões incomuns** nos dados. Pense como um alarme que dispara quando algo foge do normal — mas você decide se é um incêndio ou só queimou a torrada.
   - **Aplicações práticas:** pagamentos duplicados, fraudes em notas fiscais, desvios em despesas de viagem, variações atípicas no fluxo de caixa, lançamentos fora do horário comercial.

5. **Como o BigQuery ML pode ajudar na análise financeira?**
   - *Resposta:* Permite criar e executar modelos de ML **diretamente no banco de dados, usando SQL**. Você não precisa exportar dados, não precisa de Python, não precisa de ferramentas externas. Os dados ficam seguros onde estão.
   - **Modelos úteis:** regressão linear (prever vendas), ARIMA (séries temporais para fluxo de caixa), K-means (agrupar clientes por comportamento), classificadores (detectar fraudes).

   :::warning Segurança dos dados
   Esta é uma das maiores vantagens do BQML: seus dados financeiros **nunca saem do BigQuery**. Diferente de exportar para ferramentas externas, aqui o modelo vai até os dados — não o contrário.

6. **O que são features e labels no contexto de ML?**
   - *Resposta:* **Features** são as variáveis de **entrada** — as informações que o modelo usa para aprender (ex: mês, valor da despesa, fornecedor, centro de custo histórico). **Label** é a **resposta** que queremos prever (ex: conta contábil correta, valor do fluxo de caixa do próximo mês).
   - 📌 *Analogia:* Features são as perguntas da ficha médica (idade, peso, sintomas). Label é o diagnóstico que o médico dá.

7. **Cite 3 aplicações práticas de IA na controladoria:**
   - *Resposta:* (1) Previsão de fluxo de caixa com séries temporais → saber antecipadamente se vai faltar dinheiro, (2) Detecção automática de anomalias em despesas → encontrar pagamentos suspeitos antes da auditoria, (3) Classificação inteligente de notas fiscais → reduzir de horas para segundos o processo de lançamento contábil.

:::tip Recap — se você só lembrar disso, já valeu a pena
1. **IA = aprendizado com exemplos** → você mostra, o modelo aprende
2. **SQL é suficiente** para criar modelos (BigQuery ML)
3. **Comece simples**: regressão linear para prever, classificação para categorizar
4. **Overfitting** é o maior vilão — desconfie de modelos com 100% de acerto no treino
5. **Seu julgamento é insubstituível** — a IA faz o trabalho braçal, você faz a análise crítica
:::
