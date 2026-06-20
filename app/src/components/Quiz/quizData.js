const quizes = {
  modulo1: {
    title: 'SQL para Análise Financeira',
    questions: [
      {
        question: 'Qual cláusula SQL é usada para filtrar registros antes do agrupamento?',
        options: ['HAVING', 'WHERE', 'FILTER', 'GROUP BY'],
        correct: 1,
      },
      {
        question: 'Qual função de agregação conta o número de linhas?',
        options: ['TOTAL()', 'COUNT()', 'COUNTA()', 'NUM()'],
        correct: 1,
      },
      {
        question: 'Qual tipo de JOIN retorna todas as linhas da tabela da esquerda mesmo sem correspondência na direita?',
        options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
        correct: 2,
      },
      {
        question: 'Window Functions operam em um conjunto de linhas definido por:',
        options: ['GROUP BY', 'ORDER BY', 'OVER ()', 'PARTITION BY'],
        correct: 2,
      },
      {
        question: 'Qual cláusula filtra grupos APÓS o GROUP BY?',
        options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'],
        correct: 1,
      },
    ],
  },
  modulo2: {
    title: 'Google BigQuery',
    questions: [
      {
        question: 'O BigQuery é um:',
        options: ['Banco relacional tradicional', 'Data warehouse serverless', 'Sistema de arquivos', 'ERP na nuvem'],
        correct: 1,
      },
      {
        question: 'No BigQuery, particionar uma tabela por data:',
        options: ['Aumenta o custo', 'Reduz o volume processado em queries com filtro de data', 'É obrigatório', 'Impede o uso de clustering'],
        correct: 1,
      },
      {
        question: 'Qual destes NÃO é um tipo de dado do BigQuery?',
        options: ['ARRAY', 'STRUCT', 'CURSOR', 'GEOGRAPHY'],
        correct: 2,
      },
      {
        question: 'No BigQuery, as consultas em cache:',
        options: ['Não são cobradas', 'Duram 7 dias', 'São mais lentas', 'Exigem permissão especial'],
        correct: 0,
      },
      {
        question: 'Qual função do BigQuery é usada para fazer previsão de séries temporais?',
        options: ['LINEAR_REG', 'ARIMA_PLUS', 'KMEANS', 'DNN_CLASSIFIER'],
        correct: 1,
      },
    ],
  },
  modulo3: {
    title: 'Looker',
    questions: [
      {
        question: 'LookML é:',
        options: ['Uma linguagem de programação', 'Uma linguagem de modelagem semântica', 'Um tipo de banco de dados', 'Uma ferramenta de ETL'],
        correct: 1,
      },
      {
        question: 'No Looker, um Explore é equivalente a:',
        options: ['Uma tabela no banco', 'Uma view SQL', 'Um ponto de partida para consultas que pode unir várias views', 'Um dashboard'],
        correct: 2,
      },
      {
        question: 'Para criar uma métrica calculada no Looker, usa-se:',
        options: ['dimension', 'measure', 'filter', 'parameter'],
        correct: 1,
      },
      {
        question: 'Persistent Derived Tables (PDTs) são úteis para:',
        options: ['Criar tabelas temporárias em memória', 'Melhorar performance de consultas complexas', 'Exportar dados para CSV', 'Criar gráficos'],
        correct: 1,
      },
      {
        question: 'No Looker, template filters permitem:',
        options: ['Filtrar dados no banco', 'Criar filtros dinâmicos que usuários podem modificar', 'Aplicar formatação condicional', 'Agendar relatórios'],
        correct: 1,
      },
    ],
  },
  modulo4: {
    title: 'Tableau',
    questions: [
      {
        question: 'No Tableau, qual a diferença entre dimensão e medida?',
        options: ['Dimensão são números, medidas são textos', 'Dimensões são discretas e categóricas; medidas são numéricas e agregáveis', 'Não há diferença', 'Medidas criam cabeçalhos, dimensões criam eixos'],
        correct: 1,
      },
      {
        question: 'Uma expressão LOD do tipo FIXED:',
        options: ['Ignora os filtros da visualização', 'Considera apenas filtros de contexto', 'Calcula no nível da visualização', 'Altera os dados de origem'],
        correct: 0,
      },
      {
        question: 'Qual gráfico é mais adequado para mostrar a composição da DRE?',
        options: ['Pizza', 'Barra', 'Waterfall (cascata)', 'Dispersão'],
        correct: 2,
      },
      {
        question: 'No Tableau, Table Calculations são calculados:',
        options: ['No banco de dados', 'No nível do resultado da query, no frontend', 'Apenas no Tableau Server', 'Antes da conexão com dados'],
        correct: 1,
      },
      {
        question: 'Para criar um parâmetro de data dinâmica no Tableau, usa-se:',
        options: ['Filter action', 'Parameter', 'Set', 'Group'],
        correct: 1,
      },
    ],
  },
  modulo5: {
    title: 'IA Aplicada à Análise Financeira',
    questions: [
      {
        question: 'Qual tipo de aprendizado é mais adequado para prever o fluxo de caixa futuro?',
        options: ['Classificação', 'Regressão', 'Clusterização', 'Associação'],
        correct: 1,
      },
      {
        question: 'O que significa overfitting?',
        options: ['O modelo não aprendeu nada', 'O modelo decorou os dados de treino mas não generaliza', 'O modelo é muito simples', 'O modelo tem alta acurácia'],
        correct: 1,
      },
      {
        question: 'Qual métrica avalia "das fraudes reais, quantas eu consegui identificar"?',
        options: ['Precisão', 'Acurácia', 'Recall', 'F1-Score'],
        correct: 2,
      },
      {
        question: 'No BigQuery ML, qual modelo é usado para clusterização?',
        options: ['LINEAR_REG', 'ARIMA_PLUS', 'KMEANS', 'BOOSTED_TREE'],
        correct: 2,
      },
      {
        question: 'Qual método é mais eficaz para detectar pagamentos duplicados?',
        options: ['Regressão linear', 'GROUP BY com HAVING COUNT > 1', 'Análise de séries temporais', 'Clusterização'],
        correct: 1,
      },
    ],
  },
  modulo6: {
    title: 'Projeto Final',
    questions: [
      {
        question: 'Qual o primeiro passo do pipeline de dados?',
        options: ['Criar gráficos', 'Explorar e entender as tabelas disponíveis', 'Gerar certificado', 'Calcular margens'],
        correct: 1,
      },
      {
        question: 'Na análise de concentração de receita, a classe "A" representa:',
        options: ['Clientes com menor faturamento', 'Clientes que representam até 70% da receita acumulada', 'Clientes inadimplentes', 'Clientes novos'],
        correct: 1,
      },
      {
        question: 'O lucro bruto é calculado como:',
        options: ['Receita - Despesas Operacionais', 'Receita - CPV', 'Receita - Impostos', 'Ativo - Passivo'],
        correct: 1,
      },
      {
        question: 'No fluxo de caixa projetado, um saldo positivo significa:',
        options: ['A empresa está devendo', 'As entradas superam as saídas no período', 'O lucro foi maior que o esperado', 'O caixa está negativo'],
        correct: 1,
      },
      {
        question: 'Qual o principal indicador de inadimplência?',
        options: ['% de contas a receber vencidas sobre o total a receber', 'Valor total de vendas', 'Número de funcionários', 'Margem líquida'],
        correct: 0,
      },
    ],
  },
};

export default quizes;
