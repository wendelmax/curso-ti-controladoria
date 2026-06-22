# 3.6 — Exercícios de Looker / LookML

> **Que legal que você chegou até aqui!** 🎉 Hora de colocar a mão na massa. Os exercícios abaixo testam o que você aprendeu — e não se preocupe, as respostas estão aqui para você conferir.

import LookMLEditor from '@site/src/components/LookMLEditor';

:::tip Como usar esta página
1. Leia cada pergunta conceitual e **tente responder antes de olhar a resposta**
2. Depois, abra os desafios práticos no editor de LookML abaixo
3. Estude o código (agora com syntax highlighting!) e clique em "Validar LookML"
4. Se errar, leia a explicação e tente de novo — é assim que se aprende!
:::

<LookMLEditor />

## Exercícios Conceituais — Teste seu entendimento

<details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem', background: 'var(--ifm-color-emphasis-0)' }}>
<summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ifm-color-primary)' }}>
📝 Pergunta 1 — Dimensão vs. Medida
</summary>
**Qual a diferença entre uma `dimension` e uma `measure` no LookML?**

<details>
<summary>Ver resposta</summary>

**Dimension** é um campo **categórico** — usado para agrupar ou filtrar. Exemplos: nome da conta, centro de custo, mês.

**Measure** é um campo **numérico agregado** — usado para calcular. Exemplos: soma de valores (SUM), contagem (COUNT), média (AVG).

Traduzindo para planilha: a dimension é o **cabeçalho da linha** ("Receita", "Despesa"), a measure é o **valor na célula** (R$ 1.000,00).
</details>
</details>

<details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem', background: 'var(--ifm-color-emphasis-0)' }}>
<summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ifm-color-primary)' }}>
📝 Pergunta 2 — O que é um Explore
</summary>
**O que é um `Explore` no Looker?**

<details>
<summary>Ver resposta</summary>

É o **ponto de partida** para fazer consultas. Pense no Explore como a "porta de entrada" do restaurante: você entra, olha o cardápio (as dimensões e medidas disponíveis) e faz seu pedido (monta a consulta). Um Explore pode juntar várias views via JOIN.
</details>
</details>

<details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem', background: 'var(--ifm-color-emphasis-0)' }}>
<summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ifm-color-primary)' }}>
📝 Pergunta 3 — Para que serve `sql_on`?
</summary>
**Para que serve o parâmetro `sql_on` em um JOIN?**

<details>
<summary>Ver resposta</summary>

Define a **condição de junção** entre duas tabelas, exatamente como o ON do SQL. Exemplo: conectar lançamentos ao plano de contas pelo `id_conta`. É como o **PROCV** do Excel: "pega o valor da coluna X da tabela A e busca o correspondente na tabela B onde o ID é igual".
</details>
</details>

<details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem', background: 'var(--ifm-color-emphasis-0)' }}>
<summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ifm-color-primary)' }}>
📝 Pergunta 4 — `sql_table_name` vs `derived_table`
</summary>
**Qual a diferença entre `sql_table_name` e `derived_table`?**

<details>
<summary>Ver resposta</summary>

- **`sql_table_name`** = aponta para uma **tabela que já existe** no BigQuery (ex.: a tabela de lançamentos contábeis)
- **`derived_table`** = cria uma **tabela nova na hora**, calculada a partir de uma consulta SQL (ex.: uma pré-agregação de receitas por mês)

É como a diferença entre pegar um livro pronto na estante (sql_table_name) e escrever um resumo do livro (derived_table).
</details>
</details>

<details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem', background: 'var(--ifm-color-emphasis-0)' }}>
<summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ifm-color-primary)' }}>
📝 Pergunta 5 — O que são PDTs?
</summary>
**O que são Persistent Derived Tables (PDTs)?**

<details>
<summary>Ver resposta</summary>

São "tabelas rascunho" que o Looker **materializa (salva) no BigQuery** para acelerar consultas repetitivas. Em vez de recalcular a mesma agregação de milhões de linhas toda vez que alguém abre a DRE, a PDT já deixa o resultado prontinho — e só atualiza quando os dados de origem mudam.

Pense como a **prévia do fechamento mensal**: você calcula os saldos uma vez e consulta várias vezes.
</details>
</details>

## Prática com o Editor de LookML

Abra cada desafio no editor acima, estude o código, e clique em "Validar LookML" para verificar a sintaxe.

| Desafio | O que você vai fazer | Dica |
|---------|---------------------|------|
| 1 | Criar uma View de clientes com dimensões e measure count | Lembre-se: dimension = coluna, measure = cálculo |
| 2 | Criar measures de soma e média | Use `type: sum` e `type: average` |
| 3 | Criar um Explore com JOIN many_to_one | Relacione clientes com pedidos |

:::note Bônus — Para ir além
Depois de fazer os 3 desafios, tente responder:
- "Se eu quiser uma medida que mostre quantos clientes diferentes compraram no mês, qual tipo de measure eu usaria?" (resposta: `count_distinct`)
- "Qual parâmetro eu uso para garantir que o usuário sempre filtre por um período?" (resposta: `always_filter`)
:::

## Resumo: 3 pontos para levar para casa

1. **Dimension = "filtro/categoria"**, Measure = "número calculado" — é a base de tudo no LookML
2. **Explore é o cardápio** que junta as views (ingredientes) para o usuário montar a consulta
3. **PDTs são atalhos de performance** — dados pré-calculados que fazem seus dashboards abrirem em segundos
