/**
 * Gestão de Estado Centralizada da Aplicação
 */

const initialState = {
  authToken: null,
  tempToken: null,
  currentUser: null,
  is2faEnabled: false
};

let currentState = { ...initialState };
const listeners = new Set();

/**
 * Retorna uma cópia do estado atual
 * @returns {typeof initialState}
 */
export function getState() {
  return { ...currentState };
}

/**
 * Atualiza o estado com novos valores e notifica os ouvintes
 * @param {Partial<typeof initialState>} updates
 */
export function setState(updates) {
  currentState = { ...currentState, ...updates };
  listeners.forEach(listener => listener(getState()));
}

/**
 * Reseta o estado da aplicação para as configurações iniciais
 */
export function resetState() {
  currentState = { ...initialState };
  listeners.forEach(listener => listener(getState()));
}

/**
 * Registra um ouvinte para alterações no estado
 * @param {(state: typeof initialState) => void} listener
 * @returns {() => void} Função para cancelar a inscrição
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
