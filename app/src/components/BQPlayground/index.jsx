import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import initSqlJs from 'sql.js';
import { format } from 'sql-formatter';

const DB_URL = '/db/seed.sqlite';

const TABLE_SIZES = {
  lancamentos_contabeis: { rows: 2000, sizeMB: 0.5 },
  contas_pagar: { rows: 500, sizeMB: 0.1 },
  contas_receber: { rows: 400, sizeMB: 0.08 },
  faturamento: { rows: 600, sizeMB: 0.15 },
  notas_fiscais: { rows: 1500, sizeMB: 0.4 },
  empresas: { rows: 50, sizeMB: 0.02 },
  fornecedores: { rows: 80, sizeMB: 0.03 },
  clientes: { rows: 200, sizeMB: 0.05 },
  produtos: { rows: 100, sizeMB: 0.03 },
  centros_custo: { rows: 30, sizeMB: 0.01 },
  planos_contas: { rows: 80, sizeMB: 0.02 },
  contabilidade: { rows: 3000, sizeMB: 0.8 },
  orcamento: { rows: 200, sizeMB: 0.05 },
  regime_tributario: { rows: 10, sizeMB: 0.005 },
  balanco: { rows: 200, sizeMB: 0.06 },
};

function translateBQtoSQLite(sql) {
  let s = sql;

  s = s.replace(/EXTRACT\s*\(\s*YEAR\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%Y', $1) AS INTEGER)");
  s = s.replace(/EXTRACT\s*\(\s*MONTH\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%m', $1) AS INTEGER)");
  s = s.replace(/EXTRACT\s*\(\s*DAY\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%d', $1) AS INTEGER)");
  s = s.replace(/DATE_TRUNC\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*MONTH\s*\)/gi, "STRFTIME('%Y-%m-01', $1)");
  s = s.replace(/DATE_TRUNC\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*YEAR\s*\)/gi, "STRFTIME('%Y-01-01', $1)");
  s = s.replace(/FORMAT_DATE\s*\(\s*'([^']+)'\s*,\s*(\w+(?:\.\w+)?)\s*\)/gi, "STRFTIME('$1', $2)");

  s = s.replace(/SAFE_DIVIDE\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CASE WHEN ($2) = 0 THEN NULL ELSE ($1) / ($2) END");
  s = s.replace(/DIV\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CAST(($1) / NULLIF($2, 0) AS INTEGER)");
  s = s.replace(/\bIF\s*\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CASE WHEN ($1) THEN $2 ELSE $3 END");

  s = s.replace(/STARTS_WITH\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE ($2) || '%'");
  s = s.replace(/ENDS_WITH\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE '%' || ($2)");
  s = s.replace(/CONTAINS_SUBSTR\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE '%' || ($2) || '%'");

  s = s.replace(/DATE_ADD\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "DATE($1, '+$2 days')");
  s = s.replace(/DATE_ADD\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "DATE($1, '+$2 months')");
  s = s.replace(/DATE_SUB\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "DATE($1, '-$2 days')");
  s = s.replace(/DATE_SUB\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "DATE($1, '-$2 months')");

  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+STRING\s*\)/gi, "CAST($1 AS TEXT)");
  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+INT64\s*\)/gi, "CAST($1 AS INTEGER)");
  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+FLOAT64\s*\)/gi, "CAST($1 AS REAL)");

  return s;
}

function estimateBytes(sql) {
  const tablesUsed = [];
  const tableRegex = /FROM\s+(\w+)/gi;
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const t = match[1].toLowerCase();
    if (!tablesUsed.includes(t)) tablesUsed.push(t);
  }
  const joinRegex = /JOIN\s+(\w+)/gi;
  while ((match = joinRegex.exec(sql)) !== null) {
    const t = match[1].toLowerCase();
    if (!tablesUsed.includes(t)) tablesUsed.push(t);
  }
  let totalMB = 0;
  tablesUsed.forEach(t => {
    totalMB += TABLE_SIZES[t] ? TABLE_SIZES[t].sizeMB : 0.1;
  });
  if (!/\bSELECT\s+\*/i.test(sql)) {
    const selMatch = sql.match(/\bSELECT\s+(.+?)\s+FROM\s/i);
    if (selMatch) {
      const cols = selMatch[1].split(',').length;
      totalMB *= Math.max(0.2, Math.min(1, cols / 8));
    }
  }
  return totalMB;
}

const SAMPLES_BQ = [
  { label: 'EXTRACT — Ano e mês das notas fiscais', sql: "SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'saida' LIMIT 10" },
  { label: 'DATE_TRUNC — Agrupar faturamento por mês', sql: "SELECT DATE_TRUNC(data_emissao, MONTH) AS mes, SUM(valor_liquido) AS total FROM faturamento GROUP BY mes ORDER BY mes" },
  { label: 'IF — Categorizar contas a pagar por valor', sql: "SELECT f.nome, SUM(cp.valor) AS total, IF(SUM(cp.valor) > 10000, 'Alto', 'Normal') AS categoria FROM contas_pagar cp JOIN fornecedores f ON cp.id_fornecedor = f.id_fornecedor GROUP BY f.nome ORDER BY total DESC" },
  { label: 'SAFE_DIVIDE — Margem de lucro sem erro', sql: "SELECT nome, SAFE_DIVIDE(SUM(lucro), SUM(receita)) * 100 AS margem_percentual FROM (SELECT 'Produto A' AS nome, 5000.0 AS receita, 2000.0 AS lucro UNION ALL SELECT 'Produto B', 3000.0, 0.0) GROUP BY nome" },
  { label: 'STARTS_WITH — Fornecedores que começam com "Aço"', sql: "SELECT nome FROM fornecedores WHERE STARTS_WITH(nome, 'Aço') LIMIT 10" },
  { label: 'DATE_ADD — Projetar vencimento +30 dias', sql: "SELECT id_conta_pagar, data_vencimento, DATE_ADD(data_vencimento, INTERVAL 30 DAY) AS novo_vencimento FROM contas_pagar LIMIT 10" },
  { label: 'Funções Analíticas — ROW_NUMBER', sql: "SELECT c.nome, SUM(COALESCE(nf.base_calculo, 0)) AS total_gasto, ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.base_calculo, 0)) DESC) AS ranking FROM clientes c LEFT JOIN notas_fiscais nf ON c.id_cliente = nf.id_cliente_fornecedor AND nf.tipo = 'saida' GROUP BY c.nome ORDER BY ranking LIMIT 10" },
  { label: 'LAG — Comparar faturamento mês anterior', sql: "SELECT STRFTIME('%Y-%m', data_emissao) AS mes, SUM(valor_liquido) AS faturamento, LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS mes_anterior, SUM(valor_liquido) - LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS variacao FROM faturamento GROUP BY mes ORDER BY mes" },
];

const SAMPLES_STANDARD = [
  { label: 'SELECT básico', sql: "SELECT * FROM empresas LIMIT 5;" },
  { label: 'Faturamento por empresa', sql: "SELECT e.nome_fantasia AS empresa, SUM(f.valor_liquido) AS total FROM faturamento f JOIN empresas e ON f.id_empresa = e.id_empresa GROUP BY e.nome_fantasia ORDER BY total DESC;" },
  { label: 'Contas a pagar vencidas', sql: "SELECT f.nome AS fornecedor, cp.valor, cp.data_vencimento FROM contas_pagar cp JOIN fornecedores f ON cp.id_fornecedor = f.id_fornecedor WHERE cp.data_vencimento < DATE('now') ORDER BY cp.data_vencimento;" },
  { label: 'CTE — Top 5 fornecedores', sql: "WITH top_fornecedores AS (SELECT f.nome, SUM(cp.valor) AS total FROM fornecedores f JOIN contas_pagar cp ON f.id_fornecedor = cp.id_fornecedor GROUP BY f.nome ORDER BY total DESC LIMIT 5) SELECT * FROM top_fornecedores;" },
  { label: 'Window Function — Ranking', sql: "SELECT id_conta_pagar, valor, RANK() OVER (ORDER BY valor DESC) AS ranking FROM contas_pagar LIMIT 10;" },
];

function formatValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return val.toLocaleString('pt-BR');
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(val);
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
}

export default function BQPlayground() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const executeRef = useRef(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [query, setQuery] = useState('');
  const [bqMode, setBqMode] = useState(true);
  const [estimatedBytes, setEstimatedBytes] = useState(null);

  useEffect(() => {
    async function loadDatabase() {
      try {
        const SQL = await initSqlJs({ locateFile: (file) => `/db/${file}` });
        const resp = await fetch(DB_URL);
        if (!resp.ok) throw new Error(`Erro ao carregar banco: ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));
        setDb(database);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDatabase();
  }, []);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();
    editor.addAction({
      id: 'execute-query',
      label: 'Executar Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => executeRef.current?.(),
    });
  }, []);

  const clearDecorations = () => {
    if (editorRef.current && decorationsRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  const executeQuery = useCallback(() => {
    clearDecorations();
    if (!db || !editorRef.current) return;
    const rawSql = editorRef.current.getValue().trim();
    if (!rawSql) return;

    setExecuting(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);
    setEstimatedBytes(null);

    const sql = bqMode ? translateBQtoSQLite(rawSql) : rawSql;

    if (bqMode) {
      const mb = estimateBytes(rawSql);
      setEstimatedBytes(mb);
    }

    try {
      const start = performance.now();
      const res = db.exec(sql);
      const end = performance.now();
      setExecutionTime(((end - start) / 1000).toFixed(3));
      setResults(res);
    } catch (e) {
      const msg = e.message;
      const friendlyMsg = bqMode
        ? `${msg}\n\n💡 Dica: Você está no modo BigQuery. O SQL foi traduzido automaticamente. Se der erro, confira se a sintaxe funciona no SQLite padrão.`
        : msg;
      setError(friendlyMsg);
      const lineMatch = msg.match(/line (\d+):/i) || msg.match(/at line (\d+)/i) || msg.match(/(\d+):/);
      if (lineMatch && editorRef.current && monacoRef.current) {
        const line = parseInt(lineMatch[1]);
        const monaco = monacoRef.current;
        decorationsRef.current = editorRef.current.deltaDecorations([], [
          {
            range: new monaco.Range(line, 1, line, 1),
            options: { isWholeLine: true, overviewRuler: { color: '#e74c3c', position: monaco.editor.OverviewRulerLane.Full } },
          },
          {
            range: new monaco.Range(line, 1, line, 1000),
            options: { inlineClassName: 'error-line-highlight' },
          },
        ]);
      }
    } finally {
      setExecuting(false);
    }
  }, [db, bqMode]);
  executeRef.current = executeQuery;

  const formatQuery = useCallback(() => {
    if (!editorRef.current) return;
    try {
      const formatted = format(editorRef.current.getValue(), { language: 'sqlite', uppercase: true, tabWidth: 2 });
      editorRef.current.setValue(formatted);
    } catch { }
  }, []);

  const loadSample = (sample) => {
    if (editorRef.current) {
      editorRef.current.setValue(sample.sql);
    }
    setQuery(sample.sql);
    clearDecorations();
    setResults(null);
    setError(null);
    setEstimatedBytes(null);
  };

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') executeQuery();
  }, [executeQuery]);

  const toggleMode = () => {
    setBqMode(!bqMode);
    clearDecorations();
    setResults(null);
    setError(null);
    setEstimatedBytes(null);
  };

  const exportCSV = useCallback(() => {
    if (!results || results.length === 0) return;
    const r = results[0];
    const header = r.columns.join(',');
    const rows = r.values.map(row =>
      row.map(v => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bq_consulta_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
    'AS', 'ON', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'COALESCE', 'CAST',
    'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'OVER', 'PARTITION BY',
    'WITH', 'RECURSIVE',
  ];

  const BQ_KEYWORDS = [
    'EXTRACT', 'DATE_TRUNC', 'FORMAT_DATE', 'DATE_ADD', 'DATE_SUB',
    'SAFE_DIVIDE', 'DIV', 'IF', 'STARTS_WITH', 'ENDS_WITH', 'CONTAINS_SUBSTR',
    'UNNEST', 'ARRAY', 'STRUCT', 'TIMESTAMP', 'STRING', 'INT64', 'FLOAT64',
    'DATE_DIFF', 'UNIX_DATE', 'STRING_AGG', 'ARRAY_AGG',
  ];

  const bqModeRef = useRef(bqMode);
  bqModeRef.current = bqMode;

  function handleEditorWillMount(monaco) {
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const suggestions = [];

        SQL_KEYWORDS.forEach(kw => {
          suggestions.push({ label: kw, kind: monaco.languages.CompletionItemKind.Keyword, insertText: kw.toLowerCase(), range, detail: 'SQL' });
        });

        if (bqModeRef.current) {
          BQ_KEYWORDS.forEach(kw => {
            suggestions.push({ label: kw, kind: monaco.languages.CompletionItemKind.Keyword, insertText: kw.toLowerCase(), range, detail: 'BigQuery' });
          });
        }

        return { suggestions };
      },
      triggerCharacters: [' ', ','],
    });

    monaco.editor.defineTheme('cursoTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'type', foreground: '267f99' },
        { token: 'string', foreground: 'a31515' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editorLineNumber.foreground': '#999999',
        'editorCursor.foreground': '#1a73e8',
      },
    });
  }

  const samples = bqMode ? SAMPLES_BQ : SAMPLES_STANDARD;

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner" />
        <span>Carregando banco de dados...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <span style={{ color: 'var(--ifm-color-danger)' }}>Erro: {loadError}</span>
      </div>
    );
  }

  return (
    <div className="playground-container" onKeyDown={handleKeyDown} style={{ marginTop: '1rem' }}>
      <div className="playground-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: 0 }}>
          <span>{'☁️'} BigQuery Playground</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={bqMode} onChange={toggleMode} />
            Modo BigQuery
          </label>
          <button className="btn-execute" onClick={executeQuery} disabled={executing}>
            {executing ? 'Executando...' : '▶ Executar'}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>Ctrl+Enter</span>
        </div>
      </div>

      <div className="playground-layout">
        <div className="playground-sidebar" style={{ width: '220px', flexShrink: 0 }}>
          <div style={{
            padding: '0.75rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)',
          }}>
            {bqMode ? '☁️ Exemplos BigQuery' : '📋 Exemplos SQL'}
          </div>
          <div style={{ padding: '0.4rem', overflow: 'auto', maxHeight: '400px' }}>
            {samples.map((s, i) => (
              <button key={i} onClick={() => loadSample(s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem',
                  margin: '0.2rem 0', border: 'none', borderRadius: '4px',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: '0.75rem', lineHeight: 1.3, color: 'var(--ifm-color-emphasis-700)',
                }}
                onMouseEnter={e => e.target.style.background = 'var(--ifm-color-emphasis-100)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}>
                {s.label}
              </button>
            ))}
          </div>
          {bqMode && (
            <div style={{
              padding: '0.5rem', borderTop: '1px solid var(--ifm-color-emphasis-300)',
              fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)',
            }}>
              💡 As funções BigQuery (EXTRACT, DATE_TRUNC, etc.) são traduzidas automaticamente para SQLite.
            </div>
          )}
        </div>

        <div className="playground-right" style={{ flex: 1, minWidth: 0 }}>
          <div className="playground-editor-panel">
            <div className="playground-editor-header">
              <span>{'📝'} Editor {bqMode ? 'BigQuery SQL' : 'SQL'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {estimatedBytes !== null && (
                  <span style={{ fontSize: '0.75rem', color: estimatedBytes > 0.5 ? '#e67e22' : '#2ecc71', fontWeight: 500 }}>
                    ~{estimatedBytes.toFixed(2)} MB processados
                  </span>
                )}
                {executionTime && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)' }}>
                    {executionTime}s
                  </span>
                )}
                <button onClick={formatQuery} title="Formatar SQL"
                  style={{
                    padding: '0.15rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '4px', background: 'transparent', cursor: 'pointer',
                    fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-700)',
                  }}>
                  ✨ Formatar
                </button>
              </div>
            </div>
            <div className="playground-editor-wrapper">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={v => setQuery(v || '')}
                theme="cursoTheme"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  lineNumbers: 'on', renderLineHighlight: 'line', automaticLayout: true,
                  suggestOnTriggerCharacters: true, wordBasedSuggestions: false, tabSize: 2,
                }}
              />
            </div>
          </div>

          <div className="playground-results-panel">
            <div className="playground-results-header">
              <span>{'📊'} Resultados</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {results && results.length > 0 && (
                  <>
                    <span style={{ fontSize: '0.8rem' }}>{results[0].values.length} linha(s)</span>
                    <button onClick={exportCSV} title="Exportar CSV"
                      style={{
                        padding: '0.15rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px', background: 'transparent', cursor: 'pointer',
                        fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-700)',
                      }}>
                      📥 CSV
                    </button>
                  </>
                )}
                {error && <span style={{ color: 'var(--ifm-color-danger)', fontSize: '0.8rem' }}>Erro</span>}
              </div>
            </div>
            <div className="playground-results-content">
              {error && <div className="playground-error">{error}</div>}
              {!error && results && results.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      {results[0].columns.map((col, i) => <th key={i}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {results[0].values.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td key={j} onClick={() => copyToClipboard(String(val))}
                            title="Clique para copiar" style={{ cursor: 'pointer' }}>
                            {formatValue(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!error && (!results || results.length === 0) && (
                <div className="playground-empty">
                  {bqMode
                    ? 'Escreva uma query no estilo BigQuery (EXTRACT, DATE_TRUNC, SAFE_DIVIDE...) e execute.'
                    : 'Execute uma query para ver os resultados aqui.'}
                  <br />
                  <small>Clique em um exemplo ao lado para começar.</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {bqMode && (
        <div style={{
          marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '6px',
          background: '#e8f4f8', border: '1px solid #b3d9e8',
          fontSize: '0.82rem', color: '#1a5276', lineHeight: 1.4,
        }}>
          <strong>☁️ Modo BigQuery ativo</strong> — Funções como <code>EXTRACT</code>, <code>DATE_TRUNC</code>, <code>SAFE_DIVIDE</code>, <code>IF</code>, <code>STARTS_WITH</code> e <code>DATE_ADD</code> são traduzidas automaticamente.
          O custo estimado (~MB processados) é simulado com base nas tabelas consultadas.
        </div>
      )}
    </div>
  );
}
