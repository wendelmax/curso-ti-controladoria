# 5.3 — Detecção de Anomalias em Lançamentos Contábeis

> 🔍 **Analogia**: Imagine que você é o porteiro de um prédio. Conhece cada morador de vista. Um dia, alguém entra de madrugada carregando um monitor de computador. Você não sabe exatamente *o que* está errado, mas algo *parece estranho*. É exatamente isso que a detecção de anomalias faz: **identifica o que foge do padrão normal**, mesmo sem saber o que é.

:::note "Anomalia" não é sinônimo de "fraude"
Importante: uma anomalia é um **alerta**, não uma condenação. Pode ser fraude, erro de digitação, ou simplesmente um lançamento legítimo fora do comum. O papel do modelo é **levantar a bandeira** — quem decide é você, profissional de controladoria.
:::

## 🎯 Por que isso importa para você?

Todo controller tem aquela sensação: "tem algo errado mas não consigo provar". Detecção de anomalias:
- **Automatiza** a busca por "agulhas no palheiro" — em vez de revisar 10.000 lançamentos manualmente
- **Padroniza** critérios — seu "estranho" pode ser diferente do "estranho" do seu colega
- **Acende alertas cedo** — antes que um pequeno erro vire um grande problema de auditoria

## Por que Detectar Anomalias?

- **Fraudes** seguem padrões diferentes de transações normais
- **Erros operacionais** geram lançamentos atípicos
- **Desvios de processo** indicam falta de controles internos
- **Outliers estatísticos** merecem investigação

## Abordagem Estatística (Sem ML — só com SQL)

:::tip Z-Score, IQR... nomes complicados, ideias simples
Essas técnicas são apenas formas de responder: **"Quanto esse valor foge do normal?"**
- Z-Score: "Quantos desvios padrão esse valor está da média?"
- IQR: "Este valor está muito além do que 75% dos lançamentos costumam ser?"

Você não precisa calcular na mão — isso é trabalho do SQL. Só precisa entender o que as respostas significam.
:::

### Z-Score — Quão atípico é um valor?

```sql
-- Detectando lançamentos com valor muito acima da média
WITH stats AS (
    SELECT
        AVG(valor) AS media,
        STDEV(valor) AS desvio_padrao
    FROM lancamentos_contabeis
    WHERE debito_credito = 'debito'
)
SELECT
    l.id_lancamento,
    l.valor,
    (l.valor - s.media) / s.desvio_padrao AS z_score,
    CASE
        WHEN ABS((l.valor - s.media) / s.desvio_padrao) > 3 THEN 'Crítico'
        WHEN ABS((l.valor - s.media) / s.desvio_padrao) > 2 THEN 'Suspeito'
        ELSE 'Normal'
    END AS classificacao
FROM lancamentos_contabeis l, stats s
WHERE l.debito_credito = 'debito'
ORDER BY ABS(z_score) DESC
LIMIT 20;
```

### IQR (Intervalo Interquartil) — Resistente a outliers

```sql
-- Quartis para detectar outliers
WITH quartis AS (
    SELECT
        id_conta,
        ROUND(AVG(CASE WHEN percentil = 25 THEN valor END), 2) AS q1,
        ROUND(AVG(CASE WHEN percentil = 75 THEN valor END), 2) AS q3
    FROM (
        SELECT
            id_conta,
            valor,
            NTILE(100) OVER (PARTITION BY id_conta ORDER BY valor) AS percentil
        FROM lancamentos_contabeis
    )
    WHERE percentil IN (25, 75)
    GROUP BY id_conta
)
SELECT
    l.*,
    q.q1, q.q3,
    (q.q3 - q.q1) * 1.5 AS iqr,
    CASE
        WHEN l.valor < q.q1 - (q.q3 - q.q1) * 1.5 THEN 'Anomalia - Abaixo'
        WHEN l.valor > q.q3 + (q.q3 - q.q1) * 1.5 THEN 'Anomalia - Acima'
        ELSE 'Normal'
    END AS classificacao
FROM lancamentos_contabeis l
JOIN quartis q ON l.id_conta = q.id_conta
WHERE l.valor > q.q3 + (q.q3 - q.q1) * 1.5
   OR l.valor < q.q1 - (q.q3 - q.q1) * 1.5;
```

## Regras de Negócio + Estatística

Combine regras de auditoria com análise estatística:

```sql
-- Regras IF combinadas com desvios
SELECT
    l.id_lancamento,
    l.historico,
    l.valor,
    p.descricao AS conta,
    cc.descricao AS centro_custo,
    CASE
        WHEN l.valor > 50000 AND l.debito_credito = 'credito' THEN 'Alto valor em conta credora'
        WHEN l.valor > 100000 THEN 'Valor muito alto'
        WHEN l.id_centro_custo IS NULL THEN 'Sem centro de custo'
        WHEN l.historico LIKE '%TESTE%' OR l.historico LIKE '%AJUSTE%' THEN 'Lançamento de ajuste'
        ELSE 'Normal'
    END AS alerta
FROM lancamentos_contabeis l
LEFT JOIN planos_contas p ON l.id_conta = p.id_conta
LEFT JOIN centros_custo cc ON l.id_centro_custo = cc.id_centro_custo
WHERE l.valor > 50000
   OR l.id_centro_custo IS NULL
   OR l.historico LIKE '%TESTE%';
```

