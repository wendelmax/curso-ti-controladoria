import React, { useState } from 'react';

const STEP_ICON = { true: '✅', false: '⬜' };

const DASHBOARDS = [
  {
    id: 'dre',
    title: 'Dashboard de DRE Interativo',
    description: 'Demonstração do Resultado do Exercício — visualize receitas, despesas e resultado líquido.',
    vizUrl: 'https://public.tableau.com/views/Superstore_embedded_800x800/Overview',
    height: 600,
    guide: [
      'Encontre o mês com maior receita',
      'Identifique qual categoria de produto tem a maior margem de lucro',
      'Qual região geográfica apresenta o menor resultado?',
      'Que insight você daria ao CFO baseado neste dashboard?',
    ],
  },
  {
    id: 'financeiro',
    title: 'Análise Financeira',
    description: 'Indicadores financeiros: faturamento, margens, despesas por centro de custo.',
    vizUrl: 'https://public.tableau.com/views/RegionalSample_168s/Overview',
    height: 500,
    guide: [
      'Qual mês teve o maior faturamento?',
      'Existe sazonalidade nas vendas? (meses que se repetem todo ano)',
      'Qual produto/serviço tem a margem mais apertada?',
      'Se você fosse apresentar este dashboard ao conselho, quais 3 pontos destacaria?',
    ],
  },
];

export default function TableauExercises() {
  const [activeViz, setActiveViz] = useState(DASHBOARDS[0].id);
  const [checkedItems, setCheckedItems] = useState({});

  const current = DASHBOARDS.find(d => d.id === activeViz) || DASHBOARDS[0];

  const toggleCheck = (guideIdx) => {
    const key = `${activeViz}-${guideIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const switchViz = (id) => {
    setActiveViz(id);
    setCheckedItems({});
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {DASHBOARDS.map(d => (
          <button key={d.id} onClick={() => switchViz(d.id)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)',
              background: activeViz === d.id ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-100)',
              color: activeViz === d.id ? 'white' : 'var(--ifm-color-emphasis-700)',
              cursor: 'pointer', fontWeight: activeViz === d.id ? 600 : 400,
            }}>
            {d.title}
          </button>
        ))}
      </div>

      <div style={{
        border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px',
        overflow: 'hidden', marginBottom: '1rem',
      }}>
        <div style={{
          padding: '0.75rem 1rem', background: 'var(--ifm-color-emphasis-100)',
          borderBottom: '1px solid var(--ifm-color-emphasis-300)',
        }}>
          <strong>{current.title}</strong>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
            {current.description}
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <iframe
            src={current.vizUrl}
            title={current.title}
            style={{
              width: '100%', height: `${current.height}px`, border: 'none',
            }}
            allowFullScreen
          />
        </div>
      </div>

      <div style={{
        padding: '1rem', borderRadius: '8px',
        border: '1px solid #ffeeba', background: '#fff3cd', fontSize: '0.85rem',
      }}>
        ⚠️ Os dashboards acima são exemplos públicos do Tableau Public (não usam dados do Grupo Nova Era).
        Use-os para treinar o olhar — explore os filtros, passe o mouse nos gráficos, tente entender como cada visual foi construído.
      </div>

      {current.guide && (
        <div style={{
          marginTop: '1rem', padding: '1rem', borderRadius: '8px',
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'var(--ifm-color-emphasis-50)',
        }}>
          <strong style={{ fontSize: '0.9rem' }}>🔍 Roteiro de observação</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.25rem' }}>
            Explore o dashboard e marque quando encontrar cada resposta:
          </p>
          {current.guide.map((item, idx) => {
            const key = `${activeViz}-${idx}`;
            return (
              <div key={idx} onClick={() => toggleCheck(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.5rem', margin: '0.25rem 0',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
                  background: checkedItems[key] ? '#eafaf1' : 'transparent',
                  border: checkedItems[key] ? '1px solid #2ecc71' : '1px solid transparent',
                }}>
                <span style={{ fontSize: '1rem' }}>{checkedItems[key] ? '✅' : '⬜'}</span>
                <span style={{
                  textDecoration: checkedItems[key] ? 'line-through' : 'none',
                  color: checkedItems[key] ? '#2ecc71' : 'inherit',
                }}>{item}</span>
              </div>
            );
          })}
          {current.guide.every((_, idx) => checkedItems[`${activeViz}-${idx}`]) && (
            <div style={{
              marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px',
              background: '#eafaf1', color: '#1b5e20', fontSize: '0.85rem', textAlign: 'center',
            }}>
              🎯 Você explorou todos os pontos deste dashboard!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
