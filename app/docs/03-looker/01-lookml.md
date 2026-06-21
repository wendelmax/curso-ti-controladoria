# LookML — Fundamentos

> **Imagine que...** você está montando o plano de contas da empresa. Cada conta contábil tem um código, um nome, uma classificação (Receita, Despesa, Ativo...). O LookML é exatamente isso, mas para os dados: você **descreve** cada campo que existe, como ele se chama, de que tipo é, e como ele se relaciona com os outros campos. Só isso.

## O que é LookML?

LookML é a "linguagem de descrição" do Looker. É como uma **ficha de cadastro** para cada tabela do seu banco de dados.

:::note Respira — isso não é programação complicada
LookML parece estranho à primeira vista: chaves `{}`, dois-pontos `:`, cifrão `${}`, ponto-e-vírgula duplo `;;`. Mas a lógica é simples:

- Cada `dimension` = uma coluna da sua tabela (ex.: "Nome da Conta", "Centro de Custo")
- Cada `measure` = um cálculo (ex.: soma de valores, contagem de lançamentos)

É como **preencher uma ficha cadastral** — campo por campo. Nada de lógica complexa, só descrição.
:::

:::tip Traduzindo para seu dia a dia
- Se o SQL é um "faça isso, faça aquilo" (imperativo) → o LookML é um "isso aqui é assim" (declarativo)
- Você não diz "pegue a tabela A, junte com a B, some a coluna C". Você diz: "a tabela A se chama `lancamentos_contabeis`, o campo `vlr_lancamento` é numérico, a view `plano_contas` se relaciona com ela pela conta contábil"
- Quem escreve isso é o analista de BI — **você só precisa saber que isso existe**
:::

### O que o LookML define

- **O quê** os usuários podem consultar (dimensões, medidas)
- **Como** esses campos são calculados (a fórmula por trás)
- **Relacionamentos** entre tabelas (joins — como conectar lançamentos ao plano de contas)
- **Regras de negócio** (filtros obrigatórios, hierarquias de contas)

:::caution Jargão explicado
- **YAML** = um formato de arquivo que parece uma lista indentada. Imagine escrever um sumário: cada tópico com seus subtópicos recuados. LookML é escrito em YAML.
- **Git** = um "histórico de versões" tipo "Controlar Alterações" do Word, mas para profissionais. Cada alteração no LookML fica registrada: quem fez, quando, e pode ser aprovada antes de entrar em produção.
- **CTE** = "Common Table Expression" — uma "tabela temporária" criada na hora da consulta, como um rascunho que você usa e descarta.
:::

## Estrutura do Projeto — O "Organograma" dos Arquivos

