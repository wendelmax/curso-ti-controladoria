import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';

const STORAGE_KEY = 'curso_ti_quiz_results';
const EXERCISE_STORAGE = 'curso_ti_exercise_results';

const MODULES = [
  { id: 'modulo1', label: 'Módulo 1 — SQL' },
  { id: 'modulo2', label: 'Módulo 2 — BigQuery' },
  { id: 'modulo3', label: 'Módulo 3 — Looker' },
  { id: 'modulo4', label: 'Módulo 4 — Tableau' },
  { id: 'modulo5', label: 'Módulo 5 — IA' },
  { id: 'modulo6', label: 'Módulo 6 — Projeto Final' },
];

function loadLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

export default function Certificate() {
  const { user, supabase } = useAuth();
  const [results, setResults] = useState(loadLocal(STORAGE_KEY));
  const [exercises, setExercises] = useState(loadLocal(EXERCISE_STORAGE));
  const [studentName, setStudentName] = useState('');
  const [showCert, setShowCert] = useState(false);
  const [loading, setLoading] = useState(true);
  const certRef = useRef(null);

  useEffect(() => {
    const localResults = loadLocal(STORAGE_KEY);
    const localExercises = loadLocal(EXERCISE_STORAGE);

    if (user && supabase) {
      Promise.all([
        supabase.from('quiz_results').select('*'),
        supabase.from('exercise_results').select('*'),
      ]).then(([quizRes, exRes]) => {
        const quizData = quizRes.data || [];
        const exData = exRes.data || [];

        for (const q of quizData) {
          if (!localResults[q.module_id]) {
            localResults[q.module_id] = {
              score: q.score, correct: q.correct, total: q.total,
              passed: q.passed, date: q.date,
            };
          }
        }
        for (const e of exData) {
          if (!localExercises[e.exercise_id]) {
            localExercises[e.exercise_id] = { done: true, date: e.date };
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localResults));
        localStorage.setItem(EXERCISE_STORAGE, JSON.stringify(localExercises));
        setResults({ ...localResults });
        setExercises({ ...localExercises });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
    setResults(localResults);
    setExercises(localExercises);

    const saved = localStorage.getItem('curso_ti_student_name');
    if (saved) setStudentName(saved);
  }, [user, supabase]);

  const totalModules = MODULES.length;
  const completedModules = MODULES.filter(m => results[m.id]?.passed).length;
  const progressPct = Math.round((completedModules / totalModules) * 100);
  const allPassed = completedModules === totalModules;

  const totalExercises = Object.keys(exercises).filter(k => exercises[k]?.done).length;

  const mediaGeral = MODULES.reduce((acc, m) => {
    const r = results[m.id];
    return acc + (r ? r.score : 0);
  }, 0) / totalModules;

  const handleGenerate = () => {
    if (!studentName.trim()) return;
    localStorage.setItem('curso_ti_student_name', studentName.trim());
    setShowCert(true);
  };

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    const el = certRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfW = 297;
    const pdfH = 210;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`certificado-ti-controladoria-${studentName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>;
  }

  if (showCert) {
    return (
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }} className="no-print">
        <div id="certificado" ref={certRef} style={{
          position: 'relative',
          width: '800px', height: '565px',
          margin: '0 auto',
          padding: '40px',
          background: '#fff',
          border: 'none',
          fontFamily: 'Georgia, "Times New Roman", serif',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            border: '20px solid #1a3a5c',
            borderRadius: '8px',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '28px', left: '28px', right: '28px', bottom: '28px',
            border: '2px solid #c9a84c',
            borderRadius: '4px',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '36px', left: '36px', right: '36px', bottom: '36px',
            border: '1px solid #e0d5c0',
            borderRadius: '2px',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10px' }}>
            <div style={{ fontSize: '12px', color: '#c9a84c', letterSpacing: '6px', marginBottom: '8px' }}>
              &#9733; &#9733; &#9733; &#9733; &#9733;
            </div>

            <h1 style={{
              fontSize: '38px', color: '#1a3a5c', margin: '5px 0',
              fontFamily: 'Georgia, serif', fontWeight: 700,
              letterSpacing: '3px',
            }}>
              CERTIFICADO
            </h1>

            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0', letterSpacing: '1px' }}>
              DE CONCLUSÃO DO CURSO
            </p>

            <h2 style={{
              fontSize: '24px', color: '#1a73e8', margin: '8px 0',
              fontFamily: 'Georgia, serif', fontWeight: 600,
              borderBottom: '2px solid #c9a84c',
              paddingBottom: '8px',
              display: 'inline-block',
            }}>
              TI para Controladoria
            </h2>

            <p style={{ fontSize: '13px', color: '#555', margin: '15px 0 8px' }}>
              Certificamos que
            </p>

            <div style={{
              fontSize: '28px', fontWeight: 'bold', color: '#1a3a5c',
              margin: '5px 0', padding: '5px 30px',
              borderBottom: '2px solid #c9a84c',
              fontFamily: 'Georgia, serif',
              letterSpacing: '1px',
            }}>
              {studentName}
            </div>

            <p style={{ fontSize: '13px', color: '#555', margin: '15px 0 10px', textAlign: 'center', lineHeight: 1.6 }}>
              concluiu com êxito o curso completo de <strong>TI para Controladoria</strong>,<br />
              com carga horária estimada de <strong>58 horas</strong>, abrangendo:
            </p>

            <table style={{
              width: '90%', maxWidth: '500px', borderCollapse: 'collapse',
              fontSize: '11px', margin: '5px auto',
            }}>
              <tbody>
                {MODULES.map((m, i) => {
                  const r = results[m.id];
                  return (
                    <tr key={m.id}>
                      <td style={{
                        padding: '3px 8px', textAlign: 'left',
                        borderBottom: i < MODULES.length - 1 ? '1px dotted #ddd' : 'none',
                      }}>
                        {m.label}
                      </td>
                      <td style={{
                        padding: '3px 8px', textAlign: 'right', fontWeight: 600,
                        color: r?.passed ? '#2ecc71' : '#999',
                        borderBottom: i < MODULES.length - 1 ? '1px dotted #ddd' : 'none',
                      }}>
                        {r ? `${r.score}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={{
                    padding: '5px 8px', textAlign: 'left', fontWeight: 'bold',
                    borderTop: '2px solid #1a3a5c',
                  }}>
                    Média Geral
                  </td>
                  <td style={{
                    padding: '5px 8px', textAlign: 'right', fontWeight: 'bold',
                    color: mediaGeral >= 70 ? '#2ecc71' : '#e74c3c',
                    borderTop: '2px solid #1a3a5c',
                  }}>
                    {Math.round(mediaGeral)}%
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '10px', color: '#888', marginTop: '12px', letterSpacing: '1px' }}>
              SQL &middot; BigQuery &middot; Looker &middot; Tableau &middot; IA Aplicada &middot; Projeto Final
            </p>

            <div style={{
              marginTop: 'auto', marginBottom: '5px',
              display: 'flex', justifyContent: 'space-between',
              width: '100%', fontSize: '10px', color: '#999',
              borderTop: '1px solid #e0d5c0', paddingTop: '8px',
            }}>
              <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
              <span>Certificado #{new Date().getTime().toString(36).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }} className="no-print">
          <button onClick={handleDownloadPDF} style={{
            padding: '0.7rem 2rem', background: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer',
          }}>
            &#128196; Baixar PDF
          </button>
          <button onClick={handlePrint} style={{
            padding: '0.7rem 2rem', background: '#2ecc71', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer',
          }}>
            &#128424; Imprimir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h2>&#127891; Controle de Notas e Certificado</h2>

      {!user && (
        <div style={{
          padding: '1rem', borderRadius: '8px', border: '1px solid #ffeeba',
          background: '#fff3cd', marginBottom: '1rem', fontSize: '0.9rem',
        }}>
          &#9888; Faça <a href="/login">login</a> para salvar seu progresso na nuvem.
          Atualmente os dados ficam salvos apenas neste navegador.
        </div>
      )}

      <div style={{
        padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-300)',
        marginBottom: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: allPassed ? '#2ecc71' : 'var(--ifm-color-primary)' }}>
          {progressPct}%
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)' }}>
          {completedModules} de {totalModules} módulos concluídos
          {totalExercises > 0 && <span> &middot; {totalExercises} exercícios feitos</span>}
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
        {user
          ? 'Seu progresso está salvo na nuvem. Faça login em qualquer navegador para continuar.'
          : 'Seus resultados ficam salvos neste navegador (localStorage). Faça login para salvar na nuvem.'}
      </div>
    </div>
  );
}
