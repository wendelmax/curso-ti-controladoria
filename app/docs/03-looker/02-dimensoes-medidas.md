# Dimensões e Medidas Financeiras

## Dimensões Temporais

Dimensões de data são essenciais para análises de séries temporais em controladoria. O Looker permite criar hierarquias temporais automaticamente.

```lookml
view: dim_tempo {
  sql_table_name: `projeto.controladoria.lancamentos_contabeis` ;;

  dimension_group: data {
    type: time
    timeframes: [
      raw,           -- data original
      date,          -- agrupado por dia
      week,          -- semana
      month,         -- mês
      quarter,       -- trimestre
      year           -- ano
    ]
    sql: ${TABLE}.data_contabil ;;
  }

  dimension: ano_mes {
    type: string
    sql: FORMAT_TIMESTAMP('%Y-%m', ${TABLE}.data_contabil) ;;
    label: "Ano/Mês"
  }

  dimension: mes_abrev {
    type: string
    sql: FORMAT_TIMESTAMP('%b', ${TABLE}.data_contabil) ;;
    label: "Mês (abreviado)"
  }

  dimension: trimestre_label {
    type: string
    sql: CONCAT('T', CAST(EXTRACT(QUARTER FROM ${TABLE}.data_contabil) AS STRING),
                '/', CAST(EXTRACT(YEAR FROM ${TABLE}.data_contabil) AS STRING)) ;;
    label: "Trimestre"
  }
}
```

## Dimensões para Plano de Contas

```lookml
view: plano_contas {
  sql_table_name: `projeto.controladoria.plano_contas` ;;

  dimension: id_conta {
    type: number
    primary_key: yes
    sql: ${TABLE}.id ;;
  }

  dimension: codigo_conta {
    type: string
    sql: ${TABLE}.codigo ;;
    label: "Código"
  }

  dimension: nome_conta {
    type: string
    sql: ${TABLE}.nome ;;
    label: "Conta Contábil"
  }

  dimension: nivel {
    type: number
    sql: ${TABLE}.nivel ;;
    label: "Nível Hierárquico"
    description: "1=Grupo, 2=Subgrupo, 3=Conta Sintética, 4=Conta Analítica"
  }

  dimension: conta_pai_id {
    type: number
    sql: ${TABLE}.conta_pai ;;
    label: "Conta Superior"
    hidden: yes
  }

  dimension: classe {
    type: string
    sql: ${TABLE}.classe ;;
    label: "Classe"
    description: "ATIVO, PASSIVO, RECEITA, DESPESA, PATRIMONIO_LIQUIDO"
  }

  measure: total_contas {
    type: count
    label: "Total de Contas"
  }
}
```

## Medidas Financeiras Essenciais

### Agregações Básicas

```lookml
view: dre_medidas {
  sql_table_name: `projeto.controladoria.lancamentos_contabeis` ;;

  -- Valor total (soma simples)
  measure: valor_total_saldo {
    type: sum
    sql: ${TABLE}.valor ;;
    value_format_name: brl
    label: "Valor Total"
  }

  -- Média por período
  measure: valor_medio_mensal {
    type: average
    sql: ${TABLE}.valor ;;
    value_format_name: brl
    label: "Valor Médio Mensal"
  }

  -- Contagem de lançamentos
  measure: qtd_lancamentos {
    type: count
    label: "Qtd. Lançamentos"
    drill_fields: [lancamentos_contabeis.id_lancamento]
  }

  -- Número de dias com lançamento
  measure: dias_com_lancamento {
    type: count_distinct
    sql: ${TABLE}.data_contabil ;;
    label: "Dias com Lançamento"
  }
}
```

### Medidas Calculadas com `type: number`

Para KPIs financeiros que não são simples agregações, use `type: number` com SQL customizado.

```lookml
measure: receita_bruta {
  type: sum
  sql: CASE WHEN ${natureza} = 'C' AND ${tipo_conta} = 'Receita'
            THEN ${vlr_lancamento} ELSE 0 END ;;
  value_format_name: brl
  label: "Receita Bruta"
}

measure: deducoes {
  type: sum
  sql: CASE WHEN ${natureza} IN ('D') AND ${tipo_conta} = 'Receita'
            THEN ${vlr_lancamento} ELSE 0 END ;;
  value_format_name: brl
  label: "Deduções"
}

measure: receita_liquida {
  type: number
  sql: ${receita_bruta} - ${deducoes} ;;
  value_format_name: brl
  label: "Receita Líquida"
}

measure: despesas_operacionais {
  type: sum
  sql: CASE WHEN ${classe} = 'DESPESA'
            THEN ${vlr_lancamento} ELSE 0 END ;;
  value_format_name: brl
  label: "Despesas Operacionais"
}

measure: resultado_operacional {
  type: number
  sql: ${receita_liquida} - ${despesas_operacionais} ;;
  value_format_name: brl
  label: "Resultado Operacional"
}

measure: margem_bruta {
  type: number
  sql: CASE WHEN ${receita_liquida} = 0 THEN NULL
            ELSE 1.0 * (${receita_liquida} - ${despesas_operacionais}) / ${receita_liquida} END ;;
  value_format_name: percent_2
  label: "Margem Bruta"
}

measure: margem_liquida {
  type: number
  value_format_name: percent_2
  sql: CASE WHEN ${receita_liquida} = 0 THEN NULL
            ELSE 1.0 * ${resultado_operacional} / ${receita_liquida} END ;;
  label: "Margem Líquida"
}
```

