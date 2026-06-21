# Integração Looker + BigQuery

> **Imagine que...** seu escritório de contabilidade tem uma "caixa de arquivos" gigante (BigQuery) onde ficam todos os lançamentos, plano de contas, centros de custo — anos de dados. O Looker é uma "mesa de trabalho" que se conecta a essa caixa e te deixa montar relatórios sem precisar revirar a caixa manualmente. Esta página mostra como essa conexão é feita.

:::warning Isso não é para você fazer
As configurações desta página são **técnicas e executadas pelo engenheiro de dados ou analista de BI**. Você não precisa configurar nada disso. Mas entender o que acontece "por baixo dos panos" ajuda a:
- Saber pedir a configuração certa
- Entender por que algumas consultas são lentas (ou caras)
- Não se assustar quando ouvir "Service Account", "PDT", "Cache" na reunião
:::

## Conexão Looker ↔ BigQuery — "O Canal de Comunicação"

### Como a conexão é configurada

No painel administrativo do Looker, em **Admin > Connections**, o analista de BI preenche estas informações:

```yaml
Connection Settings:
  Name:                    controladoria-bq-prod
  Dialect:                 Google BigQuery
  Authentication:          Service Account (JSON Key)
  Service Account:         looker-sa@projeto.iam.gserviceaccount.com
  Project:                 projeto-controladoria
  Billing Project:         projeto-controladoria
  Location:                US
  Temporary GCS Bucket:    looker_temp_staging
  Max Connections:         10
  Total Max Connections:   20
  Database:                controladoria
```

:::tip Jargão explicado
- **Service Account** = uma "identidade digital" que o Looker usa para acessar o BigQuery. É como um crachá de funcionário: identifica quem está fazendo a consulta.
- **Dialect** = "dialeto". BigQuery fala um SQL específico. O Looker precisa saber qual "idioma" usar para se comunicar.
- **GCS Bucket** = uma "pasta temporária" no Google Cloud Storage usada para transferir dados grandes entre Looker e BigQuery.
:::

### Service Account com Escopo Mínimo — "O Mínimo de Acesso Necessário"

:::caution Princípio de segurança
A Service Account do Looker deve ter **apenas as permissões necessárias** para fazer o trabalho — nem mais, nem menos. É como dar a chave só da sala de arquivos, não do prédio inteiro.
:::

```json
{
  "type": "service_account",
  "project_id": "projeto-controladoria",
  "private_key_id": "key-omitida-em-producao",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "looker-sa@projeto-controladoria.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/looker-sa%40projeto-controladoria.iam.gserviceaccount.com"
}
```

### Permissões no BigQuery

```sql
-- Permissões para ler dados financeiros
GRANT `roles/bigquery.dataViewer`
ON DATASET controladoria
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

-- Permissão para executar consultas
GRANT `roles/bigquery.jobUser`
ON PROJECT 'projeto-controladoria'
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

-- Permissão para criar tabelas temporárias (PDTs)
GRANT `roles/bigquery.dataEditor`
ON DATASET controladoria_looker_scratch
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

GRANT `roles/bigquery.dataEditor`
ON DATASET controladoria_pdts
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';
```

## Persistent Derived Tables (PDTs) — "Rascunhos que viram Tabelas Permanentes"

:::note Pense como...
PDTs são como **resumos executivos** que você prepara com antecedência. Em vez de reler o relatório completo de 500 páginas toda vez que alguém pergunta "qual a Receita do mês?", você deixa um resumo de 1 página já calculado. O Looker faz a mesma coisa: pré-calcula consultas pesadas e guarda o resultado pronto para consultas futuras.
:::

### PDT para DRE Agregada

