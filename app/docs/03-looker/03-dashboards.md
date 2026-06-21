# Dashboards Financeiros no Looker

> **Imagine que...** você tem uma parede cheia de painéis no escritório. Cada painel mostra um indicador diferente: Receita do mês, Margem EBITDA, DRE por centro de custo. No Looker, essa parede é o **dashboard** — e você monta cada "painel" (chamado de **tile**) arrastando e soltando, sem programar nada.

## Tipos de Dashboards no Looker

| Tipo | Tradução | Uso em Controladoria |
|---|---|---|
| **User Dashboard** | "Rascunho rápido" — feito no Explore arrastando tiles | Análise ad-hoc, testes, protótipos |
| **LookML Dashboard** | "Relatório oficial" — definido em código, versionado no Git | Dashboards oficiais (DRE, Balanço, Fluxo de Caixa) |
| **Dashboard do Looker Studio** | "Importado de outra ferramenta" — vindo do Google Looker Studio | Relatórios regulatórios padronizados |

:::tip Qual usar quando?
- Precisa de uma análise rápida para a reunião de amanhã? → **User Dashboard**
- É o DRE oficial que vai para o CFO todo mês? → **LookML Dashboard** (versionado, auditável, ninguém mexe sem aprovação)
- É um relatório para órgão regulador? → **Looker Studio**
:::

## Criando Looks — "Salvando uma Consulta para Reusar"

:::note Pense como...
Um **Look** é como salvar um filtro avançado no Excel para usar depois. Você configura a consulta uma vez (quais colunas, quais filtros, qual ordenação), salva com um nome, e reusa em vários dashboards. Se precisar ajustar, muda em um lugar só.
:::

### Passo a passo: criando seu primeiro Look

```
1. No Explore, selecione:
   - Dimensões: data.month, plano_contas.nome_conta
   - Medidas: valor_realizado, valor_orcado, percentual_variacao
   - Filtros: data.year = 2026, tipo_conta = "Receita","Despesa"
   - Ordenação: data.month (crescente)
   - Limite: 500 linhas

2. Clique em "Save" → "Save as a Look"

3. Dê um nome:
   "[DRE] Realizado vs Orçado - Mensal"

4. Escolha a pasta:
   "Controladoria / DRE / Looks"

5. Pronto! Agora você pode inserir este Look em qualquer dashboard
```

### Exemplo de resultado — DRE Sintética

| Mês | Receita Líquida | Despesas | Resultado | % Margem |
|---|---|---|---|---|
| Jan/2026 | R$ 12.500.000 | R$ 9.800.000 | R$ 2.700.000 | 21,6% |
| Fev/2026 | R$ 11.800.000 | R$ 9.500.000 | R$ 2.300.000 | 19,5% |
| Mar/2026 | R$ 13.200.000 | R$ 10.100.000 | R$ 3.100.000 | 23,5% |
| **Q1** | **R$ 37.500.000** | **R$ 29.400.000** | **R$ 8.100.000** | **21,6%** |

## Criando um Dashboard — Montando seu Painel de Controle

:::tip Traduzindo
Um `element` no LookML é como dizer: "no dashboard, coloque um **quadro** mostrando a Margem EBITDA, do tamanho 2x1, posicionado no canto superior esquerdo".
:::

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

## Usando Merge Results — Juntando Dados de Diferentes Fontes

:::note Pense como...
**Merge Results** é como fazer um **PROCV** entre duas planilhas diferentes. Você tem dados de lucratividade em uma tabela (DRE) e dados de liquidez em outra (Balanço), e quer juntar os dois no mesmo gráfico.
:::

