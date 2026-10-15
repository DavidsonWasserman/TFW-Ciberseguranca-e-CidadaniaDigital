/**
 * Contexto Lógico de Gestão e Configuração de MFA
 * Agrupa o Painel Autenticado (Dashboard) e o Assistente de Configuração (Setup Wizard)
 */
import { apiSetup2fa, apiEnable2fa, apiDisable2fa } from '../core/api.js';
import { getState, setState } from '../core/state.js';
import { showAlert, clearAlerts, setButtonLoading, applyNumericMask } from '../core/ui.js';
import { showView } from './navigation.js';

// Elementos do Dashboard
const displayUsername = document.getElementById('display-username');
const badgeStatus = document.getElementById('badge-mfa-status');
const statusText = document.getElementById('text-mfa-status');
const btnLogout = document.getElementById('btn-logout');

const sectionSetupCard = document.getElementById('section-mfa-setup-card');
const btnStartSetup = document.getElementById('btn-mfa-start-setup');

const sectionDisableCard = document.getElementById('section-mfa-disable-card');
const formDisableMfa = document.getElementById('form-mfa-disable');
const inputDisableCode = document.getElementById('input-mfa-disable-code');

// Elementos do Wizard de Setup
const btnSetupBack = document.getElementById('btn-setup-back');
const btnSetupCancel = document.getElementById('btn-setup-cancel');
const imgQrCode = document.getElementById('img-setup-qr-code');
const textSecretKey = document.getElementById('text-setup-secret-key');
const codeOtpauthUrl = document.getElementById('code-setup-otpauth-url');
const btnCopySecret = document.getElementById('btn-copy-secret');

const btnStepNext = document.getElementById('btn-step-next');
const btnStepPrev = document.getElementById('btn-step-prev');
const formSetupVerify = document.getElementById('form-setup-verify');
const inputSetupVerifyCode = document.getElementById('input-setup-verify-code');
const btnSetupFinish = document.getElementById('btn-setup-finish');

/**
 * Renderiza os dados no Dashboard com base no estado atual
 */
export function renderDashboard() {
  const { currentUser, is2faEnabled } = getState();

  if (displayUsername) {
    displayUsername.textContent = currentUser || 'alunorural';
  }

  if (badgeStatus && statusText) {
    if (is2faEnabled) {
      badgeStatus.className = 'status-badge enabled';
      statusText.textContent = '2FA Ativado';
    } else {
      badgeStatus.className = 'status-badge disabled';
      statusText.textContent = '2FA Desativado';
    }
  }

  if (sectionSetupCard) {
    sectionSetupCard.style.display = is2faEnabled ? 'none' : 'block';
  }

  if (sectionDisableCard) {
    sectionDisableCard.style.display = is2faEnabled ? 'block' : 'none';
  }
}

/**
 * Atualiza o indicador visual do Stepper e exibe o painel da etapa solicitada
 * @param {1 | 2 | 3} stepNumber
 */
export function setWizardStep(stepNumber) {
  for (let i = 1; i <= 3; i++) {
    const panel = document.getElementById(`setup-step-panel-${i}`);
    if (panel) {
      panel.style.display = i === stepNumber ? 'block' : 'none';
    }

    const stepIndicator = document.getElementById(`stepper-item-${i}`);
    if (stepIndicator) {
      stepIndicator.classList.remove('active', 'completed');
      if (i === stepNumber) {
        stepIndicator.classList.add('active');
      } else if (i < stepNumber) {
        stepIndicator.classList.add('completed');
      }
    }

    if (i < 3) {
      const line = document.getElementById(`stepper-line-${i}`);
      if (line) {
        line.classList.toggle('completed', i < stepNumber);
      }
    }
  }

  clearAlerts();

  if (stepNumber === 2 && inputSetupVerifyCode) {
    inputSetupVerifyCode.value = '';
    inputSetupVerifyCode.focus();
  }
}

/**
 * Inicia o fluxo de configuração do 2FA gerando o segredo e QR Code
 */
