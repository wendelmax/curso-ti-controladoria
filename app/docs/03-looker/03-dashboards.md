# Dashboards Financeiros no Looker

## Tipos de Dashboards no Looker

| Tipo | Descrição | Uso em Controladoria |
|---|---|---|
| **User Dashboard** | Criado no Explore, arrasta-se tiles | Análise ad-hoc, prototipação |
| **LookML Dashboard** | Definido em código YAML, versionado em Git | Dashboards oficiais (DRE, Balanço) |
| **Dashboard do Looker Studio** | Importado do Google Looker Studio | Relatórios regulatórios padronizados |

## Criando Looks

Um **Look** é uma consulta salva que pode ser reutilizada em múltiplos dashboards.

```
No Explore, configure:
  - Dimensões: data.month, plano_contas.nome_conta
  - Medidas: valor_realizado, valor_orcado, percentual_variacao
  - Filtros: data.year = 2026, tipo_conta = "Receita","Despesa"
  - Ordenação: data.month asc
  - Limite: 500 linhas

Clique em "Save" -> "Save as a Look"
  Nome: "[DRE] Realizado vs Orçado - Mensal"
  Pasta: "Controladoria / DRE / Looks"
```

### Exemplo Look: DRE Sintética

| Mês | Receita Líquida | Despesas | Resultado | % Margem |
|---|---|---|---|---|
| Jan/2026 | R$ 12.500.000 | R$ 9.800.000 | R$ 2.700.000 | 21,6% |
| Fev/2026 | R$ 11.800.000 | R$ 9.500.000 | R$ 2.300.000 | 19,5% |
| Mar/2026 | R$ 13.200.000 | R$ 10.100.000 | R$ 3.100.000 | 23,5% |
| **Q1** | **R$ 37.500.000** | **R$ 29.400.000** | **R$ 8.100.000** | **21,6%** |

## Criando um Dashboard

### Dashboard LookML (Versionado)

```lookml
dashboard: dre_gerencial_dashboard {
  title: "DRE Gerencial - Controladoria"
  description: "Demonstrativo de Resultado consolidado por centro de custo"
  layout: grid
  preferred_currency: BRL

  element: total_receita_liquida {
    title: "Receita Líquida Acumulada"
    type: single_value
    explore: dre_resultado
    field: receita_liquida
    width: 2
    height: 1
    row: 0
    col: 0
    filters: [dim_tempo.data.year: "2026"]
    color: #1A73E8
  }

  element: margem_ebitda_kpi {
    title: "Margem EBITDA"
    type: single_value
    explore: dre_resultado
    field: margem_ebitda
    width: 2
    height: 1
    row: 0
    col: 2
    filters: [dim_tempo.data.year: "2026"]
    color: #34A853
  }

  element: grafico_dre_mensal {
    title: "DRE Mensal - Realizado vs Orçado"
    type: column
    explore: dre_resultado
    width: 6
    height: 4
    row: 1
    col: 0
    fields: [dim_tempo.data.month, valor_realizado, valor_orcado]
    sorting: [dim_tempo.data.month: asc]
    x_axis: [dim_tempo.data.month]
    y_axis: [valor_realizado, valor_orcado]
    series_types: {
      valor_realizado: "column"
      valor_orcado: "line"
    }
  }

  element: tabela_dre_detalhada {
    title: "DRE Detalhada por Conta"
    type: table
    explore: dre_resultado
    width: 8
    height: 6
    row: 4
    col: 0
    fields: [
      plano_contas.nome_conta,
      valor_realizado,
      percentual_variacao,
      razao_despesa_receita
    ]
    filters: [dim_tempo.data.month: "2026-03"]
  }

  element: pizza_despesas {
    title: "Composição de Despesas"
    type: pie
    explore: dre_resultado
    width: 4
    height: 4
    row: 4
    col: 8
    fields: [plano_contas.nome_conta, valor_realizado]
    filters: [
      dim_tempo.data.month: "2026-03",
      plano_contas.classe: "DESPESA"
    ]
    limit: 10
  }
}
```

## Usando Merge Results

**Merge Results** permite combinar dados de explores diferentes em um mesmo tile — essencial para análises cruzadas (ex.: DRE + Balanço).

