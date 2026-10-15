/**
 * Camada de Comunicação com a API REST de Autenticação e 2FA
 */

/**
 * Utilitário interno para processar respostas JSON e tratar erros HTTP
 * @param {Response} response
 * @param {string} defaultErrorMessage
 * @returns {Promise<any>}
 */
async function handleResponse(response, defaultErrorMessage) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMsg = data.error || defaultErrorMessage || `Erro na requisição (Status: ${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Autentica o usuário utilizando identificador e senha
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ twoFactorRequired: boolean, token?: string, tempToken?: string }>}
 */
export async function apiLogin(username, password) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  return handleResponse(response, 'Credenciais inválidas. Verifique os dados digitados.');
}

/**
 * Valida o código TOTP no fluxo de login em 2 etapas
 * @param {string} tempToken Token temporário com escopo 2fa
 * @param {string} code Código de 6 dígitos
 * @returns {Promise<{ token: string }>}
 */
export async function apiVerifyTotpLogin(tempToken, code) {
  const response = await fetch('/2fa/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tempToken}`
    },
    body: JSON.stringify({ code })
  });

  return handleResponse(response, 'Código de verificação incorreto ou expirado.');
}

/**
 * Inicia o setup do 2FA gerando chave secreta, QR Code e URI otpauth
 * @param {string} authToken Token completo de autenticação
 * @returns {Promise<{ secret: string, qrCode: string, otpauthUrl: string }>}
 */
export async function apiSetup2fa(authToken) {
  const response = await fetch('/2fa/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  return handleResponse(response, 'Falha ao iniciar o processo de setup do 2FA.');
}

/**
 * Confirma o código do autenticador e ativa o 2FA na conta
 * @param {string} authToken Token completo de autenticação
 * @param {string} code Código de 6 dígitos gerado
 * @returns {Promise<{ message: string }>}
 */
export async function apiEnable2fa(authToken, code) {
  const response = await fetch('/2fa/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ code })
  });

  return handleResponse(response, 'Código inválido para confirmação do setup.');
}

/**
 * Desativa a proteção de dois fatores mediante confirmação do código atual
 * @param {string} authToken Token completo de autenticação
 * @param {string} code Código de 6 dígitos do autenticador
 * @returns {Promise<{ message: string }>}
 */
export async function apiDisable2fa(authToken, code) {
  const response = await fetch('/2fa/disable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ code })
  });

  return handleResponse(response, 'Código incorreto ao desativar o 2FA.');
}

/**
 * Reseta o estado do sistema no servidor (sem necessidade de autenticação)
 * @returns {Promise<{ message: string }>}
 */
export async function apiResetSystem() {
  const response = await fetch('/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  return handleResponse(response, 'Falha ao resetar o estado do sistema.');
}

