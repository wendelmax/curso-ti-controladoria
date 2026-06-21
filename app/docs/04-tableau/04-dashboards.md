# Dashboards Executivos no Tableau — O "Painel de Controle" da Controladoria

> Imagine o painel de um avião: vários instrumentos mostrando altitude, velocidade, combustível — tudo ao mesmo tempo, num só lugar. O **dashboard** do Tableau é a mesma coisa para os números da empresa: KPIs, gráficos, tabelas e filtros tudo numa tela só, prontos para o diretor financeiro tomar decisões.

## Conceitos Fundamentais — O que é um Dashboard?

Um dashboard no Tableau é uma **tela** que combina:
- **Visualizações** (vários gráficos lado a lado)
- **Objetos de layout** (texto, imagens, containers para organizar)
- **Interações** (filtros que afetam tudo, ações de clique, parâmetros)

Pense como uma central de monitoramento: em vez de abrir 10 abas diferentes, você tem tudo numa tela só, tudo conversando entre si.

### 5 Princípios Sagrados para Controladoria

| # | Princípio | Traduzindo para seu dia a dia |
|---|-----------|------------------------------|
| 1 | **Hierarquia visual** | O mais importante (KPIs) no topo/esquerda — o olho lê assim |
| 2 | **Contexto primeiro** | Mostre o total, depois os detalhes — "o todo antes das partes" |
| 3 | **Interatividade controlada** | Dê filtros que o usuário **precisa**, não todos os filtros possíveis |
| 4 | **Performance** | Ninguém espera 30 segundos por um dashboard — extraia os dados |
| 5 | **Consistência financeira** | Mesmo formato de moeda, mesma paleta de cores, mesmo padrão

## Criando seu Primeiro Dashboard — "Mão na Massa"

### Passo 1: Planejamento — Desenhe Antes de Construir

Vamos construir o **Dashboard de Resultados do Grupo Nova Era**. Antes de abrir o Tableau, desenhe o layout mental:

```mermaid
block-beta
  columns 4
  Header("🔝 CABEÇALHO: Grupo Nova Era — Dashboard de Resultados 2025"):4
  KPI1("💰 Receita<br/>R$ XX") KPI2("💸 Despesa<br/>R$ XX") KPI3("📊 Margem<br/>XX%") KPI4("📈 EBITDA<br/>R$ XX")
  Graph("📉 Receita vs Despesa Mensal"):4
  block:Row2
    columns 2
    Treemap("🗂️ Despesas por Depto")
    Table("🏆 Top 10 Clientes")
  end
  Waterfall("📋 Waterfall DRE Trimestral"):4
  Filters("🔍 Filtros") space space Update("⏱️ Atualizado: Jun/2025")
end
```

> **Lógica:** O olho lê em Z — começa no topo esquerdo (KPIs), desce pelo gráfico principal, depois explora os detalhes na base.

### Passo 2: Criar as Planilhas (Worksheets) — "As Peças do Quebra-Cabeça"

Antes de montar o dashboard, crie cada gráfico como uma **planilha separada**. São as peças que você vai encaixar:

| Nome da Planilha | Tipo | O que mostra |
|-----------------|------|-------------|
| `kpi_receita` | Textão | SUM(valor) onde categoria = "Receita" |
| `kpi_despesa` | Textão | SUM(valor) onde categoria = "Despesa" |
| `kpi_margem` | Textão | (Receita - Despesa) / Receita (percentual) |
| `kpi_ebitda` | Textão | SUM(valor) onde categoria = "EBITDA" |
| `rec_desp_mensal` | Linha dupla | Receita vs Despesa mês a mês |
| `treemap_despesas` | Treemap | Despesas por departamento (retângulos) |
| `top_clientes` | Barra horizontal | Top 10 clientes por receita |
| `waterfall_dre` | Cascata | DRE trimestral (degaus) |

:::tip Importante
Cada planilha vira uma "peça" no dashboard. Se você fez um gráfico bonito, ele já está pronto para ser arrastado para o painel.
:::

### Passo 3: Montar o Dashboard — "Montando o Painel"

```
1. Clique no ícone "Nova Planilha → Painel" (ou Ctrl+Shift+D)
2. Defina o Tamanho: 1200 x 900 pixels (ou "Automático" para responsivo)
3. Arraste os objetos da esquerda para a tela:
   - Container Horizontal → para colocar os 4 KPIs lado a lado
   - Planilhas → arraste cada uma para a posição correta
   - Container Vertical → para agrupar treemap + tabela
   - Objeto de Texto → para o título e rodapé
```

