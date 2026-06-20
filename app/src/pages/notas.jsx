import React from 'react';
import Layout from '@theme/Layout';
import Certificate from '../components/Certificate';

export default function NotasPage() {
  return (
    <Layout
      title="Notas e Certificado"
      description="Acompanhe seu progresso no curso e gere seu certificado"
    >
      <div style={{ padding: '1rem' }}>
        <Certificate />
      </div>
    </Layout>
  );
}
