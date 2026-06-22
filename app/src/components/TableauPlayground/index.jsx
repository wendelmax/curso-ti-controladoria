import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import initSqlJs from 'sql.js';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, Cell } from 'recharts';
import { SCHEMA } from '../SchemaExplorer';

const DB_URL = '/db/seed.sqlite';

const CHART_TYPES = [
  { id: 'bar', label: 'Barras', icon: '📊' },
  { id: 'line', label: 'Linha', icon: '📈' },
  { id: 'area', label: 'Área', icon: '📉' },
  { id: 'table', label: 'Tabela', icon: '📋' },
];

const AGG_FUNCTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];

const CHART_COLORS = ['#2563eb', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

function getTableColumns(tableName) {
  const table = SCHEMA.find(t => t.name === tableName);
  return table ? table.columns : [];
}

function isDimension(col) {
  if (!col) return false;
  if (col.type === 'TEXT' || col.type === 'DATE') return true;
  if (col.type === 'INTEGER' && /^(id_|fk_)/i.test(col.name)) return true;
  return false;
}

function isMeasure(col) {
  if (!col) return false;
  if (col.type === 'REAL' || col.type === 'NUMERIC') return true;
  if (col.type === 'INTEGER' && !/^(id_|fk_)/i.test(col.name)) return true;
  return false;
}

const TABLE_LABELS = {
  empresas: 'Empresas (CNPJ, regime tributário)',
  clientes: 'Clientes (nome, cidade, segmento)',
  fornecedores: 'Fornecedores (nome, tipo, UF)',
  faturamento: 'Faturamento (valores por cliente/data)',
  contas_pagar: 'Contas a Pagar (despesas, fornecedores)',
  contas_receber: 'Contas a Receber (receitas, clientes)',
  lancamentos_contabeis: 'Lançamentos Contábeis (débito/crédito)',
  notas_fiscais: 'Notas Fiscais (impostos, base cálculo)',
  planos_contas: 'Plano de Contas (códigos, natureza)',
  centros_custo: 'Centros de Custo (departamentos)',
  dre_mensal: 'DRE Mensal (resultado por mês)',
  funcionarios: 'Funcionários (salários, cargos)',
};

export default function TableauPlayground() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedTable, setSelectedTable] = useState('faturamento');
  const [linha, setLinha] = useState('');
  const [coluna, setColuna] = useState('');
  const [cor, setCor] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [aggregation, setAggregation] = useState('SUM');
  const [data, setData] = useState(null);
  const [generatedSql, setGeneratedSql] = useState('');
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const SQL = await initSqlJs({ locateFile: (file) => `/db/${file}` });
        const resp = await fetch(DB_URL);
        if (!resp.ok) throw new Error(`Erro: ${resp.status}`);
        const buf = await resp.arrayBuffer();
        setDb(new SQL.Database(new Uint8Array(buf)));
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = useMemo(() => getTableColumns(selectedTable), [selectedTable]);
  const dimensoes = useMemo(() => columns.filter(isDimension), [columns]);
  const medidas = useMemo(() => columns.filter(isMeasure), [columns]);

  const dimOptions = useMemo(() => dimensoes.map(c => ({ value: c.name, label: c.name })), [dimensoes]);
  const medOptions = useMemo(() => medidas.map(c => ({ value: c.name, label: `$${c.name}` })), [medidas]);

  useEffect(() => {
    setLinha('');
    setColuna('');
    setCor('');
    setData(null);
    setGeneratedSql('');
    setError(null);
  }, [selectedTable]);

  const pillarStyle = (isBlue) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.25rem 0.6rem', borderRadius: '20px',
    background: isBlue ? '#dbeafe' : '#d1f2eb',
    color: isBlue ? '#1a56db' : '#0e6655',
    border: `1.5px solid ${isBlue ? '#1a56db' : '#0e6655'}`,
    fontSize: '0.75rem', fontWeight: 600, cursor: 'default',
  });

  const executeQuery = useCallback(() => {
    if (!db || !linha || !coluna) return;
    setExecuting(true);
    setError(null);

    const agg = aggregation;

    let sql;
    if (cor) {
      sql = `SELECT ${linha} AS rotulo, ${cor} AS cor_grupo, ${agg}(${coluna}) AS valor FROM ${selectedTable} GROUP BY rotulo, cor_grupo ORDER BY rotulo LIMIT 200`;
    } else {
      sql = `SELECT ${linha} AS rotulo, ${agg}(${coluna}) AS valor FROM ${selectedTable} GROUP BY rotulo ORDER BY rotulo LIMIT 200`;
    }

    setGeneratedSql(sql);

    try {
      const res = db.exec(sql);
      if (res.length > 0) {
        const rows = res[0].values.map(row => {
          const obj = {};
          res[0].columns.forEach((col, idx) => { obj[col] = row[idx]; });
          return obj;
        });
        setData(rows);
      } else {
        setData([]);
      }
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setExecuting(false);
    }
  }, [db, selectedTable, linha, coluna, cor, aggregation]);

  useEffect(() => {
    if (linha && coluna) executeQuery();
  }, [linha, coluna, cor, aggregation, executeQuery]);

  const chartData = useMemo(() => {
    if (!data) return [];
    if (!cor) return data;

    const labels = [...new Set(data.map(d => d.rotulo))];
    const groups = [...new Set(data.map(d => d.cor_grupo))];

    return labels.map(rotulo => {
      const item = { rotulo };
      groups.forEach(g => {
        const match = data.find(d => d.rotulo === rotulo && d.cor_grupo === g);
        item[g] = match ? match.valor : 0;
      });
      return item;
    });
  }, [data, cor]);

  const groups = useMemo(() => {
    if (!data || !cor) return [];
    return [...new Set(data.map(d => d.cor_grupo))];
  }, [data, cor]);

  const renderChart = () => {
    if (!data || data.length === 0) return null;

    if (chartType === 'table') {
      return (
        <div style={{ overflow: 'auto', maxHeight: '350px' }}>
          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ifm-color-emphasis-100)', position: 'sticky', top: 0 }}>
                <th style={thS}>Rótulo</th>
                {cor && <th style={thS}>Grupo</th>}
                <th style={thS}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--ifm-color-emphasis-0)' : 'transparent' }}>
                  <td style={tdS}>{d.rotulo}</td>
                  {cor && <td style={tdS}>{d.cor_grupo}</td>}
                  <td style={tdS}>{Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 20, left: 20, bottom: 25 },
    };

    const axisProps = {
      dataKey: 'rotulo',
      tick: { fontSize: 11 },
      stroke: 'var(--ifm-color-emphasis-400)',
    };

    const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'line' ? LineChart : AreaChart;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ifm-color-emphasis-200)" />
          <XAxis {...axisProps}>
            <Label value="Dimensão" position="insideBottom" offset={-10} style={{ fontSize: 11, fill: 'var(--ifm-color-emphasis-500)' }} />
          </XAxis>
          <YAxis tick={{ fontSize: 11 }} stroke="var(--ifm-color-emphasis-400)">
            <Label value="Valor (R$)" position="insideLeft" angle={-90} style={{ fontSize: 11, fill: 'var(--ifm-color-emphasis-500)' }} />
          </YAxis>
          <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
          {cor && <Legend wrapperStyle={{ fontSize: '0.8rem' }} />}
          {cor
            ? groups.map((g, idx) => {
                const common = {
                  key: g, name: g, dataKey: g,
                  fill: CHART_COLORS[idx % CHART_COLORS.length],
                  stroke: CHART_COLORS[idx % CHART_COLORS.length],
                  fillOpacity: 0.7, strokeWidth: 2,
                };
                if (chartType === 'bar') return <Bar {...common} stackId="a" />;
                if (chartType === 'line') return <Line {...common} type="monotone" dot={{ r: 3 }} />;
                return <Area {...common} type="monotone" />;
              })
            : chartType === 'bar'
              ? <Bar dataKey="valor" fill="#2563eb" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              : chartType === 'line'
                ? <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} />
                : <Area type="monotone" dataKey="valor" fill="#2563eb" fillOpacity={0.15} stroke="#2563eb" strokeWidth={2} />}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner" /><span>Carregando banco de dados...</span>
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

  const tabelasDisponiveis = SCHEMA.map(t => t.name).filter(n => TABLE_LABELS[n]);

  return (
    <div style={{
      border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '10px',
      overflow: 'hidden', marginTop: '1rem',
    }}>
      <div style={{
        padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #1a56db, #0e6655)',
        color: 'white',
      }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎨 Tableau Playground
        </h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
          Monte visualizações arrastando dimensões (azul) e medidas (verde) — igual ao Tableau
        </p>
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', display: 'block', marginBottom: '0.2rem' }}>Tabela</label>
            <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}
              style={selectS}>
              {tabelasDisponiveis.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', display: 'block', marginBottom: '0.2rem' }}>Tipo de Gráfico</label>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {CHART_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setChartType(ct.id)}
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1.5px solid ${chartType === ct.id ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)'}`,
                    background: chartType === ct.id ? '#e8f0fe' : 'var(--ifm-color-emphasis-50)',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: chartType === ct.id ? 600 : 400,
                    color: chartType === ct.id ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
                  }}>
                  {ct.icon} {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', display: 'block', marginBottom: '0.2rem' }}>Agregação</label>
            <select value={aggregation} onChange={e => setAggregation(e.target.value)}
              style={selectS}>
              {AGG_FUNCTIONS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem',
          padding: '1rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px',
          border: '1px dashed var(--ifm-color-emphasis-300)',
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1a56db' }}>
              🔵 Dimensões (discreto)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {dimOptions.map(d => (
                <div key={d.value} onClick={() => setLinha(d.value)}
                  style={{
                    ...pillarStyle(true),
                    opacity: linha === d.value ? 1 : 0.6,
                    cursor: 'pointer',
                    borderColor: linha === d.value ? '#1a56db' : '#93c5fd',
                  }}>
                  {d.label} {linha === d.value && '✓'}
                </div>
              ))}
              {dimOptions.length === 0 && <span style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-500)' }}>Nenhuma dimensão disponível</span>}
            </div>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0e6655' }}>
              🟢 Medidas (contínuo)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {medOptions.map(m => (
                <div key={m.value} onClick={() => setColuna(m.value)}
                  style={{
                    ...pillarStyle(false),
                    opacity: coluna === m.value ? 1 : 0.6,
                    cursor: 'pointer',
                    borderColor: coluna === m.value ? '#0e6655' : '#76d7c4',
                  }}>
                  {m.label} {coluna === m.value && '✓'}
                </div>
              ))}
              {medOptions.length === 0 && <span style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-500)' }}>Nenhuma medida disponível</span>}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem',
          padding: '0.75rem 1rem', background: '#fef9e7', borderRadius: '8px',
          border: '1px solid #f9e79f',
        }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b7950b', marginBottom: '0.2rem' }}>
              📐 Prateleira de Linhas
            </div>
            <select value={linha} onChange={e => setLinha(e.target.value)} style={{ ...selectS, background: '#dbeafe', borderColor: '#1a56db' }}>
              <option value="">Selecione uma dimensão...</option>
              {dimOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b7950b', marginBottom: '0.2rem' }}>
              📐 Prateleira de Colunas (Valores)
            </div>
            <select value={coluna} onChange={e => setColuna(e.target.value)} style={{ ...selectS, background: '#d1f2eb', borderColor: '#0e6655' }}>
              <option value="">Selecione uma medida...</option>
              {medOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b7950b', marginBottom: '0.2rem' }}>
              🎨 Cor (opcional)
            </div>
            <select value={cor} onChange={e => setCor(e.target.value)} style={selectS}>
              <option value="">Nenhum</option>
              {dimOptions.filter(d => d.value !== linha).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#fdedec', border: '1px solid #e74c3c', color: '#b71c1c', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {data && data.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              padding: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px',
              background: 'var(--ifm-color-emphasis-0)',
            }}>
              {renderChart()}
            </div>
          </div>
        )}

        {data && data.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem' }}>
            Nenhum resultado encontrado para esta combinação.
          </div>
        )}

        {!linha || !coluna ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-400)', fontSize: '0.85rem' }}>
            Selecione uma dimensão (azul) para o eixo X e uma medida (verde) para o eixo Y
          </div>
        ) : executing && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem' }}>
            Executando query...
          </div>
        )}

        <details style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--ifm-color-emphasis-600)' }}>
            🗄️ SQL gerado
          </summary>
          <pre style={{
            padding: '0.75rem', marginTop: '0.5rem', borderRadius: '6px',
            background: 'var(--ifm-color-emphasis-100)', fontSize: '0.78rem',
            overflow: 'auto',
          }}>
            {generatedSql || '-- Selecione linha e coluna para gerar o SQL'}
          </pre>
        </details>

        <div style={{
          marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '6px',
          background: '#e8f4f8', border: '1px solid #b3d9e8',
          fontSize: '0.78rem', color: '#1a5276', lineHeight: 1.4,
        }}>
          <strong>💡 Como usar:</strong> Em Tableau, <strong>dimensões</strong> (azul) viram cabeçalhos de linha/coluna e <strong>medidas</strong> (verde) viram eixos numéricos.
          Clique nas pílulas acima ou use os seletores nas prateleiras. A cor azul = discreta, verde = contínua — exatamente como no Tableau.
        </div>
      </div>
    </div>
  );
}

const selectS = {
  padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)',
  fontSize: '0.82rem', width: '100%',
  background: 'var(--ifm-color-emphasis-50)', color: 'var(--ifm-color-emphasis-800)',
};

const thS = {
  padding: '0.35rem 0.6rem', textAlign: 'left', borderBottom: '2px solid var(--ifm-color-emphasis-300)',
  fontWeight: 600, fontSize: '0.78rem',
};

const tdS = {
  padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  fontSize: '0.78rem',
};