```lookml
view: dre_agregada_pdt {
  derived_table: {
    sql:
      SELECT
        EXTRACT(YEAR  FROM l.data_contabil) AS ano,
        EXTRACT(MONTH FROM l.data_contabil) AS mes,
        p.nivel_1 AS grupo_dre,
        p.nome_conta,
        l.natureza,
        SUM(l.valor) AS valor_total
      FROM `projeto-controladoria.controladoria.lancamentos_contabeis` l
      INNER JOIN `projeto-controladoria.controladoria.plano_contas` p
        ON l.id_conta_contabil = p.id
      WHERE l.tipo_conta IN ('Receita', 'Despesa')
      GROUP BY 1, 2, 3, 4, 5
    ;;

    distribution_style: all
    partition_keys: [ano]
    sort_keys: [ano, mes, grupo_dre]
    datagroup_trigger: dre_snapshot_datagroup
    indexing: "lancamentos_contabeis_idx"
  }

  dimension: ano {
    type: number
    sql: ${TABLE}.ano ;;
  }

  dimension: mes {
    type: number
    sql: ${TABLE}.mes ;;
  }

  dimension: grupo_dre {
    type: string
    sql: ${TABLE}.grupo_dre ;;
  }

  dimension: nome_conta {
    type: string
    sql: ${TABLE}.nome_conta ;;
  }

  measure: valor_total {
    type: sum
    sql: ${TABLE}.valor_total ;;
    value_format_name: brl
  }
}
```

:::tip Por que isso importa para você?
Sua DRE mensal consulta milhões de linhas. Sem PDT, cada clique no dashboard leva 30 segundos. Com PDT, a consulta já está pré-calculada e o resultado aparece em **2 segundos**. A diferença é sentida no dia a dia.
:::

### Datagroups para Controle de Atualização — "Quando a PDT é recalculada"

```lookml
datagroup: dre_snapshot_datagroup {
  label: "Agendamento DRE"
  sql_trigger:
    SELECT MAX(data_atualizacao)
    FROM `projeto-controladoria.controladoria.controle_carga`
    WHERE tabela = 'lancamentos_contabeis'
    ;;
  max_cache_age: "24 hours"
  description: "Recalcula PDT da DRE quando há nova carga de lançamentos"
}
```

:::note O que isso faz na prática
- Uma PDT da DRE é calculada **automaticamente sempre que o ERP carrega novos lançamentos**
- Se não houver novos dados, a PDT não é recalculada (economiza processamento)
- Se ninguém consultar por 24h, o Looker pode usar o resultado antigo
- **Você não precisa fazer nada** — o sistema decide sozinho quando atualizar
:::

### PDT para Fechamento Mensal

```lookml
view: fechamento_mensal_pdt {
  derived_table: {
    sql:
      WITH saldos AS (
        SELECT
          DATE_TRUNC(l.data_contabil, MONTH) AS mes_fechamento,
          l.id_conta_contabil,
          p.nome_conta,
          p.classe,
          l.id_centro_custo,
          SUM(CASE WHEN l.natureza = 'C' THEN l.valor ELSE -l.valor END) AS saldo
        FROM lancamentos_contabeis l
        JOIN plano_contas p ON l.id_conta_contabil = p.id
        WHERE l.data_contabil <= LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)
        GROUP BY 1, 2, 3, 4, 5
      )
      SELECT
        mes_fechamento,
        id_conta_contabil,
        nome_conta,
        classe,
        id_centro_custo,
        SUM(saldo) OVER (
          PARTITION BY id_conta_contabil, id_centro_custo
          ORDER BY mes_fechamento
          ROWS UNBOUNDED PRECEDING
        ) AS saldo_acumulado
      FROM saldos
    ;;
    datagroup_trigger: fechamento_datagroup
    partition_keys: [mes_fechamento]
    persist_for: "12 hours"
  }

  dimension: mes_fechamento {
    type: date
    sql: ${TABLE}.mes_fechamento ;;
  }

  dimension: classe {
    type: string
    sql: ${TABLE}.classe ;;
  }

  measure: saldo_acumulado {
    type: sum
    sql: ${TABLE}.saldo_acumulado ;;
    value_format_name: brl
  }
}
```

