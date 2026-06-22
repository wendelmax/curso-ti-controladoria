import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

const TAB_KEYS = {
  PREVISAO: 'previsao',
  ANOMALIA: 'anomalia',
};

function PrevisaoTab() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [predictedValue, setPredictedValue] = useState('');
  const [model, setModel] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const tfRef = useRef(null);

  useEffect(() => {
    import('@tensorflow/tfjs').then(tf => { tfRef.current = tf; });
  }, []);

  const trainModel = async () => {
    const tf = tfRef.current;
    if (!tf) return;
    setStatus('training');
    setPrediction(null);

    const meses = [1, 2, 3, 4, 5, 6];
    const valores = [420, 438, 455, 472, 490, 512];
    setTrainingData({ meses, valores });

    const xs = tf.tensor2d(meses.map(m => [m]), [6, 1]);
    const ys = tf.tensor2d(valores.map(v => [v]), [6, 1]);
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
    await model.fit(xs, ys, { epochs: 200 });
    setModel(model);
    setStatus('ready');
    setResult('Modelo treinado! Pronto para fazer previsões.');
  };

  const predict = () => {
    if (!model || !predictedValue) return;
    const tf = tfRef.current;
    const input = tf.tensor2d([[parseFloat(predictedValue)]], [1, 1]);
    const output = model.predict(input);
    const value = output.dataSync()[0];

    const chartData = [
      ...trainingData.meses.map((m, i) => ({ mes: `Mês ${m}`, observado: trainingData.valores[i], previsto: null })),
      { mes: `Mês ${predictedValue}`, observado: null, previsto: parseFloat(value.toFixed(2)) },
    ];
    setPrediction({ mes: parseInt(predictedValue), valor: value, chartData });
    setResult(`Previsão para o mês ${predictedValue}: R$ ${value.toFixed(2)} mil`);
  };

  const cardStyle = {
    border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', overflow: 'hidden',
  };

  return (
    <div style={cardStyle}>
      <div style={{
        padding: '0.75rem 1rem', background: 'var(--ifm-color-emphasis-100)',
        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
      }}>
        <strong>{'🧠'} Previsão de Fluxo de Caixa com TensorFlow.js</strong>
      </div>
      <div style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Dados: faturamento mensal (R$ mil) — Jan: 420, Fev: 438, Mar: 455, Abr: 472, Mai: 490, Jun: 512
        </p>

        <button onClick={trainModel} disabled={status === 'training'}
          style={{
            padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
            background: status !== 'training' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
            color: status !== 'training' ? 'white' : 'var(--ifm-color-emphasis-500)',
            cursor: status !== 'training' ? 'pointer' : 'not-allowed',
            fontWeight: 600, marginBottom: '1rem',
          }}>
          {status === 'idle' ? 'Treinar Modelo' : status === 'training' ? 'Treinando...' : 'Re-treinar Modelo'}
        </button>

        {status === 'ready' && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Prever faturamento para o mês:</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" min="7" max="12" placeholder="7 a 12"
                value={predictedValue} onChange={e => setPredictedValue(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)',
                  width: '100px', fontSize: '0.95rem',
                }} />
              <button onClick={predict}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
                  background: '#2ecc71', color: 'white', cursor: 'pointer', fontWeight: 600,
                }}>
                Prever
              </button>
            </div>
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '6px',
            background: status === 'ready' ? '#eafaf1' : '#fff3e0',
            border: `1px solid ${status === 'ready' ? '#2ecc71' : '#ff9800'}`,
            color: status === 'ready' ? '#1b5e20' : '#e65100', fontSize: '0.9rem',
          }}>
            {result}
          </div>
        )}

        {prediction && (
          <div style={{ marginTop: '1rem', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prediction.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ifm-color-emphasis-200)" />
                <XAxis dataKey="mes" stroke="var(--ifm-color-emphasis-500)" fontSize={12} />
                <YAxis stroke="var(--ifm-color-emphasis-500)" fontSize={12} domain={['auto', 'auto']}>
                  <Label value="R$ mil" position="insideLeft" angle={-90} style={{ fontSize: 11, fill: 'var(--ifm-color-emphasis-500)' }} />
                </YAxis>
                <Tooltip contentStyle={{ fontSize: '0.82rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.82rem' }} />
                <Line type="monotone" dataKey="observado" stroke="#2563eb" strokeWidth={2} name="Observado" dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="previsto" stroke="#2ecc71" strokeWidth={2} name="Previsto" strokeDasharray="5 5" dot={{ r: 5, fill: '#2ecc71' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--ifm-color-emphasis-0)', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-200)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--ifm-color-emphasis-700)' }}>
          <strong>{'💡'} O que aconteceu aqui?</strong>
          <p style={{ margin: '0.25rem 0 0' }}>
            O TensorFlow.js criou um modelo de regressão linear: ele encontrou a reta que melhor se ajusta aos dados históricos (meses 1 a 6). Cada ponto azul é um dado real. O ponto verde tracejado é a previsão. Na prática, você usaria dados reais do seu ERP, com mais meses e validação estatística.
          </p>
        </div>
      </div>
    </div>
  );
}

