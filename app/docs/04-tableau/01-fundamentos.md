# Fundamentos do Tableau

## Dimensões vs Medidas

No Tableau, todo campo é classificado automaticamente como **dimensão** ou **medida**:

| Tipo | Cor | O que representa | Exemplos no Grupo Nova Era |
|------|-----|------------------|---------------------------|
| **Dimensão** | Azul | Dados categóricos, discretos | `ano`, `mes`, `centro_custo`, `conta_contabil`, `departamento` |
| **Medida** | Verde | Dados numéricos, contínuos, agregáveis | `valor`, `quantidade`, `saldo` |

**Regra prática:** dimensões criam cabeçalhos (linhas/colunas discretas); medidas criam eixos contínuos.

```tableau
// Uma dimensão no eixo Colunas cria rótulos separados
// Uma medida no eixo Linhas cria um eixo de valor

// Colunas: [ano]
// Linhas: SUM([valor])
// Resultado: barras com total de valores por ano
```

## Discreto vs Contínuo

| | Discreto (Azul) | Contínuo (Verde) |
|---|---|---|
| **Eixo** | Cabeçalhos categóricos | Eixo numérico com escala |
| **Exemplo** | `ano` (2024, 2025, 2026) | `SUM(valor)` (R$ 0 a R$ 50M) |
| **Gráfico** | Barras, linhas discretas | Linhas contínuas, área |

**Dica:** Clique com botão direito em uma data e alterne entre `Discreto` e `Contínuo` para mudar o comportamento dinamicamente.

```
[ano] como Discreto → uma coluna por ano
[ano] como Contínuo → uma linha do tempo contínua
```

## As Prateleiras (Shelves)

A interface do Tableau possui prateleiras fundamentais:

```
┌─────────────────────────────────────────────────────────┐
│ COLUNAS                                                  │
│   [ano]                                                  │
├─────────────────────────────────────────────────────────┤
│ LINHAS                                                   │
│   SUM([valor])                                           │
├─────────────────────────────────────────────────────────┤
│ FILTROS                                                  │
│   [departamento] = "Financeiro"                          │
├─────────────────────────────────────────────────────────┤
│ MARCAS                                                   │
│   ⊙ Cor    → [categoria]                                │
│   ⊙ Rotulo → SUM([valor])                               │
│   ⊙ Detalhe → [centro_custo]                            │
│   ⊙ Tamanho → SUM([qtd])                                │
└─────────────────────────────────────────────────────────┘
```

### Colunas e Linhas
Definem a estrutura do gráfico. Toda visualização começa aqui.

### Filtros
Restringem os dados exibidos. Podem ser aplicados por contexto (planilha, painel ou fonte de dados).

### Marcas (Marks)
Controlam a aparência visual:
- **Cor:** distingue categorias
- **Tamanho:** enfatiza magnitude
- **Rótulo:** exibe valores
- **Detalhe:** adiciona granularidade sem alterar eixo
- **Tooltip:** texto que aparece ao passar o mouse

## Conectando ao Banco Grupo Nova Era

### Passo 1: Conexão

```
Conectar → PostgreSQL → 
  Servidor: pg.gruponovaera.com.br
  Database: grupo_nova_era
  Schema: financeiro
  Tabela: dre
```

### Passo 2: Live vs Extract

```
Escolha "Live" para desenvolvimento.
Ao final, crie um Extract (.hyper) para o dashboard.
```

### Passo 3: Conhecer os dados

