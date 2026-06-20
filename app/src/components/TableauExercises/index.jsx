import React, { useState } from 'react';

const DASHBOARDS = [
  {
    id: 'dre',
    title: 'Dashboard de DRE Interativo',
    description: 'Demonstração do Resultado do Exercício — visualize receitas, despesas e resultado líquido.',
    vizUrl: 'https://public.tableau.com/views/Superstore_embedded_800x800/Overview',
    height: 600,
  },
  {
    id: 'financeiro',
    title: 'Análise Financeira',
    description: 'Indicadores financeiros: faturamento, margens, despesas por centro de custo.',
    vizUrl: 'https://public.tableau.com/views/RegionalSample_168s/Overview',
    height: 500,
  },
];

export default function TableauExercises() {
  const [activeViz, setActiveViz] = useState(DASHBOARDS[0].id);

  const current = DASHBOARDS.find(d => d.id === activeViz) || DASHBOARDS[0];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {DASHBOARDS.map(d => (
          <button key={d.id} onClick={() => setActiveViz(d.id)}
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
        Os dashboards acima são exemplos públicos do Tableau Public. No curso completo,
        você criará seus próprios dashboards conectados aos dados do Grupo Nova Era.
      </div>
    </div>
  );
}
