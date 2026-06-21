# Introdução ao Looker para Controladoria

> **Imagine que...** sua equipe precisa gerar 15 relatórios mensais diferentes (DRE, Balanço, Fluxo de Caixa, Análise de Custos). Hoje, cada relatório é uma planilha Excel com fórmulas diferentes — e no fechamento, os números nunca batem. O Looker resolve isso: **os números saem da mesma "fonte da verdade"**, uma única vez, para todos os relatórios.

## O que é o Looker?

Looker é uma plataforma de business intelligence e analytics da Google Cloud. 

:::note Traduzindo para seu dia a dia
Pense no Looker como um **escritório de contabilidade terceirizado**:
- Você envia os dados brutos (lançamentos contábeis) → BigQuery
- O escritório organiza tudo com regras claras → LookML
- Você recebe os relatórios prontos → Dashboards

A diferença? Esse "escritório" trabalha em segundos, não em dias. E você nunca precisa ligar perguntando "como esse número foi calculado?" — as regras estão documentadas no sistema.
:::

### Modelagem Semântica — O "Tradutor" de Planilhas

Diferente de ferramentas tradicionais que operam diretamente sobre tabelas e SQL, o Looker utiliza uma camada intermediária — o **LookML** — que funciona como um **tradator simultâneo**: você fala "Receita Líquida", o LookML traduz para a linguagem que o banco de dados entende.

:::tip Por que isso importa para você?
Você, contador ou controller, **nunca precisará escrever SQL ou LookML**. Seu trabalho é:
1. Pedir ao analista de BI: "Crie a métrica de Margem EBITDA"
2. Usar os dashboards prontos
3. Confiar que o cálculo está correto (porque foi definido uma única vez)

Mas entender como funciona por baixo dos panos ajuda você a saber **o que é possível pedir**.
:::

:::warning Jargão explicado
- **Business Intelligence (BI)** = "inteligência de negócios". É o guarda-chuva de ferramentas que transformam dados brutos em decisões. Imagine um farol iluminando onde sua empresa está gastando mais.
- **Modelagem Semântica** = em vez de você falar "soma da coluna X menos coluna Y", você fala "Receita Líquida". O sistema entende o *significado*, não só a fórmula.
- **SQL** = a "linguagem de programação" dos bancos de dados. Você não precisa aprender — o LookML escreve SQL para você.
:::

## Por que Looker para Finanças?

| Característica | O que significa | Benefício real na sua rotina |
|---|---|---|
| **Modelagem Semântica** | Métricas definidas UMA vez | Chega de DRE do financeiro dar R$ 1 milhão e a do contábil dar R$ 950 mil |
| **Governança Centralizada** | Regras no LookML, não em planilhas | Auditoria sabe exatamente como cada número foi calculado |
| **Versionamento (Git)** | Histórico de quem alterou o quê | "Quem mudou a fórmula da Margem Bruta?" — resposta em 1 clique |
| **Granularidade sob Demanda** | Drill-down sem SQL | Da DRE consolidada você clica e chega no lançamento individual |
| **Integração Nativa BigQuery**| Consulta em data warehouse sem limites | Processa milhões de linhas em segundos |

## Looker vs. Tableau: Qual escolher?

| Aspecto | Looker | Tableau |
|---|---|---|
| **Abordagem** | Tudo centralizado no LookML | Cada um faz do seu jeito |
| **Governança** | Regras únicas, versionadas, auditáveis | Difícil padronizar entre equipes |
| **Escalabilidade** | BigQuery por baixo — petabytes | Depende do computador local |
| **Curva de aprendizado** | Maior pra configurar, mas mais fácil pra consumir | Mais fácil no começo, mais bagunça depois |
| | **Melhor para controladoria** | **Melhor para análise exploratória** |

:::note E por que isso importa?
Imagine: na sua empresa, cada analista financeiro tem sua própria planilha de DRE. Um calcula margem como lucro/receita, outro como lucro líquido/receita líquida. No Looker, **todo mundo olha para a mesma Margem**, com a mesma fórmula. Discussão encerrada.
:::

## A Camada Semântica — O que está por baixo dos panos

O grande diferencial do Looker: você interage com nomes que **fazem sentido para você** ("Receita Líquida", "Margem Bruta"), não com nomes técnicos de colunas (`vlr_receita_bruta - vlr_deducoes`).

```mermaid
flowchart LR
    subgraph "Você vê"
        A[Looks / Dashboards / Explorer]
        B[Métricas de negócio: "Receita Líquida"]
    end
    subgraph "O Looker traduz"
        C[LookML - Modelo Semântico]
        D["Regras centralizadas: receita_liquida = receita_bruta - deducoes"]
    end
    subgraph "Banco de dados"
        E[BigQuery]
        F[Tabelas físicas: colunas SQL]
    end
    A --> C --> E
    B --> D --> F
```

:::caution Cuidado!
Uma `dimension` funciona como os **filtros** de um relatório contábil: "por mês", "por centro de custo", "por conta". Uma `measure` é o **valor** que aparece na célula: R$ 1.000,00, 15%, etc. Misturar os dois é como colocar "Centro de Custo" dentro da célula de valor — não faz sentido.
:::

## Fluxo de Trabalho na Controladoria — Quem faz o quê

```
┌─────────────────────────────────────────────────────────┐
│ 1. Engenheiro de dados                                  │
│    Modela tabelas no BigQuery (lançamentos, plano       │
│    de contas, centros de custo)                         │
├─────────────────────────────────────────────────────────┤
│ 2. Analista de BI                                       │
│    Cria views e explores em LookML com regras de        │
│    negócio (quem escreve o LookML)                      │
├─────────────────────────────────────────────────────────┤
│ 3. Contador / Controller  ←── VOCÊ ESTÁ AQUI           │
│    Constrói looks e dashboards no Explore (sem SQL!)    │
├─────────────────────────────────────────────────────────┤
│ 4. CFO / Diretoria                                      │
│    Consome dashboards programados e alertas             │
└─────────────────────────────────────────────────────────┘
```

:::tip A boa notícia
Você (contador/controller) está no passo 3 — **nunca precisará escrever código**. Mas ao entender os passos 1 e 2, você consegue:
- Saber o que pedir para o analista de BI
- Validar se o que foi construído atende às regras contábeis
- Não aceitar "não dá" como resposta sem entender o porquê
:::

## Resumo: 3 pontos para levar para casa

1. **Looker é uma "camada de tradução"** entre seu vocabulário financeiro e o banco de dados — você fala "Receita Líquida", ele entende.
2. **Você não precisa escrever LookML** — seu papel é consumir dashboards e pedir métricas. Mas entender o conceito evita que você seja enganado por "limitações técnicas".
3. **A grande vantagem é a consistência**: uma métrica definida uma vez, usada por todos, sem discussão sobre quem está certo.

---

**Próximo módulo:** [01-lookml.md](01-lookml.md) — Fundamentos do LookML
