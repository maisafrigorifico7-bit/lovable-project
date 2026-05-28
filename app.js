// ========================================
// Pedidos MaisaPig - Sistema de Pedidos
// Com proteção contra exclusão sem pagamento
// ========================================

class PedidosApp {
  constructor() {
    this.STORAGE_KEY = 'pedidos_maisapig';
    this.PAYMENT_KEY = 'pagamentos_maisapig';
    this.pedidos = [];
    this.pagamentos = [];
    this.filtroAtual = 'todos';
    this.init();
  }

  // ========== INICIALIZAÇÃO ==========
  init() {
    console.log('🐷 Iniciando Pedidos MaisaPig...');
    this.carregarDados();
    this.configurarEventos();
    this.renderizar();
  }

  // ========== PERSISTÊNCIA DE DADOS ==========
  carregarDados() {
    try {
      const dadosSalvos = localStorage.getItem(this.STORAGE_KEY);
      if (dadosSalvos) {
        this.pedidos = JSON.parse(dadosSalvos);
        console.log(`✅ Carregados ${this.pedidos.length} pedidos`);
      }

      const pagamentosSalvos = localStorage.getItem(this.PAYMENT_KEY);
      if (pagamentosSalvos) {
        this.pagamentos = JSON.parse(pagamentosSalvos);
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar dados:', erro);
      this.pedidos = [];
      this.pagamentos = [];
    }
  }

  salvarDados() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pedidos));
      console.log(`💾 ${this.pedidos.length} pedidos salvos`);
    } catch (erro) {
      console.error('❌ Erro ao salvar:', erro);
      alert('Erro ao salvar dados! Tente novamente.');
    }
  }

  // ========== OPERAÇÕES COM PEDIDOS ==========
  adicionarPedido(cliente, itens, prazo) {
    const pedido = {
      id: Date.now(),
      cliente: cliente.trim(),
      itens: itens.trim(),
      prazo: prazo.trim(),
      status: 'pendente',
      dataCriacao: new Date().toLocaleString('pt-BR'),
      pago: false // ← NOVO: Controle de pagamento para deletar
    };

    this.pedidos.unshift(pedido);
    this.salvarDados();
    this.renderizar();
    return pedido;
  }

  atualizarStatus(id, novoStatus) {
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.status = novoStatus;
      this.salvarDados();
      this.renderizar();
    }
  }

  deletarPedido(id) {
    const pedido = this.pedidos.find(p => p.id === id);
    
    if (!pedido) {
      alert('Pedido não encontrado');
      return false;
    }

    // ✅ VERIFICAÇÃO: Requer pagamento para deletar
    if (!pedido.pago) {
      const confirmacao = confirm(
        `⚠️ ATENÇÃO!\n\nPara deletar este pedido, é necessário pagar R$ 5,00\n\n` +
        `Pedido: ${pedido.cliente}\n` +
        `Itens: ${pedido.itens}\n\n` +
        `Deseja proceder com o pagamento?`
      );

      if (confirmacao) {
        // Aqui você integraria com um gateway de pagamento real
        // Por enquanto, simulamos com alert
        this.abrirTelaPagemento(id);
      }
      return false;
    }

    // Se já foi pago, deleta normalmente
    this.pedidos = this.pedidos.filter(p => p.id !== id);
    this.salvarDados();
    this.renderizar();
    return true;
  }

  // ========== SISTEMA DE PAGAMENTO ==========
  abrirTelaPagemento(idPedido) {
    const pedido = this.pedidos.find(p => p.id === idPedido);
    
    // Abrir modal/dialog para pagamento
    const modal = this.criarModalPagamento(pedido);
    document.body.appendChild(modal);
  }

  criarModalPagamento(pedido) {
    const div = document.createElement('div');
    div.className = 'modal-pagamento';
    div.innerHTML = `
      <div class="modal-conteudo">
        <h2>💳 Confirmar Pagamento</h2>
        <p>Para deletar este pedido, você precisa pagar:</p>
        <div class="pedido-info">
          <strong>Cliente:</strong> ${pedido.cliente}<br>
          <strong>Itens:</strong> ${pedido.itens}<br>
          <strong>Valor:</strong> R$ 5,00
        </div>
        <p>Escolha o método de pagamento:</p>
        <button onclick="pedidosApp.processarPagamento('${pedido.id}', 'pix')">
          💳 PIX (Simulado)
        </button>
        <button onclick="pedidosApp.processarPagamento('${pedido.id}', 'credito')">
          💰 Cartão (Simulado)
        </button>
        <button onclick="pedidosApp.cancelarPagamento()">
          ❌ Cancelar
        </button>
      </div>
    `;
    return div;
  }

  processarPagamento(idPedido, metodo) {
    // Simular processamento de pagamento
    alert(`✅ Pagamento de R$ 5,00 via ${metodo.toUpperCase()} foi bem-sucedido!\n\nPedido pode ser deletado agora.`);
    
    const pedido = this.pedidos.find(p => p.id === idPedido);
    if (pedido) {
      pedido.pago = true;
      this.pagamentos.push({
        idPedido,
        metodo,
        valor: 5.00,
        data: new Date().toLocaleString('pt-BR')
      });
      localStorage.setItem(this.PAYMENT_KEY, JSON.stringify(this.pagamentos));
      this.salvarDados();
      this.deletarPedido(idPedido);
      this.removerModal();
    }
  }

  cancelarPagamento() {
    alert('❌ Pagamento cancelado. Pedido mantido.');
    this.removerModal();
  }

  removerModal() {
    const modal = document.querySelector('.modal-pagamento');
    if (modal) modal.remove();
  }

  // ========== RENDERIZAÇÃO ==========
  renderizar() {
    const container = document.getElementById('pedidos-container');
    if (!container) return;

    const pedidosFiltrados = this.filtrarPedidos();
    
    if (pedidosFiltrados.length === 0) {
      container.innerHTML = '<p class="vazio">📭 Nenhum pedido encontrado</p>';
      return;
    }

    container.innerHTML = pedidosFiltrados.map(p => `
      <div class="card-pedido ${p.status}">
        <div class="card-header">
          <h3>${p.cliente}</h3>
          <span class="status-badge">${p.status.toUpperCase()}</span>
        </div>
        <div class="card-body">
          <p><strong>Itens:</strong> ${p.itens}</p>
          <p><strong>Prazo:</strong> ${p.prazo}</p>
          <p class="data-criacao">${p.dataCriacao}</p>
          ${p.pago ? '<p class="pago">✅ PAGO - Pode ser deletado</p>' : ''}
        </div>
        <div class="card-actions">
          <button onclick="pedidosApp.atualizarStatus(${p.id}, 'pesado')">⚖️ Pesado</button>
          <button onclick="pedidosApp.atualizarStatus(${p.id}, 'nota')">📝 Nota</button>
          <button onclick="pedidosApp.atualizarStatus(${p.id}, 'enviado')">✈️ Enviado</button>
          <button onclick="pedidosApp.copiarPedido(${p.id})">📋 Copiar</button>
          <button onclick="pedidosApp.deletarPedido(${p.id})" class="btn-delete">
            🗑️ ${p.pago ? 'Deletar' : 'Deletar (R$5)'}
          </button>
        </div>
      </div>
    `).join('');
  }

  filtrarPedidos() {
    if (this.filtroAtual === 'todos') return this.pedidos;
    return this.pedidos.filter(p => p.status === this.filtroAtual);
  }

  copiarPedido(id) {
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      const texto = `${pedido.cliente}\n${pedido.itens}\n${pedido.prazo}`;
      navigator.clipboard.writeText(texto).then(() => {
        alert('✅ Pedido copiado!');
      });
    }
  }

  // ========== EVENTOS ==========
  configurarEventos() {
    // Exemplo: você pode conectar com formulário real
    window.pedidosApp = this; // Expor globalmente
  }

  aplicarFiltro(filtro) {
    this.filtroAtual = filtro;
    this.renderizar();
  }
}

// Inicializar app
const pedidosApp = new PedidosApp();

// Exemplo de uso:
// pedidosApp.adicionarPedido('Wesley gi', '40 kg banha', '7 dias');