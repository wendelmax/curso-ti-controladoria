# Dimensões e Medidas Financeiras

> **Imagine que...** você está preenchendo uma DRE no Excel. As **linhas** são as contas contábeis (Receita, Custos, Despesas...) — isso são as *dimensões*, os "filtros" ou "categorias". Os **valores** que você digita nas células (R$ 1.000,00) — isso são as *medidas*, os números que respondem "quanto?". No LookML, é a mesma lógica.

## Dimensões Temporais — "Filtrar por mês, trimestre ou ano"

:::tip Traduzindo
Dimensões de data são o **"filtro de período"** do seu relatório contábil. No Excel, você filtra a coluna "Data" para ver só Janeiro. No Looker, você cria uma `dimension` do tipo `time` e ganha automaticamente: dia, semana, mês, trimestre, ano — tudo a partir de uma única data.
:::

Dimensões de data são essenciais para análises de séries temporais em controladoria. O Looker permite criar hierarquias temporais automaticamente.

```lookml
view: dim_tempo {
  sql_table_name: `projeto.controladoria.lancamentos_contabeis` ;;

  dimension_group: data {
    type: time
    timeframes: [
      raw,           -- data original (ex.: 2026-03-15 14:30:00)
      date,          -- agrupado por dia (2026-03-15)
      week,          -- semana (semana 11)
      month,         -- mês (Março)
      quarter,       -- trimestre (T1)
      year           -- ano (2026)
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

:::note Por que isso importa para você?
Com essas dimensões temporais, você pode:
- Comparar **mês a mês** a evolução da receita
- Ver o **trimestre** fechado sem precisar somar manualmente
- Agrupar por **ano** para análise interanual
- Tudo isso sem escrever uma linha de SQL — o LookML já preparou esses campos para você
:::

## Dimensões para Plano de Contas — A "Estrutura Hierárquica"

:::tip Pense como...
O plano de contas é a **espinha dorsal** da contabilidade. Cada conta tem um código, um nome, uma classificação (Receita/Despesa), e um nível hierárquico. A view abaixo descreve exatamente isso.
:::

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

:::caution Jargão explicado
- **`primary_key: yes`** = "este campo é único para cada linha". Como o CPF: cada conta tem um `id` diferente. Isso permite conectar tabelas corretamente.
- **`hidden: yes`** = "esconde do usuário final". O campo `conta_pai_id` é técnico (necessário para hierarquia), mas você não precisa ver no Explore.
- **`description`** = texto que aparece ao passar o mouse. Útil para documentar regras de negócio.
:::

## Medidas Financeiras Essenciais

### Agregações Básicas — "Resumão" dos números

:::note Pense no Excel
- **Soma (SUM)** = você seleciona a coluna e clica em AutoSoma → `=SOMA(A1:A100)`
- **Média (AVERAGE)** = você tira a média do período → `=MÉDIA(A1:A100)`
- **Contagem (COUNT)** = você conta quantos lançamentos existem → `=CONT.NÚM(A1:A100)`
- **Distintos (COUNT DISTINCT)** = você conta quantos dias diferentes tiveram lançamento
:::

```lookml
view: dre_medidas {
  sql_table_name: `projeto.controladoria.lancamentos_contabeis` ;;

  measure: valor_total_saldo {
    type: sum
    sql: ${TABLE}.valor ;;
    value_format_name: brl
    label: "Valor Total"
  }

  measure: valor_medio_mensal {
    type: average
    sql: ${TABLE}.valor ;;
    value_format_name: brl
    label: "Valor Médio Mensal"
  }

  measure: qtd_lancamentos {
    type: count
    label: "Qtd. Lançamentos"
    drill_fields: [lancamentos_contabeis.id_lancamento]
  }

  measure: dias_com_lancamento {
    type: count_distinct
    sql: ${TABLE}.data_contabil ;;
    label: "Dias com Lançamento"
  }
}
```

### Medidas Calculadas — O "Coração" da DRE

:::tip Por que isso importa para você?
Esta é a parte mais importante do módulo. Aqui o analista de BI traduz **suas regras contábeis** para o LookML:

- "Receita Líquida = Receita Bruta - Deduções"
- "Margem Bruta = (Receita - Custos) / Receita"
- "EBITDA = Resultado Operacional + Depreciação"

Tudo isso vira `measure` no LookML — e você nunca mais discute "como calculamos a margem?".
:::

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

:::caution Lendo o CASE WHEN
O `CASE WHEN ... THEN ... ELSE 0 END` é o "SE ... ENTÃO ... SENÃO" do SQL. Exemplo:
- `CASE WHEN natureza = 'C' AND tipo_conta = 'Receita' THEN valor ELSE 0 END`
- Traduzindo: "SE a natureza for crédito E o tipo for Receita, **use o valor**; SENÃO, use zero"

Isso garante que só entram créditos de receita na conta de Receita Bruta.
:::

### Indicadores de Desempenho — EBITDA, Margens, Liquidez

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

## Filtros Parameterizados — Dando Poder ao Usuário

:::tip Pense como...
Filtros parametrizados são como **criar um campo "digite o mês"** no seu relatório. O usuário escolhe o período sem precisar chamar o analista de BI para ajustar o filtro toda vez.
:::

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

:::note O que isso faz?
- `conditionally_filter` = "se o usuário não escolher nada, mostra só os últimos 90 dias" (filtro padrão seguro)
- `unless` = "mas se o usuário escolher um período personalizado, respeita a escolha dele"
- `parameter` = cria um campo onde o usuário pode digitar/datas
:::

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

Aqui está uma DRE completa — com Realizado vs. Orçado, Variação e % sobre Receita Líquida.

```lookml
view: dre_view {
  sql_table_name: `projeto.controladoria.fato_dre` ;;

  include: "/views/plano_contas.view.lkml"
  include: "/views/centros_custo.view.lkml"
  include: "/views/dim_tempo.view.lkml"

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

  measure: razao_despesa_receita {
    type: number
    value_format_name: percent_2
    sql: CASE WHEN ${receita_liquida} = 0 THEN NULL
              ELSE 1.0 * ${valor_realizado} / ${receita_liquida} END ;;
    label: "% sobre Receita Líquida"
  }
}
```

## Resumo: 3 pontos para levar para casa

1. **Dimensões = "filtros" ou "categorias"** (mês, centro de custo, conta contábil). Medidas = "números" (soma, contagem, média). É a diferença entre a **linha** da planilha e o **valor** na célula.
2. **Uma medida calculada traduz sua regra de negócio** — Receita Líquida, Margem Bruta, EBITDA — em código. Uma vez definida, todo mundo usa a mesma fórmula. Nunca mais "cada um calcula do seu jeito".
3. **Filtros parametrizados dão autonomia** — o usuário escolhe o período ou grupo de contas sem precisar do analista de BI. É como criar um "campo editável" no seu relatório.

---

**Próximo módulo:** [03-dashboards.md](03-dashboards.md) — Dashboards Financeiros
