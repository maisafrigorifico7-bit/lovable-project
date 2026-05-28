# Pedidos MaisaPig 🐷

Sistema de gerenciamento de pedidos para açougue com proteção contra exclusão sem pagamento.

## Funcionalidades

- 📋 Colar pedidos do WhatsApp
- 💾 Persistência de dados (localStorage)
- 🔒 Proteção: Exclusão de pedidos requer pagamento
- 🏷️ Filtros por status (Pendente, Pesado, Nota Emitida, Enviado)
- 🔍 Busca por cliente/item
- 🖨️ Impressão de pedidos
- 📱 Responsivo (mobile-first)

## Status Atual

⚠️ **PROBLEMA IDENTIFICADO**: Pedidos sendo apagados sem pagamento

## Solução Implementada

1. **Dados persistem em localStorage**
2. **Sistema de pagamento para deletar**
3. **Confirmação antes de excluir**
4. **Backup automático**

## Como Usar

1. Cole os pedidos do WhatsApp no campo de texto
2. Clique em "Salvar pedido"
3. Para excluir: será necessário realizar pagamento de R$ 5,00
4. Sistema mantém histórico de pedidos

## Tecnologias

- HTML5 + CSS3 + JavaScript (Vanilla)
- Lovable.dev
- localStorage para persistência
