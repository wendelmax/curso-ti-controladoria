# 5.4 — Classificação Inteligente de Despesas

## O Problema

Empresas processam milhares de notas fiscais e despesas por mês. Classificar manualmente cada lançamento no centro de custo e conta contábil correto é:

- **Lento**: 2-5 minutos por documento
- **Inconsistente**: Cada pessoa classifica de um jeito
- **Caro**: Horas de pessoal especializado

## Abordagens de Classificação

### 1. Regras Manuais (IF/THEN)

```sql
-- Regras de classificação tradicionais
SELECT
    historico,
    CASE
        WHEN historico LIKE '%ENERGIA%' OR historico LIKE '%ELETRICIDADE%' THEN 50
        WHEN historico LIKE '%ALUGUEL%' THEN 50
        WHEN historico LIKE '%TELEFONE%' OR historico LIKE '%INTERNET%' THEN 52
        WHEN historico LIKE '%COMISSÃO%' OR historico LIKE '%COMISSAO%' THEN 45
        WHEN historico LIKE '%FRETE%' THEN 47
        WHEN historico LIKE '%MATERIAL ESCRIT%' THEN 51
        ELSE NULL
    END AS conta_sugerida
FROM lancamentos_contabeis;
```

**Problema**: Não escala — centenas de regras, manutenção complexa.

### 2. ML — Classificação de Texto

O modelo aprende a partir de exemplos históricos qual conta contábil corresponde a cada descrição.

### Features para Classificação

| Feature | Como extrair |
|---------|-------------|
| **Texto da descrição** | Bruto, limpo (stop words removidas) |
| **Fornecedor** | Quem emitiu |
| **Valor** | Faixa de valor (pequeno, médio, grande) |
| **Centro de custo histórico** | Onde foi alocado antes |
| **Departamento** | Quem solicitou |
| **Tipo de documento** | NF, recibo, contrato |

## Exemplo: Classificação com Similaridade

Usando SQL para encontrar lançamentos similares:

```sql
-- Encontrar despesas similares já classificadas
SELECT
    l.historico,
    l2.historico AS similar_a,
    p2.descricao AS conta_sugerida,
    cc2.descricao AS centro_custo_sugerido,
    COUNT(*) AS ocorrencias
FROM lancamentos_contabeis l
CROSS JOIN lancamentos_contabeis l2
    ON l.id_lancamento <> l2.id_lancamento
    AND l2.debito_credito = 'debito'
INNER JOIN planos_contas p2 ON l2.id_conta = p2.id_conta
INNER JOIN centros_custo cc2 ON l2.id_centro_custo = cc2.id_centro_custo
WHERE l.historico LIKE '%' || SUBSTR(l2.historico, 1, 10) || '%'
  AND l.id_conta IS NOT NULL
GROUP BY l.historico, l2.historico, p2.descricao, cc2.descricao
ORDER BY ocorrencias DESC;
```

## NLP (Processamento de Linguagem Natural)

### Como funciona na prática

1. **Tokenização**: Quebrar "ALUGUEL MATRIZ JANEIRO 2026" em palavras
2. **Remoção de stop words**: Tirar artigos, preposições
3. **Stemming**: Reduzir palavras à raiz (ALUGUEL -> ALUG)
4. **TF-IDF**: Peso das palavras na classificação
5. **Classificador**: Modelo que associa palavras a contas

## LLMs (Large Language Models) para Classificação

Modelos como GPT, Claude e Gemini podem classificar despesas com alta acurácia.

### Exemplo de Prompt

```
Classifique a seguinte despesa em uma conta contábil e centro de custo:

Histórico: "NF 1234 - COMPRA DE CARTOLINAS E CANETAS"
Fornecedor: "Papelaria Central Ltda"
Valor: R$ 487,50

Contas disponíveis:
- 5.1.1.01: Comissões
- 5.1.1.03: Frete
- 5.1.2.01: Salários
- 5.1.2.03: Material de Escritório
- 5.1.2.04: Serviços de Terceiros
- 5.1.5: Outras Receitas

Centros de Custo: ADM, FIN, COM, PROD, LOG, TI, RH, JUR

Responda no formato JSON:
{
  "conta": "codigo",
  "centro_custo": "codigo",
  "justificativa": "explicação curta"
}
```

### Vantagens dos LLMs

- Entendem contexto e sinônimos
- Funcionam com descrições curtas ou ambíguas
- Se adaptam rápido a novas regras
- Podem justificar a classificação (auditável)

## Extração de Dados de Documentos Fiscais

### Google Document AI + OCR

```mermaid
graph LR
    A[PDF/Imagem NF] --> B[OCR - Extrair texto]
    B --> C[Campos: CNPJ, valor, data, itens]
    C --> D[Classificar despesa]
    D --> E[Lançamento no ERP]
```

### Campos Extraídos Automaticamente

| Campo | Onde está na NF |
|-------|----------------|
| CNPJ do emissor | Cabeçalho |
| Número NF | Topo |
| Data de emissão | Cabeçalho |
| Valor total | Final do documento |
| Base de ICMS | Área de tributos |
| Descrição dos itens | Corpo |
| CFOP | Cabeçalho |

## Pipeline Automatizado de Classificação

```sql
-- Simulação: classificação baseada em regras + ML
WITH despesas_nao_classificadas AS (
    SELECT * FROM lancamentos_contabeis
    WHERE id_conta IS NULL
),
classificacao_ml AS (
    SELECT
        id_lancamento,
        CASE
            WHEN historico LIKE '%ENERGIA%' THEN 50  -- Aluguel (por simplicidade)
            WHEN historico LIKE '%ALUGUEL%' THEN 50
            WHEN historico LIKE '%COMISS%' THEN 45
            WHEN historico LIKE '%FRETE%' THEN 47
            WHEN historico LIKE '%MATERIAL%' AND (historico LIKE '%ESCRIT%' OR historico LIKE '%PAPEL%') THEN 51
            WHEN valor < 500 THEN 51  -- Material escritório (valor baixo)
            ELSE 52  -- Serviços terceiros (genérico)
        END AS conta_sugerida,
        CASE
            WHEN historico LIKE '%PRODU%' THEN 4
            WHEN historico LIKE '%VEND%' THEN 3
            WHEN historico LIKE '%LOG%' OR historico LIKE '%FRETE%' THEN 5
            WHEN historico LIKE '%TI%' OR historico LIKE '%SOFTWARE%' OR historico LIKE '%SISTEMA%' THEN 6
            ELSE 1  -- ADM (genérico)
        END AS centro_custo_sugerido
    FROM despesas_nao_classificadas
)
SELECT * FROM classificacao_ml;
```

## Ferramentas Práticas

| Ferramenta | Função | Ideal para |
|------------|--------|------------|
| **Bilíngua.ai** | Classificação fiscal automática | Empresas brasileiras |
| **DocAI (Google)** | Extração de documentos fiscais | Grandes volumes |
| **Rossum** | Captura de dados de NF | Processamento AP |
| **Hypatos** | Classificação + extração | Workflow completo |
| **GPT/Claude** | Classificação via prompt | Startups e médias empresas |

## Exercício

1. Crie regras de classificação para 5 tipos de despesa no banco Nova Era
2. Escreva um prompt para classificar "CONSULTORIA FINANCEIRA MENSAL - R$ 8.500" e "NF 4455 - PEÇAS PARA MANUTENÇÃO PREVENTIVA"
3. Crie uma query que sugira a conta contábil para lançamentos não classificados baseada em similaridade com lançamentos já classificados