```
Exemplo: Margem Líquida + Liquidez Corrente no mesmo gráfico

Explore A: dre_resultado  → data.month, margem_liquida
Explore B: balanco_view  → data.month, indice_liquidez_corrente

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

:::tip Por que isso importa para você?
Com Merge Results, você pode criar um dashboard que **cruza indicadores de DRE e Balanço** no mesmo gráfico. Por exemplo: será que quando a margem cai, a liquidez também cai? Visualizar lado a lado revela correlações que tabelas separadas escondem.
:::

## Agendamento e Entrega — "O Relatório Chega Sozinho no Seu Email"

:::note O problema que resolve
Todo mês você tem que: abrir o sistema, rodar a DRE, exportar para PDF, anexar no email, digitar os destinatários, clicar em enviar. Com o agendamento do Looker, **isso tudo acontece automaticamente** no 5º dia útil às 8h.
:::

### Look Scheduled Plans — Configurando a entrega automática

```yaml
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
    day: 5                    # 5º dia útil do mês
    frequency: monthly
    at: "08:00"
    timezone: "America/Sao_Paulo"
```

### Alertas para Thresholds — "Looker te avisa quando algo está errado"

Alertas disparam notificações quando métricas ultrapassam limites definidos.

```json
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

:::warning Jargão explicado
- **Threshold** = "limite" ou "gatilho". Neste exemplo: "se a variação vs. orçamento passar de 15% para cima, me avise".
- **Scheduled Plan** = "programação de entrega". Tipo agendar um email automático.
- **Look ID** = número de identificação do Look. É como o protocolo de um documento.
:::

## Permissões por Perfil — Quem vê o quê

### Modelo de Acesso Baseado em Função

| Perfil | Acesso | O que NÃO pode ver |
|---|---|---|
| **CFO** | Todos os dashboards e explores | — (vê tudo) |
| **Controller** | DRE, Balanço, Fluxo de Caixa consolidado | Dados de remuneração |
| **Analista de Custos** | Apenas centros de custo do seu departamento | Dados de outros departamentos |
| **Auditoria** | Acesso só de leitura a todos os dados | Não pode exportar nem alterar |

### Configuração de Permissão no Looker

```lookml
explore: dre_resultado {
  label: "DRE"

  access_filter: {
    field: centros_custo.id_centro_custo
    user_attribute: centro_custo_permitido
  }
}
```

```yaml
user_attribute:
  name: centro_custo_permitido
  type: string
  default_value: "*"

# Analista de Custos → centro_custo_permitido = "1001,1002,1003"
# Analista de Folha  → centro_custo_permitido = "2001,2002"
```

:::note Como funciona na prática
Se o analista de Custos entra no dashboard, ele **só vê os centros de custo 1001, 1002, 1003**. O filtro é aplicado automaticamente — ele nem percebe que existem outros centros de custo. Zero risco de vazamento de informação.
:::

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

## Boas Práticas — Regras de Ouro

1. **Dashboards oficiais em LookML**: versionados no Git, ninguém mexe sem aprovação (PR)
2. **Looks reutilizáveis**: salvou uma consulta útil? Vire um Look. Depois reusa em 5 dashboards sem refazer
3. **Performance**: no máximo 10 tiles por dashboard. Mais que isso, vale criar um agregado pré-calculado
4. **Organização de pastas**: `Controladoria / {Ano} / {Tipo_de_Relatorio}`
5. **Programação mensal**: DRE no 5º dia útil, Balanço no 10º dia útil — automático, sem você lembrar

## Resumo: 3 pontos para levar para casa

1. **Dashboards são seus painéis de controle** — você monta arrastando tiles com indicadores financeiros (Lucro, Margem, EBITDA) sem programar.
2. **Looks e Agendamentos automatizam sua rotina**: salve consultas frequentes como Looks, agende a DRE para chegar por email no 5º dia útil, e configure alertas para desvios orçamentários.
3. **Permissões garantem que cada um vê só o que precisa** — o analista de custos vê apenas seus centros de custo; o CFO vê o consolidado. Zero risco de dados errados para a pessoa errada.

---

**Próximo módulo:** [04-integracao-bigquery.md](04-integracao-bigquery.md) — Integração com BigQuery
