/**
 * Contexto Lógico de Autenticação
 * Agrupa os componentes de Login por Credenciais e Desafio de Verificação TOTP
 */
import { apiLogin, apiVerifyTotpLogin } from '../core/api.js';
import { getState, setState } from '../core/state.js';
import { showAlert, clearAlerts, setButtonLoading, applyNumericMask } from '../core/ui.js';
import { showView } from './navigation.js';

// Elementos do DOM de Login
const formLogin = document.getElementById('form-login');
const inputIdentifier = document.getElementById('input-login-identifier');
const inputPassword = document.getElementById('input-login-password');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const btnAutofill = document.getElementById('btn-login-autofill');

// Elementos do DOM de Verificação TOTP no Login
const formTotpVerify = document.getElementById('form-totp-verify');
const inputTotpLoginCode = document.getElementById('input-totp-login-code');
const btnBackToLogin = document.getElementById('btn-back-to-login');

/**
 * Alterna a visibilidade do campo de senha (texto / senha)
 */
function handleTogglePassword() {
  if (!inputPassword || !btnTogglePassword) return;

  const isPassword = inputPassword.type === 'password';
  inputPassword.type = isPassword ? 'text' : 'password';
  btnTogglePassword.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Exibir senha');

  btnTogglePassword.innerHTML = isPassword
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
}

/**
 * Preenche automaticamente as credenciais de demonstração
 */
function handleAutofill() {
  if (inputIdentifier) inputIdentifier.value = 'alunorural@ufrrj.br';
  if (inputPassword) inputPassword.value = 'senha123';
  if (inputIdentifier) inputIdentifier.focus();
}

/**
 * Processa a submissão do formulário de login
 * @param {SubmitEvent} event
 * @param {(state: ReturnType<typeof getState>) => void} onLoginSuccess
 */
async function handleLoginSubmit(event, onLoginSuccess) {
  event.preventDefault();
  clearAlerts();

  const username = inputIdentifier?.value.trim() || '';
  const password = inputPassword?.value || '';
  const submitBtn = formLogin?.querySelector('button[type="submit"]');

  if (!username || !password) {
    showAlert('login', 'Por favor, informe seu e-mail/usuário e senha.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const data = await apiLogin(username, password);

    setState({ currentUser: username });

    if (data.twoFactorRequired) {
      setState({
        tempToken: data.tempToken,
        is2faEnabled: true
      });
      showView('totp');
      if (inputTotpLoginCode) {
        inputTotpLoginCode.value = '';
        inputTotpLoginCode.focus();
      }
    } else {
      setState({
        authToken: data.token,
        is2faEnabled: false
      });
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(getState());
      }
      showView('dashboard');
    }
  } catch (err) {
    showAlert('login', err.message);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Processa a submissão do código TOTP no fluxo de login em 2 etapas
 * @param {SubmitEvent} event
 * @param {(state: ReturnType<typeof getState>) => void} onVerifySuccess
 */
async function handleTotpVerifySubmit(event, onVerifySuccess) {
  event.preventDefault();
  clearAlerts();

  const code = inputTotpLoginCode?.value.trim() || '';
  const submitBtn = formTotpVerify?.querySelector('button[type="submit"]');
  const { tempToken } = getState();

  if (code.length !== 6) {
    showAlert('totp', 'O código deve ter exatamente 6 dígitos.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const data = await apiVerifyTotpLogin(tempToken, code);

    setState({
      authToken: data.token,
      tempToken: null,
      is2faEnabled: true
    });

    if (typeof onVerifySuccess === 'function') {
      onVerifySuccess(getState());
    }

    showView('dashboard');
  } catch (err) {
    showAlert('totp', err.message);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Limpa todos os campos do contexto de autenticação
 */
export function resetAuthInputs() {
  if (inputIdentifier) inputIdentifier.value = '';
  if (inputPassword) inputPassword.value = '';
  if (inputTotpLoginCode) inputTotpLoginCode.value = '';
}

/**
 * Inicializa os ouvintes de eventos dos componentes de autenticação
 * @param {{ onAuthenticated: (state: ReturnType<typeof getState>) => void }} callbacks
 */
export function initAuthComponent({ onAuthenticated }) {
  if (btnTogglePassword) {
    btnTogglePassword.addEventListener('click', handleTogglePassword);
  }

  if (btnAutofill) {
    btnAutofill.addEventListener('click', handleAutofill);
  }

  if (inputTotpLoginCode) {
    applyNumericMask(inputTotpLoginCode, 6);
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => handleLoginSubmit(e, onAuthenticated));
  }

  if (formTotpVerify) {
    formTotpVerify.addEventListener('submit', (e) => handleTotpVerifySubmit(e, onAuthenticated));
  }

  if (btnBackToLogin) {
    btnBackToLogin.addEventListener('click', () => {
      setState({ tempToken: null });
      showView('login');
    });
  }
}