### Passo 4: Containers — Os "Blocos de Montar" do Layout

Containers são como **gavetas**: você coloca objetos dentro deles e eles se ajustam automaticamente.

```mermaid
block-beta
  columns 1
  Header("🟦 CABEÇALHO (container horizontal)")
  block:KPIs
    columns 4
    kpi_receita kpi_despesa kpi_margem kpi_ebitda
  end
  rec_desp_mensal
  block:Row2
    columns 2
    treemap_despesas top_clientes
  end
end
```

:::tip Dica de ouro
**Container Horizontal** → objetos lado a lado (ex: os KPIs)
**Container Vertical** → objetos empilhados (ex: treemap + tabela)
O segredo do layout responsivo é aninhar containers corretamente.
:::

## Ações (Actions) — "Fazendo o Dashboard Responder ao Clique"

Ações são o que transformam seu dashboard de **estático** (só olhar) para **interativo** (clicar e explorar). É a diferença entre uma foto e um videogame.

### Filter Action — "Clique Aqui e Filtre Tudo"

**Cenário:** O diretor clica no departamento "TI" no treemap. Imediatamente, o gráfico de receita mensal e a tabela de top clientes mostram só dados de TI.

```tableau
Dashboard → Ações → Adicionar Ação → Filtrar

Nome: "Filtrar por Departamento"
Planilha de Origem (onde clico): treemap_despesas
Planilhas de Destino (o que filtra): rec_desp_mensal, top_clientes, waterfall_dre
Quando executar: Ao Selecionar
Após limpar seleção: Mostrar todos os valores
```

:::note Na prática da controladoria
Diretor clica em "TI" → vê a evolução mensal das despesas de TI. Clica em "Financeiro" → vê os números do Financeiro. Tudo em 1 clique, sem precisar criar 10 gráficos separados.
:::

### Highlight Action — "Passe o Mouse e Destaque"

**Diferença do Filter:** O destaque **não esconde** os outros dados — apenas "acende" o item selecionado.

```tableau
Dashboard → Ações → Adicionar Ação → Destacar

Nome: "Destacar Cliente"
Origem: top_clientes
Destino: rec_desp_mensal
Executar ao: Passar o mouse
```

### URL Action — "Clique e Abra um Relatório Externo"

Útil para abrir um sistema externo (SAP, ERM, relatório em PDF) ao clicar.

```tableau
Dashboard → Ações → Adicionar Ação → URL

Nome: "Abrir Detalhamento"
URL: https://bi.gruponovaera.com/detalhes?conta=<conta_contabil>
Executar ao: Menu (clique direito → opção no menu)
```

## Parâmetros — "Botões e Controles que o Usuário Mexe"

Parâmetros são como **controles deslizantes** ou **botões de rádio** que você coloca no dashboard para o usuário ajustar sem precisar editar nada.

### Exemplo 1: Período Dinâmico — "Quero Ver os Últimos 3, 6 ou 12 Meses?"

**Passo 1** — Crie o parâmetro:

```tableau
Criar → Parâmetro
   Nome: "Período de Análise"
   Tipo: Inteiro (número inteiro)
   Valores permitidos: Lista → 1, 3, 6, 12
   Valor padrão: 12
```

**Passo 2** — Crie um campo calculado que use o parâmetro:

```tableau
// Filtro de data baseado no parâmetro
DATEADD('month', -[Período de Análise], {MAX([data])})
```

**Passo 3** — Arraste esse campo para **Filtros** e selecione "Verdadeiro". Agora o dashboard só mostra dados do período selecionado.

### Exemplo 2: Meta Móvel (What-If) — "E Se a Margem Fosse X%?"

**Cenário:** O CFO quer testar: "E se a meta de margem fosse 22% em vez de 20%? Quantas filiais atingiriam?"

```tableau
1. Criar Parâmetro:
   Nome: "Meta de Margem"
   Tipo: Float (número decimal)
   Mínimo: 0, Máximo: 1, Incremento: 0.01
   Valor padrão: 0.20

2. Campo Calculado:
   IF ([Margem Realizada]) >= [Meta de Margem]
   THEN '✅ Atingiu Meta' ELSE '❌ Abaixo da Meta'
   END

3. Mostrar no dashboard:
   Painel → Parâmetros → Mostrar Parâmetro → "Meta de Margem"
   (vira um controle deslizante que o usuário arrasta)
```