## Aggregate Awareness — "Looker Escolhe o Caminho Mais Rápido"

**Aggregate Awareness** é a inteligência do Looker para decidir se consulta a tabela resumida (rápida, mas menos detalhada) ou a tabela completa (lenta, mas com todos os detalhes).

:::tip Traduzindo
É como um GPS que escolhe entre a estrada mais rápida (tabela agregada) e a rua mais completa (tabela detalhada), dependendo de onde você quer chegar.
:::

```lookml
explore: dre_resultado {
  label: "DRE"

  aggregate_table: dre_diaria {
    query: {
      dimensions: [dim_tempo.data.date, plano_contas.nome_conta]
      measures: [valor_realizado]
    }

    materialization: {
      datagroup_trigger: dre_daily_datagroup
    }
  }

  aggregate_table: dre_mensal {
    query: {
      dimensions: [dim_tempo.data.month, plano_contas.nivel_1]
      measures: [valor_realizado, valor_orcado, percentual_variacao]
    }

    materialization: {
      datagroup_trigger: dre_monthly_datagroup
    }
  }
}
```

### Como o Aggregate Awareness Funciona

```
Você consulta:     data.month, nome_conta, SUM(valor)

Looker verifica se existe uma tabela agregada que atenda:
  ✔ dre_mensal:     month + nivel_1 = útil mas não tem nome_conta
  ✔ dre_diaria:     date + nome_conta = tem tudo que precisa!

Resultado: consulta a dre_diaria (mais rápida)
e agrupa para o nível mês — sem tocar na tabela original de 200 milhões de linhas
```

:::note Por que isso importa para você?
Você não precisa fazer nada. O Looker **decide sozinho** qual tabela consultar para te dar a resposta mais rápida possível. Você só vê o resultado — a mágica acontece nos bastidores.
:::

## Estratégias de Cache — "Guardando Resultados para Não Recalcular"

:::note Pense como...
Cache é como **deixar a DRE do mês passado na gaveta**: se alguém perguntar de novo, você tira da gaveta em vez de refazer tudo. O Looker faz o mesmo: guarda resultados de consultas recentes para não precisar consultar o BigQuery toda vez.
:::

### Configuração Global de Cache

```yaml
max_cache_age: "6 hours"

datagroup: dre_datagroup {
  max_cache_age: "1 hour"
  sql_trigger:
    SELECT COUNT(*) FROM `controladoria.controle_carga`
    WHERE tabela = 'lancamentos_contabeis'
      AND data_atualizacao > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
    ;;
}

datagroup: balanco_datagroup {
  max_cache_age: "12 hours"
  sql_trigger:
    SELECT MAX(data_processamento)
    FROM `controladoria.balanco_controle`
    ;;
}
```

### Políticas por Tipo de Dado

| Tipo de Dado | Quando atualiza | Quanto tempo fica em cache |
|---|---|---|
| DRE mensal (consolidado) | Após carga do ERP | 24h |
| Balanço patrimonial | Dados estáveis, atualizações raras | 12h |
| Lançamentos diários | Dados frescos, atualização frequente | 1h |
| Histórico de anos anteriores | Nunca muda | 30 dias |
| Câmbio / índices | Em tempo real | Sem cache (sempre atual) |

## Performance Optimization — "Fazendo o Looker Voar"

### Boas Práticas para Consultas Financeiras

:::warning Isso é importante!
BigQuery cobra por **volume de dados processados**, não por tempo de execução. Uma consulta mal feita pode custar dezenas de reais. Uma consulta bem feita custa centavos.
:::

1. **Sempre filtre por data** — sem filtro de data, você pode ler terabytes de dados

```lookml
explore: lancamentos_contabeis {
  always_filter: {
    filters: {
      field: data_contabil
      value: "90 days"
    }
  }
}
```

2. **Use `sql_always_where` para segurança e performance**