### Indicadores de Desempenho

```lookml
measure: ebitda {
  type: number
  sql: ${resultado_operacional}
       + COALESCE(${depreciacao_amortizacao}, 0) ;;
  value_format_name: brl
  label: "EBITDA"
}

measure: margem_ebitda {
  type: number
  value_format_name: percent_2
  sql: CASE WHEN ${receita_liquida} = 0 THEN NULL
            ELSE 1.0 * ${ebitda} / ${receita_liquida} END ;;
  label: "Margem EBITDA"
}

measure: indice_liquidez_corrente {
  type: number
  value_format_name: decimal_2
  sql: CASE WHEN ${passivo_circulante} = 0 THEN NULL
            ELSE 1.0 * ${ativo_circulante} / ${passivo_circulante} END ;;
  label: "Liquidez Corrente"
}
```

## Filtros Parameterizados

### Template Filters para Datas Dinâmicas

```lookml
explore: dre_resultado {
  label: "DRE Dinâmica"

  conditionally_filter: {
    filters: [data: "90 days"]
    unless: [data, periodo_personalizado]
  }

  parameter: periodo_personalizado {
    type: date
    label: "Período Personalizado"
  }
}
```

### Filtros com `{% condition %}`

```lookml
dimension: periodo_filtrado {
  type: string
  sql: {% condition periodo_personalizado %}
         ${TABLE}.data_contabil
       {% endcondition %} ;;
  hidden: yes
}
```

### Filtro de Período Fiscal

```lookml
dimension: periodo_fiscal {
  type: string
  sql: CAST(EXTRACT(YEAR FROM ${TABLE}.data_contabil) AS STRING)
       || LPAD(CAST(EXTRACT(MONTH FROM ${TABLE}.data_contabil) AS STRING), 2, '0') ;;
  label: "Período Fiscal (AAAAMM)"
}

parameter: mes_referencia {
  type: string
  label: "Mês de Referência"
  allowed_value: {
    label: "Janeiro";  value: "202601"
  }
  allowed_value: {
    label: "Fevereiro"; value: "202602"
  }
  allowed_value: {
    label: "Março"; value: "202603"
  }
}
```

### Filtro de Hierarquia de Contas

```lookml
parameter: grupo_dre {
  type: string
  label: "Grupo DRE"
  allowed_value: {
    label: "Receita Operacional";    value: "1"
  }
  allowed_value: {
    label: "Deduções";               value: "2"
  }
  allowed_value: {
    label: "Custos";                 value: "3"
  }
  allowed_value: {
    label: "Despesas Gerais";        value: "4"
  }
  allowed_value: {
    label: "Resultado Financeiro";   value: "5"
  }
}

dimension: filtro_grupo_dre {
  type: string
  sql: {% condition grupo_dre %}
         ${plano_contas.nivel_1}
       {% endcondition %} ;;
  hidden: yes
}
```

## Exemplo Completo: View de DRE

```lookml
view: dre_view {
  sql_table_name: `projeto.controladoria.fato_dre` ;;

  include: "/views/plano_contas.view.lkml"
  include: "/views/centros_custo.view.lkml"
  include: "/views/dim_tempo.view.lkml"

  -- Dimensões
  dimension: id_registro {
    type: number
    primary_key: yes
    sql: ${TABLE}.id ;;
  }

  dimension: natureza_linha {
    type: string
    sql: ${TABLE}.natureza ;;
    label: "Natureza"
  }

  dimension: conta_contabil {
    type: string
    sql: ${TABLE}.conta ;;
    label: "Conta"
  }

  -- Medidas de Valor
  measure: valor_realizado {
    type: sum
    sql: ${TABLE}.valor_real ;;
    value_format_name: brl
    label: "Realizado"
  }

  measure: valor_orcado {
    type: sum
    sql: ${TABLE}.valor_orc ;;
    value_format_name: brl
    label: "Orçado"
  }

  measure: variacao_vs_orcamento {
    type: number
    sql: ${valor_realizado} - ${valor_orcado} ;;
    value_format_name: brl
    label: "Variação vs. Orçado"
  }

  measure: percentual_variacao {
    type: number
    value_format_name: percent_2
    sql: CASE WHEN ${valor_orcado} = 0 THEN NULL
              ELSE 1.0 * (${valor_realizado} - ${valor_orcado}) / ${valor_orcado} END ;;
    label: "% Variação"
  }

  -- Razão de despesas
  measure: razao_despesa_receita {
    type: number
    value_format_name: percent_2
    sql: CASE WHEN ${receita_liquida} = 0 THEN NULL
              ELSE 1.0 * ${valor_realizado} / ${receita_liquida} END ;;
    label: "% sobre Receita Líquida"
  }
}
```

---

**Próximo módulo:** [03-dashboards.md](03-dashboards.md) — Dashboards Financeiros
