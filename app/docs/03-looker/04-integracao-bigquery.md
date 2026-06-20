# Integração Looker + BigQuery

## Conexão Looker ↔ BigQuery

### Configuração da Conexão

No painel administrativo do Looker, em **Admin > Connections**:

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

# Dataset padrão
  Database:                controladoria
```

### Service Account com Escopo Mínimo

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
-- Permissões mínimas para a service account do Looker
GRANT `roles/bigquery.dataViewer`
ON DATASET controladoria
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

GRANT `roles/bigquery.jobUser`
ON PROJECT 'projeto-controladoria'
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

-- Para criar PDTs (tabelas derivadas persistentes)
GRANT `roles/bigquery.dataEditor`
ON DATASET controladoria_looker_scratch
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';

GRANT `roles/bigquery.dataEditor`
ON DATASET controladoria_pdts
TO 'serviceAccount:looker-sa@projeto-controladoria.iam.gserviceaccount.com';
```

## Persistent Derived Tables (PDTs)

PDTs são tabelas temporárias materializadas no BigQuery para acelerar consultas recorrentes.

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

### Datagroups para Controle de Atualização

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

## Aggregate Awareness

**Aggregate Awareness** permite que o Looker decida automaticamente se consulta a tabela agregada (rápida) ou a tabela detalhada (completa), baseado nos campos solicitados pelo usuário.

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
Usuário consulta:     data.month, nome_conta, SUM(valor)

Looker verifica:
  ✔ dre_mensal:     month + nivel_1 = match parcial (precisa de nome_conta)
  ✔ dre_diaria:     date + nome_conta = match total

Resultado: consulta automaticamente dre_diaria
e agrega para o nível mês (sem tocar na tabela fato de 200M linhas)
```

## Estratégias de Cache

### Configuração Global de Cache

```yaml
# No model file
max_cache_age: "6 hours"

# Datagroups por tema
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

| Tipo de Dado | Estratégia | TTL |
|---|---|---|
| DRE mensal (consolidado) | PDT recalculada após carga | 24h |
| Balanço patrimonial | Cache longo (dados estáveis) | 12h |
| Lançamentos diários | Cache curto (dados frescos) | 1h |
| Histórico de anos anteriores | Cache infinito (não muda) | 30d |
| Câmbio / índices | Consulta em tempo real | Sem cache |

### Persistência por Explore

```lookml
explore: dre_historico {
  label: "DRE Histórico (2020-2024)"
  persist_for: "30 days"
  sql_trigger_value: "historico_estatico" ;;
}

explore: dre_diario {
  label: "DRE Diário"
  persist_for: "1 hour"
}
```

## Performance Optimization

### Boas Práticas para Consultas Financeiras

1. **Sempre filtre por data**: BigQuery cobra por bytes processados; sem filtro de data você pode ler TB de dados

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

3. **Prefira PARTITION BY em PDTs**

```sql
-- Use partições no BigQuery
CREATE TABLE controladoria_pdts.dre_mensal
PARTITION BY ano
CLUSTER BY grupo_dre, mes
AS SELECT ...;
```

4. **Evite `SELECT *` em derived tables**

```lookml
-- Ruim: lê todas as colunas
derived_table: {
  sql: SELECT * FROM lancamentos_contabeis ;;
}

-- Bom: lê apenas as colunas necessárias
derived_table: {
  sql:
    SELECT id_conta, data_contabil, SUM(valor) as total
    FROM lancamentos_contabeis
    GROUP BY 1, 2
    ;;
}
```

5. **Use Limites e Agregações**

```lookml
measure: total_receita_bruta {
  type: sum
  sql: ${TABLE}.valor ;;
  # Sempre que possível, agregue no SQL
  # em vez de puxar linhas detalhadas
}

# Para grandes volumes, prefira PDTs
# em vez de consultar a tabela fato diretamente
```

### Monitoramento de Performance

```sql
-- Query de diagnóstico no BigQuery
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

## Pipeline de Dados: BigQuery → Looker

```
ERPs / Sistemas Legados
        ↓
   [Apache Airflow / Cloud Composer]
        ↓
   BigQuery - Raw Layer (dados brutos, imutáveis)
        ↓
   BigQuery - Staging Layer (limpeza, tipagem, dedup)
        ↓
   BigQuery - Analytics Layer (agregados, star schemas)
        ↓
   Looker - LookML Views (camada semântica)
        ↓
   Looker - Dashboards (consumo)
```

## Custos e Governança

| Ação | Custo | Mitigação |
|---|---|---|
| Consulta sem filtro | Alto (lê tabela inteira) | `always_filter` obrigatório |
| PDT muito frequente | Custo de escrita + storage | `datagroup_trigger` inteligente |
| Muitas conexões simultâneas | Contenção de slots | Limitar `max_connections` |
| Tabelas não particionadas | Escaneia desnecessariamente | Forçar `partition_keys` |

---

**Fim do Módulo Looker.** Voltar para [intro-looker.md](intro-looker.md)

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo3" title={quizes.modulo3.title} questions={quizes.modulo3.questions} />