```lookml
explore: lancamentos_contabeis {
  sql_always_where:
    ${data_contabil} >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY) ;;
}
```

3. **Prefira PARTITION BY em PDTs** — divide a tabela em pedaços por ano/mês

```sql
CREATE TABLE controladoria_pdts.dre_mensal
PARTITION BY ano
CLUSTER BY grupo_dre, mes
AS SELECT ...;
```

4. **Evite `SELECT *`** — peça só as colunas que você precisa

```lookml
-- Ruim: lê todas as colunas (20 colunas desnecessárias)
derived_table: {
  sql: SELECT * FROM lancamentos_contabeis ;;
}

-- Bom: lê apenas o necessário
derived_table: {
  sql:
    SELECT id_conta, data_contabil, SUM(valor) as total
    FROM lancamentos_contabeis
    GROUP BY 1, 2
    ;;
}
```

### Monitoramento de Performance — "De Olho no Que Está Lento"

```sql
SELECT
  query,
  total_bytes_processed / 1e9 AS GB_processados,
  total_slot_ms / 1000 AS slots_segundo,
  TIMESTAMP_DIFF(end_time, start_time, SECOND) AS duracao_segundos,
  state
FROM `region-US.INFORMATION_SCHEMA.JOBS_BY_PROJECT`
WHERE user_email = 'looker-sa@projeto-controladoria.iam.gserviceaccount.com'
  AND creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY total_bytes_processed DESC
LIMIT 20;
```

## Pipeline de Dados: BigQuery → Looker — "O Caminho dos Dados"

```mermaid
flowchart TD
    SRC["ERPs / Sistemas Legados<br/>(SAP, Oracle, Totvs)"]
    ORCH["Apache Airflow<br/>(orquestrador)"]
    RAW["BigQuery - Raw Layer<br/>dados brutos, imutáveis"]
    STG["BigQuery - Staging Layer<br/>limpeza, tipagem, dedup"]
    ANA["BigQuery - Analytics Layer<br/>agregados, star schemas"]
    LKML["Looker - LookML Views<br/>camada semântica"]
    DSH["Looker - Dashboards<br/>consumo"]

    SRC --> ORCH --> RAW --> STG --> ANA --> LKML --> DSH
```

## Custos e Governança — "Evitando Surpresas na Conta do Google Cloud"

| Ação | Problema | Solução |
|---|---|---|
| Consulta sem filtro de data | Lê tabela inteira → caro | `always_filter` obrigatório |
| PDT recalculada a cada 5 min | Custo de escrita + armazenamento | `datagroup_trigger` inteligente |
| Muitas pessoas consultando junto | Disputa por recursos | Limitar `max_connections` |
| Tabela sem partição | Escaneia tudo desnecessariamente | Forçar `partition_keys` |

:::tip Como evitar custos desnecessários
1. O analista de BI deve configurar **filtro de data obrigatório** em toda consulta
2. PDTs devem ser recalculadas **só quando os dados de origem mudam**
3. Dados históricos (anos anteriores) podem ficar em cache **por 30 dias ou mais**
4. Se um relatório está lento, o problema **não é o Looker** — é a consulta que precisa ser otimizada
:::

## Resumo: 3 pontos para levar para casa

1. **O Looker se conecta ao BigQuery** como você conecta um monitor ao computador — o engenheiro de dados configura uma única vez, e você só usa.
2. **PDTs e Cache são os "atalhos"** que fazem suas consultas voarem: resultados pré-calculados que evitam reprocessar milhões de linhas toda vez que você clica em um dashboard.
3. **Cuide dos custos**: BigQuery cobra pelo volume lido. Filtros de data e tabelas particionadas são seus melhores amigos para manter a conta do Google Cloud sob controle.

---

**Fim do Módulo Looker.** Voltar para [intro-looker.md](intro-looker.md)

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo3" title={quizes.modulo3.title} questions={quizes.modulo3.questions} />
