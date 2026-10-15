/**
 * Gerenciador de Navegação entre Telas e Reinício da Dinâmica
 */
import { clearAlerts } from '../core/ui.js';
import { resetState } from '../core/state.js';
import { apiResetSystem } from '../core/api.js';

const views = {
  login: document.getElementById('view-login'),
  totp: document.getElementById('view-totp'),
  dashboard: document.getElementById('view-dashboard'),
  setup: document.getElementById('view-setup')
};

/**
 * Exibe a tela especificada e oculta as demais
 * @param {'login' | 'totp' | 'dashboard' | 'setup'} viewName
 */
export function showView(viewName) {
  Object.keys(views).forEach(name => {
    const el = views[name];
    if (el) {
      el.classList.toggle('active', name === viewName);
    }
  });
  clearAlerts();
}

/**
 * Reinicia a dinâmica completamente para o estado inicial
 * @param {() => void} [onResetCallback] Callback opcional para limpeza adicional nos componentes
 */
export async function restartDynamic(onResetCallback) {
  const confirmed = confirm(
    'Deseja reiniciar a dinâmica? Todas as etapas e sessões ativas serão reiniciadas para a tela inicial de login.'
  );
  if (!confirmed) return;

  try {
    await apiResetSystem();
  } catch (error) {
    console.error('Falha ao resetar o estado no servidor:', error);
  }

  resetState();

  if (typeof onResetCallback === 'function') {
    onResetCallback();
  }

  showView('login');
}

/**
 * Inicializa os botões globais de reinício da dinâmica
 * @param {() => void} [onResetCallback]
 */
export function initNavigation(onResetCallback) {
  const btnRestartHeader = document.getElementById('btn-restart-dynamic');
  const btnRestartDash = document.getElementById('btn-restart-dynamic-dash');

  if (btnRestartHeader) {
    btnRestartHeader.addEventListener('click', () => restartDynamic(onResetCallback));
  }

  if (btnRestartDash) {
    btnRestartDash.addEventListener('click', () => restartDynamic(onResetCallback));
  }
}
