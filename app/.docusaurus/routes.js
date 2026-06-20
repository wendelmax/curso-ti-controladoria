import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/notas',
    component: ComponentCreator('/notas', '07e'),
    exact: true
  },
  {
    path: '/playground',
    component: ComponentCreator('/playground', 'a73'),
    exact: true
  },
  {
    path: '/curso/',
    component: ComponentCreator('/curso/', '6cc'),
    routes: [
      {
        path: '/curso/',
        component: ComponentCreator('/curso/', '8fc'),
        routes: [
          {
            path: '/curso/',
            component: ComponentCreator('/curso/', '786'),
            routes: [
              {
                path: '/curso/bigquery/diferencas-sql',
                component: ComponentCreator('/curso/bigquery/diferencas-sql', 'b59'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/bigquery/funcoes-analiticas',
                component: ComponentCreator('/curso/bigquery/funcoes-analiticas', '8d4'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/bigquery/intro-bigquery',
                component: ComponentCreator('/curso/bigquery/intro-bigquery', 'f4c'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/bigquery/otimizacao',
                component: ComponentCreator('/curso/bigquery/otimizacao', '3a6'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/bigquery/particionamento',
                component: ComponentCreator('/curso/bigquery/particionamento', '992'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/bigquery/pratica-datasets',
                component: ComponentCreator('/curso/bigquery/pratica-datasets', '36b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/bigquery-ml',
                component: ComponentCreator('/curso/ia/bigquery-ml', '84b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/classificacao-despesas',
                component: ComponentCreator('/curso/ia/classificacao-despesas', '1de'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/deteccao-anomalias',
                component: ComponentCreator('/curso/ia/deteccao-anomalias', '01a'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/ferramentas-ia',
                component: ComponentCreator('/curso/ia/ferramentas-ia', 'aed'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/fundamentos-ml',
                component: ComponentCreator('/curso/ia/fundamentos-ml', 'bfa'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/intro-ia',
                component: ComponentCreator('/curso/ia/intro-ia', 'ad7'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/ia/previsao-fluxo-caixa',
                component: ComponentCreator('/curso/ia/previsao-fluxo-caixa', '5e4'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/intro/',
                component: ComponentCreator('/curso/intro/', 'f7b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/looker/dashboards',
                component: ComponentCreator('/curso/looker/dashboards', 'f2b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/looker/dimensoes-medidas',
                component: ComponentCreator('/curso/looker/dimensoes-medidas', '5b6'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/looker/integracao-bigquery',
                component: ComponentCreator('/curso/looker/integracao-bigquery', 'e7b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/looker/intro-looker',
                component: ComponentCreator('/curso/looker/intro-looker', '125'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/looker/lookml',
                component: ComponentCreator('/curso/looker/lookml', 'b77'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/analise-vendas',
                component: ComponentCreator('/curso/projeto-final/analise-vendas', '50f'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/apresentacao',
                component: ComponentCreator('/curso/projeto-final/apresentacao', '41d'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/dashboard-executivo',
                component: ComponentCreator('/curso/projeto-final/dashboard-executivo', '5fa'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/dre-automatizado',
                component: ComponentCreator('/curso/projeto-final/dre-automatizado', '2a4'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/intro-projeto',
                component: ComponentCreator('/curso/projeto-final/intro-projeto', 'b01'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/pipeline',
                component: ComponentCreator('/curso/projeto-final/pipeline', '7cc'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/projeto-final/previsao-financeira',
                component: ComponentCreator('/curso/projeto-final/previsao-financeira', '093'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/agregacoes',
                component: ComponentCreator('/curso/sql/agregacoes', '960'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/cases-financeiros',
                component: ComponentCreator('/curso/sql/cases-financeiros', '669'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/exercicios',
                component: ComponentCreator('/curso/sql/exercicios', '50e'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/filtros',
                component: ComponentCreator('/curso/sql/filtros', '78c'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/fundamentos',
                component: ComponentCreator('/curso/sql/fundamentos', '0bf'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/intro-sql',
                component: ComponentCreator('/curso/sql/intro-sql', 'caf'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/joins',
                component: ComponentCreator('/curso/sql/joins', 'e1b'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/subqueries-ctes',
                component: ComponentCreator('/curso/sql/subqueries-ctes', '893'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/sql/window-functions',
                component: ComponentCreator('/curso/sql/window-functions', '6cb'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/tableau/calculos-lod',
                component: ComponentCreator('/curso/tableau/calculos-lod', '230'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/tableau/dashboards',
                component: ComponentCreator('/curso/tableau/dashboards', '774'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/tableau/fundamentos',
                component: ComponentCreator('/curso/tableau/fundamentos', 'd67'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/tableau/intro-tableau',
                component: ComponentCreator('/curso/tableau/intro-tableau', '6d3'),
                exact: true,
                sidebar: "cursoSidebar"
              },
              {
                path: '/curso/tableau/visualizacoes-financeiras',
                component: ComponentCreator('/curso/tableau/visualizacoes-financeiras', '412'),
                exact: true,
                sidebar: "cursoSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '070'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