:::tip Na prática da controladoria
Com isso, o CFO pode testar diferentes cenários durante a reunião: "Desliza a meta para 18%... agora para 22%..." e vê instantaneamente quantas áreas batem a meta.
:::

## Filtros no Dashboard — "Quem Controla o que Aparece"

### Tipos de Filtro — Cada Um com Seu Poder

| Tipo | O que afeta | Exemplo |
|------|-------------|---------|
| **Filtro de Planilha Única** | Só 1 gráfico | Ano no topo do waterfall |
| **Filtro de Painel** | **Tudo** no dashboard | Selecionar ano no topo — todas as visualizações mudam |
| **Filtro de Fonte de Dados** | Todos os dashboards da mesma fonte | Período global |
| **Filtro com Parâmetro** | Controlado por botão/deslizante | Meta deslizante |

### Regras de Ouro para Filtros

1. **Filtros no topo** ou numa lateral — lugar de destaque
2. Mostre **só o necessário** — usuário não precisa ver 20 filtros
3. **Lista > Deslizante** para categorias (departamento, centro de custo)
4. Use **"Aplicar ao Painel"** para filtros que devem afetar tudo
5. **Esconda filtros técnicos** — o usuário final não precisa ver campos auxiliares

## Design e Formatação Financeira — "A Apresentação é Tão Importante Quanto os Números"

### Paleta de Cores Recomendada para Financeiros

| Elemento | Cor | Código |
|----------|-----|--------|
| Receita | Azul | `#1A73E8` |
| Despesa | Vermelho | `#D93025` |
| Lucro | Verde | `#1E8E3E` |
| Meta | Cinza | `#5F6368` |
| Alerta | Laranja | `#F9AB00` |
| Benchmark | Roxo | `#9334E6` |

### Formatando Números como um Profissional

```
Valores em reais:  R$ #.##0,00   (ex: R$ 1.234,56)
Milhares:          R$ #.##0,     (ex: R$ 1,2 → significa R$ 1.200)
Percentuais:       0,00%          (ex: 15,32%)
Datas:             mmm/aaaa       (ex: Jan/2025)
```

### Layout Limpo — "Menos É Mais"

- **Margens:** 10px entre os objetos (respiro visual)
- **Título:** Negrito, 16pt, azul escuro — destaque
- **Subtítulo:** 11pt, cinza — informação secundária
- **Fundo:** Branco ou cinza clarinho (`#F8F9FA`)
- **Grade:** Tire o que não for necessário — poluição visual

## Boas Práticas para Financeiros — "O Toque Profissional"

### 1. Contexto é Tudo — Mostre Sempre a Variação

Nunca mostre um número solto. Sempre mostre **vs período anterior**:

```tableau
// Seta para cima/baixo no KPI
IIF(SUM([valor]) > LOOKUP(SUM([valor]), -1), '▲', '▼')
```

Use triângulos: ▲ = melhorou, ▼ = piorou. O olho humano processa isso em milissegundos.

### 2. Hierarquia de Informação — "O Mais Importante Primeiro"

```
Nível 1 (Topo do dashboard):   KPIs consolidados do período
Nível 2 (Meio):                Tendências e comparações
Nível 3 (Base):                Detalhamento (tabelas, drill-down)
```

### 3. Tooltips que Agregam Valor — "Não Repita o Óbvio"

A tooltip (aquela caixinha ao passar o mouse) não deve só repetir o número do gráfico. Adicione contexto:

```tableau
// Tooltip personalizada de exemplo
<departamento> | <mes>
Receita: R$ <SUM(receita)>
Crescimento vs Mês Anterior: +12%
% do Total Geral: 23%
```

**Como fazer:** Dashboard → Tooltip → Inserir → Escolha os Campos

### 4. Alerta Visual — "Vermelho, Amarelo, Verde"

```tableau
// Cor do KPI muda conforme o resultado
IF [Margem Realizada] < 0.15 THEN '🔴 Vermelho'   ── crítico
ELSEIF [Margem Realizada] < 0.20 THEN '🟡 Amarelo' ── atenção
ELSE '🟢 Verde'                                      ── ok
END
```

## Performance — "Não Faça o Diretor Esperar"

