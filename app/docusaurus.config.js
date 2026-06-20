const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

module.exports = {
  title: 'Curso TI para Controladoria',
  tagline: 'SQL, BigQuery, Looker, Tableau & IA para Análise Financeira',
  favicon: 'img/favicon.svg',
  url: 'https://curso-ti-controladoria.example.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  plugins: ['@docusaurus/plugin-vercel-analytics'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/curso/',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    image: 'img/logo.svg',
    navbar: {
      title: 'TI para Controladoria',
      items: [
        { to: '/curso/intro/intro', label: 'Curso', position: 'left' },
        { to: '/playground', label: 'SQL Playground', position: 'left' },
        { to: '/notas', label: 'Notas', position: 'left' },
        {
          href: 'https://github.com/your-org/curso-ti-controladoria',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Módulos',
          items: [
            { label: 'SQL para Análise Financeira', to: '/curso/01-sql/intro-sql' },
            { label: 'Google BigQuery', to: '/curso/02-bigquery/intro-bigquery' },
            { label: 'Looker', to: '/curso/03-looker/intro-looker' },
            { label: 'Tableau', to: '/curso/04-tableau/intro-tableau' },
            { label: 'IA Aplicada', to: '/curso/05-ia/intro-ia' },
            { label: 'Projeto Final', to: '/curso/06-projeto-final/intro-projeto' },
          ],
        },
      ],
      copyright: `Curso TI para Controladoria © ${new Date().getFullYear()}`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['sql', 'json', 'yaml'],
    },
  },
};
