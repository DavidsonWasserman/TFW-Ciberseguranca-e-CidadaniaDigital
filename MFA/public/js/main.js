/**
 * Demonstração de Autenticação Multifator (TOTP / RFC 6238)
 * Ponto de Entrada da Aplicação (Entrypoint ES Module)
 */
import { initNavigation, showView } from './components/navigation.js';
import { initAuthComponent, resetAuthInputs } from './components/auth.js';
import { initMfaManagerComponent, renderDashboard, resetMfaInputs } from './components/mfa-manager.js';

// Inicialização de componentes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Callback invocado quando o usuário clica em "Reiniciar Dinâmica"
  const handleDynamicRestart = () => {
    resetAuthInputs();
    resetMfaInputs();
  };

  // Inicializa o controle de navegação e reinício
  initNavigation(handleDynamicRestart);

  // Inicializa o contexto de autenticação (Login & Desafio TOTP)
  initAuthComponent({
    onAuthenticated: () => {
      renderDashboard();
    }
  });

  // Inicializa o contexto de gestão do MFA (Dashboard & Setup Wizard)
  initMfaManagerComponent();

  // Exibe a tela de login inicial
  showView('login');
});
