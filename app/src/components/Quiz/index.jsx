import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'curso_ti_quiz_results';

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveResults(results) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export default function Quiz({ moduleId, title, questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(loadResults());

  const isPassed = results[moduleId]?.passed;

  useEffect(() => {
    setResults(loadResults());
  }, []);

  const handleAnswer = (qIndex, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = useCallback(() => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 70;

    const newResults = {
      ...loadResults(),
      [moduleId]: { score: pct, correct, total, passed, date: new Date().toISOString() },
    };
    saveResults(newResults);
    setResults(newResults);
    setSubmitted(true);
  }, [answers, questions, moduleId]);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const selectedAll = Object.keys(answers).length === questions.length;

  const progressStyle = {
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid var(--ifm-color-emphasis-300)',
    backgroundColor: 'var(--ifm-color-emphasis-0)',
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '2px solid var(--ifm-color-primary)', paddingTop: '1.5rem' }}>
      <h3>&#128220; Quiz: {title}</h3>
      <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.9rem' }}>
        {questions.length} perguntas | Mínimo 70% para aprovação
      </p>

      {isPassed && (
        <div style={{ ...progressStyle, borderLeft: '4px solid #2ecc71', backgroundColor: '#eafaf1' }}>
          &#10003; Aprovado! Nota: {String(results[moduleId]?.score)}% — {results[moduleId]?.date?.slice(0, 10)}
        </div>
      )}

      {questions.map((q, qi) => {
        const isCorrect = submitted && answers[qi] === q.correct;
        const isWrong = submitted && answers[qi] !== undefined && answers[qi] !== q.correct;

        return (
          <div key={qi} style={{
            ...progressStyle,
            borderLeft: isCorrect ? '4px solid #2ecc71' : isWrong ? '4px solid #e74c3c' : '4px solid var(--ifm-color-emphasis-300)',
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {qi + 1}. {q.question}
            </p>
            {q.options.map((opt, oi) => {
              const letter = String.fromCharCode(65 + oi);
              const isSelected = answers[qi] === oi;
              const showCorrect = submitted && q.correct === oi;
              const showWrong = submitted && isSelected && isWrong;

              return (
                <label key={oi} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.75rem', margin: '0.25rem 0',
                  borderRadius: '6px', cursor: submitted ? 'default' : 'pointer',
                  background: showCorrect ? '#eafaf1' : showWrong ? '#fdedec' : 'transparent',
                  border: showCorrect ? '1px solid #2ecc71' : showWrong ? '1px solid #e74c3c' : '1px solid transparent',
                  fontWeight: showCorrect ? 600 : 400,
                }}>
                  <input type="radio" name={`q-${qi}`} value={oi}
                    checked={isSelected}
                    onChange={() => handleAnswer(qi, oi)}
                    disabled={submitted}
                    style={{ accentColor: 'var(--ifm-color-primary)' }} />
                  <span>{letter}) {opt}</span>
                  {showCorrect && <span style={{ color: '#2ecc71', marginLeft: 'auto' }}>&#10003;</span>}
                  {showWrong && <span style={{ color: '#e74c3c', marginLeft: 'auto' }}>&#10007;</span>}
                </label>
              );
            })}
            {submitted && (
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: isCorrect ? '#2ecc71' : '#e74c3c' }}>
                {isCorrect ? 'Correto!' : `Resposta correta: ${String.fromCharCode(65 + q.correct)}`}
              </p>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleSubmit} disabled={!selectedAll || submitted}
          style={{
            padding: '0.6rem 1.5rem', border: 'none', borderRadius: '8px',
            background: selectedAll && !submitted ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
            color: selectedAll && !submitted ? 'white' : 'var(--ifm-color-emphasis-500)',
            cursor: selectedAll && !submitted ? 'pointer' : 'not-allowed',
            fontWeight: 600, fontSize: '0.95rem',
          }}>
          {submitted ? 'Nota registrada!' : 'Corrigir Quiz'}
        </button>
        {!selectedAll && !submitted && (
          <span style={{ color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem', alignSelf: 'center' }}>
            Responda todas as perguntas para corrigir
          </span>
        )}
        {submitted && (
          <button onClick={handleReset}
            style={{
              padding: '0.6rem 1.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '8px', background: 'transparent', cursor: 'pointer',
              color: 'var(--ifm-color-emphasis-700)', fontSize: '0.95rem',
            }}>
            Refazer Quiz
          </button>
        )}
      </div>

      {submitted && (
        <div style={{
          marginTop: '1.5rem', padding: '1rem 1.5rem', borderRadius: '8px',
          background: (results[moduleId]?.score || 0) >= 70 ? '#eafaf1' : '#fdedec',
          border: `1px solid ${(results[moduleId]?.score || 0) >= 70 ? '#2ecc71' : '#e74c3c'}`,
          textAlign: 'center',
        }}>
          <strong style={{ fontSize: '1.2rem' }}>
            Nota: {results[moduleId]?.score}% ({results[moduleId]?.correct}/{results[moduleId]?.total} questões)
          </strong>
          <br />
          {(results[moduleId]?.score || 0) >= 70
            ? 'Aprovado! Siga para o próximo módulo.'
            : 'Não foi dessa vez. Revise o conteúdo e tente novamente.'}
        </div>
      )}
    </div>
  );
}
