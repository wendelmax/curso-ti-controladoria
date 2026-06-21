import { useEffect } from 'react';

const MODULE_MAP = [
  { prefix: 'Módulo 1', id: 'modulo1' },
  { prefix: 'Módulo 2', id: 'modulo2' },
  { prefix: 'Módulo 3', id: 'modulo3' },
  { prefix: 'Módulo 4', id: 'modulo4' },
  { prefix: 'Módulo 5', id: 'modulo5' },
  { prefix: 'Módulo 6', id: 'modulo6' },
];

function getQuizResults() {
  try {
    return JSON.parse(localStorage.getItem('curso_ti_quiz_results') || '{}');
  } catch {
    return {};
  }
}

function updateSidebar() {
  if (typeof document === 'undefined') return;
  const quizData = getQuizResults();

  const links = document.querySelectorAll('.menu__list-item .menu__link');
  links.forEach((link) => {
    const text = link.textContent || '';
    for (const mod of MODULE_MAP) {
      if (!text.includes(mod.prefix)) continue;

      const existingBadge = link.querySelector('.mod-progress-badge');
      if (existingBadge) existingBadge.remove();

      const passed = quizData[mod.id]?.passed;

      const badge = document.createElement('span');
      badge.className = 'mod-progress-badge';
      badge.style.cssText = 'margin-left: 6px; display: inline-flex; align-items: center;';
      if (passed) {
        badge.title = 'Módulo concluído';
        badge.textContent = '✅';
      } else {
        badge.title = 'Pendente';
        badge.textContent = '⏳';
      }
      link.appendChild(badge);
      break;
    }
  });
}

export default function SidebarProgress() {
  useEffect(() => {
    let timer;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(updateSidebar, 50);
    };
    update();
    const observer = new MutationObserver(() => update());
    observer.observe(document.body, { childList: true, subtree: true });
    const handler = () => update();
    window.addEventListener('storage', handler);
    window.addEventListener('sidebar-progress-update', handler);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('storage', handler);
      window.removeEventListener('sidebar-progress-update', handler);
    };
  }, []);
  return null;
}