:::tip Pense como um escritório de contabilidade
- **manifest.lkml** → a "portaria": diz onde tudo fica
- **models/** → os "departamentos": DRE, Balanço, etc.
- **views/** → as "pastas físicas": lançamentos, plano de contas, centros de custo
- **dashboards/** → os "relatórios prontos" na parede
:::

```mermaid
graph TD
    subgraph "Projeto: modelo_financeiro"
        M[manifest.lkml<br/>"Portaria"]
        subgraph "models/ (Departamentos)"
            DRE[dre.model.lkml]
            BAL[balanco.model.lkml]
        end
        subgraph "views/ (Pastas com dados)"
            V1[lancamentos_contabeis.view.lkml]
            V2[plano_contas.view.lkml]
            V3[centros_custo.view.lkml]
        end
        subgraph "dashboards/ (Relatórios prontos)"
            DB[dre_dashboard.lookml]
        end
    end
```

## Arquivos `.view` — A "Ficha Cadastral" de Cada Tabela

Uma **view** é a descrição de uma tabela. Ela lista todos os campos disponíveis e diz se cada um é:
- **Dimension** = um campo de "categorizar/filtrar" (ex.: nome da conta, centro de custo)
- **Measure** = um campo de "calcular" (ex.: soma dos valores, contagem de lançamentos)

### Exemplo: View `lancamentos_contabeis`

Veja como fica a "ficha cadastral" da tabela de lançamentos contábeis:

```lookml
view: lancamentos_contabeis {
  sql_table_name: `projeto.controladoria.lancamentos_contabeis` ;;

  dimension: id_lancamento {
    type: number
    sql: ${TABLE}.id_lancamento ;;
    primary_key: yes
  }

  dimension: data_contabil {
    type: date
    sql: ${TABLE}.data_contabil ;;
  }

  dimension: id_conta {
    type: number
    sql: ${TABLE}.id_conta_contabil ;;
  }

  dimension: nome_conta {
    type: string
    sql: ${TABLE}.nome_conta ;;
  }

  dimension: id_centro_custo {
    type: number
    sql: ${TABLE}.id_centro_custo ;;
  }

  dimension: centro_custo {
    type: string
    sql: ${TABLE}.centro_custo ;;
  }

  dimension: tipo_conta {
    type: string
    sql: ${TABLE}.tipo_conta ;;  -- 'Receita', 'Despesa', 'Ativo', 'Passivo'
  }

  dimension: vlr_lancamento {
    type: number
    sql: ${TABLE}.valor ;;
  }

  dimension: natureza {
    type: string
    sql: ${TABLE}.natureza ;;    -- 'D' (débito) ou 'C' (crédito)
  }

  measure: total_lancamentos {
    type: count
    drill_fields: [id_lancamento, nome_conta, vlr_lancamento]
  }

  measure: valor_total {
    type: sum
    sql: ${vlr_lancamento} ;;
    value_format_name: brl
  }
}
```

:::tip Lendo o código — um campo de cada vez
Veja o campo `nome_conta`:
- `dimension: nome_conta` = "estou criando um campo chamado nome_conta"
- `type: string` = "esse campo é texto" (não número)
- `sql: ${TABLE}.nome_conta ;;` = "no banco de dados, esse campo se chama `nome_conta`"

É literalmente isso. O LookML inteiro é feito dessa forma: campo por campo.
:::

## Arquivos `.explore` — A "Porta de Entrada" para Consultas

O **explore** é como dizer: "a partir de agora, quando o usuário quiser fazer uma DRE, ele pode usar a view `lancamentos_contabeis` conectada com `plano_contas` e `centros_custo`".

:::note Pense como...
O explore é o **cardápio do restaurante**. A cozinha (LookML) tem todos os ingredientes (views), mas o cardápio (explore) diz quais combinações são possíveis. Sem explore, o garçom não sabe o que pode servir.
:::

```lookml
include: "/views/lancamentos_contabeis.view.lkml"
include: "/views/plano_contas.view.lkml"
include: "/views/centros_custo.view.lkml"

explore: dre_resultado {
  label: "DRE - Demonstrativo de Resultado"

  join: plano_contas {
    type: left_outer
    sql_on: ${lancamentos_contabeis.id_conta} = ${plano_contas.id_conta} ;;
    relationship: many_to_one
  }

  join: centros_custo {
    type: left_outer
    sql_on: ${lancamentos_contabeis.id_centro_custo} = ${centros_custo.id_centro_custo} ;;
    relationship: many_to_one
  }

  always_filter: {
    filters: {
      field: lancamentos_contabeis.tipo_conta
      value: "Receita", "Despesa"
    }
  }
}
```

:::caution Jargão explicado (joins)
- **join** = conectar duas tabelas. É como fazer um **PROCV** no Excel: você tem uma informação aqui e busca o complemento em outra planilha.
- **left_outer** = "traz todos os lançamentos, mesmo que a conta contábil não exista no plano de contas" (mais seguro)
- **many_to_one** = "muitos lançamentos podem pertencer a uma mesma conta" (relação natural)
:::

## Parâmetros Essenciais — O "Vocabulário" que você precisa reconhecer

| Parâmetro | Tradução | Exemplo prático |
|---|---|---|
| `sql` | "No banco de dados, este campo é..." | `${TABLE}.valor` |
| `type` | "Este campo é do tipo..." | `type: sum` (soma), `type: string` (texto) |
| `sql_table_name` | "Esta view corresponde à tabela..." | `` `projeto.dataset.tabela` `` |
| `primary_key` | "Este campo identifica cada linha unicamente" | `primary_key: yes` (como um CPF) |
| `drill_fields` | "Quando o usuário clicar, mostra..." | `drill_fields: [id_lancamento, nome_conta]` |
| `value_format_name` | "Formato de exibição" | `value_format_name: brl` (R$ 1.000,00) |
| `label` | "Nome amigável que o usuário vê" | `label: "Centro de Custo"` |
| `description` | "Descrição que aparece ao passar o mouse" | `description: "Código SAP do centro"` |
| `hidden` | "Esconde este campo do usuário" | `hidden: yes` (para campos técnicos) |

## Boas Práticas para Controladoria

:::tip Regras de ouro para pedir ao analista de BI
1. **Nomenclatura consistente**: Os campos devem aparecer em português para você (`label: "Receita Líquida"`). Os nomes técnicos internos podem ficar em inglês.
2. **Documentação**: Peça para o analista colocar `description` em todos os campos financeiros — assim você vê a fórmula ao passar o mouse.
3. **Drill paths lógicos**: Deve ser possível clicar na DRE consolidada e "descer" até o lançamento individual (DRE → centro de custo → lançamento).
4. **Filtros obrigatórios**: Sempre peça para filtrar por período e tipo de conta — evita consultas lentas e dados errados.
5. **Teste antes**: Todo campo novo deve ser testado em ambiente de desenvolvimento antes de ir para produção.
:::

## Resumo: 3 pontos para levar para casa

1. **LookML é uma "descrição" das suas tabelas** — o analista de BI preenche uma ficha para cada campo (nome, tipo, fórmula). Você só precisa reconhecer os parâmetros.
2. **View = tabela, Explore = cardápio de consultas**: a view lista os ingredientes, o explore diz quais combinações são possíveis.
3. **Você não precisa escrever LookML**, mas saber ler ajuda a: pedir métricas certas, validar se a regra contábil está correta, e não aceitar "não dá" como resposta.

---

**Próximo módulo:** [02-dimensoes-medidas.md](02-dimensoes-medidas.md) — Dimensões e Medidas Financeiras
