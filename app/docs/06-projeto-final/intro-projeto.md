# Módulo 6: Projeto Final Integrador

**Carga horária: 6h**

---

> 🧾 **Analogia do Dia**  
> Sabe quando chega o fim do mês e você precisa fechar a contabilidade, consolidar os números, preparar a DRE, analisar variações e apresentar tudo na reunião de diretoria?  
> Este projeto é EXATAMENTE isso — mas usando SQL e ferramentas modernas no lugar de planilhas manuais.

---

Chegou a hora de juntar tudo que você aprendeu! O projeto final simula um **desafio real de controladoria** usando dados do Grupo Nova Era.

:::tip Respira — você já sabe o suficiente

Este projeto reúne **tudo** que você aprendeu nos módulos anteriores: SQL, joins, window functions, CTEs, visualização. Se você chegou até aqui, já tem as ferramentas. Agora é questão de aplicar.

Não precisa fazer de uma vez. Divida em 3 sessões de 2h cada. Lembre-se: errar faz parte — **cada erro é um aprendizado**. E no mundo real, é assim mesmo: você testa, ajusta, testa de novo.
:::

## Por que isso importa para você?

Na sua rotina de controladoria, você já faz isso hoje — mas manualmente:

| Hoje (manual) | Com SQL (automático) |
|:---|---:|
| Abrir sistema contábil → exportar para Excel | Uma query que já traz os dados limpos |
| FazerPROCV entre planilhas | JOIN direto no banco |
| Arrastar fórmulas até dar erro | O banco calcula tudo |
| Preparar slide copiando gráfico por gráfico | Dashboard ao vivo, sempre atualizado |

**O projeto prova que você consegue fazer o mesmo trabalho em metade do tempo — sem macros, sem VLOOKUP, sem risco de fórmula quebrada.**

## 🤔 "Pipeline"? "ETL"? "Deploy"? O que é isso?

- **Pipeline** (pronuncia-se *paiplain*): É como uma **linha de montagem de dados**. Você puxa matéria-prima (dados brutos do banco), processa (limpa, organiza) e entrega o produto final (relatório pronto). Assim como uma linha de produção fabril.
- **ETL** (*Extract, Transform, Load*): *Extrair* os dados de onde eles estão, *Transformar* (limpar, calcular) e *Carregar* no destino final (dashboard, relatório).
- **Deploy** (pronuncia-se *diploi*): significa "colocar em produção" — ou seja, disponibilizar seu código para uso real, não só no seu computador.

Você não precisa decorar os termos. Precisa entender o conceito: **você vai construir uma máquina que transforma dados brutos em informações prontas para decisão.**

## O Desafio

A diretoria do Grupo Nova Era solicitou um **painel analítico completo** para acompanhar a saúde financeira da empresa. É como se você estivesse montando o **painel de instrumentos de um avião**: vários indicadores diferentes, todos confiáveis, sempre atualizados.

Você precisa entregar:

1. **Pipeline de dados**: Extrair e organizar dados do banco SQL (é a fundação de tudo)
2. **Análise de vendas**: Quem são os clientes top? Quais produtos vendem mais?
3. **DRE automatizado**: Demonstrativo de resultado mês a mês (isso você já domina!)
4. **Previsão financeira**: Projeção de fluxo de caixa (como você faz no Excel)
5. **Dashboard executivo**: Visualização consolidada (o "painel do avião")
6. **Apresentação**: Insights e recomendações (como na reunião de diretoria)

## Etapas do Projeto

| Etapa | Tema | Ferramentas | O que você vai aprender |
|-------|------|-------------|-------------------------|
| 1 | Pipeline de Dados | SQL + BigQuery | Extrair dados brutos e preparar para análise |
| 2 | Análise de Vendas | SQL + Window Functions | Ranking, curva ABC, sazonalidade |
| 3 | DRE Automatizado | SQL + CTEs | Sua DRE sem Excel, direto do SQL |
| 4 | Previsão Financeira | SQL + BigQuery ML | Projeções usando o próprio banco |
| 5 | Dashboard Executivo | Looker ou Tableau | Visualizar tudo em um painel |
| 6 | Apresentação | Todas | Contar a história dos números |

:::note Mão na massa!
Você pode usar o **SQL Playground** para todas as etapas de SQL e documentar suas análises em markdown. Não precisa instalar nada no seu computador.
:::

## Resumo do Capítulo

- ✅ Este projeto junta TUDO que você aprendeu no curso
- ✅ Cada etapa constrói sobre a anterior: pipeline → análise → DRE → previsão → dashboard → apresentação
- ✅ Os termos técnicos (pipeline, ETL, deploy) são só nomes novos para processos que você já conhece na controladoria
