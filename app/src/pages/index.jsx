import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout
      title="Curso TI para Controladoria"
      description="SQL, BigQuery, Looker, Tableau e IA para análise financeira"
    >
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - var(--ifm-navbar-height) - 4rem)',
        textAlign: 'center', padding: '2rem',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          TI para Controladoria
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--ifm-color-emphasis-600)', maxWidth: '600px', marginBottom: '2rem' }}>
          SQL, BigQuery, Looker, Tableau &amp; IA Aplicada à Análise Financeira e Operacional
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/curso/intro/"
            style={{
              padding: '0.8rem 2rem', background: 'var(--ifm-color-primary)', color: 'white',
              borderRadius: '8px', fontWeight: 600, textDecoration: 'none',
            }}>
            &#128214; Começar o Curso
          </Link>
          <Link to="/playground"
            style={{
              padding: '0.8rem 2rem', border: '2px solid var(--ifm-color-primary)',
              color: 'var(--ifm-color-primary)', borderRadius: '8px', fontWeight: 600,
              textDecoration: 'none',
            }}>
            &#128187; SQL Playground
          </Link>
          <Link to="/notas"
            style={{
              padding: '0.8rem 2rem', border: '2px solid var(--ifm-color-emphasis-300)',
              color: 'var(--ifm-color-emphasis-700)', borderRadius: '8px', fontWeight: 600,
              textDecoration: 'none',
            }}>
            &#127891; Notas e Certificado
          </Link>
        </div>
        <div style={{
          marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem', maxWidth: '700px', width: '100%',
        }}>
          {[
            { label: 'SQL', sub: '16h', color: '#1a73e8' },
            { label: 'BigQuery', sub: '10h', color: '#34a853' },
            { label: 'Looker', sub: '8h', color: '#ea4335' },
            { label: 'Tableau', sub: '8h', color: '#fbbc04' },
            { label: 'IA', sub: '10h', color: '#9c27b0' },
            { label: 'Projeto', sub: '6h', color: '#00acc1' },
          ].map(m => (
            <div key={m.label} style={{
              padding: '1rem', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)',
              background: 'var(--ifm-color-emphasis-0)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.85rem', color: m.color }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
