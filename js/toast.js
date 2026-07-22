let toastTimeout;

/**
 * Exibe uma mensagem flutuante (Toast) na tela.
 * @param {string} mensagem - O texto a ser exibido.
 * @param {string} tipo - Tipo do aviso: 'success', 'danger' ou 'info'.
 * @param {number} duracao - Tempo de exibição em milissegundos (padrão: 3000ms).
 */
function mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Define o texto
  toast.textContent = mensagem;

  // Aplica as classes de estilo e exibição
  toast.className = `toast toast--${tipo} show`;

  // Limpa timeout pendente caso um novo toast seja acionado rapidamente
  clearTimeout(toastTimeout);

  // Agenda para esconder o toast após o tempo estipulado
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duracao);
}