function gerarDadosDespesas() {
  const categorias = ['Material Escritório', 'Serviços', 'Aluguel', 'Salários', 'Viagens', 'TI', 'Marketing'];
  const dados = [];
  for (let i = 0; i < 40; i++) {
    const cat = categorias[i % categorias.length];
    const mes = Math.floor(i / 7) + 1;
    let valor = 0;
    switch (cat) {
      case 'Salários': valor = 80000 + Math.random() * 10000; break;
      case 'Aluguel': valor = 15000 + Math.random() * 2000; break;
      case 'Serviços': valor = 12000 + Math.random() * 8000; break;
      case 'TI': valor = 5000 + Math.random() * 3000; break;
      case 'Viagens': valor = 3000 + Math.random() * 4000; break;
      case 'Marketing': valor = 7000 + Math.random() * 5000; break;
      default: valor = 2000 + Math.random() * 3000;
    }
    if (i === 7) valor = 95000; // anomalia: salário muito alto
    if (i === 22) valor = 0.5; // anomalia: valor quase zero
    if (i === 30) valor = 120000; // anomalia: gasto enorme em viagens
    dados.push({ id: i + 1, mes, categoria: cat, valor: Math.round(valor * 100) / 100 });
  }
  return dados;
}

function calcularZScore(valor, media, desvio) {
  if (desvio === 0) return 0;
  return (valor - media) / desvio;
}

