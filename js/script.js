// Chave para armazenar no localStorage
const LOCAL_STORAGE_KEY = 'ciel_finance_transactions';

// Seleção dos elementos do DOM
const balanceValueEl = document.getElementById('balanceValue');
const incomeValueEl = document.getElementById('incomeValue');
const expenseValueEl = document.getElementById('expenseValue');

const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const dateInput = document.getElementById('date');

const transactionListEl = document.getElementById('transactionList');
const ctx = document.getElementById('myChart').getContext('2d');

// Define a data atual como padrão no campo de data
if (dateInput) {
  dateInput.valueAsDate = new Date();
}

// 1. Obter transações do localStorage
function getTransactions() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Lista de transações na memória
let transactions = getTransactions();

// Instância global do gráfico do Chart.js
let financeChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Total Receitas', 'Total Despesas'],
    datasets: [{
      label: 'Valores em R$',
      data: [0, 0],
      backgroundColor: [
        'rgba(46, 204, 113, 0.5)', // Verde para Receitas
        'rgba(231, 76, 60, 0.5)'   // Vermelho para Despesas
      ],
      borderColor: [
        'rgba(46, 204, 113, 1)',
        'rgba(231, 76, 60, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// 2. Salvar transações no localStorage
function saveTransactions() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
}

// Formatar valores como moeda R$
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatar data para exibição (dd/mm/aaaa)
function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// 3. Atualizar o resumo (Saldo, Receitas, Despesas) e Gráfico
function updateSummary() {
  const totals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      acc.income += transaction.amount;
    } else if (transaction.type === 'expense') {
      acc.expense += transaction.amount;
    }
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  balanceValueEl.textContent = formatCurrency(balance);
  incomeValueEl.textContent = formatCurrency(totals.income);
  expenseValueEl.textContent = formatCurrency(totals.expense);

  // Atualizar dados do gráfico
  financeChart.data.datasets[0].data = [totals.income, totals.expense];
  financeChart.update();
}

// 4. Renderizar a lista de transações na tabela
function renderTransactions() {
  transactionListEl.innerHTML = '';

  if (transactions.length === 0) {
    transactionListEl.innerHTML = `
      <tr class="empty-state">
        <td colspan="5" style="text-align: center;">Nenhuma transação cadastrada ainda.</td>
      </tr>
    `;
    return;
  }

  transactions.forEach((transaction) => {
    const tr = document.createElement('tr');

    const isIncome = transaction.type === 'income';
    const typeLabel = isIncome ? 'Receita' : 'Despesa';
    const amountClass = isIncome ? 'text-income' : 'text-expense';

    tr.innerHTML = `
      <td>${transaction.description}</td>
      <td class="${amountClass}">${formatCurrency(transaction.amount)}</td>
      <td>${typeLabel}</td>
      <td>${formatDate(transaction.date)}</td>
      <td>
        <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')" title="Excluir">
          🗑️
        </button>
      </td>
    `;

    transactionListEl.appendChild(tr);
  });
}

// 5. Adicionar nova transação
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;
  const date = dateInput.value;

  if (!description || isNaN(amount) || !type || !date) {
    mostrarToast('Por favor, preencha todos os campos corretamente.', 'danger');
    return;
  }

  const newTransaction = {
    id: Date.now().toString(), // ID único baseado no timestamp
    description,
    amount,
    type,
    date
  };

  transactions.push(newTransaction);

  saveTransactions();
  updateUI();

  // Exibe notificação de sucesso
  mostrarToast('Transação adicionada com sucesso!', 'success');

  // Limpa os campos do formulário
  transactionForm.reset();
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

// 6. Excluir transação
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateUI();
  mostrarToast('Transação removida.', 'danger');
}

// Atualizar toda a interface
function updateUI() {
  renderTransactions();
  updateSummary();
}

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);

// Inicializar aplicativo
updateUI();