## Abordagem ML: Isolation Forest

O Isolation Forest é um algoritmo que identifica anomalias isolando pontos atípicos. Diferente de métodos estatísticos, ele funciona bem com **múltiplas variáveis** simultaneamente.

### Características para analisar em lançamentos

| Variável | Por que relevante |
|----------|------------------|
| Valor do lançamento | Quantia atípica |
| Hora do lançamento | Fora do horário comercial |
| Dia da semana | Final de semana |
| Usuário que lançou | Usuário incomum para aquela conta |
| Frequência na conta | Muitos lançamentos no mesmo dia |
| Contrapartida | Combinação incomum de contas |

## BigQuery ML para Detecção de Anomalias

```sql
-- Criando modelo de anomalias (K-means para clusterização)
CREATE MODEL `projeto.modelo.anomalias_lancamentos`
OPTIONS(model_type='KMEANS', num_clusters=5)
AS
SELECT
    valor,
    id_conta,
    id_centro_custo,
    CASE WHEN debito_credito = 'debito' THEN 1 ELSE 0 END AS eh_debito,
    CAST(STRFTIME('%w', data_lancamento) AS INT64) AS dia_semana
FROM lancamentos_contabeis;
```

```sql
-- Detectando anomalias com o modelo
SELECT *
FROM ML.DETECT_ANOMALIES(
    MODEL `projeto.modelo.anomalias_lancamentos`,
    STRUCT(0.01 AS contamination)
);
```

## Padrões Comuns de Fraude/Erro

| Padrão | Descrição | Como Detectar |
|--------|-----------|---------------|
| **Duplicatas** | Mesmo valor, fornecedor, data | GROUP BY com HAVING COUNT > 1 |
| **Redondos** | Valores exatos (1.000,00) | valor % 1000 = 0 |
| **Fora de hora** | Lançamentos madrugada/fds | HOUR(data) e DAYOFWEEK |
| **Contas suspeitas** | Combinações incomuns | JOIN plano de contas |
| **Beneficiário incomum** | Fornecedor novo + valor alto | JOIN fornecedores |

### Exemplo: Detectando Pagamentos Duplicados

```sql
SELECT
    f.nome AS fornecedor,
    cp.valor,
    COUNT(*) AS qtd_lancamentos,
    GROUP_CONCAT(cp.descricao) AS descricoes
FROM contas_pagar cp
INNER JOIN fornecedores f ON cp.id_fornecedor = f.id_fornecedor
GROUP BY f.nome, cp.valor
HAVING COUNT(*) > 1;
```

## Implementando um Sistema de Alertas

1. **Batch diário**: Execute queries de anomalia todas as manhãs
2. **Thresholds dinâmicos**: Ajuste os limites baseado em média móvel
3. **Classifique por severidade**: Crítico, Alto, Médio, Baixo
4. **Notificação**: Envie alerts para o responsável (e-mail, Slack)
5. **Registro**: Mantenha log de todas as anomalias detectadas
6. **Feedback loop**: Marque falsos positivos para melhorar o modelo

## 🎯 Resumo do Capítulo

| Conceito | Em português claro |
|----------|-------------------|
| **Z-Score** | Mede "o quão fora da curva" um valor está |
| **IQR** | Identifica outliers baseado nos quartis dos dados |
| **Isolation Forest** | Algoritmo ML que isola pontos atípicos (como separar uma peça diferente em uma esteira) |
| **Anomalia ≠ Fraude** | Anomalia é um alerta para você investigar, não uma acusação |

> 💡 **Regra prática**: Na dúvida entre regra manual e ML? Comece com estatística simples (Z-Score, IQR). Se os padrões forem muito complexos para regras fixas, migre para ML. E lembre-se: **todo falso positivo é um alerta que você investiga; todo falso negativo é um problema que você não viu.**

## Exercício Prático

1. Crie uma query que encontre os 10 lançamentos mais atípicos (maior desvio da média da conta)
2. Detecte possíveis duplicatas em contas_pagar
3. Liste lançamentos feitos em finais de semana
4. Encontre contas que nunca tiveram lançamentos (podem indicar conta desnecessária)
5. Crie um ranking de contas por volatilidade (coeficiente de variação dos valores)

:::tip Não se prenda à perfeição dos exercícios
O importante é praticar o **raciocínio**: "o que é normal vs anormal nos meus dados?".
Comece simples: uma média, um desvio, um ORDER BY. Depois adicione complexidade.
:::