function AnomaliaTab() {
  const [threshold, setThreshold] = useState(2);
  const dados = useMemo(() => gerarDadosDespesas(), []);

  const stats = useMemo(() => {
    const valores = dados.map(d => d.valor);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const variancia = valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / valores.length;
    const desvio = Math.sqrt(variancia);
    return { media, desvio };
  }, [dados]);

  const resultados = useMemo(() => {
    return dados.map(d => {
      const z = calcularZScore(d.valor, stats.media, stats.desvio);
      const isAnomalia = Math.abs(z) > threshold;
      return { ...d, zScore: z, anomalia: isAnomalia };
    });
  }, [dados, stats, threshold]);

  const anomalias = resultados.filter(r => r.anomalia);
  const normais = resultados.filter(r => !r.anomalia);

  const chartData = resultados.map(r => ({
    id: r.id,
    valor: r.valor,
    anomalia: r.anomalia ? 'Sim' : 'Não',
    categoria: r.categoria,
  }));

  return (
    <div style={{
      border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.75rem 1rem', background: 'var(--ifm-color-emphasis-100)',
        borderBottom: '1px solid var(--ifm-color-emphasis-300)',
      }}>
        <strong>{'🚨'} Detecção de Anomalias em Despesas</strong>
      </div>
      <div style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Dados simulados de 40 despesas do Grupo Nova Era. Três anomalias foram inseridas: um salário muito alto (R$ 95 mil), uma despesa de R$ 0,50 (valor atípico) e um gasto de R$ 120 mil em viagens.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Limiar Z-Score:</span>
            <input type="range" min="1" max="3.5" step="0.1" value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              style={{ width: '120px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '2.5rem' }}>{threshold.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
            Média: R$ {stats.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |
            Desvio: R$ {stats.desvio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#eafaf1', border: '1px solid #2ecc71', fontSize: '0.85rem' }}>
            ✅ Normais: {normais.length}
          </div>
          <div style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#fdedec', border: '1px solid #e74c3c', fontSize: '0.85rem' }}>
            🚨 Anomalias: {anomalias.length}
          </div>
        </div>

        <div style={{ height: '280px', marginBottom: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ifm-color-emphasis-200)" />
              <XAxis dataKey="id" stroke="var(--ifm-color-emphasis-500)" fontSize={11} label={{ value: 'Lançamento #', position: 'insideBottom', offset: -10, style: { fontSize: 11 } }} />
              <YAxis stroke="var(--ifm-color-emphasis-500)" fontSize={11}>
                <Label value="R$" position="insideLeft" angle={-90} style={{ fontSize: 11, fill: 'var(--ifm-color-emphasis-500)' }} />
              </YAxis>
              <Tooltip contentStyle={{ fontSize: '0.82rem' }} formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <ReferenceLine y={stats.media} stroke="#2563eb" strokeDasharray="5 5" label={{ value: 'Média', position: 'right', fontSize: 11 }} />
              <Bar dataKey="valor" name="Valor">
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.anomalia === 'Sim' ? '#e74c3c' : '#3498db'} fillOpacity={entry.anomalia === 'Sim' ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {anomalias.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '0.85rem', color: '#c0392b' }}>🚨 Anomalias detectadas:</strong>
            <table style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Valor</th>
                  <th style={thStyle}>Z-Score</th>
                  <th style={thStyle}>Por que é anômalo</th>
                </tr>
              </thead>
              <tbody>
                {anomalias.map(a => (
                  <tr key={a.id} style={{ background: '#fdedec' }}>
                    <td style={tdStyle}>{a.id}</td>
                    <td style={tdStyle}>{a.categoria}</td>
                    <td style={tdStyle}>R$ {a.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={tdStyle}>{a.zScore.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {a.zScore > 0
                        ? `Valor ${a.zScore.toFixed(1)}x acima da média (R$ ${stats.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
                        : `Valor muito abaixo da média (quase zero)`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '0.75rem', background: 'var(--ifm-color-emphasis-0)', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-200)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--ifm-color-emphasis-700)' }}>
          <strong>{'💡'} Como funciona?</strong>
          <p style={{ margin: '0.25rem 0 0' }}>
            Usamos o <strong>Z-Score</strong> — uma medida de quantos desvios padrão um valor está acima ou abaixo da média. Quanto maior o |Z|, mais atípico é o valor. O limiar (padrão = 2.0) define o ponto de corte. Na prática, você usaria dados reais do seu ERP e ajustaria o limiar conforme a tolerância da sua empresa.
          </p>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '2px solid var(--ifm-color-emphasis-300)',
  fontWeight: 600, fontSize: '0.8rem',
};

const tdStyle = {
  padding: '0.35rem 0.6rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  fontSize: '0.8rem',
};

export default function TFjsPredictor() {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PREVISAO);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab(TAB_KEYS.PREVISAO)}
          style={tabBtnStyle(activeTab === TAB_KEYS.PREVISAO)}>
          {'🔮'} Previsão
        </button>
        <button onClick={() => setActiveTab(TAB_KEYS.ANOMALIA)}
          style={tabBtnStyle(activeTab === TAB_KEYS.ANOMALIA)}>
          {'🚨'} Detecção de Anomalias
        </button>
      </div>

      {activeTab === TAB_KEYS.PREVISAO && <PrevisaoTab />}
      {activeTab === TAB_KEYS.ANOMALIA && <AnomaliaTab />}
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
    background: active ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-100)',
    color: active ? 'white' : 'var(--ifm-color-emphasis-700)',
    cursor: 'pointer', fontWeight: active ? 600 : 400, fontSize: '0.9rem',
    transition: 'all 0.15s',
  };
}
