# Fundamentos do Tableau — O "ABC" para Começar

> Imagine que você está organizando a DRE do mês. Você separa os dados em duas categorias: de um lado, os **rótulos** ("Receita", "Despesa", "Centro de Custo") — do outro, os **valores** (R$ 1,2 milhão, R$ 800 mil). No Tableau é a mesma lógica: existem as **dimensões** (rótulos azuis) e as **medidas** (números verdes). Entender essa diferença é 80% do caminho andado.

## Dimensões vs Medidas — A "Dualidade" que Tudo Explica

No Tableau, todo campo ganha um rótulo de cor automaticamente:

| Tipo | Cor | O que representa | Exemplos no Grupo Nova Era |
|------|-----|------------------|---------------------------|
| **Dimensão** | 🔵 Azul | Dados de texto, categoria, rótulo — coisas que *classificam* | `ano`, `mes`, `centro_custo`, `conta_contabil`, `departamento` |
| **Medida** | 🟢 Verde | Dados numéricos — coisas que *se somam, se calculam* | `valor`, `quantidade`, `saldo` |

:::tip Regra prática de ouro
**Dimensão azul** → cria cabeçalhos (ex: "2024", "2025", "2026" como colunas separadas)
**Medida verde** → cria eixos numéricos (ex: escala de R$ 0 a R$ 50 milhões)
:::

```tableau
// Pense: dimensão no eixo X, medida no eixo Y
// Colunas: [ano]
// Linhas: SUM([valor])
// Resultado: uma barrinha para cada ano com o valor total
```

:::note Na prática da controladoria
Sua conta contábil (ex: "3.01.001 — Receita de Vendas") é uma **dimensão** (classifica). O saldo dela (R$ 500 mil) é uma **medida** (numera). Sempre que você quiser "quebrar" um número por alguma categoria, arraste a categoria como dimensão.
:::

## Discreto vs Contínuo — A "Chave" que Muda Tudo

Essa é uma das maiores fontes de confusão para iniciantes. Vamos descomplicar:

| | Discreto (Azul) | Contínuo (Verde) |
|---|---|---|
| **Comportamento** | Cria "caixinhas" separadas | Cria uma "linha" contínua |
| **Exemplo** | `ano` → 2024, 2025, 2026 (colunas separadas) | `SUM(valor)` → escala de R$ 0 a R$ 50M |
| **Gráfico típico** | Barras, pizza, linhas "quebradas" entre pontos | Linha contínua, área, dispersão |

:::tip Dica rápida
Quer ver um ano por coluna? Deixe a data como **Discreto** (azul). Quer ver uma linha do tempo contínua de janeiro a dezembro? Mude para **Contínuo** (verde). O truque: clique com o **botão direito** no campo de data e alterne entre os dois modos.
:::

```
[ano] como Discreto → gráfico de barras: 2024, 2025, 2026 lado a lado
[ano] como Contínuo → linha: janeiro 2024 até dezembro 2026
```

## As Prateleiras (Shelves) — Onde Você "Monta" o Gráfico

Pense nas prateleiras como **gavetas organizadoras**: cada uma tem uma função específica. Você arrasta os campos para a gaveta certa e mágica acontece.

```mermaid
block-beta
  columns 1
  block:Col
    columns 1
    COLUNAS (eixo X — o que vai na horizontal)
    ano
  end
  block:Lin
    columns 1
    LINHAS (eixo Y — o que vai na vertical)
    SUM([valor])
  end
  block:Fil
    columns 1
    FILTROS (o que você quer esconder ou focar)
    departamento = "Financeiro"
  end
  block:Mar
    columns 3
    Cor categoria
    Rótulo SUM([valor])
    Detalhe centro_custo
    Tamanho SUM([qtd])
  end
end
```

### Colunas e Linhas — O "Esqueleto" do Gráfico
Define a estrutura. **Toda** visualização começa aqui: o que vai no eixo X e no eixo Y.

### Filtros — O "Peneirador"
Restringe os dados que aparecem. Quer ver só 2025? Arraste `ano` para Filtros e selecione 2025.

### Marcas (Marks) — O "Estilista"
Controlam a aparência visual:
- **Cor:** diferencia categorias (ex: Receita azul, Despesa vermelha)
- **Tamanho:** quanto maior o número, maior o ponto/barra
- **Rótulo:** mostra o valor escrito no gráfico
- **Detalhe:** adiciona mais informações sem mudar o eixo
- **Tooltip:** o texto que aparece ao passar o mouse

:::tip Jargão traduzido
**Tooltip** = "dica flutuante". É aquela caixinha de texto que surge quando você passa o mouse em cima de um elemento. No Tableau, você pode personalizar o que ela mostra.
:::

## Conectando ao Banco Grupo Nova Era — Mão na Massa

Vamos conectar o Tableau aos dados que usaremos no curso inteiro. Siga os passos:

### Passo 1: Conexão

```
Conectar → PostgreSQL → 
  Servidor: pg.gruponovaera.com.br
  Database: grupo_nova_era
  Schema: financeiro
  Tabela: dre (é aqui que está nossa DRE)
```

