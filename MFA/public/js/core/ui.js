/**
 * Utilitários de Interface do Usuário (UI Helpers)
 */

/**
 * Exibe uma mensagem de alerta no container da tela indicada
 * @param {string} viewName Nome da view (ex: 'login', 'totp', 'dashboard', 'setup')
 * @param {string} message Mensagem de texto a ser exibida
 * @param {'error' | 'success' | 'info'} type Tipo visual do alerta
 */
export function showAlert(viewName, message, type = 'error') {
  const alertBox = document.getElementById(`alert-${viewName}`);
  if (!alertBox) return;

  alertBox.className = `alert-box alert-${type} visible`;
  const textSpan = alertBox.querySelector('.alert-message');
  if (textSpan) {
    textSpan.textContent = message;
  }
}

/**
 * Limpa e oculta todas as caixas de alerta da aplicação
 */
export function clearAlerts() {
  document.querySelectorAll('.alert-box').forEach(box => {
    box.className = 'alert-box';
    const textSpan = box.querySelector('.alert-message');
    if (textSpan) textSpan.textContent = '';
  });
}

/**
 * Alterna o estado de carregamento (spinner) e desativação de um botão
 * @param {HTMLButtonElement | null} button
 * @param {boolean} isLoading
 */
export function setButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
}

/**
 * Aplica máscara exclusivamente numérica e limitação de caracteres a um input
 * @param {HTMLInputElement | null} input
 * @param {number} maxLength
 */
export function applyNumericMask(input, maxLength = 6) {
  if (!input) return;
  input.addEventListener('input', (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target);
    target.value = target.value.replace(/\D/g, '').slice(0, maxLength);
  });
}