```
Exemplo: Margem Líquida + Liquidez Corrente no mesmo gráfico

Explore A: dre_resultado  -> data.month, margem_liquida
Explore B: balanco_view  -> data.month, indice_liquidez_corrente

Resultado merge:
| Mês    | Margem Líquida | Liquidez Corrente |
|--------|----------------|-------------------|
| Jan    | 12,3%          | 1,85              |
| Fev    | 11,8%          | 1,92              |
| Mar    | 14,1%          | 1,78              |
```

```lookml
element: margem_vs_liquidez {
  title: "Margem Líquida vs Liquidez Corrente"
  type: scatter
  explore: dre_resultado
  merge_result: yes
  merge_fields: [margem_liquida, indice_liquidez_corrente]
  fields: [dim_tempo.month, margem_liquida, indice_liquidez_corrente]
}
```

## Agendamento e Entrega

### Look Scheduled Plans

```yaml
# Configuração de entrega programada
scheduled_plan:
  name: "DRE Mensal para Diretoria"
  run_as: "sistema_controladoria"
  require_approval: false
  enabled: true

  destination:
    type: email
    address: ["cfo@empresa.com.br", "controller@empresa.com.br"]
    format: pdf
    pdf_landscape: true
    pdf_paper_size: A4

  schedule:
    day: 5                    # Dia útil do mês
    frequency: monthly
    at: "08:00"
    timezone: "America/Sao_Paulo"
```

### Alertas para Thresholds

Alertas disparam notificações quando métricas ultrapassam limites definidos.

```json
// Alerta de desvio orçamentário no Looker API
{
  "alert": {
    "title": "Desvio Orçamentário Crítico",
    "look_id": 42,
    "field": "percentual_variacao",
    "threshold": {
      "type": "absolute",
      "value": 15.0,
      "direction": "above"
    },
    "notification": {
      "type": "email",
      "recipients": [
        "controller@empresa.com.br",
        "gerente_financeiro@empresa.com.br"
      ]
    },
    "frequency": "daily",
    "condition_period": "last_30_days"
  }
}
```

## Permissões por Perfil

### Modelo de Acesso Baseado em Função

| Perfil | Acesso | Restrições |
|---|---|---|
| **CFO** | Todos os dashboards e explores | — |
| **Controller** | DRE, Balanço, Fluxo de Caixa — consolidado | Sem acesso a dados de remuneração |
| **Analista de Custos** | Apenas centros de custo do seu departamento | Filtro automático no centro de custo |
| **Auditoria** | Acesso read-only a todos os dados | Sem permissão de exportar |

### Configuração de Permissão no Looker

```lookml
explore: dre_resultado {
  label: "DRE"

  # Acesso irrestrito para CFO e Controller
  access_filter: {
    field: centros_custo.id_centro_custo
    user_attribute: centro_custo_permitido
  }
}
```

```yaml
# Atributos de usuário definidos na admin do Looker
user_attribute:
  name: centro_custo_permitido
  type: string
  default_value: "*"

# Para analistas de departamento:
# Analista de Custos -> Adm: centro_custo_permitido = "1001,1002,1003"
# Analista de Folha  -> Adm: centro_custo_permitido = "2001,2002"
```

### Exemplo de Dashboard Restrito por Departamento

```lookml
dashboard: despesas_departamentais {
  title: "Despesas por Departamento"

  element: tabela_despesas {
    type: table
    explore: dre_resultado
    fields: [
      centros_custo.nome,
      dim_tempo.data.month,
      valor_realizado
    ]
    # O filtro de acesso é aplicado automaticamente
    # via user_attribute: centro_custo_permitido
  }
}
```

## Boas Práticas

1. **Dashboards oficiais em LookML**: versionados, revisados em PR, sem alteração manual
2. **Looks reutilizáveis**: crie looks de consultas frequentes e referencie-os nos dashboards
3. **Performance**: evite mais de 10 tiles por dashboard; use agregados pré-calculados
4. **Hierarquia de pastas**: Controladoria / `{Ano}` / `{Tipo_de_Relatorio}`
5. **Programação mensal**: entregue DRE no 5º dia útil, Balanço no 10º dia útil

---

**Próximo módulo:** [04-integracao-bigquery.md](04-integracao-bigquery.md) — Integração com BigQuery