### Passo 2: Live ou Extract?

```
Use "Live" enquanto estiver aprendendo e testando.
Quando terminar o dashboard, crie um Extract (.hyper) para ele ficar rápido.
```

### Passo 3: Conhecer os dados — A "Ficha Técnica"

Use a aba **Dados** (Data Source) do lado esquerdo para explorar os campos. É como folhear o sumário de um livro antes de ler:

| Campo | Tipo (no Tableau) | O que significa |
|-------|-------------------|-----------------|
| `ano` | Inteiro | Ano fiscal (2024, 2025, 2026) — use como dimensão |
| `mes` | String (texto) | Mês abreviado (Jan, Fev, Mar...) |
| `data` | Data | Data completa da transação |
| `conta_contabil` | String | Código da conta contábil (ex: 3.01.001) |
| `categoria_dre` | String | Grupo da DRE (Receita, CMV, Despesas...) |
| `centro_custo` | String | Centro de custo (ex: CC-FIN, CC-ADM) |
| `departamento` | String | Departamento responsável |
| `valor` | Decimal (número) | **Valor monetário em R$** — sua principal medida |
| `tipo` | String | Débito ou Crédito |
| `cliente_id` | Inteiro | ID do cliente (quando aplicável) |

:::caution Atenção!
Repare que `ano` aparece como **Inteiro**, não como Data. Isso significa que o Tableau vai tratar 2024, 2025, 2026 como rótulos separados, não como uma linha do tempo. Se quiser linha do tempo, use o campo `data`.
:::

## Criando sua Primeira Visualização

## Criando sua Primeira Visualização — "Hello World" do Tableau

### Exemplo 1: Receita Total por Ano (Gráfico de Barras)

**Problema:** Quanto o Grupo Nova Era faturou em cada ano?

Passo a passo:
1. Arraste `ano` para **Colunas** → aparecem 3 colunas: 2024, 2025, 2026
2. Arraste `SUM(valor)` para **Linhas** → nascem as barras!
3. Arraste `categoria_dre` para **Filtros** e marque só "Receita"

```
Colunas: [ano]
Linhas: SUM([valor])
Filtros: [categoria_dre] = "Receita"
```

**Resultado:** Três barrinhas mostrando a receita total de cada ano. Em segundos, você vê se o faturamento cresceu ou caiu.

### Exemplo 2: Despesas por Departamento (Barras Horizontais)

**Problema:** Qual departamento gasta mais?

1. Arraste `departamento` para **Linhas**
2. Arraste `SUM(valor)` para **Colunas**
3. Filtre: só `categoria_dre` = "Despesa"
4. Arraste `departamento` para **Cor** (cada departamento de uma cor)

```
Linhas: [departamento]
Colunas: SUM([valor])
Filtros: [categoria_dre] = "Despesa"
Cor: [departamento]
```

### Exemplo 3: Evolução Mensal da Receita (Linha do Tempo)

**Problema:** Como a receita se comporta mês a mês?

1. Arraste `data` (como **Contínuo** — verde) para **Colunas**
2. Arraste `SUM(valor)` para **Linhas**
3. Filtro: `categoria_dre` = "Receita"
4. Arraste `ano` para **Cor** — cada ano ganha uma cor diferente

```
Colunas: MONTH([data]) (contínuo — cria uma linha do tempo)
Linhas: SUM([valor])
Filtros: [categoria_dre] = "Receita"
Cor: [ano]
```

**Resultado:** Você vê a sazonalidade — será que dezembro sempre vende mais?

### Exemplo 4: Top 10 Clientes por Receita

**Problema:** Quem são os 10 clientes que mais trazem receita?

1. Arraste `cliente_id` para **Linhas**
2. Arraste `SUM(valor)` para **Colunas** (ordem decrescente)
3. Clique em **Filtros → Top N → 10 por SUM(valor)**

```
Linhas: [cliente_id]
Colunas: SUM(valor)
Filtro: Top 10 por SUM(valor) (descendente)
```

:::tip Na prática da controladoria
Este exemplo é clássico para relatórios de **concentração de receita**. Se os top 3 clientes representam 80% do faturamento, isso é um risco de negócio que você precisa reportar.
:::

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

## Resumo rápido — Fundamentos

| Conceito | O que você precisa lembrar |
|----------|---------------------------|
| **Dimensão (azul)** | É categoria/rótulo — vai em Colunas ou Linhas para criar grupos |
| **Medida (verde)** | É número — vai no centro para criar os valores |
| **Discreto vs Contínuo** | Discreto = colunas separadas; Contínuo = eixo contínuo |
| **Marcas** | Cor, tamanho, rótulo — é onde você "embeleza" o gráfico |
| **Filtros** | Peneiram os dados — use para focar em períodos, categorias etc. |

> 💡 **Lembrete de ouro:** Se o gráfico não apareceu, você provavelmente colocou uma medida onde deveria ser dimensão, ou vice-versa. Troque e veja a mágica acontecer.

**Próximo: [Visualizações Financeiras](02-visualizacoes-financeiras.md)**
