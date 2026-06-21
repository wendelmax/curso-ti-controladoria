import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

export default function TFjsPredictor() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [predictedValue, setPredictedValue] = useState('');
  const [model, setModel] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const tfRef = useRef(null);

  useEffect(() => {
    import('@tensorflow/tfjs').then(tf => {
      tfRef.current = tf;
    });
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

    await model.fit(xs, ys, {
      epochs: 200,
    });

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
    border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px',
    margin: '1.5rem 0', overflow: 'hidden',
  };

  return (
    <div>
      <div style={cardStyle}>
        <div style={{
          padding: '0.75rem 1rem', background: 'var(--ifm-color-emphasis-100)',
          borderBottom: '1px solid var(--ifm-color-emphasis-300)',
        }}>
          <strong>&#129302; Previsão de Fluxo de Caixa com TensorFlow.js</strong>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Dados de treinamento: faturamento mensal (R$ mil) — Jan: 420, Fev: 438, Mar: 455, Abr: 472, Mai: 490, Jun: 512
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
                  value={predictedValue}
                  onChange={e => setPredictedValue(e.target.value)}
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
              color: status === 'ready' ? '#1b5e20' : '#e65100',
              fontSize: '0.9rem',
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
            <strong>&#128161; O que aconteceu aqui?</strong>
            <p style={{ margin: '0.25rem 0 0' }}>
              O TensorFlow.js criou um modelo de regressão linear simples: ele encontrou a reta que melhor se ajusta aos dados históricos
              (meses 1 a 6). Cada ponto azul é um dado real. O ponto verde tracejado é a previsão do modelo para o mês solicitado.
              Quanto mais linear for a tendência dos dados, mais precisa será a previsão. Na prática, você usaria dados reais do seu
              ERP, com mais meses e validação estatística, mas o conceito é o mesmo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
