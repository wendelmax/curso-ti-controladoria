# Módulo 2: Google BigQuery

**Carga horária: 10h**

Imagine que você trabalha na controladoria de uma empresa com 10 anos de lançamentos contábeis — cerca de 50 milhões de registros. No seu banco antigo (tipo o SQLite do Módulo 1), rodar um fechamento mensal levava 15 minutos. Se alguém filtrava errado, o sistema travava para todo mundo. Frustrante, né?

Agora imagine que a mesma consulta leva **3 segundos**, custa **centavos**, e nunca trava. Esse é o BigQuery.

## Traduzindo para seu dia a dia

BigQuery é o "data warehouse serverless" do Google Cloud. Vamos traduzir isso:

- **Data warehouse** ("armazém de dados") — em vez de espalhar suas informações em 50 planilhas diferentes, você centraliza TUDO em um único lugar, organizado para consultas rápidas.
- **Serverless** ("sem servidor") — você não precisa instalar software, não precisa configurar memória, processador ou disco. O Google cuida de toda a infraestrutura. Você só escreve o SQL.

Enquanto bancos tradicionais foram criados para sistemas do dia a dia (lançar uma venda de cada vez), o BigQuery foi criado para **analisar montanhas de dados de uma vez só**.

:::tip É como trocar uma calculadora de pilha por um supercomputador. A boa notícia: o manual de instruções (o SQL) é o mesmo que você já aprendeu.
:::

## Por que BigQuery para Controladoria?

Na prática da controladoria, seu maior problema não é saber contabilidade — é esperar consultas financeiras rodarem. BigQuery resolve isso:

| Situação | Antes (SQL tradicional) | Com BigQuery |
|---|---|---|
| Fechamento mensal de 5 anos de dados | 15–30 minutos | 2–5 segundos |
| Conciliação bancária anual | Travava o sistema | Roda sem susto |
| Relatório gerencial comparativo | Limitado a 6 meses | Anos históricos completos |
| Compartilhar com auditoria | Envia CSV por e-mail | Acesso direto em tempo real |

**BigQuery ML** — você pode criar modelos preditivos (prever fluxo de caixa, inadimplência) usando apenas SQL, sem precisar aprender Python ou outras linguagens de programação.

**Custo justo** — você paga só pelo que processa. Uma consulta rápida = centavos. O primeiro 1 TB por mês é **grátis**.

## Tópicos do Módulo

| Aula | Tópico | O que você vai aprender |
|---|---|---|
| 1 | Diferenças: SQL tradicional vs BigQuery SQL | Como o SQL do BigQuery é diferente do que você viu |
| 2 | Particionamento e Clusterização | Como organizar dados para pagar menos e rodar mais rápido |
| 3 | Funções Analíticas no BigQuery | Saldo acumulado, comparação mês a mês, rankings |
| 4 | Otimização de Queries Financeiras | Técnicas para reduzir custo em 90%+ |
| 5 | Prática com Datasets Públicos | Mão na massa com dados reais de empresas |

## Resumo — O que você precisa lembrar

| Pergunta | Resposta em português claro |
|---|---|
| O que é BigQuery? | Um super-banco de dados do Google, pago por uso, sem precisar instalar nada |
| Para que serve na controladoria? | Processar milhões de lançamentos contábeis em segundos |
| Preciso instalar algo? | Não. Só ter uma conta Google e saber escrever SQL |
| Quanto custa? | Centavos por consulta. Primeiro 1 TB/mês é grátis |

> **Aviso:** Este módulo é teórico com exemplos de código. Para praticar BigQuery de verdade, você precisará de uma conta Google Cloud (o nível gratuito — free tier — é suficiente).