Use a aba **Dados** (Data Source) para explorar os campos disponíveis:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ano` | Inteiro | Ano fiscal (2024, 2025, 2026) |
| `mes` | String | Mês abreviado (Jan, Fev, Mar...) |
| `data` | Data | Data completa da transação |
| `conta_contabil` | String | Código da conta (ex: 3.01.001) |
| `categoria_dre` | String | Grupo DRE (Receita, CMV, Despesas) |
| `centro_custo` | String | Centro de custo (ex: CC-FIN) |
| `departamento` | String | Departamento responsável |
| `valor` | Decimal | Valor monetário em R$ |
| `tipo` | String | Débito ou Crédito |
| `cliente_id` | Inteiro | ID do cliente (quando aplicável) |

## Criando sua Primeira Visualização

### Exemplo 1: Receita Total por Ano

1. Arraste `ano` para **Colunas**
2. Arraste `SUM(valor)` para **Linhas**
3. (Opcional) Arraste `categoria_dre` para **Filtros**, selecione "Receita"

```
Colunas: [ano]
Linhas: SUM([valor])
Filtros: [categoria_dre] = "Receita"
```

Visualização: Um gráfico de barras mostrando receita total para 2024, 2025 e 2026.

### Exemplo 2: Despesas por Departamento (Gráfico de Barras Horizontal)

1. Arraste `departamento` para **Linhas**
2. Arraste `SUM(valor)` para **Colunas**
3. Filtre por `categoria_dre` = "Despesa"

```
Linhas: [departamento]
Colunas: SUM([valor])
Filtros: [categoria_dre] = "Despesa"
Cor: [departamento]
```

### Exemplo 3: Evolução Mensal da Receita (Linha do Tempo)

1. Arraste `data` (como Contínuo) para **Colunas**
2. Arraste `SUM(valor)` para **Linhas**
3. Filtro: `categoria_dre` = "Receita"
4. Arraste `ano` para **Cor** (para colorir cada ano)

```
Colunas: MONTH([data])  (contínuo)
Linhas: SUM([valor])
Filtros: [categoria_dre] = "Receita"
Cor: [ano]
```

### Exemplo 4: Top 10 Clientes por Receita

1. Arraste `cliente_id` para **Linhas**
2. Arraste `SUM(valor)` para **Colunas** (como medida, ordenado decrescente)
3. Clique em **Filtros → Top N → 10 por SUM(valor)**

```
Linhas: [cliente_id]
Colunas: SUM(valor)
Filtro: Top 10 por SUM(valor)
```

## Ordenação

O Tableau ordena automaticamente, mas você pode controlar manualmente:

- **Botão de ordenação** na toolbar (ascendente/descendente)
- **Ordenação por campo**: clique no cabeçalho da dimensão
- **Ordenação por fórmula**: botão direito no campo → Ordenar → Personalizado

```
Para ordenar departamentos por valor total (maior despesa primeiro):
Clique no botão de ordenação na barra de ferramentas com SUM(valor) selecionado.
```

## Filtragem Avançada

### Filtros Contextuais

Filtros comuns são aplicados um após o outro. Filtros contextuais são aplicados *antes* de tudo — úteis para Top N em subconjuntos.

```
1. Arraste [ano] para Filtros e selecione "2025"
2. Clique direito → "Adicionar ao Contexto"
3. Agora o Top 10 de clientes será calculado apenas dentro de 2025
```

### Filtros por Condição

```
Filtro em [valor]: 
  → Por condição: SUM(valor) >= 100000
  (Exibe apenas contas com saldo >= R$ 100 mil)
```

## Exercícios Práticos

1. **Receita vs Despesa por mês (2025)**
   Crie um gráfico de barras agrupadas com `data` em Colunas, `SUM(valor)` em Linhas, e `categoria_dre` em Cor. Filtre para "Receita" e "Despesa".

2. **Margem bruta por centro de custo**
   Filtre `categoria_dre` para "Receita" e "CMV". Crie uma tabela com `centro_custo` em Linhas e `SUM(valor)` em Colunas para cada categoria.

3. **Despesas acima de R$ 50 mil**
   Filtre por `departamento` e `valor`, mostrando apenas contas com `SUM(valor) > 50000`. Use ordenação descendente.

---

**Próximo: [Visualizações Financeiras](02-visualizacoes-financeiras.md)**