async function handleStartSetup() {
  clearAlerts();
  setButtonLoading(btnStartSetup, true);

  const { authToken } = getState();

  try {
    const data = await apiSetup2fa(authToken);

    if (imgQrCode) imgQrCode.src = data.qrCode;
    if (textSecretKey) textSecretKey.textContent = data.secret;
    if (codeOtpauthUrl) codeOtpauthUrl.textContent = data.otpauthUrl;

    setWizardStep(1);
    showView('setup');
  } catch (err) {
    showAlert('dashboard', err.message);
  } finally {
    setButtonLoading(btnStartSetup, false);
  }
}

/**
 * Copia a chave secreta Base32 para a área de transferência
 */
async function handleCopySecret() {
  const secret = textSecretKey?.textContent;
  if (!secret || !btnCopySecret) return;

  try {
    await navigator.clipboard.writeText(secret);
    const originalHTML = btnCopySecret.innerHTML;
    btnCopySecret.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => {
      btnCopySecret.innerHTML = originalHTML;
    }, 2000);
  } catch {
    showAlert('setup', `Copie manualmente: ${secret}`, 'info');
  }
}

/**
 * Processa a ativação do 2FA com o primeiro código TOTP no Passo 2
 * @param {SubmitEvent} event
 */
async function handleSetupVerifySubmit(event) {
  event.preventDefault();
  clearAlerts();

  const code = inputSetupVerifyCode?.value.trim() || '';
  const submitBtn = formSetupVerify?.querySelector('button[type="submit"]');
  const { authToken } = getState();

  if (code.length !== 6) {
    showAlert('setup', 'Informe o código de 6 dígitos gerado pelo seu aplicativo autenticador.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    await apiEnable2fa(authToken, code);

    setState({ is2faEnabled: true });
    setWizardStep(3);
  } catch (err) {
    showAlert('setup', err.message);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Processa a desativação da proteção 2FA
 * @param {SubmitEvent} event
 */
async function handleDisableMfaSubmit(event) {
  event.preventDefault();
  clearAlerts();

  const code = inputDisableCode?.value.trim() || '';
  const submitBtn = formDisableMfa?.querySelector('button[type="submit"]');
  const { authToken } = getState();

  if (code.length !== 6) {
    showAlert('dashboard', 'Informe o código TOTP de 6 dígitos para desativar.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    await apiDisable2fa(authToken, code);

    setState({ is2faEnabled: false });
    renderDashboard();
    showAlert('dashboard', '2FA desativado com sucesso.', 'info');
    if (inputDisableCode) inputDisableCode.value = '';
  } catch (err) {
    showAlert('dashboard', err.message);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Encerra a sessão do usuário (Logout)
 */
function handleLogout() {
  setState({
    authToken: null,
    tempToken: null,
    currentUser: null
  });
  showView('login');
}

/**
 * Limpa todos os campos do contexto de gestão do MFA
 */
export function resetMfaInputs() {
  if (inputDisableCode) inputDisableCode.value = '';
  if (inputSetupVerifyCode) inputSetupVerifyCode.value = '';
  setWizardStep(1);
}

/**
 * Inicializa os ouvintes de eventos da gestão do MFA
 */
export function initMfaManagerComponent() {
  // Máscaras de código numérico
  if (inputDisableCode) applyNumericMask(inputDisableCode, 6);
  if (inputSetupVerifyCode) applyNumericMask(inputSetupVerifyCode, 6);

  // Ações do Dashboard
  if (btnStartSetup) btnStartSetup.addEventListener('click', handleStartSetup);
  if (formDisableMfa) formDisableMfa.addEventListener('submit', handleDisableMfaSubmit);
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  // Ações do Setup Wizard
  if (btnCopySecret) btnCopySecret.addEventListener('click', handleCopySecret);
  if (btnStepNext) btnStepNext.addEventListener('click', () => setWizardStep(2));
  if (btnStepPrev) btnStepPrev.addEventListener('click', () => setWizardStep(1));
  if (btnSetupBack) btnSetupBack.addEventListener('click', () => showView('dashboard'));
  if (btnSetupCancel) btnSetupCancel.addEventListener('click', () => showView('dashboard'));
  if (formSetupVerify) formSetupVerify.addEventListener('submit', handleSetupVerifySubmit);

  if (btnSetupFinish) {
    btnSetupFinish.addEventListener('click', () => {
      renderDashboard();
      showView('dashboard');
      showAlert(
        'dashboard',
        'Autenticação Multifator ativada com sucesso! No próximo login, o código será exigido.',
        'success'
      );
    });
  }
}