### Diagnóstico Rápido: O Que Está Deixando Lento?

| Seu dashboard está... | Provável causa | Solução |
|----------------------|---------------|---------|
| ...lento para abrir | Consulta ao vivo (live) | Extraia os dados (.hyper) |
| ...travando com LOD | Muitos níveis de cálculo | Simplifique ou pré-agregue |
| ...com milhões de pontos | Dados diários | Agregue por mês |
| ...filtro demorando | Muitas opções (cardinalidade alta) | Use filtro contextual |
| ...várias fontes | Cruzando bancos diferentes | Faça join na origem |

### Checklist Anti-Lentidão

- [ ] Extrair dados (.hyper) em vez de conexão live
- [ ] Máximo 10-15 valores por filtro
- [ ] Remover campos que não estão sendo usados
- [ ] `COUNTD` só quando realmente necessário (é pesado)
- [ ] Preferir `FIXED` em vez de `INCLUDE`/`EXCLUDE`
- [ ] Fazer o máximo de contas no SQL antes de trazer pro Tableau

## Publicação e Compartilhamento — "Hora de Mostrar o Resultado"

### Opção Grátis: Tableau Public

```tableau
Arquivo → Exportar → Tableau Public como...

1. Crie uma conta em public.tableau.com
2. Arquivo → Salvar no Tableau Public
3. Defina se fica público ou "não listado"
4. Copie o link e compartilhe
```

:::caution Cuidado!
No Tableau Public, **seus dados ficam visíveis para qualquer pessoa**. Use apenas com dados fictícios ou sintéticos (como os do Grupo Nova Era). Dados reais da sua empresa NUNCA devem ir para o Tableau Public.
:::

### Opção Corporativa: Tableau Server/Cloud

```tableau
Arquivo → Publicar → Tableau Server

1. Servidor: tableau.gruponovaera.com
2. Projeto: Controladoria → Dashboards
3. Permissões: 
   - 👁️ Visualização: Diretoria, Gerência
   - ✏️ Edição: Analistas de Controladoria
4. Agendar Extract: Diário às 06:00
```

### Programação de Atualização — "Dashboard Fresquinho Todo Dia"

```
Servidor → Agendar → 
  Nome: "Atualização Grupo Nova Era"
  Frequência: Diária
  Horário: 06:00 BRT
  Prioridade: Alta
  Notificar: analistas@gruponovaera.com
```

> 💡 **Dica:** Agende a atualização para antes do horário comercial. Assim, quando o diretor abrir às 8h, os dados já estão atualizados.

## Exercícios Práticos

1. **Dashboard de Resultados (completo)**
   Monte o dashboard completo do Grupo Nova Era conforme o layout proposto. Inclua os 4 KPIs, gráfico de linha, treemap, top clientes e waterfall.

2. **Ações de Filtro**
   Adicione filter actions para que clicar em um departamento no treemap filtre todo o dashboard. Teste o comportamento.

3. **Parâmetro de Período**
   Crie um parâmetro para selecionar o período de análise (3, 6, 12 meses). Use no gráfico de linha de receita vs despesa.

4. **Tooltips Personalizadas**
   Enriqueça as tooltips de todas as visualizações com variação percentual, valor acumulado no ano e comparação com meta.

5. **Publicação**
   Exporte o dashboard para Tableau Public e compartilhe o link de visualização.

---

## Resumo rápido — Dashboards

| Conceito | Traduzindo | Lembre-se |
|----------|------------|-----------|
| **Dashboard** | Painel com vários gráficos numa tela só | Planeje o layout antes — Z visual |
| **Containers** | Gavetas que organizam o layout | Horizontal = lado a lado, Vertical = empilhado |
| **Ações** | Interatividade ao clicar/passar mouse | Filter (filtra), Highlight (destaca), URL (abre link) |
| **Parâmetros** | Controles que o usuário mexe | Período, meta what-if, cenários |
| **Performance** | Velocidade do dashboard | Extract > Live, FIXED > INCLUDE, agregar na origem |
| **Publicação** | Compartilhar com o time | Public = grátis (dados públicos), Server = corporativo |

> 💡 **Lembrete final:** Um bom dashboard não é aquele com mais gráficos — é aquele que responde às perguntas certas em menos tempo. Menos é mais.

---

**Fim do Módulo: Tableau para Controladoria**

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo4" title={quizes.modulo4.title} questions={quizes.modulo4.questions} />
