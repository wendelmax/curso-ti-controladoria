import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'curso_ti_quiz_results';
const MODULES = [
  { id: 'modulo1', label: 'Módulo 1 — SQL' },
  { id: 'modulo2', label: 'Módulo 2 — BigQuery' },
  { id: 'modulo3', label: 'Módulo 3 — Looker' },
  { id: 'modulo4', label: 'Módulo 4 — Tableau' },
  { id: 'modulo5', label: 'Módulo 5 — IA' },
  { id: 'modulo6', label: 'Módulo 6 — Projeto Final' },
];

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function Certificate() {
  const [results, setResults] = useState(loadResults());
  const [studentName, setStudentName] = useState('');
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    setResults(loadResults());
    const saved = localStorage.getItem('curso_ti_student_name');
    if (saved) setStudentName(saved);
  }, []);

  const totalModules = MODULES.length;
  const completedModules = MODULES.filter(m => results[m.id]?.passed).length;
  const progressPct = Math.round((completedModules / totalModules) * 100);
  const allPassed = completedModules === totalModules;

  const handleGenerate = () => {
    if (!studentName.trim()) return;
    localStorage.setItem('curso_ti_student_name', studentName.trim());
    setShowCert(true);
  };

  const handlePrint = () => window.print();

  const mediaGeral = MODULES.reduce((acc, m) => {
    const r = results[m.id];
    return acc + (r ? r.score : 0);
  }, 0) / totalModules;

  if (showCert) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="no-print">
        <div id="certificado" style={{
          border: '4px double #1a73e8', padding: '3rem 2rem', textAlign: 'center',
          background: '#fff', borderRadius: '12px', pageBreakInside: 'avoid',
          fontFamily: 'Georgia, serif',
        }}>
          <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
            &#9733; &#9733; &#9733; &#9733; &#9733;
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#1a73e8', margin: '0.5rem 0', fontFamily: 'Georgia, serif' }}>
            CERTIFICADO
          </h1>
          <p style={{ fontSize: '1rem', color: '#666', margin: '1rem 0' }}>
            de Conclusão do Curso
          </p>
          <h2 style={{ fontSize: '1.6rem', margin: '1rem 0', fontFamily: 'Georgia, serif' }}>
            TI para Controladoria
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#444', margin: '1.5rem 0' }}>
            Certificamos que
          </p>
          <div style={{
            fontSize: '1.8rem', fontWeight: 'bold', color: '#1a73e8',
            margin: '0.5rem 0', padding: '0.5rem 1rem',
            borderBottom: '2px solid #1a73e8', display: 'inline-block',
          }}>
            {studentName}
          </div>
          <p style={{ fontSize: '1rem', color: '#666', margin: '1.5rem 0' }}>
            concluiu com êxito o curso completo de <strong>TI para Controladoria</strong>,<br />
            com carga horária estimada de <strong>58 horas</strong>, abrangendo:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '450px', margin: '1rem auto', fontSize: '0.9rem', lineHeight: '1.8' }}>
            {MODULES.map(m => {
              const r = results[m.id];
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>{m.label}</span>
                  <span style={{ color: r?.passed ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
                    {r ? `${r.score}%` : '—'}
                  </span>
                </div>
              );
            })}
            <div style={{ borderTop: '1px solid #ccc', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Média Geral</span>
              <span style={{ color: mediaGeral >= 70 ? '#2ecc71' : '#e74c3c' }}>{Math.round(mediaGeral)}%</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '2rem' }}>
            SQL &middot; BigQuery &middot; Looker &middot; Tableau &middot; IA Aplicada &middot; Projeto Final
          </p>
          <div style={{ fontSize: '0.8rem', color: '#bbb', marginTop: '1rem' }}>
            Data de emissão: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }} className="no-print">
          <button onClick={handlePrint} style={{
            padding: '0.7rem 2rem', background: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer',
          }}>
            &#128424; Imprimir Certificado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h2>&#127891; Controle de Notas e Certificado</h2>

      <div style={{
        padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-300)',
        marginBottom: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: allPassed ? '#2ecc71' : 'var(--ifm-color-primary)' }}>
          {progressPct}%
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)' }}>
          {completedModules} de {totalModules} módulos concluídos
        </div>
        <div style={{
          height: '8px', background: 'var(--ifm-color-emphasis-200)', borderRadius: '4px',
          margin: '1rem 0', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: allPassed ? '#2ecc71' : 'var(--ifm-color-primary)',
            borderRadius: '4px', transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {MODULES.map(m => {
        const r = results[m.id];
        return (
          <div key={m.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', borderRadius: '6px',
            border: '1px solid var(--ifm-color-emphasis-200)', marginBottom: '0.5rem',
            background: r?.passed ? '#eafaf1' : r ? '#fdedec' : 'transparent',
          }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{m.label}</strong>
              {r && <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', marginLeft: '0.5rem' }}>
                {r.date?.slice(0, 10)}
              </span>}
            </div>
            <div style={{ fontWeight: 600, color: r?.passed ? '#2ecc71' : r ? '#e74c3c' : 'var(--ifm-color-emphasis-400)' }}>
              {r ? `${r.score}%` : '—'}
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: '1.5rem', padding: '1.5rem', borderRadius: '8px',
        border: '1px solid var(--ifm-color-emphasis-300)',
      }}>
        <h4>Gerar Certificado</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.75rem' }}>
          {allPassed
            ? 'Parabéns! Você concluiu todos os módulos. Preencha seu nome para gerar o certificado.'
            : `Complete os ${totalModules - completedModules} módulos restantes para gerar o certificado.`}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text"
            placeholder="Seu nome completo"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: '8px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              fontSize: '0.95rem',
            }} />
          <button onClick={handleGenerate}
            disabled={!allPassed || !studentName.trim()}
            style={{
              padding: '0.6rem 1.5rem', border: 'none', borderRadius: '8px',
              background: allPassed && studentName.trim() ? '#2ecc71' : 'var(--ifm-color-emphasis-200)',
              color: allPassed && studentName.trim() ? 'white' : 'var(--ifm-color-emphasis-500)',
              cursor: allPassed && studentName.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600, whiteSpace: 'nowrap',
            }}>
            &#127891; Gerar Certificado
          </button>
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', textAlign: 'center' }}>
        Seus resultados ficam salvos neste navegador (localStorage).
        Utilize sempre o mesmo navegador para manter seu progresso.
      </div>
    </div>
  );
}
