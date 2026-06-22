import React, { useState, useMemo } from 'react';
import SqlExercicio from '../SqlExercicio';

const STORAGE_KEY = 'curso_ti_exercise_results';

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const LEVEL_BADGES = {
  1: { label: 'Iniciante', color: '#2563eb', bg: '#dbeafe', emoji: '🌱' },
  2: { label: 'Intermediário', color: '#7c3aed', bg: '#ede9fe', emoji: '🔥' },
  3: { label: 'Avançado', color: '#dc2626', bg: '#fef2f2', emoji: '⚡' },
  4: { label: 'Expert', color: '#000000', bg: '#f5f5f5', emoji: '🏆' },
};

function ExercicioCard({ ex, index }) {
  const [open, setOpen] = useState(false);
  const results = loadResults();
  const done = results[ex.id]?.done;

  return (
    <div style={{
      border: `1px solid ${done ? '#2ecc71' : 'var(--ifm-color-emphasis-300)'}`,
      borderRadius: '8px',
      marginBottom: '0.75rem',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '0.7rem 1rem',
          background: done ? '#eafaf1' : 'var(--ifm-color-emphasis-0)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          userSelect: 'none',
        }}
      >
        <span style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: done ? '#2ecc71' : 'var(--ifm-color-emphasis-200)',
          color: done ? 'white' : 'var(--ifm-color-emphasis-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
        }}>
          {done ? '✓' : index + 1}
        </span>
        <span style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.4, color: done ? '#1b5e20' : 'var(--ifm-color-emphasis-800)' }}>
          {ex.prompt}
        </span>
        <span style={{ fontSize: '0.75rem', color: done ? '#2ecc71' : 'var(--ifm-color-emphasis-400)' }}>
          {done ? '✅' : open ? '▲' : '▼'}
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <SqlExercicio
            id={ex.id}
            prompt={ex.prompt}
            hint={ex.hint}
            table={ex.table}
            expectedSql={ex.expectedSql}
          />
        </div>
      )}
    </div>
  );
}

export default function PraticarLab({ moduleId, titulo, nivel, exercicios }) {
  const results = useMemo(() => loadResults(), []);
  const total = exercicios.length;
  const concluidos = exercicios.filter(e => results[e.id]?.done).length;
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const badge = LEVEL_BADGES[nivel] || LEVEL_BADGES[1];

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{
        border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, var(--ifm-color-primary), #1a56db)',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
                🧪 Laboratório: {titulo}
              </h4>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.85, fontSize: '0.82rem' }}>
                {total} {total === 1 ? 'exercício' : 'exercícios'} • {concluidos} concluídos
              </p>
            </div>
            <span style={{
              padding: '0.2rem 0.6rem', borderRadius: '20px',
              background: badge.bg, color: badge.color,
              fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {badge.emoji} {badge.label}
            </span>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              flex: 1, height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.25)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: '#2ecc71', borderRadius: '3px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '3rem', textAlign: 'right' }}>
              {pct}%
            </span>
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', background: 'var(--ifm-color-emphasis-0)' }}>
          {exercicios.map((ex, i) => (
            <ExercicioCard key={ex.id} ex={ex} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
